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

const setupPutRun = run => ddbStub.putItem.withArgs({
  Item: {
    TestId: { S: testId },
    RunId: { S: run.id },
    Run: { S: JSON.stringify(run) },
  },
  TableName: testRunsTable,
}).returns({ promise: () => Promise.resolve() });

const setupDeleteRun = ret => ddbStub.deleteItem.withArgs({
  Key: { TestId: { S: testId }, RunId: { S: runId } },
  TableName: testRunsTable,
  ReturnValues: 'ALL_OLD',
}).returns({ promise: () => Promise.resolve(ret) });

const setupPutTest = test => ddbStub.putItem.withArgs({
  Item: { TestId: { S: test.id }, Test: { S: JSON.stringify(test) } },
  TableName: testsTable,
}).returns({ promise: () => Promise.resolve() });

const setupPutObject = variables => s3Stub.putObject.withArgs({
  Bucket: variablesBucket,
  Key: `${accountId}.json`,
  Body: JSON.stringify(variables),
  ServerSideEncryption: 'AES256',
}).returns({ promise: () => Promise.resolve() });

const setupDeleteTest = ret => ddbStub.deleteItem.withArgs({
  Key: { TestId: { S: testId } },
  TableName: testsTable,
  ReturnValues: 'ALL_OLD',
}).returns({ promise: () => Promise.resolve(ret) });

describe('writer', () => {
  beforeEach(() => {
    sinon.stub(Util, 'sequencialId').returns(generatedId);
  });

  afterEach(() => Util.sequencialId.restore());

  it('creates run', () => {
    const run = { id: generatedId };
    setupPutRun(run);

    return new Writer(ddbStub).createRun(testId, {})
      .then(res => assert.deepEqual(res, run));
  });

  it('deletes run', () => {
    setupDeleteRun({ Attributes: { Run: { S: `{ "id": "${runId}" }` } } });

    return new Writer(ddbStub).deleteRun(testId, runId)
      .then(res => assert.deepEqual(res, [{ id: runId }]));
  });

  it('creates test', () => {
    const created = '2017-01-01';
    const dateStub = sinon.stub(new Date());
    dateStub.toISOString.returns(created);
    const test = { id: generatedId, created };
    setupPutTest(test);

    return new Writer(ddbStub, s3Stub, dateStub).createTest({})
      .then(res => assert.deepEqual(res, test));
  });

  it('updates test', () => {
    const test = { id: testId };
    setupPutTest(test);

    return new Writer(ddbStub).updateTest(test)
      .then(res => assert.deepEqual(res, test));
  });

  it('deletes test', () => {
    setupDeleteTest({ Attributes: { Test: { S: `{ "id": "${testId}" }` } } });

    return new Writer(ddbStub).deleteTest(testId)
      .then(res => assert.deepEqual(res, [{ id: testId }]));
  });

  it('creates variables', () => {
    const variables = { key: 'myKey', value: 'myValue' };
    setupPutObject(variables);

    return new Writer(ddbStub, s3Stub).createVariables(variables)
      .then(res => assert.deepEqual(res, variables));
  });
});
