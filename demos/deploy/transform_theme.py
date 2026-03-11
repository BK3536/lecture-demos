#!/usr/bin/env python3
"""Transform all demo HTML files to add theme toggle + back navigation."""
import re, glob, os

DEMOS_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def transform_file(filepath):
    with open(filepath, 'r') as f:
        html = f.read()

    fname = os.path.basename(filepath)
    is_index = fname == 'index.html'

    # Determine relative path to theme files
    rel = os.path.relpath(DEMOS_DIR, os.path.dirname(filepath))
    if rel == '.':
        prefix = ''
    else:
        prefix = rel + '/'

    # Skip if already transformed
    if 'theme.css' in html:
        print(f'  SKIP {filepath} (already transformed)')
        return

    # 1. Add theme.css link after the Inter font link
    inter_link = 'href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap">'
    if inter_link in html:
        html = html.replace(
            inter_link,
            inter_link + f'\n<link rel="stylesheet" href="{prefix}theme.css?v=4">'
        )

    # 2. Add theme.js script
    if is_index:
        # For index: add before </head>
        html = html.replace('</style>\n</head>', f'</style>\n<script src="{prefix}theme.js?v=4"></script>\n</head>')
    else:
        # For demos: add after Plotly script tag
        plotly_tag = '<script src="https://cdn.plot.ly/plotly-2.35.2.min.js"></script>'
        if plotly_tag in html:
            html = html.replace(
                plotly_tag,
                plotly_tag + f'\n<script src="{prefix}theme.js?v=4"></script>'
            )

    # 3. Replace the plotBg/lo const lines with theme-aware versions (demos only)
    if not is_index:
        # Replace: const plotBg='#1f2937',paperBg='#1f2937',gridColor='#374151',textColor='#9ca3af';
        old_colors = "const plotBg='#1f2937',paperBg='#1f2937',gridColor='#374151',textColor='#9ca3af';"
        new_colors = "var _t=THEMES[curTheme];const plotBg=_t.plotBg,paperBg=_t.paperBg,gridColor=_t.gridColor,textColor=_t.textColor;"
        html = html.replace(old_colors, new_colors)

        # Replace hardcoded zerolinecolor in lo definition
        html = html.replace("zerolinecolor:'#4b5563'", "zerolinecolor:_t.zeroLine")

    # 4. Modify header to add back-link and toggle
    if is_index:
        # Index: just add toggle button (no back link)
        # Match: <div class="header">...centered content
        html = html.replace(
            '<div class="header">',
            '<div class="header" style="justify-content:center;position:relative;">'
        )
        # Add toggle as last child before closing </div> of header
        # The header ends before <div class="courses">
        html = html.replace(
            '</div>\n<div class="courses">',
            '  <button class="theme-toggle" onclick="toggleTheme()" title="Toggle theme" style="position:absolute;right:2rem;"></button>\n</div>\n<div class="courses">',
            1  # only first occurrence
        )
    else:
        # Demos: add back link + wrap title + add toggle
        # Find header pattern
        header_match = re.search(
            r'<div class="header">\n\s*<h1>(.*?)</h1>\n\s*<p>(.*?)</p>\n</div>',
            html, re.DOTALL
        )
        if header_match:
            h1_content = header_match.group(1)
            p_content = header_match.group(2)
            # Determine back URL
            back_url = f'{prefix}index.html' if prefix else 'index.html'
            new_header = (
                f'<div class="header">\n'
                f'  <a class="back-link" href="{back_url}" title="All demos">&larr;</a>\n'
                f'  <div class="header-title">\n'
                f'    <h1>{h1_content}</h1>\n'
                f'    <p>{p_content}</p>\n'
                f'  </div>\n'
                f'  <button class="theme-toggle" onclick="toggleTheme()" title="Toggle theme"></button>\n'
                f'</div>'
            )
            html = html[:header_match.start()] + new_header + html[header_match.end():]

    with open(filepath, 'w') as f:
        f.write(html)
    print(f'  OK   {filepath}')


def main():
    files = sorted(glob.glob(os.path.join(DEMOS_DIR, '**/*.html'), recursive=True))
    print(f'Transforming {len(files)} files...')
    for f in files:
        # Skip deploy directory
        if '/deploy/' in f:
            continue
        transform_file(f)
    print('Done!')


if __name__ == '__main__':
    main()
