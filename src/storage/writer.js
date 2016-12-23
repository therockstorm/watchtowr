import aws from 'aws-sdk'; // eslint-disable-line import/no-extraneous-dependencies
import Util from '../util/util';

const stage = process.env.NODE_ENV;
const testsTable = `Tests${stage}`;
const testRunsTable = `TestRuns${stage}`;
const variablesBucket = `watchtowr-${stage}-variables`;
const config = { region: 'us-west-2' };
const accountId = '98f2250c-c782-4ed6-bc52-297268daf490';

export default class Writer {
  constructor(ddb = new aws.DynamoDB(config), s3 = new aws.S3(config), date = new Date()) {
    this.ddb = ddb;
    this.s3 = s3;
    this.date = date;
  }

  createRun(testId, run) {
    const runCopy = run;
    runCopy.id = Util.sequencialId();
    return this.ddb.putItem({
      Item: {
        TestId: { S: testId },
        RunId: { S: runCopy.id },
        Run: { S: JSON.stringify(runCopy) },
      },
      TableName: testRunsTable,
    }).promise().then(() => runCopy).catch(err => Util.error(err));
  }

  deleteRun(testId, runId) {
    return this.ddb.deleteItem({
      Item: { TestId: { S: testId }, RunId: { S: runId } },
      TableName: testRunsTable,
      ReturnValues: 'ALL_OLD',
    }).promise().then(data => (
      data.Items.map(item => JSON.parse(item.Run.S))
    )).catch(err => Util.error(err));
  }

  createTest(test) {
    const testCopy = test;
    testCopy.id = Util.sequencialId();
    testCopy.created = this.date.toISOString();
    return this._putTest(testCopy);
  }

  updateTest(test) {
    return this._putTest(test);
  }

  deleteTest(id) {
    return this.ddb.deleteItem({
      Item: { TestId: { S: id } },
      TableName: testsTable,
      ReturnValues: 'ALL_OLD',
    }).promise().then(data => (
      data.Items.map(item => JSON.parse(item.Test.S))
    )).catch(err => Util.error(err));
  }

  createVariables(variables) {
    return this.s3.putObject({
      Bucket: variablesBucket,
      Key: `${accountId}.json`,
      Body: JSON.stringify(variables),
      ServerSideEncryption: 'AES256',
    }).promise().then(() => variables).catch(err => Util.error(err));
  }

  _putTest(test) {
    return this.ddb.putItem({
      Item: { TestId: { S: test.id }, Test: { S: JSON.stringify(test) } },
      TableName: testsTable,
    }).promise().then(() => test).catch(err => Util.error(err));
  }
}
