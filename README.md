# Watchtowr

Watchtowr.io—an insightful, open-sourced [GraphQL](http://graphql.org/) API to test and monitor availability and correctness of your micro-service and public APIs.

![Watchtowr.io screenshot](/watchtowr.png?raw=true)

## Getting Started

+ Create a test using a GraphQL mutation

```
mutation {
  createTest(test: {
    name: "/users/{id}/friends"
    request: {
      method: GET
      url: "https://www.example.com/users/1/friends"
    }
    assertions: [{
      target: STATUS_CODE
      comparison: EQUAL
      value: "200"
    }]
  }) { id }
}
```

+ By default, the test will run every 30 minutes. To run it manually:

```
mutation {
  runTest(id: "11e6fef9-6f11-10c0-8369-197b325765c1")
}
``` 

+ To query for results:

```
query {
  run(testId: "11e6fef9-6f11-10c0-8369-197b325765c1", id: "11e6fefb-132e-a810-93c8-f91a36893922") {
    results {
      expected {
        target
        comparison
        value
      }
      actual
      success
    }
  }
}
```

## Development

Install [nvm](https://github.com/creationix/nvm), clone the repo, and then...

Install and use Node version references in .nvm: `nvm install && nvm use`  
Install yarn: Either `npm install -g yarn` or `brew install yarn watchman`  
Install global dependencies: `yarn global add serverless snyk`  
Deploy to AWS: `yarn run deploy`

Some scripts assume the following in your ~/.bashrc or ~/.bash_profile:  
```
export NODE_ENV=development
```
