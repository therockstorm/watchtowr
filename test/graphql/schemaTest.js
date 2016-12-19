import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { it } from 'mocha';
import sinon from 'sinon';
import { graphql } from 'graphql';
import Schema from '../../src/graphql/schema';
import Resolver from '../../src/graphql/resolver';
import TestRunner from '../../src/runner/testRunner';

chai.use(chaiAsPromised);
const expect = chai.expect;
const resolverStub = sinon.stub(new Resolver());
const testRunnerStub = sinon.stub(new TestRunner());
const schema = new Schema(resolverStub, testRunnerStub);
const runId = '11e6af50-8fbf-b952-80db-218d3d616683';
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
const runQuery = `query { run(testId: "${testId}", id: "${runId}") { ${runsSnippet} } }`;
const runsQuery = `query { runs(testId: "${testId}") { ${runsSnippet} } }`;
const testsSnippet = `
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
  }`;
const testQuery = `query { test(id: "${testId}") { ${testsSnippet} } }`;
const testsQuery = `query { tests { ${testsSnippet} } }`;
const createTestMutation = `mutation { createTest(test: {
  name: "My test name"
  request: {
    headers: [{
      key: "x-api-key",
      value: "xyz"
    }],
    method: GET,
    url: "https://www.rockywarren.com"
  },
  assertions: [{
    target: ELAPSED_TIME_MS,
    comparison: LESS_THAN,
    value: "1200"
    }]
}) { id } }`;
const runTestMutation = `mutation { runTest(id: "${testId}") { id } }`;
const updateTestMutation = `mutation { updateTest(test: {
  id: "${testId}",
  name: "My test name",
  request: {
    method: POST,
    url: "https://www.rockywarren.com",
    body: "{}"
  },
  assertions: [{
    target: STATUS_CODE,
    comparison: EQUAL
    value: "200"
  }]
}) { id } }`;
const deleteTestMutation = `mutation { deleteTest(id: "${testId}") { id } }`;
const deleteRunMutation = `mutation { deleteRun(testId: "${testId}", id: "${runId}") { id } }`;

it('calls getTest', () => (
  graphql(schema, testQuery).then((res) => {
    if (res.errors) console.log(res.errors.map(e => e.message));
    return expect(resolverStub.getTest.called).to.be.true;
  })
));

it('calls getTests', () => {
  resolverStub.getTests.returns([]);
  return graphql(schema, testsQuery).then((res) => {
    if (res.errors) console.log(res.errors.map(e => e.message));
    return expect(resolverStub.getTests.called).to.be.true;
  });
});

it('calls getRun', () => (
  graphql(schema, runQuery).then((res) => {
    if (res.errors) console.log(res.errors.map(e => e.message));
    return expect(resolverStub.getRun.called).to.be.true;
  })
));

it('calls getRuns', () => {
  resolverStub.getRuns.returns([]);
  return graphql(schema, runsQuery).then((res) => {
    if (res.errors) console.log(res.errors.map(e => e.message));
    return expect(resolverStub.getRuns.calledWith(testId)).to.be.true;
  });
});

it('calls createTest', () => (
  graphql(schema, createTestMutation).then((res) => {
    if (res.errors) console.log(res.errors.map(e => e.message));
    return expect(res).to.deep.equal({ data: { createTest: null } }) &&
      expect(resolverStub.createTest.called).to.be.true;
  })
));

it('calls runById', () => (
  graphql(schema, runTestMutation).then((res) => {
    if (res.errors) console.log(res.errors.map(e => e.message));
    return expect(res).to.deep.equal({ data: { runTest: null } }) &&
      expect(testRunnerStub.runById.calledWith(testId)).to.be.true;
  })
));

it('calls updateTest', () => (
  graphql(schema, updateTestMutation).then((res) => {
    if (res.errors) console.log(res.errors.map(e => e.message));
    return expect(res).to.deep.equal({ data: { updateTest: null } }) &&
      expect(resolverStub.updateTest.called).to.be.true;
  })
));

it('calls deleteTest', () => (
  graphql(schema, deleteTestMutation).then((res) => {
    if (res.errors) console.log(res.errors.map(e => e.message));
    return expect(res).to.deep.equal({ data: { deleteTest: null } }) &&
      expect(resolverStub.deleteTest.called).to.be.true;
  })
));

it('calls deleteRun', () => (
  graphql(schema, deleteRunMutation).then((res) => {
    if (res.errors) console.log(res.errors.map(e => e.message));
    return expect(res).to.deep.equal({ data: { deleteRun: null } }) &&
      expect(resolverStub.deleteRun.called).to.be.true;
  })
));
