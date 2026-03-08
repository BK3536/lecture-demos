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
    lo.paper_bgcolor = t.paperBg;
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

/* ── Fullscreen toggle ───────────────────────────────── */
function toggleFullscreen() {
  var c = document.querySelector('.container');
  if (!c) return;
  c.classList.toggle('fs-active');
  _updateFullscreenIcon();
  // Trigger Plotly resize after layout change
  setTimeout(function() {
    if (typeof Plotly !== 'undefined') {
      document.querySelectorAll('.plot').forEach(function(el) {
        if (el.data) try { Plotly.Plots.resize(el); } catch(e) {}
      });
    }
  }, 100);
}

function _updateFullscreenIcon() {
  var btn = document.querySelector('.fullscreen-toggle');
  if (!btn) return;
  var active = document.querySelector('.container.fs-active');
  btn.innerHTML = active
    ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>'
    : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>';
}

/* ── ESC to exit fullscreen ──────────────────────────── */
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && document.querySelector('.container.fs-active')) {
    toggleFullscreen();
  }
});

/* ── Inject fullscreen button on load ────────────────── */
function _injectFullscreenButton() {
  var header = document.querySelector('.header');
  var themeBtn = document.querySelector('.theme-toggle');
  if (!header || !themeBtn || !document.querySelector('.container')) return;
  var btn = document.createElement('button');
  btn.className = 'fullscreen-toggle';
  btn.title = 'Toggle fullscreen (ESC to exit)';
  btn.onclick = toggleFullscreen;
  header.insertBefore(btn, themeBtn);
  _updateFullscreenIcon();
}

/* ── Mobile controls toggle ──────────────────────────── */
function toggleMobileControls() {
  var controls = document.querySelector('.controls');
  if (!controls) return;
  controls.classList.toggle('mobile-open');
  _updateMobileToggleIcon();
  // Resize plots after controls expand/collapse
  setTimeout(function() {
    if (typeof Plotly !== 'undefined') {
      document.querySelectorAll('.plot').forEach(function(el) {
        if (el.data) try { Plotly.Plots.resize(el); } catch(e) {}
      });
    }
  }, 350);
}

function _updateMobileToggleIcon() {
  var btn = document.querySelector('.mobile-controls-toggle');
  if (!btn) return;
  var open = document.querySelector('.controls.mobile-open');
  btn.innerHTML = open
    ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>'
    : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>';
  btn.title = open ? 'Hide controls' : 'Show controls';
}

function _injectMobileControlsToggle() {
  var header = document.querySelector('.header');
  var themeBtn = document.querySelector('.theme-toggle');
  if (!header || !themeBtn || !document.querySelector('.controls')) return;
  var btn = document.createElement('button');
  btn.className = 'mobile-controls-toggle';
  btn.onclick = toggleMobileControls;
  header.insertBefore(btn, themeBtn);
  _updateMobileToggleIcon();
}

/* ── Set icons on load ───────────────────────────────── */
document.addEventListener('DOMContentLoaded', function() {
  _updateToggleIcon();
  _injectFullscreenButton();
  _injectMobileControlsToggle();
});
