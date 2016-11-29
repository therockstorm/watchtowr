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
const existingRun = {
  id: runId,
  started: 1480224613,
  results: [{ success: false }, { success: true }],
};
const expectedRun = {
  id: runId,
  started: '2016-11-27T05:30:13.000Z',
  results: [{ success: false }, { success: true }],
  success: false,
};
// const existingStep = {
//   request: {
//     method: 'POST',
//     url: 'https://example.com/post',
//   },
//   assertions: [{
//     type: 'STATUS_CODE_EQ',
//     value: '201',
//   }],
// };
// const newStep = {
//   testId,
//   request: {
//     headers: [{
//       key: 'x-key1',
//       value: 'x-value1',
//     }, {
//       key: 'x-key2',
//       value: 'x-value2',
//     }],
//     method: 'GET',
//     url: 'https://example.com/get',
//   },
//   assertions: [{
//     type: 'STATUS_CODE_EQ',
//     value: '200',
//   }, {
//     type: 'ELAPSED_LT',
//     value: '1000',
//   }],
// };

// function setupGetTest(ret) {
//   readerStub.getTest.withArgs(testId).returns(Promise.resolve(ret));
// }

describe('getRun', () => {
  beforeEach(() => readerStub.getRun.reset());

  it('returns run', () => {
    readerStub.getRun.withArgs(testId, runId).returns(Promise.resolve([existingRun]));

    return resolver.getRun(testId, runId).then(res => (
      expect(res).to.deep.equal([expectedRun]) && expect(readerStub.getRun.called).to.be.true
    ));
  });
});

describe('getRuns', () => {
  beforeEach(() => readerStub.getRuns.reset());

  it('returns runs', () => {
    readerStub.getRuns.withArgs(testId).returns(Promise.resolve([existingRun]));

    return resolver.getRuns(testId).then(res => (
      expect(res).to.deep.equal([expectedRun]) && expect(readerStub.getRuns.called).to.be.true
    ));
  });

  it('returns empty array on error', () => {
    readerStub.getRuns.withArgs(testId).returns(Promise.resolve([]));

    return resolver.getRuns(testId).then(res => (
      expect(res).to.deep.equal([]) && expect(readerStub.getRun.called).to.be.true
    ));
  });
});

describe('deleteRun', () => {
  it('returns deleted run', () => {
    writerStub.deleteRun.withArgs(runId).returns(Promise.resolve([existingRun]));

    return resolver.deleteRun(runId).then(res => (
      expect(res).to.deep.equal([expectedRun]) && expect(writerStub.deleteRun.called).to.be.true
    ));
  });
});


// describe('updateTest', () => {
//   function expectNotFound() {
//     return new Resolver(readerStub, writerStub).updateTest({
//       id: testId,
//     }).catch(err => expect(err).to.deep.equal(new ApiError('Test not found.', 404)));
//   }

//   it('returns error if no matching test found', () => {
//     setupGetTest({
//       id: undefined,
//     });

//     return expectNotFound();
//   });

//   it('does not update if no changes to non-arrays', () => {
//     writerStub.updateTest.reset();
//     setupGetTest({
//       id: testId,
//       name: 'Kittens',
//       steps: [{}],
//     });

//     return new Resolver(readerStub, writerStub).updateTest({
//       id: testId,
//       name: 'Kittens',
//       steps: [{}],
//     }).then(() => expect(writerStub.updateTest.called).to.be.false);
//   });

//   it('updates non-array props', () => {
//     writerStub.updateTest.reset();
//     setupGetTest({
//       id: testId,
//       name: 'Kittens',
//       steps: [{}],
//     });

//     return new Resolver(readerStub, writerStub).updateTest({
//       id: testId,
//       name: 'Puppies',
//       steps: [{}],
//     }).then(() => expect(writerStub.updateTest.calledWith({
//       id: testId,
//       name: 'Puppies',
//       steps: [{}],
//     })).to.be.true);
//   });
// });
