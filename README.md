# Watchtowr

Watchtowr API monitoring and testing. Built using [Serverless](https://serverless.com) and [GraphQL](http://graphql.org).

## Getting Started

Install nvm, clone the repo, and then...

Install dependencies: `nvm install && nvm use && npm install -g serverless yarn && yarn`  
NPM scripts assume you have the following ~/.bashrc file:  
```
export NODE_ENV=dev
export TESTS_TABLE=tests-dev
export TEST_RUNS_TABLE=test-runs-dev

export ACME_DIR=<path_to_acme_install>
. "$ACME_DIR/acme.sh.env"
```

## Development

To do a clean deploy:

- Remove [API mapping](https://us-west-2.console.aws.amazon.com/apigateway/home?region=us-west-2#/custom-domain-names/api.watchtowr.io)
- Delete [stack](https://us-west-2.console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks?filter=active&tab=events)
- Delete deployment [bucket](https://console.aws.amazon.com/s3/home?region=us-west-2)
- Delete [tables](https://us-west-2.console.aws.amazon.com/dynamodb/home?region=us-west-2)
- `npm run deploy`
- `npm run map-api`
