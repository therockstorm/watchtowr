import yaml from 'js-yaml'; // eslint-disable-line import/no-extraneous-dependencies
import fs from 'fs';
import path from 'path';
import Util from './util';

const stage = Util.required(process.env.NODE_ENV, 'stage');
const service = Util.required(process.argv[2], 'service');

const snsTopic = () => ({
  Type: 'AWS::SNS::Topic',
  Properties: {
    DisplayName: `${service}Email`,
    Subscription: [{ Protocol: 'email', Endpoint: `rocky.warren+${service}-alarm@gmail.com` }],
  },
});

const attributeDef = (name, type) => ({ AttributeName: name, AttributeType: type });

const keyDef = (name, type) => ({ AttributeName: name, KeyType: type });

const dynamoTable = (tableName, attributeDefinitions, keySchema) => ({
  Type: 'AWS::DynamoDB::Table',
  DeletionPolicy: 'Retain',
  Properties: {
    AttributeDefinitions: attributeDefinitions,
    KeySchema: keySchema,
    ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
    TableName: tableName,
  },
});

const cloudWatchAlarm = (metric, namespace, statistic, evalPeriods,
    threshold, comparison, dimName, dimValue) =>
  ({
    Type: 'AWS::CloudWatch::Alarm',
    Properties: {
      AlarmActions: [{ Ref: 'EmailSnsTopic' }],
      MetricName: metric,
      Namespace: namespace,
      Statistic: statistic,
      Period: '60',
      EvaluationPeriods: evalPeriods,
      Threshold: threshold,
      ComparisonOperator: comparison,
      Dimensions: [{ Name: dimName, Value: { Ref: dimValue } }],
    },
  });

const cloudWatchFunctionAlarm = dimValue => cloudWatchAlarm('Errors', 'AWS/Lambda', 'Average', '1', '0', 'GreaterThanThreshold', 'FunctionName', dimValue);

const cloudWatchDynamoAlarm = (metric, dimValue) => cloudWatchAlarm(metric, 'AWS/DynamoDB', 'Sum', '5', '48', 'GreaterThanOrEqualToThreshold', 'TableName', dimValue);

fs.writeFileSync(
  path.join(__dirname, './resources.yml'),
  yaml.safeDump({
    EmailSnsTopic: snsTopic(),
    TestsTable: dynamoTable(`tests-${stage}`, [attributeDef('TestId', 'S')], [keyDef('TestId', 'HASH')]),
    TestRunsTable: dynamoTable(`test-runs-${stage}`, [attributeDef('TestId', 'S'), attributeDef('RunId', 'S')], [keyDef('TestId', 'HASH'), keyDef('RunId', 'RANGE')]),
    TestsTableReadCapacityAlarm: cloudWatchDynamoAlarm('ConsumedReadCapacityUnits', 'TestsTable'),
    TestsTableWriteCapacityAlarm: cloudWatchDynamoAlarm('ConsumedWriteCapacityUnits', 'TestsTable'),
    TestRunsTableReadCapacityAlarm: cloudWatchDynamoAlarm('ConsumedReadCapacityUnits', 'TestRunsTable'),
    TestRunsTableWriteCapacityAlarm: cloudWatchDynamoAlarm('ConsumedWriteCapacityUnits', 'TestRunsTable'),
    ApiErrorAlarm: cloudWatchFunctionAlarm('ApiLambdaFunction'),
    RunnerErrorAlarm: cloudWatchFunctionAlarm('RunnerLambdaFunction'),
  }),
);
