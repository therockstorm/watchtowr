import axios from 'axios';
import { assert } from 'chai';
import { describe, it } from 'mocha';
import sinon from 'sinon';
import RunBuilder from '../../src/runner/runBuilder';
import Reader from '../../src/storage/reader';
import Writer from '../../src/storage/writer';
import TestRunner from '../../src/runner/testRunner';
import Notifier from '../../src/runner/notifier';

const readerStub = sinon.stub(new Reader());
const writerStub = sinon.stub(new Writer());
const runBuilderStub = sinon.stub(new RunBuilder());
const notifierStub = sinon.stub(new Notifier());
const requestStub = sinon.stub(axios, 'request');
const timeout = 90000;
const validateStatus = sinon.match.any;
const started = sinon.match.any;
const start = [1, 2000000];
const testId1 = '11e6af50-8fbf-b952-80db-218d3d616683';
const testId2 = 'ba00ee81-86f9-4014-8550-2ec523734648';
const variables = [{ key: '{{myKey}}', value: 'myValue' }];
const test = {
  id: testId1,
  request: {
    headers: [{
      key: 'x-key1',
      value: '{{myKey}}',
    }],
    method: 1,
    url: 'https://{{myKey}}.com/get',
  },
  assertions: [{
    target: 1,
    comparison: 1,
    value: '200',
  }, {
    target: 2,
    comparison: 3,
    value: '1000',
  }],
};
const tests = [test, {
  id: testId2,
  request: {
    method: 2,
    url: 'https://example.com/post',
    body: '{"x": "{{myKey}}"}',
  },
  assertions: [{
    target: 1,
    comparison: 1,
    value: '201',
  }],
}];

describe('TestRunner', () => {
  beforeEach(() => {
    sinon.stub(process, 'hrtime').returns(start);
    readerStub.getVariables.reset();
    requestStub.reset();
    writerStub.createRun.reset();
    notifierStub.notify.reset();
    runBuilderStub.create.reset();
  });

  afterEach(() => process.hrtime.restore());


  describe('runAll', () => {
    it('creates runs', () => {
      const res1 = { status: 200 };
      const res2 = { status: 201 };
      const result1 = { success: true };
      const result2 = { success: false };
      readerStub.getTests.returns(Promise.resolve(tests));
      readerStub.getVariables.returns(Promise.resolve(variables));
      requestStub.withArgs({
        url: 'https://myValue.com/get',
        method: 'GET',
        headers: { 'User-Agent': 'watchtowr/1.0', 'x-key1': 'myValue' },
        data: tests[0].request.body,
        timeout,
        validateStatus,
      }).returns(Promise.resolve(res1));
      requestStub.withArgs({
        url: tests[1].request.url,
        method: 'POST',
        headers: { 'User-Agent': 'watchtowr/1.0' },
        data: '{"x": "myValue"}',
        timeout,
        validateStatus,
      }).returns(Promise.resolve(res2));
      runBuilderStub.build.onFirstCall().returns(result1).onSecondCall().returns(result2);

      return new TestRunner(readerStub, writerStub, runBuilderStub, notifierStub).runAll()
        .then(() => {
          assert.isTrue(runBuilderStub.create
            .calledWith(started, start, tests[0].assertions, res1));
          assert.isTrue(notifierStub.notify.calledWith(tests[0], result1));
          assert.isTrue(writerStub.createRun.calledWith(tests[0].id, result1));
          assert.isTrue(runBuilderStub.create
            .calledWith(started, start, tests[1].assertions, res2));
          assert.isTrue(notifierStub.notify.calledWith(tests[1], result2));
          assert.isTrue(writerStub.createRun.calledWith(tests[1].id, result2));
          assert.isTrue(readerStub.getVariables.calledOnce);
        });
    });

    it('does not make calls if no tests', () => {
      readerStub.getTests.returns(Promise.resolve([]));
      return new TestRunner(readerStub, writerStub, runBuilderStub, notifierStub)
        .runAll(testId1)
        .then(() => {
          assert.isFalse(requestStub.called);
          assert.isFalse(runBuilderStub.create.called);
          assert.isFalse(writerStub.createRun.called);
          assert.isFalse(notifierStub.notify.called);
          assert.isFalse(readerStub.getVariables.called);
        });
    });
  });

  describe('runById', () => {
    it('creates run', () => {
      const res = { status: 200 };
      const result = { success: true };
      readerStub.getTest.withArgs(testId1).returns(Promise.resolve([test]));
      readerStub.getVariables.returns(Promise.resolve(variables));
      requestStub.withArgs({
        url: 'https://myValue.com/get',
        method: 'GET',
        headers: { 'User-Agent': 'watchtowr/1.0', 'x-key1': 'myValue' },
        data: test.request.body,
        timeout,
        validateStatus,
      }).returns(Promise.resolve(res));
      runBuilderStub.build.returns(result);

      return new TestRunner(readerStub, writerStub, runBuilderStub, notifierStub)
        .runById(testId1)
        .then(() => {
          assert.isTrue(runBuilderStub.create.calledWith(started, start, test.assertions, res));
          assert.isTrue(notifierStub.notify.calledWith(test, result));
          assert.isTrue(writerStub.createRun.calledWith(test.id, result));
          assert.isTrue(readerStub.getVariables.calledOnce);
        });
    });

    it('returns error if no test', () => {
      readerStub.getTest.withArgs(testId1).returns(Promise.resolve([]));
      return new TestRunner(readerStub, writerStub, runBuilderStub, notifierStub)
        .runById(testId1)
        .then((res) => {
          assert.deepEqual(res.message, 'Test not found.');
          assert.isFalse(requestStub.called);
          assert.isFalse(runBuilderStub.create.called);
          assert.isFalse(writerStub.createRun.called);
          assert.isFalse(notifierStub.notify.called);
          assert.isFalse(readerStub.getVariables.called);
        });
    });
  });
});
