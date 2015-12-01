// See mit-license.txt for license info

export default function(fn) {
  const cache = new Map();
  return function(arg) {
    if (cache.has(arg)) {
      return cache.get(arg);
    } else {
      const value = fn.call(this, arg);
      cache.set(arg, value);
      return value;
    }
  };
}
