import aws from 'aws-sdk';
import { assert } from 'chai';
import { describe, it } from 'mocha';
import sinon from 'sinon';
import Reader from '../../src/storage/reader';

const ddbStub = sinon.stub(new aws.DynamoDB());
const s3Stub = sinon.stub(new aws.S3());
const testsTable = 'Teststest';
const testRunsTable = 'TestRunstest';
const variablesBucket = 'watchtowr-test-variables';
const accountId = '98f2250c-c782-4ed6-bc52-297268daf490';
const runId = 'ba00ee81-86f9-4014-8550-2ec523734648';
const testId = '11e6af50-8fbf-b952-80db-218d3d616683';
const empty = { Items: [] };
const r = { Run: { S: `{ "id": "${runId}" }` } };
const run = { Items: [r] };
const runs = { Items: [r, r] };
const t = { Test: { S: `{ "id": "${testId}" }` } };
const test = { Items: [t] };
const tests = { Items: [t, t] };
const error = new Error('Server error occurred and we have been notified.');

const setupQuery = (table, key, exp, proj) => ddbStub.query.withArgs({
  TableName: table,
  KeyConditionExpression: key,
  ExpressionAttributeValues: exp,
  ProjectionExpression: proj,
});

describe('getRun', () => {
  beforeEach(() => ddbStub.query.reset());
  const setupRun = () => setupQuery(testRunsTable, 'TestId = :testIdVal AND RunId = :runIdVal', { ':testIdVal': { S: testId }, ':runIdVal': { S: runId } }, 'Run');
  const setupResolve = ret => setupRun().returns({ promise: () => Promise.resolve(ret) });
  const setupReject = () => setupRun().returns({ promise: () => Promise.reject() });

  it('returns empty list', () => {
    setupResolve(empty);
    return new Reader(ddbStub).getRun(testId, runId)
      .then(res => assert.deepEqual(res, empty.Items));
  });

  it('returns run', () => {
    setupResolve(run);
    return new Reader(ddbStub).getRun(testId, runId)
      .then(res => assert.deepEqual(res, run.Items.map(item => JSON.parse(item.Run.S))));
  });

  it('returns error', () => {
    setupReject();
    return new Reader(ddbStub).getRun(testId, runId).then(res => assert.deepEqual(res, error));
  });
});

describe('getRuns', () => {
  const setupRuns = (ret, id = testId) => setupQuery(testRunsTable, 'TestId = :testIdVal', { ':testIdVal': { S: id } }, 'Run')
    .returns({ promise: () => Promise.resolve(ret) });
  const mapRuns = val => ({ runs: val.Items.map(item => JSON.parse(item.Run.S)) });

  it('returns empty list', () => {
    setupRuns(empty);

    return new Reader(ddbStub).getRuns([testId]).then((res) => {
      assert.equal(res.length, 1);
      return res[0].then(x => assert.deepEqual(x, { runs: [] }));
    });
  });

  it('returns runs for one test', () => {
    setupRuns(runs);

    return new Reader(ddbStub).getRuns([testId]).then((res) => {
      assert.equal(res.length, 1);
      return res[0].then(x => assert.deepEqual(x, mapRuns(runs)));
    });
  });

  it('returns runs for multiple tests', () => {
    const testId2 = '2';
    setupRuns(runs);
    setupRuns(run, testId2);

    return new Reader(ddbStub).getRuns([testId, testId2]).then((res) => {
      assert.equal(res.length, 2);
      res[0].then(x => assert.deepEqual(x, mapRuns(runs)));
      return res[1].then(x => assert.deepEqual(x, mapRuns(run)));
    });
  });
});

describe('getTest', () => {
  const setupTest = () => setupQuery(testsTable, 'TestId = :testIdVal', { ':testIdVal': { S: testId } }, 'Test');
  const setupResolve = ret => setupTest().returns({ promise: () => Promise.resolve(ret) });
  const setupReject = () => setupTest().returns({ promise: () => Promise.reject() });

  it('returns empty list', () => {
    setupResolve(empty);
    return new Reader(ddbStub).getTest(testId)
      .then(res => assert.deepEqual(res, empty.Items));
  });

  it('returns test', () => {
    setupResolve(test);
    return new Reader(ddbStub).getTest(testId)
      .then(res => assert.deepEqual(res, test.Items.map(item => JSON.parse(item.Test.S))));
  });

  it('returns error', () => {
    setupReject();
    return new Reader(ddbStub).getTest(testId).then(res => assert.deepEqual(res, error));
  });
});

describe('getTests', () => {
  const setupScan = () => ddbStub.scan.withArgs({ TableName: testsTable });
  const setupResolve = ret => setupScan().returns({ promise: () => Promise.resolve(ret) });
  const setupReject = () => setupScan().returns({ promise: () => Promise.reject() });

  it('returns empty list', () => {
    setupResolve(empty);
    return new Reader(ddbStub).getTests().then(res => assert.deepEqual(res, empty.Items));
  });

  it('returns tests', () => {
    setupResolve(tests);
    return new Reader(ddbStub).getTests()
      .then(res => assert.deepEqual(res, tests.Items.map(item => JSON.parse(item.Test.S))));
  });

  it('returns error', () => {
    setupReject();
    return new Reader(ddbStub).getTests().then(res => assert.deepEqual(res, error));
  });
});

describe('getVariables', () => {
  const setupGetObject = () => s3Stub.getObject.withArgs({ Bucket: variablesBucket, Key: `${accountId}.json` });
  const setupResolve = ret => setupGetObject().returns({ promise: () => Promise.resolve(ret) });
  const setupReject = ret => setupGetObject().returns({ promise: () => Promise.reject(ret) });

  it('returns empty list', () => {
    setupReject({ code: 'NoSuchKey' });
    return new Reader(ddbStub, s3Stub).getVariables().then(res => assert.deepEqual(res, []));
  });

  it('returns tests', () => {
    const variables = [{ key: 'myKey', value: 'myValue' }];
    setupResolve({ Body: JSON.stringify(variables) });
    return new Reader(ddbStub, s3Stub).getVariables()
      .then(res => assert.deepEqual(res, variables));
  });

  it('returns error', () => {
    setupReject({ code: 'Unexpected' });
    return new Reader(ddbStub, s3Stub).getVariables().then(res => assert.deepEqual(res, error));
  });
});
