import aws from 'aws-sdk';
import { assert } from 'chai';
import { describe, it } from 'mocha';
import sinon from 'sinon';
import Reader from '../../src/storage/reader';

const ddbStub = sinon.stub(new aws.DynamoDB());
const runId = 'ba00ee81-86f9-4014-8550-2ec523734648';
const testId = '11e6af50-8fbf-b952-80db-218d3d616683';
const empty = { Items: [] };
const r = { Run: { S: `{ "id": "${runId}" }` } };
const run = { Items: [r] };
const runs = { Items: [r, r] };
const t = { Test: { S: `{ "id": "${testId}" }` } };
const test = { Items: [t] };
const tests = { Items: [t, t] };

const setupQuery = (ret, table, key, exp, proj) => ddbStub.query.withArgs({
  TableName: table,
  KeyConditionExpression: key,
  ExpressionAttributeValues: exp,
  ProjectionExpression: proj,
}).returns({ promise: () => Promise.resolve(ret) });

describe('getRun', () => {
  const setupRun = ret => setupQuery(ret, 'test-runs-test', 'TestId = :testIdVal AND RunId = :runIdVal', { ':testIdVal': { S: testId }, ':runIdVal': { S: runId } }, 'Run');

  it('returns empty list', () => {
    setupRun(empty);

    return new Reader(ddbStub).getRun(testId, runId)
      .then(res => assert.deepEqual(res, empty.Items));
  });

  it('returns run', () => {
    setupRun(run);

    return new Reader(ddbStub).getRun(testId, runId)
      .then(res => assert.deepEqual(res, run.Items.map(item => JSON.parse(item.Run.S))));
  });
});

describe('getRuns', () => {
  const setupRuns = ret => setupQuery(ret, 'test-runs-test', 'TestId = :testIdVal', { ':testIdVal': { S: testId } }, 'Run');

  it('returns empty list', () => {
    setupRuns(empty);

    return new Reader(ddbStub).getRuns(testId).then(res => assert.deepEqual(res, empty.Items));
  });

  it('returns runs', () => {
    setupRuns(runs);

    return new Reader(ddbStub).getRuns(testId, runId)
      .then(res => assert.deepEqual(res, runs.Items.map(item => JSON.parse(item.Run.S))));
  });
});

describe('getTest', () => {
  const setupTest = ret => setupQuery(ret, 'tests-test', 'TestId = :testIdVal', { ':testIdVal': { S: testId } }, 'Test');

  it('returns empty list', () => {
    setupTest(empty);

    return new Reader(ddbStub).getTest(testId)
      .then(res => assert.deepEqual(res, empty.Items));
  });

  it('returns test', () => {
    setupTest(test);

    return new Reader(ddbStub).getTest(testId)
      .then(res => assert.deepEqual(res, test.Items.map(item => JSON.parse(item.Test.S))));
  });
});

describe('getTests', () => {
  const setupScan = ret => ddbStub.scan.withArgs({ TableName: 'tests-test' })
    .returns({ promise: () => Promise.resolve(ret) });

  it('returns empty list', () => {
    setupScan(empty);

    return new Reader(ddbStub).getTests().then(res => assert.deepEqual(res, empty.Items));
  });

  it('returns tests', () => {
    setupScan(tests);

    return new Reader(ddbStub).getTests()
      .then(res => assert.deepEqual(res, tests.Items.map(item => JSON.parse(item.Test.S))));
  });
});
