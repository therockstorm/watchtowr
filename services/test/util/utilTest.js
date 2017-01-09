import chai from 'chai';
import { it } from 'mocha';
import Immutable from 'immutable';
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
  // const x = [{ key: 'Dog', value: 'good' }, { key: 'Cat', value: 'bad' }];
  // const l = Immutable.fromJS(x).map((q) => {
  //   return { [q.get('key')]: q.get('value') };
  // });
  // console.log(JSON.stringify(l));
  // const variables = {};
  // x.map(v => (variables[v.key] = v.value));
  // const y = Immutable.fromJS(variables);
  // console.log(y);
  // console.log(y.get('Dog'));
});
