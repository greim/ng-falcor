// See mit-license.txt for license info

/* eslint-env mocha */

import extract from '../src/extract';
import assert from 'assert';

describe('extract', () => {

  it('should extract a top-level value', () => {
    const val = extract({ foo: 0 }, ['foo']);
    assert.strictEqual(val, 0);
  });

  it('should extract a second-level value', () => {
    const val = extract({ foo: { bar: 1 } }, ['foo','bar']);
    assert.strictEqual(val, 1);
  });

  it('should extract a top-level atom', () => {
    const val = extract({ foo: { $type: 'atom', value: 2 } }, ['foo']);
    assert.strictEqual(val, 2);
  });

  it('should extract a second-level atom', () => {
    const val = extract({ foo: { bar: { $type: 'atom', value: 3 } } }, ['foo','bar']);
    assert.strictEqual(val, 3);
  });

  it('should follow refs', () => {
    const jsong = {
      foo: { $type: 'ref', value: ['baz'] },
      baz: { bar: { $type: 'atom', value: 4 } }
    };
    const val = extract(jsong, ['foo','bar']);
    assert.strictEqual(val, 4);
  });

  it('should follow a last ref', () => {
    const jsong = {
      foo: { $type: 'ref', value: ['baz'] },
      baz: { $type: 'atom', value: 4 }
    };
    const val = extract(jsong, ['foo']);
    assert.strictEqual(val, 4);
  });

  it('should follow multiple refs', () => {
    const jsong = {
      foo: { $type: 'ref', value: ['bar'] },
      bar: { baz: { $type: 'ref', value: ['qux'] } },
      qux: { wub: { $type: 'atom', value: 5 } }
    };
    const val = extract(jsong, ['foo','baz','wub']);
    assert.strictEqual(val, 5);
  });

  it('should not extract a non-existant top-level value', () => {
    const val = extract({}, ['foo','bar']);
    assert.strictEqual(val, undefined);
  });

  it('should not extract a non-existant second-level value', () => {
    const val = extract({ foo: {} }, ['foo','bar']);
    assert.strictEqual(val, undefined);
  });

  it('should extract null', () => {
    const val = extract({ foo: null }, ['foo']);
    assert.strictEqual(val, null);
  });

  it('should extract an error', () => {
    const val = extract({ foo: { $type: 'error', value: 'oops' } }, ['foo']);
    assert.strictEqual(val, 'oops');
  });

  it('should extract an error over a ref', () => {
    const jsong = {
      foo: { $type: 'ref', value: ['bar'] },
      bar: { $type: 'error', value: 'yikes' }
    };
    const val = extract(jsong, ['foo']);
    assert.strictEqual(val, 'yikes');
  });
});
