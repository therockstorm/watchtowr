import aws from 'aws-sdk'; // eslint-disable-line import/no-extraneous-dependencies
import fs from 'fs';
import path from 'path';

// https://github.com/Neilpang/acme.sh/blob/master/README.md#use-dns-mode
// acme.sh --upgrade && . ~/.bashrc
// acme.sh --issue --dns --domain watchtowr.io --domain watchtowr.io --somain api.watchtowr.io
// Manually add records to Route53
// acme.sh --renew --domain watchtowr.io --domain www.watchtowr.io --domain api.watchtowr.io

// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/APIGateway.html
const utf8 = 'utf8';
const acmePath = process.env.ACME_DIR;
const stage = process.env.NODE_ENV;
const certService = process.argv[2];
const domain = process.argv[3];
const region = process.argv[4];
const apiId = process.argv[5];

if (!acmePath) console.log('acmePath required');
else if (!stage) console.log('stage required');
else if (!certService) console.log('certService required');
else if (!domain) console.log('domain required');
else if (!region) console.log('region required');
else if (!apiId) console.log('apiId required');
else {
  const apiDomain = `api.${domain}`;
  const apigateway = new aws.APIGateway({ region });

  apigateway.getDomainName({ domainName: apiDomain }, (getErr) => {
    if (!getErr) console.log('Implment deleteDomainName or manually go to API Gateway console -> Custom Domain Names and upload a Backup Certificate');
    else if (getErr.code !== 'NotFoundException') console.log(`Unexpected getErr=${getErr}`);
    else {
      const name = `${certService}-${domain}`;
      const basePath = path.join(acmePath, domain);
      const body = fs.readFileSync(path.join(basePath, `${domain}.cer`), utf8);
      const key = fs.readFileSync(path.join(basePath, `${domain}.key`), utf8);
      const chain = fs.readFileSync(path.join(basePath, 'ca.cer'), utf8);

      apigateway.createDomainName({
        certificateBody: body,
        certificateChain: chain,
        certificateName: name,
        certificatePrivateKey: key,
        domainName: apiDomain,
      }, (createErr, createRes) => {
        if (createErr) console.log(`Unexpected createErr=${createErr}`);

        setTimeout(apigateway.createBasePathMapping({
          domainName: apiDomain,
          restApiId: apiId,
          stage,
        }, (mappingErr) => {
          if (mappingErr) console.log(`Unexpected mappingErr=${mappingErr}`);
          else console.log(`Create an Alias record in Route53 to map ${apiDomain} to ${createRes.distributionDomainName}`);
        }), 2000);
      });
    }
  });
}
