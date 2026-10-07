import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { maskBrazilianDate, parseBrazilianDate } from './date';

describe('maskBrazilianDate', () => {
  it('inserts the slashes as the user types', () => {
    assert.equal(maskBrazilianDate(''), '');
    assert.equal(maskBrazilianDate('0'), '0');
    assert.equal(maskBrazilianDate('08'), '08');
    assert.equal(maskBrazilianDate('081'), '08/1');
    assert.equal(maskBrazilianDate('0812'), '08/12');
    assert.equal(maskBrazilianDate('08122'), '08/12/2');
    assert.equal(maskBrazilianDate('08122023'), '08/12/2023');
  });

  it('ignores non-digits and extra characters', () => {
    assert.equal(maskBrazilianDate('08/12/2023999'), '08/12/2023');
    assert.equal(maskBrazilianDate('ab08-12'), '08/12');
  });

  it('produces input that parseBrazilianDate accepts', () => {
    assert.equal(parseBrazilianDate(maskBrazilianDate('08122023')), '2023-12-08');
  });
});
