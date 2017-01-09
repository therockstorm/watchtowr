/* eslint-disable */
import { handle } from '../src/api';

// import Reader from '../src/storage/reader';
// new Reader().getVariables().then(res => console.log(res));

const queries = [
  // invalid query
  // 'query { cow { id } }',
  // tests
  // 'query { tests { id name request { method url headers { key value } body } assertions { target comparison value } runs { id started elapsedMs response { statusCode } results { expected { target comparison value } actual success } success } } }',
  // non-existent test(id: UUID!)
  // 'query { test(id: "11e6af50-8fbf-b952-80db-218d3d616683") { id name request { method url headers { key value } body } assertions { target comparison value } runs { id started elapsedMs response { statusCode } results { expected { target comparison value } actual success } success } } }',
  // test(id: UUID!)
  // `query {
  //   test(id: "11e6c73c-9002-da10-b145-35b599cc3f91") {
  //     lastFailure {
  //       started
  //     }
  //     runs {
  //       started
  //     }
  //   }
  //   runs(testId: "11e6c73c-9002-da10-b145-35b599cc3f91") {
  //     started
  //   }
  // }`,
  `query {
    runs1: runs(testId: "11e6c424-7df1-bc80-ac7e-f510c61b0a7f") {
      elapsedMs
    }
    runs2: runs(testId: "11e6c967-3605-99d0-89a5-87a8257a07e5") {
      elapsedMs
    }
  }`,
  // non-existent test runs(testId: UUID!)
  // 'query { runs(testId: "11e6af50-8fbf-b952-80db-218d3d616683") { id started elapsedMs response { statusCode } results { expected { target comparison value } actual success } success } }',
  // runs(testId: UUID!)
  // `query { runs(testId: "11e6c424-7df1-bc80-ac7e-f510c61b0a7f") {
  //     elapsedMs
  //     response {
  //       statusCode
  //     }
  //     results {
  //       expected {
  //         target
  //         comparison
  //         value
  //       }
  //       actual
  //       success
  //     }
  //     success
  //   }
  // }`,
  // non-existent run(testId: UUID!, id: UUID!)
  // 'query { run(testId: "11e6af50-8fbf-b952-80db-218d3d616683", id: "11e6af50-8fbf-b952-80db-218d3d616683") { id started elapsedMs response { statusCode } results { expected { target comparison value } actual success } success } }',
  // run(testId: UUID!, id: UUID!)
  // `query { run(testId: "11e6c424-7df1-bc80-ac7e-f510c61b0a7f", id: "11e6c4b0-7779-1150-913a-0b296f5eb20b") {
  //     started
  //   }
  // }`,
];

const mutations = [
  // `mutation { createTest(test: {
  //   name: "Root"
  //   request: {
  //     method: GET
  //     url: "{{BaseUrl}}/"
  //     headers: [{
  //      key: "Accept", value: "{{Accept}}"
  //     }, {
  //       key: "Authorization", value: "{{Authorization}}"
  //     }]
  //   }
  //   assertions: [{
  //     target: STATUS_CODE
  //     comparison: EQUAL
  //     value: "200"
  //   }]
  // }) { id }}`,
  // `mutation { createTest(test: {
  //   name: "Root"
  //   request: {
  //     method: POST
  //     url: "{{BaseUrl}}/transfers"
  //     headers: [{
  //      key: "Accept", value: "{{Accept}}"
  //     }, {
  //       key: "Authorization", value: "{{Authorization}}"
  //     }, {
  //       key: "Content-Type", value: "{{Content-Type}}"
  //     }],
  //     body: ${JSON.stringify("{\"amount\":{\"currency\":\"USD\",\"value\":\"0.01\"}}")}
  //   }
  //   assertions: [{
  //     target: STATUS_CODE
  //     comparison: EQUAL
  //     value: "400"
  //   }]
  // }) { id }}`,
  // `mutation { createTest(test: {
  //   name: "POST /customers"
  //   request: {
  //     method: POST
  //     url: "{{BaseUrl}}/customers"
  //     headers: [{
  //      key: "Accept", value: "{{Accept}}"
  //     }, {
  //       key: "Authorization", value: "{{Authorization}}"
  //     }, {
  //       key: "Content-Type", value: "{{Content-Type}}"
  //     }]
  //     body: ${JSON.stringify("{\"firstName\": \"Verified\", \"lastName\": \"Customer\", \"email\": \"{{randomString}}@example.com\", \"type\": \"personal\", \"address1\": \"123 Main St\", \"city\": \"San Francisco\", \"state\": \"CA\", \"postalCode\": \"94012\", \"dateOfBirth\": \"1980-01-01\", \"ssn\": \"1234\"}")}
  //   }
  //   assertions: [{
  //     target: STATUS_CODE
  //     comparison: EQUAL
  //     value: "201"
  //   }]
  //   variables: [{
  //     key: "location"
  //     value: "CreatedCustomerUrl"
  //   }]
  // }) { id }}`,
  // `mutation { createTest(test: {
  //   name: "GET /customers/{id}"
  //   request: {
  //     method: GET
  //     url: "{{CreatedCustomerUrl}}"
  //     headers: [{
  //      key: "Accept", value: "{{Accept}}"
  //     }, {
  //       key: "Authorization", value: "{{Authorization}}"
  //     }]
  //   }
  //   assertions: [{
  //     target: STATUS_CODE
  //     comparison: EQUAL
  //     value: "200"
  //   }]
  // }) { id }}`,
  //   `mutation { createTest(test: {
  //   name: "POST /customers/{id}/funding-sources"
  //   request: {
  //     method: POST
  //     url: "{{CreatedCustomerUrl}}/funding-sources"
  //     headers: [{
  //      key: "Accept", value: "{{Accept}}"
  //     }, {
  //       key: "Authorization", value: "{{Authorization}}"
  //     }, {
  //       key: "Content-Type", value: "{{Content-Type}}"
  //     }]
  //     body: ${JSON.stringify("{\"routingNumber\": \"222222226\", \"accountNumber\": \"{{randomInt}}}\", \"type\": \"Checking\"}")}
  //   }
  //   assertions: [{
  //     target: STATUS_CODE
  //     comparison: EQUAL
  //     value: "201"
  //   }]
  //   variables: [{
  //     key: "location"
  //     value: "CreatedFundingSourceUrl"
  //   }]
  // }) { id }}`,
  // `mutation { createTest(test: {
  //   name: "GET /funding-sources/{id}"
  //   request: {
  //     method: GET
  //     url: "{{CreatedFundingSourceUrl}}"
  //     headers: [{
  //      key: "Accept", value: "{{Accept}}"
  //     }, {
  //       key: "Authorization", value: "{{Authorization}}"
  //     }]
  //   }
  //   assertions: [{
  //     target: STATUS_CODE
  //     comparison: EQUAL
  //     value: "200"
  //   }]
  // }) { id }}`,
  // `mutation { updateTest(test: {
  //   id: "11e6ca3d-3c26-0800-92ce-8b6ea89e1912"
  //   name: "Transfer"
  //   request: {
  //     method: POST
  //     url: "{{BaseUrl}}/transfers"
  //     headers: [{
  //     key: "Accept", value: "{{Accept}}"
  //     }, {
  //       key: "Authorization", value: "{{Authorization}}"
  //     }, {
  //       key: "Content-Type", value: "{{Content-Type}}"
  //     }],
  //     body: "{\"amount\":{\"currency\":\"USD\",\"value\":\"0.01\"}}"
  //   }
  //   assertions: [{
  //     target: STATUS_CODE
  //     comparison: EQUAL
  //     value: "400"
  //   }]
  // }) { id }}`,
  // `mutation {
  //   createVariables(variables: [
  //     { key: "Accept", value: "application/vnd.dwolla.v1.hal+json" },
  //     { key: "Content-Type", value: "application/vnd.dwolla.v1.hal+json" },
  //     { key: "Authorization", value: "Bearer  },
  //     { key: "BaseUrl", value: "https://api-uat.dwolla.com" },
  //   ]) {
  //     key
  //     value
  //   }
  // }`
  // `mutation {
  //   deleteTest(id: "11e6c986-ed2a-6cc0-92dc-075703de9954") {
  //     id
  //   }
  // }`,
  // `mutation {
  //   runTest(id: "11e6d60b-41cc-2120-9bf0-0584478cfc08")
  // }`,
];

mutations.map(query => handle({ body: `{ "query": ${JSON.stringify(query)} }` }, { awsRequestId: 1 }, ((err, res) => {
  if (err) console.log(`err=${JSON.stringify(err)}`);
  if (res) console.log(`statusCode=${res.statusCode}, body=${res.body}`);
})));

// const q = 'query GetTest($id: UUID!) { test(id: $id) { runs { started } } }';
// const v = '{ "id": "11e6c424-7df1-bc80-ac7e-f510c61b0a7f" }';
// handle({ body: `{ "query": ${JSON.stringify(q)}, "variables": ${JSON.stringify(v)} }` }, { awsRequestId: 1 }, ((err, res) => {
//   if (err) console.log(`err=${JSON.stringify(err)}`);
//   if (res) console.log(`statusCode=${res.statusCode}, body=${res.body}`);
// }));

// it.only('test', () => {
//   // return new Reader().batchGetTests('11e6c424-7df1-bc80-ac7e-f510c61b0a7f')
//   return new Reader().batchGetRuns('11e6c424-7df1-bc80-ac7e-f510c61b0a7f', '11e6c4b0-7779-1150-913a-0b296f5eb20b')
//     .then(res => console.log('testRes=' + JSON.stringify(res)))
//     .catch(err => console.error('testErr=' + err));
// });
// it.only('test', () => {
//   return new Reader().getRunDoc('11e6c424-7df1-bc80-ac7e-f510c61b0a7f', '11e6c4b0-7779-1150-913a-0b296f5eb20b')
//     .then(res => console.log('testRes=' + JSON.stringify(res)))
//     .catch(err => console.error('testErr=' + err));
// });
