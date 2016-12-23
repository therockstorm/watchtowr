import aws from 'aws-sdk'; // eslint-disable-line import/no-extraneous-dependencies
import Util from '../util/util';

const stage = process.env.NODE_ENV;
const testsTable = `Tests${stage}`;
const testRunsTable = `TestRuns${stage}`;
const variablesBucket = `watchtowr-${stage}-variables`;
const config = { region: 'us-west-2' };
const accountId = '98f2250c-c782-4ed6-bc52-297268daf490';

export default class Reader {
  constructor(ddb = new aws.DynamoDB(config), s3 = new aws.S3(config)) {
    this.ddb = ddb;
    this.s3 = s3;
  }

  getRun(testId, runId) {
    Util.log(`getRun(${testId}, ${runId})`);
    return this.ddb.query({
      TableName: testRunsTable,
      KeyConditionExpression: 'TestId = :testIdVal AND RunId = :runIdVal',
      ExpressionAttributeValues: { ':testIdVal': { S: testId }, ':runIdVal': { S: runId } },
      ProjectionExpression: 'Run',
    }).promise().then(data => (
      data.Items.map(item => JSON.parse(item.Run.S))
    )).catch(err => Reader._logAndCreateErr(err));
  }

  getRuns(testIds) {
    Util.log(`getRuns(${testIds})`);
    return Promise.resolve(testIds.map(testId => (
      this.ddb.query({
        TableName: testRunsTable,
        KeyConditionExpression: 'TestId = :testIdVal',
        ExpressionAttributeValues: { ':testIdVal': { S: testId } },
        ProjectionExpression: 'Run',
      }).promise()
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
    )).catch(err => Reader._logAndCreateErr(err));
  }

  getTests() {
    Util.log('getTests()');
    return this.ddb.scan({ TableName: testsTable }).promise()
      .then(data => (data.Items.map(item => JSON.parse(item.Test.S))))
      .catch(err => Reader._logAndCreateErr(err));
  }

  getVariables() {
    Util.log('getVariables()');
    return this.s3.getObject({ Bucket: variablesBucket, Key: `${accountId}.json` }).promise()
      .then(data => JSON.parse(data.Body.toString()))
      .catch(err => (err.code === 'NoSuchKey' ? [] : Reader._logAndCreateErr(err)));
  }

  static _logAndCreateErr(err) {
    Util.error(err);
    return new Error('Server error occurred and we have been notified.');
  }
}
