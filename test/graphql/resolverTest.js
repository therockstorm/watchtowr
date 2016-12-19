import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { describe, it } from 'mocha';
import sinon from 'sinon';
import Resolver from '../../src/graphql/resolver';
import Reader from '../../src/storage/reader';
import Writer from '../../src/storage/writer';

chai.use(chaiAsPromised);
const expect = chai.expect;
const runId = '11e6af50-8fbf-b952-80db-218d3d616683';
const testId = 'ba00ee81-86f9-4014-8550-2ec523734648';
const readerStub = sinon.stub(new Reader());
const writerStub = sinon.stub(new Writer());
const resolver = new Resolver(readerStub, writerStub);
const expectedRun = { started: '1970-01-01T00:00:00.000Z', results: [], success: true };
const expectedTest = { id: testId };
const runNotFound = 'Run not found.';
const testNotFound = 'Test not found.';

describe('getRun', () => {
  beforeEach(() => readerStub.getRun.reset());

  it('returns run', () => {
    readerStub.getRun.withArgs(testId, runId)
      .returns(Promise.resolve([{ started: 0, results: [] }]));

    return resolver.getRun(testId, runId).then(res => (
      expect(res).to.deep.equal(expectedRun)
    ));
  });

  it('returns error if no run returned', () => {
    readerStub.getRun.withArgs(testId, runId).returns(Promise.resolve([]));

    return resolver.getRun(testId, runId).then(res => (
      expect(res.message).to.equal(runNotFound)
    ));
  });
});

describe('getLastFailure', () => {
  beforeEach(() => readerStub.getRuns.reset());

  it('returns last failure', () => {
    const expected = { started: 1, results: [{ success: true }, { success: false }] };
    readerStub.getRuns.withArgs(testId)
      .returns(Promise.resolve([{ started: 0, results: [{ success: false }] }, expected]));

    return resolver.getLastFailure(testId).then(res => (
      expect(res).to.deep.equal({
        started: '1970-01-01T00:00:00.001Z',
        results: expected.results,
        success: false,
      })
    ));
  });

  it('returns null if no failures', () => {
    readerStub.getRuns.withArgs(testId).returns(Promise.resolve([{ started: 0, results: [] }]));

    return resolver.getLastFailure(testId).then(res => (
      expect(res).to.equal(null)
    ));
  });

  it('returns null if no runs', () => {
    readerStub.getRuns.withArgs(testId).returns(Promise.resolve([]));

    return resolver.getLastFailure(testId).then(res => (
      expect(res).to.equal(null)
    ));
  });
});

describe('getRuns', () => {
  beforeEach(() => readerStub.getRuns.reset());

  it('returns runs', () => {
    readerStub.getRuns.withArgs(testId).returns(Promise.resolve([{ started: 0, results: [] }]));

    return resolver.getRuns(testId).then(res => (
      expect(res).to.deep.equal([expectedRun])
    ));
  });

  it('returns [] if no runs returned', () => {
    readerStub.getRuns.withArgs(testId).returns(Promise.resolve([]));

    return resolver.getRuns(testId).then(res => (
      expect(res).to.deep.equal([])
    ));
  });
});

describe('deleteRun', () => {
  beforeEach(() => writerStub.deleteRun.reset());

  it('returns deleted run', () => {
    writerStub.deleteRun.withArgs(runId).returns(Promise.resolve([{ started: 0, results: [] }]));

    return resolver.deleteRun(runId).then(res => (
      expect(res).to.deep.equal(expectedRun)
    ));
  });

  it('returns error if no run returned', () => {
    writerStub.deleteRun.withArgs(runId).returns(Promise.resolve([]));

    return resolver.deleteRun(runId).then(res => (
      expect(res.message).to.equal(runNotFound)
    ));
  });
});

describe('createTest', () => {
  beforeEach(() => writerStub.createTest.reset());

  it('returns created test', () => {
    writerStub.createTest.withArgs(expectedTest).returns(Promise.resolve(expectedTest));

    return resolver.createTest({ id: testId }).then(res => (
      expect(res).to.deep.equal(expectedTest)
    ));
  });
});

describe('getTest', () => {
  beforeEach(() => readerStub.getTest.reset());

  it('returns test', () => {
    readerStub.getTest.withArgs(testId).returns(Promise.resolve([{ id: testId }]));

    return resolver.getTest(testId).then(res => (
      expect(res).to.deep.equal(expectedTest)
    ));
  });

  it('returns error if no test returned', () => {
    readerStub.getTest.withArgs(testId).returns(Promise.resolve([]));

    return resolver.getTest(testId).then(res => (
      expect(res.message).to.equal(testNotFound)
    ));
  });
});

describe('getTests', () => {
  beforeEach(() => readerStub.getTests.reset());

  it('returns tests', () => {
    readerStub.getTests.returns(Promise.resolve([{ id: testId }]));

    return resolver.getTests().then(res => (
      expect(res).to.deep.equal([expectedTest])
    ));
  });

  it('returns [] if no tests returned', () => {
    readerStub.getTests.returns(Promise.resolve([]));

    return resolver.getTests().then(res => (
      expect(res).to.deep.equal([])
    ));
  });
});

describe('updateTest', () => {
  beforeEach(() => writerStub.updateTest.reset());

  it('returns updated test', () => {
    const test = { id: testId };
    readerStub.getTest.withArgs(test.id).returns(Promise.resolve([test]));
    writerStub.updateTest.returns(Promise.resolve(expectedTest));

    return resolver.updateTest(test).then(res => (
      expect(res).to.deep.equal(expectedTest)
    ));
  });

  it('returns error if no test returned', () => {
    readerStub.getTest.withArgs(testId).returns(Promise.resolve([]));

    return resolver.updateTest({ id: testId }).then(res => (
      expect(res.message).to.equal(testNotFound)
    ));
  });
});

describe('deleteTest', () => {
  beforeEach(() => writerStub.deleteTest.reset());

  it('returns deleted test', () => {
    writerStub.deleteTest.withArgs(testId).returns(Promise.resolve([{ id: testId }]));

    return resolver.deleteTest(testId).then(res => (
      expect(res).to.deep.equal(expectedTest)
    ));
  });

  it('returns error if no test returned', () => {
    writerStub.deleteTest.withArgs(testId).returns(Promise.resolve([]));

    return resolver.deleteTest(testId).then(res => (
      expect(res.message).to.equal(testNotFound)
    ));
  });
});
