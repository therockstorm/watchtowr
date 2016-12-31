import aws from 'aws-sdk'; // eslint-disable-line import/no-extraneous-dependencies
import required from '../../util/util';

// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SES.html
const domain = required(process.argv[2], 'domain');
const region = required(process.argv[3], 'region');
const ses = new aws.SES({ region });
const route53 = new aws.Route53();
const params = { Domain: domain };
const cname = token => ({
  Action: 'UPSERT',
  ResourceRecordSet: {
    Name: `${token}._domainkey.${domain}`,
    Type: 'CNAME',
    ResourceRecords: [{
      Value: `${token}.dkim.amazonses.com`,
    }],
    TTL: 300,
  },
});
const txt = value => ({
  Action: 'UPSERT',
  ResourceRecordSet: {
    Name: domain,
    Type: 'TXT',
    ResourceRecords: [{
      Value: `"${value}"`,
    }],
    TTL: 300,
  },
});

console.log(`Verifying ${domain} identity`);
ses.verifyDomainIdentity(params, (idErr, idRes) => {
  if (idErr) console.error(`Unexpected idErr=${idErr}`);
  else {
    console.log(`Verifying ${domain} DKIM`);
    ses.verifyDomainDkim(params, (dkimErr, dkimRes) => {
      if (dkimErr) console.error(`Unexpected dkimErr=${dkimErr}`);
      else {
        const changes = [txt(idRes.VerificationToken)];
        dkimRes.DkimTokens.map(token => changes.push(cname(token)));
        console.log(`Creating Route53 records sets=${JSON.stringify(changes)}`);
        route53.changeResourceRecordSets({
          ChangeBatch: {
            Changes: changes,
          },
          HostedZoneId: 'Z2HLSO6NIE1IL3',
        }, (recordErr, recordRes) => {
          if (recordErr) console.error(`Unexpected recordErr=${recordErr}`);
          else {
            const id = recordRes.ChangeInfo.Id;
            setInterval(() => route53.getChange({ Id: id }, (changeErr, changeRes) => {
              if (changeErr) {
                console.error(`Unexpected changeErr=${changeErr}`);
                process.exit(1);
              } else if (changeRes.ChangeInfo.Status === 'INSYNC') {
                console.log('Successfully verified domain and DKIM.');
                process.exit();
              } else console.log(`Status=${changeRes.ChangeInfo.Status}`);
            }), 5000);
          }
        });
      }
    });
  }
});
