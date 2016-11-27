// import axios from 'axios';
// import chai from 'chai';
// import chaiAsPromised from 'chai-as-promised';
// import { describe, it } from 'mocha';
// import sinon from 'sinon';
// import Reader from '../../src/storage/reader';
// import Writer from '../../src/storage/writer';
// import Runner from '../../src/runner/runner';

// chai.use(chaiAsPromised);
// const expect = chai.expect;
// const multiStepTest = [{
//   id: 'ba00ee81-86f9-4014-8550-2ec523734648',
//   enabled: true,
//   steps: [{
//     orderNum: 1,
//     enabled: true,
//     request: {
//       headers: [{
//         key: 'x-key1',
//         value: 'x-value1',
//       }, {
//         key: 'x-key2',
//         value: 'x-value2',
//       }],
//       method: 'GET',
//       url: 'https://example.com/get',
//     },
//     assertions: [{
//       type: 'STATUS_CODE_EQ',
//       value: '200',
//     }, {
//       type: 'ELAPSED_LT',
//       value: '1000',
//     }],
//   }, {
//     orderNum: 2,
//     enabled: true,
//     request: {
//       method: 'POST',
//       url: 'https://example.com/post',
//     },
//     assertions: [{
//       type: 'STATUS_CODE_EQ',
//       value: '201',
//     }],
//   }],
// }];
// const disabledTest = [{
//   id: '2777b111-a26e-4994-94be-d6b4876f904c',
//   enabled: false,
//   steps: [{
//     orderNum: 1,
//     enabled: true,
//     request: {
//       method: 'GET',
//       url: 'https://yahoo.com/get',
//     },
//     assertions: [{
//       type: 'STATUS_CODE_EQ',
//       value: '200',
//     }],
//   }],
// }];
// const disabledStep = [{
//   id: 'd7cfa080-a0ce-4856-8e74-598a1b085bd7',
//   enabled: true,
//   steps: [{
//     orderNum: 1,
//     enabled: false,
//     request: {
//       method: 'GET',
//       url: 'https://google.com/get',
//     },
//     assertions: [{
//       type: 'STATUS_CODE_EQ',
//       value: '200',
//     }],
//   }, {
//     orderNum: 2,
//     enabled: true,
//     request: {
//       method: 'POST',
//       url: 'https://google.com/post',
//     },
//     assertions: [{
//       type: 'STATUS_CODE_EQ',
//       value: '201',
//     }],
//   }],
// }];
// const readerStub = sinon.stub(new Reader());
// const writerStub = sinon.stub(new Writer());
// const dateStub = sinon.stub(new Date());
// const timerStub = sinon.stub(process, 'hrtime');
// const requestStub = sinon.stub(axios, 'request');

// function setupGetAllTests(ret) {
//   readerStub.getAllTests.returns(new Promise(resolve => resolve(ret)));
// }

// describe('run', () => {
//   before(() => {
//     dateStub.getTime.returns(123);
//     const start = [1, 2000000];
//     timerStub.returns(start);
//     timerStub.withArgs(start).returns([3, 4567000]);
//   });

//   it('creates runs', () => {
//     setupGetAllTests(multiStepTest);
//     requestStub.withArgs({
//       url: 'https://example.com/get',
//       method: 'GET',
//       headers: {
//         'User-Agent': 'watchtowr/1.0',
//         'x-key1': 'x-value1',
//         'x-key2': 'x-value2',
//       },
//     }).returns(new Promise(resolve => resolve({
//       status: 200,
//     })));
//     requestStub.withArgs({
//       url: 'https://example.com/post',
//       method: 'POST',
//       headers: {
//         'User-Agent': 'watchtowr/1.0',
//       },
//     }).returns(new Promise(resolve => resolve({
//       status: 201,
//     })));

//     return new Runner(readerStub, writerStub, dateStub, timerStub, requestStub).run().then(() => (
//       expect(writerStub.createRun.calledWith('ba00ee81-86f9-4014-8550-2ec523734648', {
//         started: 123,
//         elapsedMs: 4.567,
//         request: {
//           headers: {
//             'User-Agent': 'watchtowr/1.0',
//             'x-key1': 'x-value1',
//             'x-key2': 'x-value2',
//           },
//           method: 'GET',
//           url: 'https://example.com/get',
//         },
//         response: {
//           statusCode: 200,
//         },
//         results: [{
//           expected: {
//             type: 'STATUS_CODE_EQ',
//             value: '200',
//           },
//           actual: '200',
//           success: true,
//         }, {
//           expected: {
//             type: 'ELAPSED_LT',
//             value: '1000',
//           },
//           actual: '4.567',
//           success: true,
//         }],
//       })).to.be.true && expect(writerStub.createRun.calledWith('ba00ee81-86f9-4014-8550-2ec523734648', {
//         started: 123,
//         elapsedMs: 4.567,
//         request: {
//           headers: {
//             'User-Agent': 'watchtowr/1.0',
//           },
//           method: 'POST',
//           url: 'https://example.com/post',
//         },
//         response: {
//           statusCode: 201,
//         },
//         results: [{
//           expected: {
//             type: 'STATUS_CODE_EQ',
//             value: '201',
//           },
//           actual: '201',
//           success: true,
//         }],
//       })).to.be.true
//     ));
//   });

//   it('does not run disabled tests', () => {
//     writerStub.createRun.reset();
//     setupGetAllTests(disabledTest);
//     requestStub.returns(new Promise(resolve => resolve({
//       status: 200,
//     })));

//     return new Runner(readerStub, writerStub, dateStub, timerStub, requestStub).run()
//       .then(() => expect(writerStub.createRun.called).to.be.false);
//   });

//   it('does not run disabled steps', () => {
//     writerStub.createRun.reset();
//     setupGetAllTests(disabledStep);
//     requestStub.withArgs({
//       url: 'https://google.com/post',
//       method: 'POST',
//       headers: {
//         'User-Agent': 'watchtowr/1.0',
//       },
//     }).returns(new Promise(resolve => resolve({
//       status: 200,
//     })));

//     return new Runner(readerStub, writerStub, dateStub, timerStub, requestStub).run()
//       .then(() => expect(writerStub.createRun.calledWith('d7cfa080-a0ce-4856-8e74-598a1b085bd7', {
//         started: 123,
//         elapsedMs: 4.567,
//         request: {
//           headers: {
//             'User-Agent': 'watchtowr/1.0',
//           },
//           method: 'POST',
//           url: 'https://google.com/post',
//         },
//         response: {
//           statusCode: 200,
//         },
//         results: [{
//           expected: {
//             type: 'STATUS_CODE_EQ',
//             value: '201',
//           },
//           actual: '200',
//           success: false,
//         }],
//       })).to.be.true);
//   });
// });
