// See mit-license.txt for license info

/* eslint-env mocha */

import { create } from '../src';
import assert from 'assert';

var $rootScope = {
  $evalAsync() {}
};

describe('ng-falcor', () => {

  describe('create', () => {

    it('should create', () => {
      create({});
    });
  });

  describe('factory', () => {

    it('should be a function', () => {
      const factory = create({});
      assert.strictEqual(typeof factory, 'function');
    });

    it('factory should inject root scope', () => {
      const factory = create({});
      assert.deepEqual(factory.$inject, ['$rootScope']);
    });
  });

  describe('ngf', () => {

    it('should be a function', () => {
      const factory = create({});
      const ngf = factory($rootScope);
      assert.strictEqual(typeof ngf, 'function');
    });

    it('getValue should be a function', () => {
      const factory = create({});
      const ngf = factory($rootScope);
      assert.strictEqual(typeof ngf.getValue, 'function');
    });

    it('getValue should return a thenable', () => {
      const factory = create({});
      const ngf = factory($rootScope);
      const thenable = ngf.getValue(['foo']);
      assert.strictEqual(typeof thenable.then, 'function');
    });

    it('should return undefined at first', () => {
      const factory = create({});
      const ngf = factory($rootScope);
      const val = ngf('foo');
      assert.strictEqual(val, undefined);
    });

    it('should accept a cache', () => {
      const factory = create({ cache: { foo: 1 } });
      factory($rootScope);
    });

    it('should return a value from cache', () => {
      const factory = create({ cache: { foo: 1 } });
      const ngf = factory($rootScope);
      const val = ngf('foo');
      assert.strictEqual(val, 1);
    });

    it('should return a value from cache multiple times', () => {
      const factory = create({ cache: { foo: 1 } });
      const ngf = factory($rootScope);
      let val = ngf('foo');
      assert.strictEqual(val, 1);
      val = ngf('foo');
      assert.strictEqual(val, 1);
    });

    it('should accept path strings', () => {
      const factory = create({ cache: { foo: { bar: 2 } } });
      const ngf = factory($rootScope);
      const val = ngf('foo.bar');
      assert.strictEqual(val, 2);
    });

    it('should accept path args', () => {
      const factory = create({ cache: { foo: { bar: 2 } } });
      const ngf = factory($rootScope);
      const val = ngf('foo', 'bar');
      assert.strictEqual(val, 2);
    });

    it('should follow refs', () => {
      var cache = {
        foo: { bar: { $type: 'ref', value: ['fiz', 'fuz'] } },
        fiz: { fuz: 3 }
      };
      const factory = create({ cache });
      const ngf = factory($rootScope);
      const val = ngf('foo', 'bar');
      assert.strictEqual(val, 3);
    });

    it('should accept a router', () => {
      var router = '/model.json';
      const factory = create({ router });
      factory($rootScope);
    });

    it('should invalidate', () => {
      const factory = create({ cache: { foo: 'x' } });
      const ngf = factory($rootScope);
      let val = ngf('foo');
      assert.strictEqual(val, 'x');
      ngf.invalidate('foo');
      val = ngf('foo');
      assert.strictEqual(val, undefined);
    });

    it('should set', () => {
      const factory = create();
      const ngf = factory($rootScope);
      return ngf.set({ path: 'foo', value: 'bar' }).then(() => {
        const val = ngf('foo');
        assert.strictEqual(val, 'bar');
      });
    });
  });

  describe('two-way binding', () => {

    it('should get', () => {
      const factory = create({ cache: { foo: 'bar' }});
      const ngf = factory($rootScope);
      const tw = ngf.twoWay('foo');
      const val = tw();
      assert.strictEqual(val, 'bar');
    });

    it('should set', () => {
      const factory = create({ cache: { foo: 'bar' }});
      const ngf = factory($rootScope);
      const tw = ngf.twoWay('foo');
      tw('baz');
      const val = ngf('foo');
      assert.strictEqual(val, 'baz');
    });

    it('should set and get', () => {
      const factory = create();
      const ngf = factory($rootScope);
      const tw = ngf.twoWay('foo');
      tw('baz');
      const val = tw();
      assert.strictEqual(val, 'baz');
    });

    it('should get and set', () => {
      const factory = create();
      const ngf = factory($rootScope);
      const tw = ngf.twoWay('foo');
      let val = tw();
      assert.strictEqual(val, undefined);
      tw('baz');
      val = tw();
      assert.strictEqual(val, 'baz');
    });

    it('should configure', () => {
      const factory = create();
      const ngf = factory($rootScope);
      ngf.configure();
    });
  });
});
