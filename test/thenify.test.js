// See mit-license.txt for license info

/* eslint-env mocha */

import thenify from '../src/thenify';
import assert from 'assert';

describe('thenify', () => {

  it('should return a function', () => {
    const f = thenify(() => 1);
    assert.strictEqual(typeof f, 'function');
  });

  it('should preserve function behavior', () => {
    const f = thenify(() => 1);
    const result = f();
    assert.strictEqual(result, 1);
  });

  it('should not call then() if it does not exist', () => {
    const f = thenify(() => ({}));
    f();
  });

  it('should not call then() if returns undefined', () => {
    const f = thenify(() => undefined);
    f();
  });

  it('should not call then() if it is not a function', () => {
    const f = thenify(() => ({ then: true }));
    f();
  });

  it('should call then() if it exists and is function', () => {
    let itWorked = false;
    const f = thenify(() => ({ then() { itWorked = true; } }));
    f();
    assert(itWorked);
  });
});
