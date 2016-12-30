# Services

Serverless and GraphQL services.

## Getting Started

Install nvm, clone the repo, and then...

Install dependencies: `yarn`  

## Development

To do a clean deploy:

- Remove [API mapping](https://us-west-2.console.aws.amazon.com/apigateway/home?region=us-west-2#/custom-domain-names/api.watchtowr.io)
- Delete [stack](https://us-west-2.console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks?filter=active&tab=events)
- Delete deployment [bucket](https://console.aws.amazon.com/s3/home?region=us-west-2)
- Delete [tables](https://us-west-2.console.aws.amazon.com/dynamodb/home?region=us-west-2)
- `npm run deploy`
- `npm run map-api`
- Add 'Access-Control-Allow-Credentials': 'true' to OPTIONS and that and 'Access-Control-Allow-Origin': 'http://localhost:3000'
