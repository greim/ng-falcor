// See mit-license.txt for license info

// Falcor ModelResult objs don't execute until you call
// then(). Hence this helper function since sometimes we
// want the execution without calling then().
export default function(fn) {
  return function() {
    const prom = fn.apply(null, arguments);
    if (prom && typeof prom.then === 'function') {
      return prom.then(identity);
    }
    return prom;
  };
}

function identity(thing) { return thing; }
