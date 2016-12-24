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
    threshold, comparison, dimensions = []) =>
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
      Dimensions: dimensions,
    },
  });

const cloudWatchFunctionAlarm = dimValueRef => cloudWatchAlarm('Errors', 'AWS/Lambda', 'Average', '1', '0', 'GreaterThanThreshold', [{ Name: 'FunctionName', Value: { Ref: dimValueRef } }]);

const cloudWatchDynamoAlarm = (metric, dimValueRef) => cloudWatchAlarm(metric, 'AWS/DynamoDB', 'Sum', '5', '48', 'GreaterThanOrEqualToThreshold', [{ Name: 'TableName', Value: { Ref: dimValueRef } }]);

const cloudWatchLogMetricsAlarm = metric => cloudWatchAlarm(metric, 'LogMetrics', 'Sum', '1', '0', 'GreaterThanThreshold');

const cloudWatchFilter = (logGroupRef, name) => ({
  Type: 'AWS::Logs::MetricFilter',
  Properties: {
    LogGroupName: {
      Ref: logGroupRef,
    },
    FilterPattern: '"[ERROR]"',
    MetricTransformations: [{
      MetricValue: '1',
      MetricNamespace: 'LogMetrics',
      MetricName: name,
    }],
  },
});

const s3Bucket = name => ({
  Type: 'AWS::S3::Bucket',
  DeletionPolicy: 'Retain',
  Properties: {
    BucketName: `${service}-${stage}-${name}`,
  },
});

const bucketResource = bucketRef => [{ 'Fn::Join': ['', ['arn:aws:s3:::', { Ref: bucketRef }, '/*']] }];

const s3BucketPolicy = bucketRef => ({
  Type: 'AWS::S3::BucketPolicy',
  Properties: {
    Bucket: { Ref: bucketRef },
    PolicyDocument: {
      Statement: [{
        Effect: 'Allow',
        Principal: '*',
        Action: ['s3:GetObject', 's3:PutObject'],
        Resource: bucketResource(bucketRef),
      }, {
        Sid: 'DenyIncorrectEncryptionHeader',
        Effect: 'Deny',
        Principal: '*',
        Action: 's3:PutObject',
        Resource: bucketResource(bucketRef),
        Condition: { StringNotEquals: { 's3:x-amz-server-side-encryption': 'AES256' } },
      }, {
        Sid: 'DenyUnEncryptedObjectUploads',
        Effect: 'Deny',
        Principal: '*',
        Action: 's3:PutObject',
        Resource: bucketResource(bucketRef),
        Condition: { Null: { 's3:x-amz-server-side-encryption': 'true' } },
      }],
    },
  },
});

const testsTableRef = 'TestsTable';
const testRunsTableRef = 'TestRunsTable';
fs.writeFileSync(
  path.join(__dirname, './resources.yml'),
  yaml.safeDump({
    EmailSnsTopic: snsTopic(),
    TestsTable: dynamoTable(`Tests${stage}`, [attributeDef('TestId', 'S')], [keyDef('TestId', 'HASH')]),
    TestRunsTable: dynamoTable(`TestRuns${stage}`, [attributeDef('TestId', 'S'), attributeDef('RunId', 'S')], [keyDef('TestId', 'HASH'), keyDef('RunId', 'RANGE')]),
    TestsTableReadCapacityAlarm: cloudWatchDynamoAlarm('ConsumedReadCapacityUnits', testsTableRef),
    TestsTableWriteCapacityAlarm: cloudWatchDynamoAlarm('ConsumedWriteCapacityUnits', testsTableRef),
    TestRunsTableReadCapacityAlarm: cloudWatchDynamoAlarm('ConsumedReadCapacityUnits', testRunsTableRef),
    TestRunsTableWriteCapacityAlarm: cloudWatchDynamoAlarm('ConsumedWriteCapacityUnits', testRunsTableRef),
    ApiErrorAlarm: cloudWatchFunctionAlarm('ApiLambdaFunction'),
    RunnerErrorAlarm: cloudWatchFunctionAlarm('RunnerLambdaFunction'),
    ApiErrorLogFilter: cloudWatchFilter('ApiLogGroup', 'api-errors'),
    RunnerErrorLogFilter: cloudWatchFilter('RunnerLogGroup', 'runner-errors'),
    ApiErrorLogAlarm: cloudWatchLogMetricsAlarm('api-errors'),
    RunnerErrorLogAlarm: cloudWatchLogMetricsAlarm('runner-errors'),
    VariablesS3Bucket: s3Bucket('variables'),
    VariablesS3BucketPolicy: s3BucketPolicy('VariablesS3Bucket'),
  }),
);