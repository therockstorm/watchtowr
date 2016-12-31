import aws from 'aws-sdk'; // eslint-disable-line import/no-extraneous-dependencies
import fs from 'fs';
import path from 'path';
import required from '../../util/util';

const stage = required(process.env.NODE_ENV, 'stage');
const stackName = `${required(process.argv[2], 'service')}-${stage}`;
const cloudformation = new aws.CloudFormation({ region: required(process.argv[3], 'region') });
const templateBody = fs.readFileSync(path.join(__dirname, 'stack.yml'), 'utf8');

const waitForCompletion = () => (
  setInterval(() => cloudformation.describeStacks({ StackName: stackName }).promise()
    .then((res) => {
      const stack = res.Stacks[0];
      const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
      console.log(`${timestamp} ${stack.StackStatus}`);
      if (stack.StackStatusReason) console.log(stack.StackStatusReason);
      if (!stack.StackStatus.endsWith('IN_PROGRESS')) process.exit();
    }).catch((err) => {
      console.error(`Unexpected err=${err}`);
      process.exit(1);
    }), 5000));

const createStack = () => {
  console.log(`Creating ${stackName}...`);
  return cloudformation
    .createStack({
      StackName: stackName,
      OnFailure: 'ROLLBACK',
      TemplateBody: templateBody,
      Tags: [{
        Key: 'STAGE',
        Value: stage,
      }],
    }).promise().then(() => waitForCompletion()).catch(err => console.error(err));
};

cloudformation.describeStacks({ StackName: stackName }).promise().then((res) => {
  if (res.Stacks[0].StackStatus === 'ROLLBACK_COMPLETE') {
    console.log(`Deleting ${stackName}...`);
    return cloudformation.deleteStack({ StackName: stackName }).promise()
      .then(() => waitForCompletion()
        .then(() => createStack()));
  }
  console.log(`Updating ${stackName}...`);
  return cloudformation
    .updateStack({ StackName: stackName, TemplateBody: templateBody })
    .promise().then(() => waitForCompletion())
    .catch((err) => {
      if (err.message === 'No updates are to be performed.') console.log('No stack updates.');
      else console.error(err);
    });
}).catch(() => createStack());
