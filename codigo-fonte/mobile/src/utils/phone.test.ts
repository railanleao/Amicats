import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { maskBrazilianPhone } from './phone';

describe('maskBrazilianPhone', () => {
  it('formats progressively as the user types', () => {
    assert.equal(maskBrazilianPhone(''), '');
    assert.equal(maskBrazilianPhone('3'), '(3');
    assert.equal(maskBrazilianPhone('31'), '(31');
    assert.equal(maskBrazilianPhone('319'), '(31) 9');
    assert.equal(maskBrazilianPhone('3199999'), '(31) 9999-9');
    assert.equal(maskBrazilianPhone('31999998888'), '(31) 99999-8888');
  });

  it('formats landlines with 10 digits', () => {
    assert.equal(maskBrazilianPhone('3133334444'), '(31) 3333-4444');
  });

  it('ignores non-digits and extra characters', () => {
    assert.equal(maskBrazilianPhone('(31) 99999-8888123'), '(31) 99999-8888');
  });
});
