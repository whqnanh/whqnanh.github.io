const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace inline font-pixel styles in stats
html = html.split('style="font-family: var(--font-pixel); font-size: 1.05rem;"').join('class="stat-meta"');

// Replace inline font-pixel in config reload
html = html.split('style="font-family: var(--font-pixel); font-size: 1.15rem; color: #10b981;"')
           .join('style="font-family: var(--font-mono); font-size: 0.85rem; font-weight: 600; color: #10b981;"');

// Replace inline font-pixel in footer
html = html.split('style="font-family: var(--font-pixel); font-size: 1.15rem;"')
           .join('style="font-family: var(--font-sans); font-size: 0.85rem; color: var(--text-muted);"');

fs.writeFileSync('index.html', html);
console.log('Cleaned font-pixel styles from index.html successfully!');
