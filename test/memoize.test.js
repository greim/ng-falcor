// See mit-license.txt for license info

/* eslint-env mocha */

import memoize from '../src/memoize';
import assert from 'assert';

describe('memoize', () => {

  it('should return the value on first call', () => {
    const f = memoize(foo => foo * foo);
    const val = f(2);
    assert.strictEqual(val, 4);
  });

  it('should return the value on second call', () => {
    const f = memoize(foo => foo * foo);
    f(3);
    const val = f(3);
    assert.strictEqual(val, 9);
  });

  it('should only call the function first time', () => {
    let callCount = 0;
    const f = memoize(foo => {
      assert(++callCount === 1);
      return foo * foo;
    });
    f(4);
    f(4);
  });
});
