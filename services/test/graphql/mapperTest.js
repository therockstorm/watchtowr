import chai from 'chai';
import { describe, it } from 'mocha';
import Mapper from '../../src/graphql/mapper';

const expect = chai.expect;
const runId = '11e6af50-8fbf-b952-80db-218d3d616683';
const testId = 'ba00ee81-86f9-4014-8550-2ec523734648';
const emptyArray = [];
const run = (success = false) => ({
  id: runId,
  started: 1482017287271,
  results: [{ success }, { success: true }],
});
const expectedRun = (success = false) => ({
  id: runId,
  started: '2016-12-17T23:28:07.271Z',
  results: [{ success }, { success: true }],
  success,
});
const test = { id: testId };
const variable = { key: 'myKey', value: 'myValue' };

describe('toApiRun', () => {
  it('returns error if no run', () => (
    expect(Mapper.toApiRun(null, false, emptyArray)).to.equal(emptyArray)
  ));

  it('returns error if empty list', () => (
    expect(Mapper.toApiRun([]).message).to.equal('Run not found.')
  ));

  it('maps single run', () => (
    expect(Mapper.toApiRun([run()])).to.deep.equal(expectedRun())
  ));

  it('maps multiple runs', () => (
    expect(Mapper.toApiRun([run(), run(true)], true))
      .to.deep.equal([expectedRun(), expectedRun(true)])
  ));
});

describe('toApiTest', () => {
  it('returns error if no test', () => (
    expect(Mapper.toApiTest(null, false, emptyArray)).to.equal(emptyArray)
  ));

  it('returns error if empty list', () => (
    expect(Mapper.toApiTest([]).message).to.equal('Test not found.')
  ));

  it('maps single test', () => (
    expect(Mapper.toApiTest([test])).to.deep.equal(test)
  ));

  it('maps multiple tests', () => {
    const tests = [test, test];
    return expect(Mapper.toApiTest(tests, true)).to.deep.equal(tests);
  });
});

describe('toApiVariable', () => {
  it('returns error if no variable', () => (
    expect(Mapper.toApiVariable(null, false, emptyArray)).to.equal(emptyArray)
  ));

  it('returns error if empty list', () => (
    expect(Mapper.toApiVariable([]).message).to.equal('Variable not found.')
  ));

  it('maps single variable', () => (
    expect(Mapper.toApiVariable([variable])).to.deep.equal(variable)
  ));

  it('maps multiple variables', () => {
    const variables = [variable, variable];
    return expect(Mapper.toApiTest(variables, true)).to.deep.equal(variables);
  });
});

describe('toVariables', () => {
  const expected = [{ key: '{{myKey}}', value: 'myValue' }];
  let vars;

  beforeEach(() => {
    vars = { key: 'myKey', value: 'myValue' };
    return true;
  });

  it('adds replacements to variable', () => (
    expect(Mapper.toVariables([vars])).to.deep.equal(expected)
  ));

  it('does not add replacements if exist at beginning', () => {
    const vCopy = vars;
    vCopy.key = `{{${vars.key}`;
    return expect(Mapper.toVariables([vCopy])).to.deep.equal(expected);
  });

  it('does not add replacements if exist at end', () => {
    const vCopy = vars;
    vCopy.key = `${vars.key}}}`;
    return expect(Mapper.toVariables([vCopy])).to.deep.equal(expected);
  });

  it('does not add replacements if exist at beginning and end', () => {
    const vCopy = vars;
    vCopy.key = `{{${vars.key}}}`;
    return expect(Mapper.toVariables([vCopy])).to.deep.equal(expected);
  });

  it('remove replacements in the middle of key', () => {
    const vCopy = vars;
    vCopy.key = 'my{{}}Key';
    return expect(Mapper.toVariables([vCopy])).to.deep.equal(expected);
  });
});
