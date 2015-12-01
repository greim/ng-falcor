// See mit-license.txt for license info

import { Model } from 'falcor';
import HttpDataSource from 'falcor-http-datasource';
import extract from './extract';
import pathSyntax from 'falcor-path-syntax';
import thenify from './thenify';
import memoize from './memoize';

const parse = memoize(pathSyntax.fromPath);

function create({ router, cache }) {

  function factory($rootScope) {

    // Called whenever model changes.
    const onChange = () => { $rootScope.$evalAsync(); };

    // This syncs the model to the server-side Falcor router.
    const source = router && new HttpDataSource(router);

    // Central cache of data shared by all ngf consumers.
    const model = new Model({ source, onChange, cache }).batch(); // de-bounces router fetches

    // Extract values from this for synchronous reads.
    const graph = model._root.cache;

    // This is the singleton created by the factory.
    const ngf = function(path) {
      if (arguments.length > 1) {
        path = Array.from(arguments);
      } else if (typeof path === 'string') {
        path = parse(path);
      }
      const result = extract(graph, path);
      if (result === undefined) {
        ngf.getValue(path);
      }
      return result;
    };

    // Re-expose model methods to all consumers.
    ngf.get = thenify(model.get.bind(model));
    ngf.getValue = thenify(model.getValue.bind(model));
    ngf.set = thenify(model.set.bind(model));
    ngf.call = thenify(model.call.bind(model));

    // Two-way binding helper.
    ngf.twoWay = function(path) {
      path = parse(path);
      return function(newValue) {
        const isSet = arguments.length > 0;
        if (isSet) {
          ngf.setValue(path, newValue);
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

export { create };
