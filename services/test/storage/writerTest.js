import aws from 'aws-sdk';
import { assert } from 'chai';
import { describe, it } from 'mocha';
import sinon from 'sinon';
import Util from '../../src/util/util';
import Writer from '../../src/storage/writer';

const ddbStub = sinon.stub(new aws.DynamoDB());
const s3Stub = sinon.stub(new aws.S3());
const testsTable = 'Teststest';
const testRunsTable = 'TestRunstest';
const variablesBucket = 'watchtowr-test-variables';
const accountId = '98f2250c-c782-4ed6-bc52-297268daf490';
const runId = 'ba00ee81-86f9-4014-8550-2ec523734648';
const testId = '11e6af50-8fbf-b952-80db-218d3d616683';
const generatedId = '00000000-0000-0000-0000-000000000000';
const error = new Error('Server error occurred and we have been notified.');
const variables = { key: 'myKey', value: 'myValue' };
const dateStub = sinon.stub(new Date());
const created = '2017-01-01';
dateStub.toISOString.returns(created);

const setupPutTest = test => ddbStub.putItem.withArgs({
  Item: { TestId: { S: test.id }, Test: { S: JSON.stringify(test) } },
  TableName: testsTable,
});

describe('writer', () => {
  beforeEach(() => {
    sinon.stub(Util, 'sequencialId').returns(generatedId);
  });

  afterEach(() => Util.sequencialId.restore());

  describe('createRun', () => {
    const setup = run => ddbStub.putItem.withArgs({
      Item: {
        TestId: { S: testId },
        RunId: { S: run.id },
        Run: { S: JSON.stringify(run) },
      },
      TableName: testRunsTable,
    });
    const setupResolve = run => setup(run).returns({ promise: () => Promise.resolve() });
    const setupReject = run => setup(run).returns({ promise: () => Promise.reject() });

    it('creates run', () => {
      const run = { id: generatedId };
      setupResolve(run);
      return new Writer(ddbStub).createRun(testId, {}).then(res => assert.deepEqual(res, run));
    });

    it('returns error', () => {
      setupReject({ id: generatedId });
      return new Writer(ddbStub).createRun(testId, {}).then(res => assert.deepEqual(res, error));
    });
  });

  describe('deleteRun', () => {
    const setup = () => ddbStub.deleteItem.withArgs({
      Key: { TestId: { S: testId }, RunId: { S: runId } },
      TableName: testRunsTable,
      ReturnValues: 'ALL_OLD',
    });
    const setupResolve = ret => setup().returns({ promise: () => Promise.resolve(ret) });
    const setupReject = () => setup().returns({ promise: () => Promise.reject() });

    it('deletes run', () => {
      setupResolve({ Attributes: { Run: { S: `{ "id": "${runId}" }` } } });
      return new Writer(ddbStub).deleteRun(testId, runId)
        .then(res => assert.deepEqual(res, [{ id: runId }]));
    });

    it('returns error', () => {
      setupReject();
      return new Writer(ddbStub).deleteRun(testId, runId).then(res => assert.deepEqual(res, error));
    });
  });

  describe('createTest', () => {
    const setupResolve = test => setupPutTest(test).returns({ promise: () => Promise.resolve() });
    const setupReject = test => setupPutTest(test).returns({ promise: () => Promise.reject() });

    it('creates test', () => {
      const test = { id: generatedId, created };
      setupResolve(test);

      return new Writer(ddbStub, s3Stub, dateStub).createTest({})
        .then(res => assert.deepEqual(res, test));
    });

    it('returns error', () => {
      const test = { id: generatedId, created };
      setupReject(test);
      return new Writer(ddbStub, s3Stub, dateStub).createTest({})
        .then(res => assert.deepEqual(res, error));
    });
  });

  describe('updateTest', () => {
    const setupResolve = test => setupPutTest(test).returns({ promise: () => Promise.resolve() });
    const setupReject = test => setupPutTest(test).returns({ promise: () => Promise.reject() });

    it('updates test', () => {
      const test = { id: testId };
      setupResolve(test);
      return new Writer(ddbStub).updateTest(test).then(res => assert.deepEqual(res, test));
    });

    it('returns error', () => {
      const test = { id: testId };
      setupReject(test);
      return new Writer(ddbStub).updateTest(test).then(res => assert.deepEqual(res, error));
    });
  });

  describe('deleteTest', () => {
    const setup = () => ddbStub.deleteItem.withArgs({
      Key: { TestId: { S: testId } },
      TableName: testsTable,
      ReturnValues: 'ALL_OLD',
    });
    const setupResolve = ret => setup().returns({ promise: () => Promise.resolve(ret) });
    const setupReject = () => setup().returns({ promise: () => Promise.reject() });

    it('deletes test', () => {
      setupResolve({ Attributes: { Test: { S: `{ "id": "${testId}" }` } } });
      return new Writer(ddbStub).deleteTest(testId)
        .then(res => assert.deepEqual(res, [{ id: testId }]));
    });

    it('returns error', () => {
      setupReject();
      return new Writer(ddbStub).deleteTest(testId).then(res => assert.deepEqual(res, error));
    });
  });

  describe('createVariables', () => {
    const setup = () => s3Stub.putObject.withArgs({
      Bucket: variablesBucket,
      Key: `${accountId}.json`,
      Body: JSON.stringify(variables),
      ServerSideEncryption: 'AES256',
    }).returns({ promise: () => Promise.resolve() });
    const setupResolve = () => setup().returns({ promise: () => Promise.resolve() });
    const setupReject = () => setup().returns({ promise: () => Promise.reject() });

    it('creates variables', () => {
      setupResolve();
      return new Writer(ddbStub, s3Stub).createVariables(variables)
        .then(res => assert.deepEqual(res, variables));
    });

    it('returns error', () => {
      setupReject();
      return new Writer(ddbStub, s3Stub).createVariables(variables)
        .then(res => assert.deepEqual(res, error));
    });
  });
});
