// See mit-license.txt for license info

import { Model } from 'falcor';
import HttpDataSource from 'falcor-http-datasource';
import extract from './extract';
import pathSyntax from 'falcor-path-syntax';
import thenify from './thenify';
import memoize from './memoize';

const parse = memoize(pathSyntax.fromPath);

function create(opts = {}) {

  function factory($rootScope) {

    // Called whenever model changes.
    const onChange = () => { $rootScope.$evalAsync(); };

    // This syncs the model to the server-side Falcor router.
    let source;

    // Central cache of data shared by all ngf consumers.
    let model;

    // Extract values from this for synchronous reads.
    let graph;

    // Retrieve a value. Path must reference a single node in the graph.
    var thcb = () => {};
    const ngf = pathify(function(path) {
      model.getValue(path).then(thcb);
      return extract(graph, path);
    });

    ngf.configure = function({
      router = opts.router,
      timeout = opts.timeout,
      headers = opts.headers,
      cache = opts.cache
    } = {}) {
      source = router && new HttpDataSource(router, { timeout, headers });
      model = new Model({ source, onChange, cache }).batch();
      graph = model._root.cache;
      $rootScope.$evalAsync();
    };

    ngf.configure(opts);

    // proxy the model on this object
    for (const [ srcName, destName ] of [
      [ 'get', 'get' ],
      [ 'getValue', 'getValue' ],
      [ 'set', 'set' ],
      [ 'call', 'callModel' ],
      [ 'invalidate', 'invalidate' ]
    ]) {
      ngf[destName] = thenify(function(...args) {
        return model[srcName](...args);
      });
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
