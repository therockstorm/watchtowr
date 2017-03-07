import aws from 'aws-sdk';
import fs from 'fs';
import path from 'path';
import required from '../../util/util';

const acmePath = required(process.env.ACME_DIR, 'acmePath');
const stage = required(process.env.NODE_ENV, 'stage');
const certService = required(process.argv[2], 'certService');
const domain = required(process.argv[3], 'domain');
const region = required(process.argv[4], 'region');
const apiId = required(process.argv[5], 'apiId');
const apigateway = new aws.APIGateway({ region });
const apiDomain = `api.${domain}`;

apigateway.getDomainName({ domainName: apiDomain }, (getErr) => {
  if (!getErr) console.error('Manually go to API Gateway console -> Custom Domain Names and upload a Backup Certificate. https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-custom-domains.html#how-to-rotate-custom-domain-certificate');
  else if (getErr.code !== 'NotFoundException') console.error(`Unexpected getErr=${getErr}`);
  else {
    const utf8 = 'utf8';
    const basePath = path.join(acmePath, domain);
    console.log(`Creating ${apiDomain}`);
    apigateway.createDomainName({
      certificateBody: fs.readFileSync(path.join(basePath, `${domain}.cer`), utf8),
      certificateChain: fs.readFileSync(path.join(basePath, 'ca.cer'), utf8),
      certificateName: `${certService}-${domain}`,
      certificatePrivateKey: fs.readFileSync(path.join(basePath, `${domain}.key`), utf8),
      domainName: apiDomain,
    }, (createErr, createRes) => {
      if (createErr) console.error(`Unexpected createErr=${createErr}`);
      else {
        console.log(`Creating mapping for ${stage}`);
        setTimeout(() => apigateway.createBasePathMapping({
          domainName: apiDomain,
          restApiId: apiId,
          stage,
        }, (mappingErr) => {
          if (mappingErr) console.error(`Unexpected mappingErr=${mappingErr}`);
          else console.log(`Create an Alias record with your DNS to map ${apiDomain} to ${createRes.distributionDomainName}`);
        }), 2000);
      }
    });
  }
});
