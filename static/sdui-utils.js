/* SDUI Studio — Pure utility functions (no JSX) */

let _uid = 0;

function tagIds(node) {
  if (!node) return;
  node._id = ++_uid;
  (node.children || []).forEach(tagIds);
}

function buildTreeNode(node) {
  if (!node) return null;
  const p = node.props || {};
  const name = p.text?.slice(0, 22)
    || p.contentDescription?.slice(0, 22)
    || p.url?.split('/').pop()?.slice(0, 22)
    || '';
  return {
    id: node._id,
    type: node.type,
    name,
    sduiLabel: p.sduiLabel,
    open: true,
    children: (node.children || []).map(buildTreeNode).filter(Boolean),
  };
}

function findPath(node, targetId, path = []) {
  const myPath = [...path, node._id];
  if (node._id === targetId) return myPath;
  for (const c of (node.children || [])) {
    const r = findPath(c, targetId, myPath);
    if (r) return r;
  }
  return null;
}

function findIndexPath(node, targetId, path = []) {
  if (node._id === targetId) return path;
  const children = node.children || [];
  for (let i = 0; i < children.length; i++) {
    const r = findIndexPath(children[i], targetId, [...path, i]);
    if (r) return r;
  }
  return null;
}

function getNodeByIndexPath(node, path) {
  let curr = node;
  for (const idx of path) {
    if (!curr?.children?.[idx]) return null;
    curr = curr.children[idx];
  }
  return curr;
}

function findById(node, id) {
  if (!node) return null;
  if (node._id === id) return node;
  for (const c of (node.children || [])) {
    const r = findById(c, id);
    if (r) return r;
  }
  return null;
}

function flattenFsTree(nodes, level = 0) {
  const result = [];
  for (const n of (nodes || [])) {
    result.push({ name: n.name, path: n.path, type: n.is_dir ? 'folder' : 'file', level, open: level === 0 });
    if (n.is_dir && n.children) result.push(...flattenFsTree(n.children, level + 1));
  }
  return result;
}

function pickLang() {
  try { return localStorage.getItem('sdui_lang') || 'tr'; } catch { return 'tr'; }
}

function pickTheme() {
  try { return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; } catch { return 'light'; }
}

function formatRelTime(date, lang) {
  if (!date) return lang === 'tr' ? 'Kaydedilmedi' : 'Unsaved';
  const s = Math.round((Date.now() - date) / 1000);
  if (s < 10) return lang === 'tr' ? 'az önce' : 'just now';
  if (s < 60) return s + (lang === 'tr' ? 'sn' : 's');
  return Math.round(s / 60) + (lang === 'tr' ? ' dk' : 'm');
}
