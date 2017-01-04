import aws from 'aws-sdk';
import required from '../../util/util';

const distributionId = required(process.argv[2], 'distributionId');
const cloudfront = new aws.CloudFront({ region: required(process.argv[3], 'region') });

const waitForCompletion = (id) => {
  let count = 0;
  setInterval(() => cloudfront.getInvalidation({ DistributionId: distributionId, Id: id }).promise()
    .then((res) => {
      count += 1;
      const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
      if (count % 8 === 0) console.log('---------------------------');
      console.log(`${timestamp} ${res.Invalidation.Status}`);
      if (res.Invalidation.Status === 'Completed') process.exit();
    }).catch((err) => {
      console.error(`err=${err}`);
      process.exit(1);
    }), 15000);
};

cloudfront.createInvalidation({
  DistributionId: distributionId,
  InvalidationBatch: {
    CallerReference: Date.now().toString(),
    Paths: { Quantity: 2, Items: ['/index.html', '/static/js/*'] },
    // Paths: { Quantity: 3, Items: ['/index.html', '/static/js/*', '/static/css/*'] },
  },
}).promise().then((res) => {
  console.log(`Cloudfront invalidation created: ${res.Invalidation.Id}`);
  waitForCompletion(res.Invalidation.Id);
}).catch(err => console.error(`err=${err}`));
