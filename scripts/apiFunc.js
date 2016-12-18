import { handle } from '../src/api';

const queries = [
  // invalid query
  'query { cow { id } }',
  // tests
  'query { tests { id name request { method url headers { key value } body } assertions { target comparison value } runs { id started elapsedMs response { statusCode } results { expected { target comparison value } actual success } success } } }',
  // non-existent test(id: UUID!)
  'query { test(id: "11e6af50-8fbf-b952-80db-218d3d616683") { id name request { method url headers { key value } body } assertions { target comparison value } runs { id started elapsedMs response { statusCode } results { expected { target comparison value } actual success } success } } }',
  // test(id: UUID!)
  // non-existent test runs(testId: UUID!)
  'query { runs(testId: "11e6af50-8fbf-b952-80db-218d3d616683") { id started elapsedMs response { statusCode } results { expected { target comparison value } actual success } success } }',
  // runs(testId: UUID!)
  `query {
    runs(testId: "11e6c424-7df1-bc80-ac7e-f510c61b0a7f") {
      elapsedMs
      response {
        statusCode
      }
      results {
        expected {
          target
          comparison
          value
        }
        actual
        success
      }
      success
    }
  }`,
  // non-existent run(testId: UUID!, id: UUID!)
  'query { run(testId: "11e6af50-8fbf-b952-80db-218d3d616683", id: "11e6af50-8fbf-b952-80db-218d3d616683") { id started elapsedMs response { statusCode } results { expected { target comparison value } actual success } success } }',
  // run(testId: UUID!, id: UUID!)
];

// const mutations = [
//   `mutation { createTest(test: {
//     name: "Root"
//     request: {
//       method: GET
//       url: "https://www.example.com/"
//     }
//     assertions: [{
//       target: STATUS_CODE
//       comparison: EQUAL
//       value: "200"
//     }]
//   }) { id }}`,
// ];

queries.map(query => handle({ body: `{ "query": ${JSON.stringify(query)} }` }, { awsRequestId: 1 }, ((err, res) => {
  if (err) console.log(`err=${JSON.stringify(err)}`);
  if (res) console.log(`statusCode=${res.statusCode}, body=${res.body}`);
})));
