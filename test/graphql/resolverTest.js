// import chai from 'chai';
// import chaiAsPromised from 'chai-as-promised';
// import { describe, it } from 'mocha';
// import sinon from 'sinon';
// import Resolver from '../../src/graphql/resolver';
// import Reader from '../../src/storage/reader';
// import Writer from '../../src/storage/writer';

// chai.use(chaiAsPromised);
// const expect = chai.expect;
// const accountId = '98f2250c-c782-4ed6-bc52-297268daf490';
// const testId = 'ba00ee81-86f9-4014-8550-2ec523734648';
// const existingStep = {
//   orderNum: 1,
//   enabled: true,
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
//   orderNum: 1,
//   enabled: false,
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
// const readerStub = sinon.stub(new Reader());
// const writerStub = sinon.stub(new Writer());

// function setupGetTest(ret) {
//   readerStub.getTest.withArgs(accountId, testId)
//     .returns(new Promise(resolve => resolve(ret)));
// }

// describe('updateTest', () => {
//   function expectNotFound() {
//     return new Resolver(readerStub, writerStub).updateTest(accountId, {
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
//       steps: [{
//         orderNum: 1,
//       }],
//     });

//     return new Resolver(readerStub, writerStub).updateTest(accountId, {
//       id: testId,
//       name: 'Kittens',
//       steps: [{
//         orderNum: 3,
//       }],
//     }).then(() => expect(writerStub.updateTest.called).to.be.false);
//   });

//   it('updates non-array props', () => {
//     writerStub.updateTest.reset();
//     setupGetTest({
//       id: testId,
//       name: 'Kittens',
//       enabled: true,
//       steps: [{
//         orderNum: 1,
//       }],
//     });

//     return new Resolver(readerStub, writerStub).updateTest(accountId, {
//       id: testId,
//       name: 'Puppies',
//       steps: [{
//         orderNum: 3,
//       }],
//     }).then(() => expect(writerStub.updateTest.calledWith(accountId, {
//       id: testId,
//       name: 'Puppies',
//       enabled: true,
//       steps: [{
//         orderNum: 1,
//       }],
//     })).to.be.true);
//   });
// });

// describe('updateStep', () => {
//   function expectNotFound(errMsg = 'Test not found.') {
//     return new Resolver(readerStub, writerStub).updateStep(accountId, {
//       testId,
//       orderNum: 2,
//     }).catch(err => expect(err).to.deep.equal(new ApiError(errMsg, 404)));
//   }

//   it('returns error if no matching test found', () => {
//     setupGetTest({
//       id: undefined,
//     });

//     return expectNotFound();
//   });

//   it('returns error if no steps found', () => {
//     setupGetTest({
//       id: testId,
//       steps: [],
//     });

//     return expectNotFound('Step not found.');
//   });

//   it('returns error if no matching step found', () => {
//     setupGetTest({
//       id: testId,
//       steps: [{
//         orderNum: 1,
//       }],
//     });

//     return expectNotFound('Step not found.');
//   });

//   it('does not update if no changes', () => {
//     writerStub.updateTest.reset();
//     setupGetTest({
//       id: testId,
//       name: 'Kittens',
//       steps: [{
//         orderNum: 1,
//         enabled: true,
//       }],
//     });

//     return new Resolver(readerStub, writerStub).updateStep(accountId, {
//       testId,
//       orderNum: 1,
//       enabled: true,
//     }).then(() => expect(writerStub.updateTest.called).to.be.false);
//   });

//   it('updates props', () => {
//     writerStub.updateTest.reset();
//     setupGetTest({
//       id: testId,
//       steps: [existingStep, {
//         orderNum: 2,
//         enabled: true,
//       }],
//     });

//     return new Resolver(readerStub, writerStub).updateStep(accountId, newStep)
//       .then(() => expect(writerStub.updateTest.calledWith(accountId, {
//         id: testId,
//         steps: [{
//           orderNum: 1,
//           enabled: false,
//           request: {
//             headers: [{
//               key: 'x-key1',
//               value: 'x-value1',
//             }, {
//               key: 'x-key2',
//               value: 'x-value2',
//             }],
//             method: 'GET',
//             url: 'https://example.com/get',
//           },
//           assertions: [{
//             type: 'STATUS_CODE_EQ',
//             value: '200',
//           }, {
//             type: 'ELAPSED_LT',
//             value: '1000',
//           }],
//         }, {
//           orderNum: 2,
//           enabled: true,
//         }],
//       })).to.be.true);
//   });
// });
