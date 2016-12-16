import aws from 'aws-sdk'; // eslint-disable-line import/no-extraneous-dependencies

export default class Notifier {
  constructor(ses = new aws.SES({ region: 'us-west-2' })) {
    this.ses = ses;
  }

  notify(run) {
    if (run.results.every(result => result.success)) return;
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SES.html#sendEmail-property
    // this.ses.sendEmail();
  }
}
