/* ── Plotly color themes ─────────────────────────────── */
var THEMES = {
  dark:  { plotBg:'#1f2937', paperBg:'#1f2937', gridColor:'#374151', textColor:'#9ca3af', zeroLine:'#4b5563' },
  light: { plotBg:'#ffffff', paperBg:'#ffffff', gridColor:'#e2e8f0', textColor:'#475569', zeroLine:'#cbd5e1' }
};

/* ── Init theme from localStorage ────────────────────── */
var curTheme = localStorage.getItem('demo-theme') || 'dark';
document.documentElement.setAttribute('data-theme', curTheme);

/* ── Toggle ──────────────────────────────────────────── */
function toggleTheme() {
  curTheme = curTheme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('demo-theme', curTheme);
  document.documentElement.setAttribute('data-theme', curTheme);
  _updateToggleIcon();
  _refreshGlobalColors();
  if (typeof update === 'function') { update(); }
  else { _relayoutPlots(); }
}

function _refreshGlobalColors() {
  var t = THEMES[curTheme];
  if (typeof _t !== 'undefined') { _t = t; }
  if (typeof plotBg !== 'undefined') { plotBg = t.plotBg; }
  if (typeof paperBg !== 'undefined') { paperBg = t.paperBg; }
  if (typeof gridColor !== 'undefined') { gridColor = t.gridColor; }
  if (typeof textColor !== 'undefined') { textColor = t.textColor; }
  if (typeof lo !== 'undefined' && lo) {
    lo.paper_bgcolor = t.plotBg;
    lo.plot_bgcolor = t.plotBg;
    if (lo.font) lo.font.color = t.textColor;
    if (lo.xaxis) { lo.xaxis.gridcolor = t.gridColor; lo.xaxis.zerolinecolor = t.zeroLine; }
    if (lo.yaxis) { lo.yaxis.gridcolor = t.gridColor; lo.yaxis.zerolinecolor = t.zeroLine; }
  }
}

function _updateToggleIcon() {
  var btn = document.querySelector('.theme-toggle');
  if (btn) btn.innerHTML = curTheme === 'dark'
    ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
    : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
}

function _relayoutPlots() {
  if (typeof Plotly === 'undefined') return;
  var t = THEMES[curTheme];
  document.querySelectorAll('.plot').forEach(function(el) {
    if (!el.data) return;
    var upd = {
      paper_bgcolor: t.paperBg, plot_bgcolor: t.plotBg,
      'font.color': t.textColor,
      'xaxis.gridcolor': t.gridColor, 'xaxis.zerolinecolor': t.zeroLine,
      'yaxis.gridcolor': t.gridColor, 'yaxis.zerolinecolor': t.zeroLine
    };
    // 3D scenes
    if (el.layout && el.layout.scene) {
      upd['scene.bgcolor'] = t.plotBg;
      upd['scene.xaxis.backgroundcolor'] = t.plotBg;
      upd['scene.xaxis.gridcolor'] = t.gridColor;
      upd['scene.xaxis.color'] = t.textColor;
      upd['scene.yaxis.backgroundcolor'] = t.plotBg;
      upd['scene.yaxis.gridcolor'] = t.gridColor;
      upd['scene.yaxis.color'] = t.textColor;
      upd['scene.zaxis.backgroundcolor'] = t.plotBg;
      upd['scene.zaxis.gridcolor'] = t.gridColor;
      upd['scene.zaxis.color'] = t.textColor;
    }
    try { Plotly.relayout(el, upd); } catch(e) {}
  });
}

/* ── Set icon on load ────────────────────────────────── */
document.addEventListener('DOMContentLoaded', _updateToggleIcon);
