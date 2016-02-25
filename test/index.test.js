// See mit-license.txt for license info

/* eslint-env mocha */

import ngFalcor from '../src';
import { create } from '../src';
import assert from 'assert';
import { Model } from 'falcor';

var $rootScope = {
  $evalAsync() {}
};

describe('ng-falcor', () => {

  describe('importing', () => {

    it('should import both in CJS and ES6', () => {
      const cjsModule = require('../src');
      assert.strictEqual(ngFalcor, cjsModule);
      assert.strictEqual(ngFalcor.create, cjsModule.create);
      assert.strictEqual(create, cjsModule.create);
      assert.strictEqual(typeof ngFalcor.create, 'function');
    });
  });

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

    it('getValue should return a promise', () => {
      const factory = create({});
      const ngf = factory($rootScope);
      const thenable = ngf.getValue(['foo']);
      assert.strictEqual(typeof thenable.then, 'function', 'no then method');
      assert.strictEqual(typeof thenable.catch, 'function', 'no catch method');
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

    it('should not accept path strings', () => {
      const factory = create({ cache: { foo: { bar: 2 } } });
      const ngf = factory($rootScope);
      const val = ngf('foo.bar');
      assert.strictEqual(val, undefined);
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

    it('should withoutDataSource', async function() {
      const factory = create();
      const ngf = factory($rootScope);
      await ngf.set({ path: ['a'], value: 'b' });
      assert.strictEqual(ngf('a'), 'b');
      var m = ngf.withoutDataSource();
      assert.strictEqual(await m.getValue(['a']), 'b');
    });

    it('should use model as data source', async function() {
      const model = new Model({
        cache: { a: 'b' }
      });
      const source = model.asDataSource();
      const factory = create({ source });
      const ngf = factory($rootScope);
      assert.strictEqual(await ngf.getValue(['a']), 'b');
    });

    it('should not dupe calls to data source', async function() {
      let count = 0;
      const model = new Model({
        cache: { a: 'b' }
      });
      const source = model.asDataSource();
      source.call = function() {
        count++;
        return model.get('a'); // just need to return a modelresponse here.
      };
      const factory = create({ source });
      const ngf = factory($rootScope);
      const prom = ngf.callModel('foo', ['a'], [], []);
      await prom;
      await prom;
      assert.strictEqual(count, 1);
    });

    it('should have initial configuration', () => {
      const factory = create({ router: '/model.json' });
      const ngf = factory($rootScope);
      assert.strictEqual(ngf._config.router, '/model.json');
      assert(!!ngf._config._source, 'missing source');
    });

    it('should configure', () => {
      const factory = create();
      const ngf = factory($rootScope);
      ngf.configure({ router: '/model.json' });
      assert.strictEqual(ngf._config.router, '/model.json');
      assert(!!ngf._config._source, 'missing source');
    });

    it('should configure router', () => {
      const factory = create({ router: '/model.json' });
      const ngf = factory($rootScope);
      const oldSource = ngf._config._source;
      ngf.configure({ router: '/model2.json' });
      assert.strictEqual(ngf._config.router, '/model2.json');
      assert(oldSource !== ngf._config._source, 'wrong source');
    });

    it('should reconfigure', () => {
      const factory = create({ headers: { foo: 'bar' } });
      const ngf = factory($rootScope);
      ngf.reconfigure({ headers: { baz: 'qux' } });
      assert.deepEqual(ngf._config.headers, { foo: 'bar', baz: 'qux' });
    });

    it('should reconfigure set null', () => {
      const factory = create({ router: '/foo' });
      const ngf = factory($rootScope);
      ngf.reconfigure({ router: null });
      assert.strictEqual(ngf._config.router, undefined);
    });

    it('should reconfigure headers set null', () => {
      const factory = create({ headers: { foo: 'bar' } });
      const ngf = factory($rootScope);
      ngf.reconfigure({ headers: null });
      assert.strictEqual(ngf._config.headers, undefined);
    });

    it('should not keep ref to cache', () => {
      const factory = create({ cache: { foo: 'bar' } });
      const ngf = factory($rootScope);
      assert.strictEqual(ngf._config.cache, undefined);
    });

    it('should create a range', () => {
      const factory = create();
      const ngf = factory($rootScope);
      const range = ngf.range(0,3);
      assert.deepEqual(range, [0,1,2,3]);
    });

    it('should create a range starting above zero', () => {
      const factory = create();
      const ngf = factory($rootScope);
      const range = ngf.range(10,13);
      assert.deepEqual(range, [10,11,12,13]);
    });

    it('should create an inverted range', () => {
      const factory = create();
      const ngf = factory($rootScope);
      const range = ngf.range(13,10);
      assert.deepEqual(range, [13,12,11,10]);
    });

    it('should scope', () => {
      const cache = {
        users: {
          abc: { foo: 'aaa', bar: 'bbb' }
        }
      };
      const factory = create({ cache });
      const ngf = factory($rootScope);
      const abc = ngf.scope(['users','abc']);
      const val = abc('foo');
      assert.strictEqual(val, 'aaa');
    });

    it('should scope with a function', () => {
      const cache = {
        users: {
          abc: { foo: 'aaa', bar: 'bbb' }
        }
      };
      const factory = create({ cache });
      const ngf = factory($rootScope);
      const abc = ngf.scope(() => ['users','abc']);
      const val = abc('foo');
      assert.strictEqual(val, 'aaa');
    });

    it('should scope following references', () => {
      const cache = {
        things: {
          def: { bar: 'baz' }
        },
        users: {
          abc: { foo: { $type: 'ref', value: [ 'things', 'def' ] } }
        }
      };
      const factory = create({ cache });
      const ngf = factory($rootScope);
      const abc = ngf.scope(['users','abc']);
      const val = abc('foo', 'bar');
      assert.strictEqual(val, 'baz');
    });

    it('should accept both arrays and bare args', () => {
      const factory = create({ cache: { foo: { bar: { baz: 3 } } } });
      const ngf = factory($rootScope);
      assert.strictEqual(ngf('foo', 'bar', 'baz'), ngf(['foo', 'bar', 'baz']));
    });

    it('should return undefined on undefined or null path steps', () => {
      const factory = create();
      const ngf = factory($rootScope);
      assert.strictEqual(ngf('foo', null, 'baz'), undefined);
      assert.strictEqual(ngf('foo', undefined, 'baz'), undefined);
    });

    it('should have $error, $ref, $atom', () => {
      const factory = create();
      const ngf = factory($rootScope);
      assert.strictEqual(typeof ngf.ref, 'function');
      assert.strictEqual(typeof ngf.atom, 'function');
      assert.strictEqual(typeof ngf.error, 'function');
    });

    it('should detach', done => {
      const cache = { foo: 1, bar: { baz: 2 }, qux: 3 };
      const factory = create({ cache });
      const ngf = factory($rootScope);
      ngf.detach({
        foo: ['foo'],
        baz: ['bar', 'baz'],
        qux: ['qux']
      })
      .then(detached => {
        assert.deepEqual(detached, { foo: 1, baz: 2, qux: 3 });
        done();
      })
      .catch(done);
    });

    it('should reattach', done => {
      const cache = { foo: 1, bar: { baz: 2 }, qux: 3 };
      const factory = create({ cache });
      const ngf = factory($rootScope);
      ngf.detach({
        foo: ['foo'],
        baz: ['bar', 'baz'],
        qux: ['qux']
      })
      .then(detached => {
        detached.foo = 123;
        return ngf.reattach(detached);
      })
      .then(() => {
        assert.strictEqual(ngf('foo'), 123);
        assert.strictEqual(ngf('bar', 'baz'), 2);
        assert.strictEqual(ngf('qux'), 3);
        done();
      })
      .catch(done);
    });

    it('should not return errors', () => {
      const cache = {
        foo: { $type: 'error', value: 'oops' }
      };
      const factory = create({ cache });
      const ngf = factory($rootScope);
      assert.strictEqual(ngf('foo'), undefined);
    });

    describe('paging', () => {

      describe('stepping', () => {

        it('should initialize to zero', () => {
          const factory = create({});
          const ngf = factory($rootScope);
          const stepper = ngf.stepper(3);
          assert.strictEqual(stepper.hasNext(3), false);
          assert.strictEqual(stepper.hasNext(4), true);
          assert.strictEqual(stepper.hasPrev(), false);
          assert.deepEqual(stepper.indices(), [0,1,2]);
        });

        it('should not prev into negative range', () => {
          const factory = create({});
          const ngf = factory($rootScope);
          const stepper = ngf.stepper(3);
          stepper.prev();
          assert.strictEqual(stepper.hasNext(3), false);
          assert.strictEqual(stepper.hasNext(4), true);
          assert.strictEqual(stepper.hasPrev(), false);
          assert.deepEqual(stepper.indices(), [0,1,2]);
        });

        it('should step on next', () => {
          const factory = create({});
          const ngf = factory($rootScope);
          const stepper = ngf.stepper(3);
          stepper.prev();
          stepper.next();
          assert.strictEqual(stepper.hasNext(6), false);
          assert.strictEqual(stepper.hasNext(7), true);
          assert.strictEqual(stepper.hasPrev(), true);
          assert.deepEqual(stepper.indices(), [3,4,5]);
        });

        it('should reverse step on prev', () => {
          const factory = create({});
          const ngf = factory($rootScope);
          const stepper = ngf.stepper(3);
          stepper.prev();
          stepper.next();
          stepper.prev();
          assert.strictEqual(stepper.hasNext(3), false);
          assert.strictEqual(stepper.hasNext(4), true);
          assert.strictEqual(stepper.hasPrev(), false);
          assert.deepEqual(stepper.indices(), [0,1,2]);
        });
      });

      describe('increasing', () => {

        it('should initialize to zero', () => {
          const factory = create({});
          const ngf = factory($rootScope);
          const increaser = ngf.increaser(3);
          assert.strictEqual(increaser.hasMore(3), false);
          assert.strictEqual(increaser.hasMore(4), true);
          assert.deepEqual(increaser.indices(), [0,1,2]);
        });

        it('should increase on more', () => {
          const factory = create({});
          const ngf = factory($rootScope);
          const increaser = ngf.increaser(3);
          increaser.more();
          assert.strictEqual(increaser.hasMore(6), false);
          assert.strictEqual(increaser.hasMore(7), true);
          assert.deepEqual(increaser.indices(), [0,1,2,3,4,5]);
        });
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

    it('should accept both bare args and array', () => {
      const factory = create({ cache: { foo: { bar: 2 } } });
      const ngf = factory($rootScope);
      const tw1 = ngf.twoWay('foo', 'bar');
      const tw2 = ngf.twoWay(['foo', 'bar']);
      assert.strictEqual(tw1(), tw2());
    });
  });
});
