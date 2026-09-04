const fs = require('fs');
let css = fs.readFileSync('css/style.css', 'utf8');

// Update .pixel-tag
css = css.replace(
  /\.pixel-tag \{[\s\S]*?font-weight: 700;\s*\}/,
  `.pixel-tag {\n  font-family: var(--font-sans);\n  font-size: 0.82rem;\n  letter-spacing: 0.05em;\n  color: var(--text-main);\n  font-weight: 700;\n  text-transform: uppercase;\n}`
);

// Update .section-tagline
css = css.replace(
  /\.section-tagline \{[\s\S]*?display: block;\s*\}/,
  `.section-tagline {\n  font-family: var(--font-sans);\n  font-size: 0.82rem;\n  letter-spacing: 0.08em;\n  font-weight: 700;\n  color: #1a73e8;\n  text-transform: uppercase;\n  margin-bottom: var(--space-xs);\n  display: block;\n}`
);

// Update .price-pill
css = css.replace(
  /\.price-pill \{[\s\S]*?border: 1px solid var\(--border-medium\);\s*\}/,
  `.price-pill {\n  font-family: var(--font-sans);\n  font-size: 0.95rem;\n  font-weight: 700;\n  letter-spacing: -0.01em;\n  padding: 4px 14px;\n  border-radius: var(--radius-pill);\n  background: var(--bg-surface);\n  color: var(--text-main);\n  border: 1px solid var(--border-medium);\n}`
);

// Update .tag-badge
css = css.replace(
  /\.tag-badge \{[\s\S]*?border: 1px solid var\(--border-subtle\);\s*\}/,
  `.tag-badge {\n  font-family: var(--font-sans);\n  font-size: 0.74rem;\n  letter-spacing: 0.04em;\n  font-weight: 600;\n  color: var(--text-subtle);\n  background: var(--bg-surface);\n  padding: 3px 10px;\n  border-radius: var(--radius-pill);\n  border: 1px solid var(--border-subtle);\n}`
);

// Update terminal fonts
css = css.replace(
  /\.terminal-label \{[\s\S]*?font-weight: 500;\s*\}/,
  `.terminal-label {\n  font-family: var(--font-mono);\n  font-size: 0.8rem;\n  letter-spacing: 0.02em;\n  color: #94a3b8;\n  font-weight: 600;\n}`
);

css = css.replace(
  /\.terminal-content \{[\s\S]*?line-height: 1.6;\s*\}/,
  `.terminal-content {\n  padding: var(--space-lg) var(--space-xl);\n  font-family: var(--font-mono);\n  font-size: 0.875rem;\n  letter-spacing: 0.01em;\n  color: #f8fafc;\n  min-height: 280px;\n  max-height: 380px;\n  overflow-y: auto;\n  line-height: 1.6;\n}`
);

css = css.replace(
  /\.term-input \{[\s\S]*?flex: 1;\s*\}/,
  `.term-input {\n  background: transparent;\n  border: none;\n  outline: none;\n  color: #ffffff;\n  font-family: var(--font-mono);\n  font-size: 0.875rem;\n  letter-spacing: 0.02em;\n  flex: 1;\n}`
);

css = css.replace(
  /\.cmd-badge \{[\s\S]*?transition: all 0.2s ease;\s*\}/,
  `.cmd-badge {\n  font-family: var(--font-mono);\n  font-size: 0.8rem;\n  letter-spacing: 0.02em;\n  padding: 4px 14px;\n  border-radius: var(--radius-pill);\n  background: #1e293b;\n  border: 1px solid #334155;\n  color: #94a3b8;\n  cursor: pointer;\n  transition: all 0.2s ease;\n}`
);

// Add .stat-meta
if (!css.includes('.stat-meta')) {
  css += `\n.stat-meta {\n  font-family: var(--font-sans);\n  font-size: 0.8rem;\n  font-weight: 600;\n  color: var(--text-subtle);\n  letter-spacing: 0.02em;\n}\n`;
}

fs.writeFileSync('css/style.css', css);
console.log('Successfully updated typography in css/style.css!');
