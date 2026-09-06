export function visitFolder(history = { paths: [], index: -1 }, path) {
  if (history.paths[history.index] === path) return history;
  const paths = [...history.paths.slice(0, history.index + 1), path].slice(-80);
  return { paths, index: paths.length - 1 };
}
export function stepFolder(history, delta) {
  return { ...history, index: Math.max(0, Math.min(history.paths.length - 1, history.index + delta)) };
}
