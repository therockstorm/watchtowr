import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { it } from 'mocha';
import sinon from 'sinon';
import { graphql } from 'graphql';
import Schema from '../../src/graphql/schema';
import Resolver from '../../src/graphql/resolver';

chai.use(chaiAsPromised);
const expect = chai.expect;
const resolverStub = sinon.stub(new Resolver());
const schema = new Schema(resolverStub);
const testId = 'ba00ee81-86f9-4014-8550-2ec523734648';
const runsSnippet = `
  id
  started
  elapsedMs
  response {
    statusCode
  }
  success
  results {
    expected {
      target
      comparison
      value
    }
    actual
    success
  }`;
const runsQuery = `query {
  runs(testId: "${testId}") {
    ${runsSnippet}
  }
}`;
const testsSnippet = `
  tests {
    id
    name
    request {
      headers {
        key
        value
      }
      method
      url
      body
    }
    assertions {
      target
      comparison
      value
    }
    runs {
      ${runsSnippet}
    }
  }`;
const testsQuery = `query { ${testsSnippet} }`;
// const createTestMutation = `mutation { createTest(test: {
//   name: "My test name"
//   request: {
//     headers: [{
//       key: "x-api-key",
//       value: "xyz"
//     }],
//     method: "GET",
//     url: "https://www.rockywarren.com"
//   },
//   assertions: [{
//     target: STATUS_CODE,
//     comparison: EQUAL,
//     value: "200"
//     }]
// }) { id } }`;
// const updateTestMutation = `mutation { updateTest(test: {
//   id: "${testId}",
//   name: "My test name",
//   request: {
//     headers: [{
//       key: "x-api-key",
//       value: "xyz"
//     }],
//     method: "POST",
//     url: "https://www.rockywarren.com",
//     body: "{ "id": "123abc"}"
//   },
//   assertions: [{
//     target: STATUS_CODE,
//     comparison: EQUAL
//     value: "200"
//   }]
// }) { id } }`;

it('calls getTests', () => {
  resolverStub.getTests.returns([]);

  return graphql(schema, testsQuery).then((res) => {
    if (res.errors) console.log(res.errors.map(e => e.message));
    return expect(resolverStub.getTests.called).to.be.true;
  });
});

it('calls getRuns', () => {
  resolverStub.getRuns.returns([]);

  return graphql(schema, runsQuery).then((res) => {
    if (res.errors) console.log(res.errors.map(e => e.message));
    return expect(resolverStub.getRuns.calledWith(testId)).to.be.true;
  });
});

// it('calls createTest', () => {
//   const stub = sinon.stub(new Resolver());

//   return graphql(schema, createTestMutation).then((res) => {
//     if (res.errors) console.log(res.errors.map(e => e.message));
//     expect(res).to.deep.equal({
//       data: {
//         createTest: null,
//       },
//     });
//     return expect(stub.createTest.calledWith()).to.be.true;
//   });
// });

// it('calls updateTest', () => {
//   const stub = sinon.stub(new Resolver());

//   return graphql(schema, updateTestMutation).then((res) => {
//     if (res.errors) console.log(res.errors.map(e => e.message));
//     expect(res).to.deep.equal({
//       data: {
//         updateTest: null,
//       },
//     });
//     return expect(stub.updateTest.calledWith()).to.be.true;
//   });
// });
