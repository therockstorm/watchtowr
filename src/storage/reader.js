import aws from 'aws-sdk'; // eslint-disable-line import/no-extraneous-dependencies
import Util from '../util/util';

const testsTable = `tests-${process.env.NODE_ENV}`;
const testRunsTable = `test-runs-${process.env.NODE_ENV}`;

export default class Reader {
  constructor(ddb = new aws.DynamoDB({ region: 'us-west-2' })) {
    this.ddb = ddb;
  }

  getRun(testId, runId) {
    console.log('getRun');
    return this.ddb.query({
      TableName: testRunsTable,
      KeyConditionExpression: 'TestId = :testIdVal AND RunId = :runIdVal',
      ExpressionAttributeValues: { ':testIdVal': { S: testId }, ':runIdVal': { S: runId } },
      ProjectionExpression: 'Run',
    }).promise().then(data => (
      data.Items.map(item => JSON.parse(item.Run.S))
    )).catch(err => Util.error(err));
  }

  getRuns(testId) {
    console.log('getRuns. keys=' + testId);
    return this.ddb.query({
      TableName: testRunsTable,
      KeyConditionExpression: 'TestId = :testIdVal',
      ExpressionAttributeValues: { ':testIdVal': { S: testId[0] } },
      ProjectionExpression: 'Run',
    }).promise().then(data => {
      const runs = data.Items.map(item => JSON.parse(item.Run.S));
      return [{ runs }];
    }).catch(err => Util.error(err));
  }

  // batchGetTests(testId) {
  //   console.log('batchGetTests');
  //   return this.ddb.batchGetItem({
  //     RequestItems: { 'tests-dev': { Keys: [{ TestId: { S: testId } }] } },
  //   }).promise().then(data => (
  //     data.Responses['tests-dev'].map(item => JSON.parse(item.Test.S))
  //   )).catch(err => Util.error(err));
  // }

  // batchGetRuns(testId, runId) {
  //   console.log('batchGetRuns');
  //   return this.ddb.batchGetItem({
  //     RequestItems: { 'test-runs-dev': { Keys: [{ TestId: { S: testId }, RunId: { S: runId } }] } },
  //   }).promise().then(data => (
  //     data.Responses['test-runs-dev'].map(item => JSON.parse(item.Run.S))
  //   )).catch(err => Util.error(err));
  // }

  getTest(testId) {
    console.log('getTest');
    return this.ddb.query({
      TableName: testsTable,
      KeyConditionExpression: 'TestId = :testIdVal',
      ExpressionAttributeValues: { ':testIdVal': { S: testId } },
      ProjectionExpression: 'Test',
    }).promise().then(data => (
      data.Items.map(item => JSON.parse(item.Test.S))
    )).catch(err => Util.error(err));
  }

  getTests() {
    console.log('getTests');
    return this.ddb.scan({ TableName: testsTable }).promise().then(data => (
      data.Items.map(item => JSON.parse(item.Test.S))
    )).catch(err => Util.error(err));
  }
}
