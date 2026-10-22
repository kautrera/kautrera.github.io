import { visit } from 'unist-util-visit';

// Prefix root-relative image and link URLs in markdown with the site base (needed for GitHub Pages project sites).
export default function rehypeBase({ base = '' } = {}) {
  const prefix = base.replace(/\/$/, '');
  const fix = (v) => (typeof v === 'string' && v.startsWith('/') && !v.startsWith('//') && !v.startsWith(prefix + '/') ? prefix + v : v);
  return (tree) => {
    if (!prefix) return;
    visit(tree, 'element', (node) => {
      if (node.tagName === 'img') node.properties.src = fix(node.properties.src);
      if (node.tagName === 'a') node.properties.href = fix(node.properties.href);
    });
  };
}
