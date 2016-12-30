import aws from 'aws-sdk'; // eslint-disable-line import/no-extraneous-dependencies

// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/IAM.html
const iam = new aws.IAM();
const certService = process.argv[2];
const domain = process.argv[3];

if (!certService) console.log('certService required');
else if (!domain) console.log('domain required');
else {
  iam.getServerCertificate({ ServerCertificateName: `${certService}-${domain}` }, (err, data) => {
    if (err) console.log(err);
    else console.log(data.ServerCertificate.ServerCertificateMetadata);
  });
}
