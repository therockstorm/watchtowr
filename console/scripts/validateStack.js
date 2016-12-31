import aws from 'aws-sdk';
import fs from 'fs';
import path from 'path';
import required from '../../util/util';

const cloudformation = new aws.CloudFormation({ region: required(process.argv[2], 'region') });

cloudformation.validateTemplate({
  TemplateBody: fs.readFileSync(path.join(__dirname, 'stack.yml'), 'utf8'),
}).promise().then(() => console.error('Stack valid.')).catch(err => console.error(err));
