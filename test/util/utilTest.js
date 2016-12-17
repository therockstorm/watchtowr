import chai from 'chai';
import { it } from 'mocha';
import Util from '../../src/util/util';

const expect = chai.expect;

it('returns ids in order', () => {
  const ids = [...Array(10)].map(() => Util.sequencialId());
  return expect(ids).to.deep.equal(Object.assign(ids).sort());
});

it('Test random stuff here', () => {
  const val = 'dog';
  console.log(val);
});
