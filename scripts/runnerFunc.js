import { handle } from '../src/runner';

handle(JSON.stringify({
  version: '0',
  id: '0c0238c1-7f44-4f79-be12-1c59e9ab965e',
  'detail-type': 'Scheduled Event',
  source: 'aws.events',
  account: '111685254296',
  time: '2016-12-17T20:44:41Z',
  region: 'us-west-2',
  resources: [
    'arn:aws:events:us-west-2:111685254296:rule/watchtowr-dev-RunnerEventsRuleSchedule1-1W4CGTTWRFVRU',
  ],
  detail: {},
}), { awsRequestId: 1 }, ((err, res) => console.log(`err="${JSON.stringify(err)} res="${JSON.stringify(res)}""`)));
