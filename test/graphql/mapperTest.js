import chai from 'chai';
import { describe, it } from 'mocha';
import Mapper from '../../src/graphql/mapper';

const expect = chai.expect;
const runId = '11e6af50-8fbf-b952-80db-218d3d616683';
const testId = 'ba00ee81-86f9-4014-8550-2ec523734648';
const emptyArray = [];
const run = (success = false) => ({
  id: runId,
  started: 1480224613,
  results: [{ success }, { success: true }],
});
const expectedRun = (success = false) => ({
  id: runId,
  started: '2016-11-27T05:30:13.000Z',
  results: [{ success }, { success: true }],
  success,
});
const tests = {
  id: testId,
};

describe('toApiRun', () => {
  it('returns error if no run', () => (
    expect(Mapper.toApiRun(null, emptyArray)).to.equal(emptyArray)
  ));

  it('returns error if empty list', () => (
    expect(Mapper.toApiRun([]).message).to.equal('Run not found.')
  ));

  it('maps single run', () => (
    expect(Mapper.toApiRun([run()])).to.deep.equal([expectedRun()])
  ));

  it('maps multiple runs', () => (
    expect(Mapper.toApiRun([run(), run(true)])).to.deep.equal([expectedRun(), expectedRun(true)])
  ));
});

describe('toApiTest', () => {
  it('returns error if no test', () => (
    expect(Mapper.toApiTest(null, emptyArray)).to.equal(emptyArray)
  ));

  it('returns error if empty list', () => (
    expect(Mapper.toApiTest([]).message).to.equal('Test not found.')
  ));

  it('maps tests', () => (
    expect(Mapper.toApiTest([tests])).to.deep.equal([tests])
  ));
});
