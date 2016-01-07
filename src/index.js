// See mit-license.txt for license info

import { Model } from 'falcor';
import HttpDataSource from 'falcor-http-datasource';
import extract from './extract';
import pathSyntax from 'falcor-path-syntax';
import thenify from './thenify';
import memoize from './memoize';

const parse = memoize(pathSyntax.fromPath);

function create({
  router,
  timeout,
  headers,
  cache
} = {}) {

  function factory($rootScope) {

    // Called whenever model changes.
    const onChange = () => { $rootScope.$evalAsync(); };

    // This syncs the model to the server-side Falcor router.
    const source = router && new HttpDataSource(router, { timeout, headers });

    // Central cache of data shared by all ngf consumers.
    const model = new Model({ source, onChange, cache }).batch(); // de-bounces router fetches

    // Extract values from this for synchronous reads.
    const graph = model._root.cache;

    // Retrieve a value. Path must reference a single node in the graph.
    const ngf = pathify(function(path) {
      model.getValue(path);
      return extract(graph, path);
    });

    // proxy the model on this object
    ngf.model = {};
    for (const [ srcName, destName ] of [
      [ 'get', 'get' ],
      [ 'getValue', 'getValue' ],
      [ 'set', 'set' ],
      [ 'call', 'callModel' ],
      [ 'invalidate', 'invalidate' ]
    ]) {
      let fn = model[srcName];
      fn = fn.bind(model);
      fn = thenify(fn);
      ngf[destName] = fn;
    }

    // Two-way binding helper.
    ngf.twoWay = function(path) {
      path = parse(path);
      return function(value) {
        const isSet = arguments.length > 0;
        if (isSet) {
          ngf.set({ path, value });
        } else {
          return extract(graph, path);
        }
      };
    };

    // All done.
    return ngf;
  }

  factory.$inject = ['$rootScope'];
  return factory;
}

function pathify(cb) {
  return function(path) {
    if (arguments.length > 1) {
      path = Array.from(arguments);
    } else if (typeof path === 'string') {
      path = parse(path);
    }
    return cb.call(this, path);
  };
}

export { create };
