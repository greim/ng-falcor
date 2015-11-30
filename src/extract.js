// See mit-license.txt for license info

// pull things out of a falcor graph, following
// refs and unboxing values as necessary
export default function extract(obj, path, idx = 0, root = obj) {
  const isRef = obj && obj.$type === 'ref';
  if (isRef) {
    var newPath = obj.value.concat(path.slice(idx));
    return extract(root, newPath);
  } else if (path.length - idx === 0) {
    return obj && obj.$type ? obj.value : obj;
  } else if (obj === null || obj === undefined) {
    return obj;
  } else {
    var step = path[idx];
    return extract(obj[step], path, idx + 1, root);
  }
}
