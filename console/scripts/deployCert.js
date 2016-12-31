import aws from 'aws-sdk'; // eslint-disable-line import/no-extraneous-dependencies
import fs from 'fs';
import path from 'path';
import required from '../../util/util';

const certService = required(process.argv[2], 'certService');
const domain = required(process.argv[3], 'domain');
const distributionId = required(process.argv[4], 'distributionId');

const iam = new aws.IAM();
const utf8 = 'utf8';
const basePath = path.join(required(process.env.ACME_DIR, 'acmePath'), domain);
const name = `${certService}-${domain}`;
const newName = `${name}-new`;

iam.uploadServerCertificate({
  CertificateBody: fs.readFileSync(path.join(basePath, `${domain}.cer`), utf8),
  PrivateKey: fs.readFileSync(path.join(basePath, `${domain}.key`), utf8),
  CertificateChain: fs.readFileSync(path.join(basePath, 'ca.cer'), utf8),
  ServerCertificateName: newName,
  Path: `/cloudfront/${certService}/`,
}).promise().then((uploadRes) => {
  const certId = uploadRes.ServerCertificateMetadata.ServerCertificateId;
  console.log(`New certId=${certId}`);
  const cloudfront = new aws.CloudFront();

  cloudfront.getDistributionConfig({ Id: distributionId }).promise().then((configRes) => {
    const configCopy = configRes;
    configCopy.DistributionConfig.ViewerCertificate.IAMCertificateId = certId;
    configCopy.DistributionConfig.ViewerCertificate.Certificate = certId;
    configCopy.DistributionConfig.ViewerCertificate.CertificateSource = 'iam';
    configCopy.DistributionConfig.IsIPV6Enabled = true;
    configCopy.DistributionConfig.ViewerCertificate.CloudFrontDefaultCertificate = false;
    if (!('SSLSupportMethod' in configCopy.DistributionConfig.ViewerCertificate)) {
      configCopy.DistributionConfig.ViewerCertificate.SSLSupportMethod = 'sni-only';
      configCopy.DistributionConfig.ViewerCertificate.MinimumProtocolVersion = 'TLSv1';
    }

    cloudfront.updateDistribution({
      DistributionConfig: configCopy.DistributionConfig,
      Id: distributionId,
      IfMatch: configRes.ETag,
    }).promise().then(() => {
      iam.deleteServerCertificate({ ServerCertificateName: name }, () => {
        iam.updateServerCertificate({
          ServerCertificateName: newName,
          NewServerCertificateName: name,
        }).promise().then(() => {
          console.log('Cert uploaded and assigned, CloudFront distribution deploying...');
          const params = { Id: distributionId };
          setInterval(() => cloudfront.getDistribution(params).promise().then((getRes) => {
            if (getRes.Distribution.Status === 'Deployed') {
              console.log('CloudFront distribution deployed.');
              process.exit();
            } else console.log(`Status=${getRes.Distribution.Status}`);
          }).catch((getErr) => {
            if (getErr) {
              console.error(`getErr=${getErr}`);
              process.exit(1);
            }
          }), 15000);
        }).catch(updateCertErr => console.error(`updateCertErr=${updateCertErr}`));
      });
    }).catch(updateErr => console.error(`updateErr=${updateErr}`));
  }).catch(configErr => console.error(`configErr=${configErr}`));
}).catch(uploadErr => console.error(`uploadErr=${uploadErr}`));
