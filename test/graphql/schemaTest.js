import { assert } from 'chai';
import { it } from 'mocha';
import sinon from 'sinon';
import { graphql } from 'graphql';
import Schema from '../../src/graphql/schema';
import Resolver from '../../src/graphql/resolver';
import TestRunner from '../../src/runner/testRunner';

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
const variablesQuery = 'query { variables { key value } }';
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
  lastFailure {
    ${runsSnippet}
  }
  runs {
    ${runsSnippet}
  }`;
const testQuery = `query { test(id: "${testId}") { ${testsSnippet} } }`;
const testsQuery = `query { tests { ${testsSnippet} } }`;
const createVariablesMutation = `mutation { createVariables(variables: [{
  key: "{{Accept}}",
  value: "application/json"
}]) { key } }`;
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
const runTestMutation = `mutation { runTest(id: "${testId}") }`;
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

const failOnErrors = (res) => {
  if (!res.errors) return;
  console.log(res.errors.map(e => e.message));
  assert.isTrue(false);
};

it('calls getTest', () => (
  graphql(schema, testQuery).then((res) => {
    failOnErrors(res);
    return assert.isTrue(resolverStub.getTest.calledWith(testId));
  })
));

it('calls getTests', () => {
  resolverStub.getTests.returns([]);
  return graphql(schema, testsQuery).then((res) => {
    failOnErrors(res);
    return assert.isTrue(resolverStub.getTests.called);
  });
});

it('calls getRun', () => (
  graphql(schema, runQuery).then((res) => {
    failOnErrors(res);
    return assert.isTrue(resolverStub.getRun.calledWith(testId, runId));
  })
));

it('calls getRuns', () => {
  resolverStub.getRuns.returns([]);
  return graphql(schema, runsQuery).then((res) => {
    failOnErrors(res);
    return assert.isTrue(resolverStub.getRuns.calledWith(testId));
  });
});

it('calls getVariables', () => {
  resolverStub.getVariables.returns([]);
  return graphql(schema, variablesQuery).then((res) => {
    failOnErrors(res);
    return assert.isTrue(resolverStub.getVariables.called);
  });
});

it('calls createTest', () => (
  graphql(schema, createTestMutation).then((res) => {
    failOnErrors(res);
    assert.isTrue(resolverStub.createTest.called);
    return assert.deepEqual(res, { data: { createTest: null } });
  })
));

it('calls createVariables', () => (
  graphql(schema, createVariablesMutation).then((res) => {
    failOnErrors(res);
    assert.isTrue(resolverStub.createVariables.called);
    return assert.deepEqual(res, { data: { createVariables: null } });
  })
));

it('calls runById', () => (
  graphql(schema, runTestMutation).then((res) => {
    failOnErrors(res);
    assert.isTrue(testRunnerStub.runById.calledWith(testId));
    return assert.deepEqual(res, { data: { runTest: null } });
  })
));

it('calls updateTest', () => (
  graphql(schema, updateTestMutation).then((res) => {
    failOnErrors(res);
    assert.isTrue(resolverStub.updateTest.called);
    return assert.deepEqual(res, { data: { updateTest: null } });
  })
));

it('calls deleteTest', () => (
  graphql(schema, deleteTestMutation).then((res) => {
    failOnErrors(res);
    assert.isTrue(resolverStub.deleteTest.calledWith(testId));
    return assert.deepEqual(res, { data: { deleteTest: null } });
  })
));

it('calls deleteRun', () => (
  graphql(schema, deleteRunMutation).then((res) => {
    failOnErrors(res);
    assert.isTrue(resolverStub.deleteRun.calledWith(testId, runId));
    return assert.deepEqual(res, { data: { deleteRun: null } });
  })
));
