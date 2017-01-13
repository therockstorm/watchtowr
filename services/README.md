# Services

Serverless and GraphQL services.

## Getting Started

Install nvm, clone the repo, and then...

Install dependencies: `yarn`  

## Development

To do a clean deploy if already deployed:

- Remove [Custom Domain](https://us-west-2.console.aws.amazon.com/apigateway/home?region=us-west-2#/custom-domain-names)
- Delete [stack](https://us-west-2.console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks?filter=active)
- Delete deployment and variables [buckets](https://console.aws.amazon.com/s3/home?region=us-west-2)
- Delete [Usage Plan](https://us-west-2.console.aws.amazon.com/apigateway/home?region=us-west-2#/usage-plans/)
- Delete [tables](https://us-west-2.console.aws.amazon.com/dynamodb/home?region=us-west-2)
- Comment out ApiUsagePlan and then run `yarn run deploy`
- Update package.json apiId, uncomment plan and deploy again, add API Key to plan in AWS Console
- `yarn run cert:deploy`
