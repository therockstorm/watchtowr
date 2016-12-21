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
const dateStub = sinon.stub(new Date());
const requestStub = sinon.stub(axios, 'request');
const started = 123;
const start = [1, 2000000];
const testId1 = '11e6af50-8fbf-b952-80db-218d3d616683';
const testId2 = 'ba00ee81-86f9-4014-8550-2ec523734648';
const test = {
  id: testId1,
  request: {
    headers: [{
      key: 'x-key1',
      value: 'x-value1',
    }],
    method: 1,
    url: 'https://example.com/get',
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
    body: '{"x": "y"}',
  },
  assertions: [{
    target: 1,
    comparison: 1,
    value: '201',
  }],
}];
dateStub.getTime.returns(started);

describe('TestRunner', () => {
  beforeEach(() => {
    sinon.stub(process, 'hrtime').returns(start);
  });

  afterEach(() => process.hrtime.restore());

  it('runAll creates runs', () => {
    const res1 = { status: 200 };
    const res2 = { status: 201 };
    const result1 = { success: true };
    const result2 = { success: false };
    readerStub.getTests.returns(Promise.resolve(tests));
    requestStub.withArgs({
      url: tests[0].request.url,
      method: 'GET',
      headers: { 'User-Agent': 'watchtowr/1.0', 'x-key1': 'x-value1' },
      data: tests[0].request.body,
    }).returns(Promise.resolve(res1));
    requestStub.withArgs({
      url: tests[1].request.url,
      method: 'POST',
      headers: { 'User-Agent': 'watchtowr/1.0' },
      data: tests[1].request.body,
    }).returns(Promise.resolve(res2));
    runBuilderStub.build.onFirstCall().returns(result1).onSecondCall().returns(result2);

    return new TestRunner(readerStub, writerStub, runBuilderStub, notifierStub, dateStub).runAll()
      .then(() => {
        assert.isTrue(runBuilderStub.create.calledWith(started, start, tests[0].assertions, res1));
        assert.isTrue(notifierStub.notify.calledWith(tests[0], result1));
        assert.isTrue(writerStub.createRun.calledWith(tests[0].id, result1));
        assert.isTrue(runBuilderStub.create.calledWith(started, start, tests[1].assertions, res2));
        assert.isTrue(notifierStub.notify.calledWith(tests[1], result2));
        assert.isTrue(writerStub.createRun.calledWith(tests[1].id, result2));
      });
  });

  it('runById creates run', () => {
    const res = { status: 200 };
    const result = { success: true };
    readerStub.getTest.withArgs(testId1).returns(Promise.resolve([test]));
    requestStub.withArgs({
      url: test.request.url,
      method: 'GET',
      headers: { 'User-Agent': 'watchtowr/1.0', 'x-key1': 'x-value1' },
      data: test.request.body,
    }).returns(Promise.resolve(res));
    runBuilderStub.build.returns(result);

    return new TestRunner(readerStub, writerStub, runBuilderStub, notifierStub, dateStub)
      .runById(testId1)
      .then(() => {
        assert.isTrue(runBuilderStub.create.calledWith(started, start, test.assertions, res));
        assert.isTrue(notifierStub.notify.calledWith(test, result));
        assert.isTrue(writerStub.createRun.calledWith(test.id, result));
      });
  });
});
