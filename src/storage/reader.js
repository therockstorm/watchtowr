import aws from 'aws-sdk'; // eslint-disable-line import/no-extraneous-dependencies
import Util from '../util/util';

const testsTable = `tests-${process.env.NODE_ENV}`;
const testRunsTable = `test-runs-${process.env.NODE_ENV}`;

export default class Reader {
  constructor(ddb = new aws.DynamoDB({ region: 'us-west-2' })) {
    this.ddb = ddb;
  }

  // getRunDoc(testId, runId) {
  //   const docClient = new aws.DynamoDB.DocumentClient({ region: 'us-west-2' });
  //   console.log('getRunDoc');
  //   return docClient
  //     .query({
  //       TableName: testRunsTable,
  //       KeyConditionExpression: 'TestId = :testIdVal AND RunId = :runIdVal',
  //       ExpressionAttributeValues: { ':testIdVal': testId, ':runIdVal': runId },
  //     })
  //     .promise()
  //     .then(data => data.Items.map(item => JSON.parse(item.Run)))
  //     .catch(err => Reader._logAndThrow(err));
  // }

  // batchGetTests(testId) {
  //   console.log('batchGetTests');
  //   return this.ddb.batchGetItem({
  //     RequestItems: { 'tests-dev': { Keys: [{ TestId: { S: testId } }] } },
  //   }).promise().then(data => (
  //     data.Responses['tests-dev'].map(item => JSON.parse(item.Test.S))
  //   )).catch(err => Reader._logAndThrow(err));
  // }

  // batchGetRuns(testId, runId) {
  //   console.log('batchGetRuns');
  //   return this.ddb.batchGetItem({
  //  RequestItems: { 'test-runs-dev': { Keys: [{ TestId: { S: testId }, RunId: { S: runId } }] } },
  //   }).promise().then(data => (
  //     data.Responses['test-runs-dev'].map(item => JSON.parse(item.Run.S))
  //   )).catch(err => Reader._logAndThrow(err));
  // }

  getRun(testId, runId) {
    Util.log(`getRun(${testId}, ${runId})`);
    return this.ddb.query({
      TableName: testRunsTable,
      KeyConditionExpression: 'TestId = :testIdVal AND RunId = :runIdVal',
      ExpressionAttributeValues: { ':testIdVal': { S: testId }, ':runIdVal': { S: runId } },
      ProjectionExpression: 'Run',
    }).promise().then(data => (
      data.Items.map(item => JSON.parse(item.Run.S))
    )).catch(err => Reader._logAndThrow(err));
  }

  getRuns(testIds) {
    Util.log(`getRuns(${testIds})`);
    return Promise.resolve(testIds.map(testId => (
      this.ddb.query({
        TableName: testRunsTable,
        KeyConditionExpression: 'TestId = :testIdVal',
        ExpressionAttributeValues: { ':testIdVal': { S: testId } },
        ProjectionExpression: 'Run',
      })
      .promise()
      .then(data => ({ runs: data.Items.map(item => JSON.parse(item.Run.S)) }))
      .catch(err => Reader._logAndCreateErr(err)))));
  }

  getTest(testId) {
    Util.log(`getTest(${testId})`);
    return this.ddb.query({
      TableName: testsTable,
      KeyConditionExpression: 'TestId = :testIdVal',
      ExpressionAttributeValues: { ':testIdVal': { S: testId } },
      ProjectionExpression: 'Test',
    }).promise().then(data => (
      data.Items.map(item => JSON.parse(item.Test.S))
    )).catch(err => Reader._logAndThrow(err));
  }

  getTests() {
    Util.log('getTests()');
    return this.ddb.scan({ TableName: testsTable }).promise().then(data => (
      data.Items.map(item => JSON.parse(item.Test.S))
    )).catch(err => Reader._logAndThrow(err));
  }

  static _logAndCreateErr(err) {
    Util.error(err);
    return new Error('Server error occurred and we have been notified.');
  }

  static _logAndThrow(err) {
    Util.error(err);
    throw new Error('Server error occurred and we have been notified.');
  }
}
