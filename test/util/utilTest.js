import chai from 'chai';
import { it } from 'mocha';
import Util from '../../src/util/util';

const expect = chai.expect;

it('returns ids in order', () => {
  const ids = [...Array(10)].map(() => Util.sequencialId());
  return expect(ids).to.deep.equal(Object.assign(ids).sort());
});

it('Replaces all instances', () => {
  expect(Util.replaceAll('DOG_REPs chase CAT_REPs. DOG_REP', { DOG_REP: 'dog', CAT_REP: 'cat' }))
    .to.equal('dogs chase cats. dog');
});

it('Test random stuff here', () => {
  const bytes = s => ~-encodeURI(s).split(/%..|./).length; // eslint-disable-line no-bitwise
  const jsonSize = s => bytes(JSON.stringify(s));

  console.log(jsonSize({ 'shirt-color': 'R', 'shirt-size': 'M' }));
});
