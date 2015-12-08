// See mit-license.txt for license info

export default function(fn) {
  const cache = Object.create(null);
  return function(arg) {
    let result = cache[arg];
    if (result === undefined) {
      result = fn.call(this, arg);
      cache[arg] = result;
    }
    return result;
  };
}
