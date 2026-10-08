import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseJsonBody } from './parseBody';

describe('parseJsonBody', () => {
  it('parses a JSON body', () => {
    assert.deepEqual(parseJsonBody('{"id":1}'), { id: 1 });
  });

  it('returns undefined for an empty body, such as a 201 without content', () => {
    assert.equal(parseJsonBody(''), undefined);
    assert.equal(parseJsonBody('  \n'), undefined);
  });

  it('still throws on a malformed body', () => {
    assert.throws(() => parseJsonBody('{oops'));
  });
});
