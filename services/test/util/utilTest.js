import { assert } from 'chai';
import { it } from 'mocha';
import Util from '../../src/util/util';

it('returns ids in order', () => {
  const ids = [...Array(10)].map(() => Util.sequencialId());
  assert.equal(ids, Object.assign(ids).sort());
});

it('replaces all instances', () => {
  assert.equal(Util.replaceAll('DOG_REPs chase CAT_REPs. DOG_REP', { DOG_REP: 'dog', CAT_REP: 'cat' }), 'dogs chase cats. dog');
});

it('returns different string each time', () => {
  assert.notEqual(Util.randomString(), Util.randomString());
});

it('returns different int each time', () => {
  assert.notEqual(Util.randomInt(), Util.randomInt());
});

it('Test random stuff here', () => {
});
