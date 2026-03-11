from __future__ import annotations

import json
from pathlib import Path

import numpy as np

WORKSPACE = Path(__file__).resolve().parents[4]
SAR_RFI = WORKSPACE / 'research' / 'sar-rfi'
OUT = Path(__file__).resolve().parents[1] / 'radar' / 'assets' / 'real_sar_pipeline_d453.json'

RAW_QUICKLOOK = SAR_RFI / 'data' / 'sentinel1_l0' / 'quicklook' / 'chunk_0000_sar_quicklook_arrays.npz'
FOCUSED_SWATH = SAR_RFI / 'data' / 'sentinel1_l0' / 'official_focus_sw10_tops_dem' / 'swath_10_stitched_focused.npz'
GEOCODE_GRID = SAR_RFI / 'data' / 'sentinel1_l0' / 'official_focus_sw10_tops_dem' / 'geocode_grid_downsampled.npz'
REPORT_JSON = SAR_RFI / 'data' / 'sentinel1_l0' / 'official_focus_sw10_tops_dem' / 'swath_10_report.json'


def sample_grid(arr: np.ndarray, target_h: int, target_w: int) -> np.ndarray:
    h, w = arr.shape
    yi = np.linspace(0, h - 1, target_h).round().astype(int)
    xi = np.linspace(0, w - 1, target_w).round().astype(int)
    return arr[np.ix_(yi, xi)]


def relative_db(arr: np.ndarray) -> np.ndarray:
    arr = np.asarray(arr)
    if np.iscomplexobj(arr):
        mag = np.abs(arr).astype(np.float32)
        db = 20.0 * np.log10(np.maximum(mag, 1e-6))
    else:
        db = arr.astype(np.float32)
    db -= float(np.nanmax(db))
    return db


def pack_grid(arr: np.ndarray) -> list[list[int]]:
    return np.round(arr * 10.0).astype(np.int16).tolist()


def panel_payload(key: str, title: str, subtitle: str, arr: np.ndarray, *,
                  target_h: int, target_w: int, x_label: str, y_label: str,
                  x_extent: tuple[float, float] | None = None,
                  y_extent: tuple[float, float] | None = None) -> dict:
    ds = sample_grid(arr, target_h, target_w)
    payload = {
        'key': key,
        'title': title,
        'subtitle': subtitle,
        'z_rel_db_tenths': pack_grid(ds),
        'shape': [int(target_h), int(target_w)],
        'x_label': x_label,
        'y_label': y_label,
        'zmin_rel_db': float(np.nanmin(ds)),
        'zmax_rel_db': float(np.nanmax(ds)),
        'scale_db': 0.1,
    }
    if x_extent is not None:
        payload['x_extent'] = [float(x_extent[0]), float(x_extent[1])]
    if y_extent is not None:
        payload['y_extent'] = [float(y_extent[0]), float(y_extent[1])]
    return payload


def main() -> None:
    quicklook = np.load(RAW_QUICKLOOK)
    focused = np.load(FOCUSED_SWATH)
    geocode = np.load(GEOCODE_GRID)
    report = json.loads(REPORT_JSON.read_text())

    raw_rel = relative_db(quicklook['raw_db'])
    rc_rel = relative_db(quicklook['rc_db'])
    focused_rel = relative_db(focused['img'])
    geocoded_rel = relative_db(geocode['img_db'])

    lat = geocode['lat']
    lon = geocode['lon']

    payload = {
        'source': {
            'project': 'research/sar-rfi',
            'granule': 'S1A_IW_RAW__0SDV_20250125T093218_20250125T093247_057599_0718B6_D453',
            'polarization': 'VV',
            'swath': int(report.get('swath', 10)),
            'l0dat': report.get('l0dat', ''),
            'raw_quicklook_npz': str(RAW_QUICKLOOK.relative_to(SAR_RFI)),
            'focused_npz': str(FOCUSED_SWATH.relative_to(SAR_RFI)),
            'geocode_npz': str(GEOCODE_GRID.relative_to(SAR_RFI)),
        },
        'metrics': {
            'stitched_shape': report.get('stitched_shape', [int(focused['img'].shape[0]), int(focused['img'].shape[1])]),
            'platform_velocity_mps': report.get('platform_velocity_mps'),
            'satellite_altitude_m': report.get('satellite_altitude_m'),
            'az_irw_px': report.get('stitched_metrics', {}).get('az_irw_px'),
            'rg_irw_px': report.get('stitched_metrics', {}).get('rg_irw_px'),
            'az_pslr_db': report.get('stitched_metrics', {}).get('az_pslr_db'),
            'rg_pslr_db': report.get('stitched_metrics', {}).get('rg_pslr_db'),
        },
        'panels': [
            panel_payload(
                'raw',
                'Actual Level-0 raw echo',
                'Decoded packet chunk from the D453 Sentinel-1 VV granule',
                raw_rel,
                target_h=128,
                target_w=512,
                x_label='Range sample',
                y_label='Azimuth line',
                x_extent=(0, quicklook['raw_db'].shape[1] - 1),
                y_extent=(0, quicklook['raw_db'].shape[0] - 1),
            ),
            panel_payload(
                'range_compressed',
                'After range compression',
                'Matched filtering sharpens the fast-time response before azimuth focusing',
                rc_rel,
                target_h=128,
                target_w=512,
                x_label='Range sample',
                y_label='Azimuth line',
                x_extent=(0, quicklook['rc_db'].shape[1] - 1),
                y_extent=(0, quicklook['rc_db'].shape[0] - 1),
            ),
            panel_payload(
                'focused',
                'Stitched focused SAR image',
                'Real swath-10 focus result from the sar-rfi official-style Sentinel-1 pipeline',
                focused_rel,
                target_h=192,
                target_w=640,
                x_label='Range pixel',
                y_label='Azimuth pixel',
                x_extent=(0, focused['img'].shape[1] - 1),
                y_extent=(0, focused['img'].shape[0] - 1),
            ),
            panel_payload(
                'geocoded',
                'Geocoded image overview',
                'Approximate latitude / longitude grid after terrain-aware projection',
                geocoded_rel,
                target_h=192,
                target_w=192,
                x_label='Longitude (deg)',
                y_label='Latitude (deg)',
                x_extent=(float(np.nanmin(lon)), float(np.nanmax(lon))),
                y_extent=(float(np.nanmin(lat)), float(np.nanmax(lat))),
            ),
        ],
    }

    OUT.write_text(json.dumps(payload, separators=(',', ':')))
    print(f'Wrote {OUT} ({OUT.stat().st_size / 1024:.1f} KiB)')


if __name__ == '__main__':
    main()
