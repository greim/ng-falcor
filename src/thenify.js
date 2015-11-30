// See mit-license.txt for license info

// Falcor promises apparently don't execute until you call
// then(). Hence this helper function since sometimes we
// want the execution while discarding the promise.
export default function(fn) {
  return function() {
    const prom = fn.apply(null, arguments);
    prom.then(noop);
    return prom;
  };
}

function noop() {}
