import aws from 'aws-sdk';

// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/APIGateway.html
const stage = process.env.NODE_ENV;
const domain = process.argv[2];
const region = process.argv[3];
const apiId = process.argv[4];

if (!domain) console.log('domain required');
else if (!region) console.log('region required');
else if (!apiId) console.log('apiId required');
else {
  const apigateway = new aws.APIGateway({
    region,
  });

  apigateway.createBasePathMapping({
    domainName: `api.${domain}`,
    restApiId: apiId,
    stage,
  }, (err, data) => {
    if (err) console.log(err);
    else console.log(data);
  });
}
