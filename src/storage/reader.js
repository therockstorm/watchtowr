import aws from 'aws-sdk'; // eslint-disable-line import/no-extraneous-dependencies
import Util from '../util/util';
import { config } from '../../package.json';

const testsTable = process.env.TESTS_TABLE;
const testRunsTable = process.env.TEST_RUNS_TABLE;

export default class Reader {
  constructor(ddb = new aws.DynamoDB({ region: config.region })) {
    this.ddb = ddb;
  }

  getRun(testId, runId) {
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
    return this.ddb.query({
      TableName: testRunsTable,
      KeyConditionExpression: 'TestId = :testIdVal',
      ExpressionAttributeValues: { ':testIdVal': { S: testId } },
      ProjectionExpression: 'Run',
    }).promise().then(data => (
      data.Items.map(item => JSON.parse(item.Run.S))
    )).catch(err => Util.error(err));
  }

  getTest(testId) {
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
    return this.ddb.scan({ TableName: testsTable }).promise().then(data => (
      data.Items.map(item => JSON.parse(item.Test.S))
    )).catch(err => Util.error(err));
  }
}
