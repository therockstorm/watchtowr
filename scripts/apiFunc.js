import { handle } from '../src/api';

const queries = [
  // invalid query
  'query { cow { id } }',
  // tests
  'query { tests { id name request { method url headers { key value } body } assertions { target comparison value } runs { id started elapsedMs response { statusCode } results { expected { target comparison value } actual success } success } } }',
  // non-existent test(id: UUID!)
  'query { test(id: "11e6af50-8fbf-b952-80db-218d3d616683") { id name request { method url headers { key value } body } assertions { target comparison value } runs { id started elapsedMs response { statusCode } results { expected { target comparison value } actual success } success } } }',
  // test(id: UUID!)
  // runs(testId: UUID!)
  'query { runs(testId: "11e6af50-8fbf-b952-80db-218d3d616683") { id started elapsedMs response { statusCode } results { expected { target comparison value } actual success } success } }',
  // non-existent run(testId: UUID!, id: UUID!)
  'query { run(testId: "11e6af50-8fbf-b952-80db-218d3d616683", id: "11e6af50-8fbf-b952-80db-218d3d616683") { id started elapsedMs response { statusCode } results { expected { target comparison value } actual success } success } }',
  // run(testId: UUID!, id: UUID!)
];

queries.map(query => handle({ body: `{ "query": ${JSON.stringify(query)} }` }, { awsRequestId: 1 }, ((err, res) => {
  if (err) console.log(`err=${JSON.stringify(err)}`);
  if (res) console.log(`statusCode=${res.statusCode}, body=${res.body}`);
})));
