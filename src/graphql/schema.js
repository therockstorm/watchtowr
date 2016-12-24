import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';
import { GraphQLDateTime, GraphQLUUID, GraphQLLimitedString } from 'graphql-custom-types';
import Resolver from './resolver';
import TestRunner from '../runner/testRunner';

export const httpMethodEnum = new GraphQLEnumType({
  name: 'HttpMethod',
  description: 'HTTP request methods.',
  values: {
    GET: { value: 1 },
    POST: { value: 2 },
    PUT: { value: 3 },
    DELETE: { value: 4 },
    HEAD: { value: 5 },
    OPTIONS: { value: 6 },
  },
});
export const assertionTargetEnum = new GraphQLEnumType({
  name: 'AssertionTarget',
  description: 'The HTTP response property to run assertions against.',
  values: {
    STATUS_CODE: { value: 1 },
    ELAPSED_TIME_MS: { value: 2 },
  },
});
export const comparisonEnum = new GraphQLEnumType({
  name: 'Comparison',
  description: 'Comparisons.',
  values: {
    EQUAL: { value: 1 },
    NOT_EQUAL: { value: 2 },
    LESS_THAN: { value: 3 },
  },
});
const assertionType = new GraphQLObjectType({
  name: 'Assertion',
  description: 'An assertion to run against the HTTP response.',
  fields: () => ({
    target: {
      type: assertionTargetEnum,
      description: 'The HTTP response property to run the assertion against.',
    },
    comparison: {
      type: comparisonEnum,
      description: 'The comparison used for the assertion.',
    },
    value: {
      type: GraphQLString,
      description: 'The expected value.',
    },
  }),
});
const keyValueType = new GraphQLObjectType({
  name: 'KeyValue',
  description: 'A key/value pair.',
  fields: () => ({
    key: { type: GraphQLString },
    value: { type: GraphQLString },
  }),
});
const requestType = new GraphQLObjectType({
  name: 'Request',
  description: 'An HTTP request.',
  fields: () => ({
    method: {
      type: httpMethodEnum,
      description: 'The HTTP method.',
    },
    url: {
      type: GraphQLString,
      description: 'The URL of the request.',
    },
    headers: {
      type: new GraphQLList(keyValueType),
      description: 'A list of headers for the request.',
    },
    body: {
      type: GraphQLString,
      description: 'The body of the request.',
    },
  }),
});
const responseType = new GraphQLObjectType({
  name: 'Response',
  description: 'An HTTP response.',
  fields: () => ({
    statusCode: {
      type: GraphQLInt,
      description: 'The status code returned.',
    },
  }),
});
const resultType = new GraphQLObjectType({
  name: 'Result',
  description: 'An assertion result.',
  fields: () => ({
    expected: {
      type: assertionType,
      description: 'The expected assertion result.',
    },
    actual: {
      type: GraphQLString,
      description: 'The actual value.',
    },
    success: {
      type: GraphQLBoolean,
      description: 'Whether or not the assertion succeeded.',
    },
  }),
});
const runType = new GraphQLObjectType({
  name: 'Run',
  description: 'A test run.',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLUUID),
      description: 'The id of the run.',
    },
    started: {
      type: GraphQLDateTime,
      description: 'The time the test run started.',
    },
    elapsedMs: {
      type: GraphQLFloat,
      description: 'A list of headers for the request.',
    },
    response: {
      type: responseType,
      description: 'The HTTP response returned.',
    },
    results: {
      type: new GraphQLNonNull(new GraphQLList(resultType)),
      description: 'A list of assertion results.',
    },
    success: {
      type: GraphQLBoolean,
      description: 'Whether or not all assertions succeeded.',
    },
  }),
});
const keyValueInputType = new GraphQLInputObjectType({
  name: 'KeyValueInput',
  description: 'A key/value pair input.',
  fields: () => ({
    key: { type: new GraphQLLimitedString(1, 100) },
    value: { type: new GraphQLNonNull(GraphQLString) },
  }),
});
const requestInputType = new GraphQLInputObjectType({
  name: 'RequestInput',
  description: 'An HTTP request input.',
  fields: () => ({
    method: {
      type: new GraphQLNonNull(httpMethodEnum),
      description: 'The HTTP method.',
    },
    url: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The URL of the request.',
    },
    headers: {
      type: new GraphQLList(keyValueInputType),
      description: 'A list of headers for the request.',
    },
    body: {
      type: GraphQLString,
      description: 'The body of the request.',
    },
  }),
});
const assertionInputType = new GraphQLInputObjectType({
  name: 'AssertionInput',
  description: 'An assertion input to run against the HTTP response.',
  fields: () => ({
    target: {
      type: new GraphQLNonNull(assertionTargetEnum),
      description: 'The HTTP response property to run the assertion against.',
    },
    comparison: {
      type: new GraphQLNonNull(comparisonEnum),
      description: 'The comparison used for the assertion.',
    },
    value: {
      type: GraphQLString,
      description: 'The expected value.',
    },
  }),
});
const testInputType = new GraphQLInputObjectType({
  name: 'TestInput',
  description: 'A test input.',
  fields: () => ({
    name: {
      type: GraphQLString,
      description: 'The name of the test.',
    },
    request: {
      type: new GraphQLNonNull(requestInputType),
      description: 'The HTTP request.',
    },
    assertions: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(assertionInputType))),
      description: 'A list of assertions to run on the response.',
    },
  }),
});
const testUpdateInputType = new GraphQLInputObjectType({
  name: 'TestUpdateInput',
  description: 'A test update input that replaces the test with the specified id.',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLUUID),
      description: 'The id of the test.',
    },
    name: {
      type: GraphQLString,
      description: 'The name of the test.',
    },
    request: {
      type: new GraphQLNonNull(requestInputType),
      description: 'The HTTP request.',
    },
    assertions: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(assertionInputType))),
      description: 'A list of assertions to run on the response.',
    },
  }),
});

export default class Schema extends GraphQLSchema {
  constructor(resolver = new Resolver(), testRunner = new TestRunner()) {
    const testType = new GraphQLObjectType({
      name: 'Test',
      description: 'A test.',
      fields: () => ({
        id: {
          type: new GraphQLNonNull(GraphQLUUID),
          description: 'The id of the test.',
        },
        name: {
          type: GraphQLString,
          description: 'The name of the test.',
        },
        request: {
          type: requestType,
          description: 'The HTTP request.',
        },
        assertions: {
          type: new GraphQLNonNull(new GraphQLList(assertionType)),
          description: 'A list of assertions to run on the response.',
        },
        lastFailure: {
          type: runType,
          description: 'The last failure run.',
          resolve: test => resolver.getLastFailure(test.id),
        },
        runs: {
          type: new GraphQLNonNull(new GraphQLList(runType)),
          description: 'A list of past runs.',
          resolve: test => resolver.getRuns(test.id),
        },
      }),
    });

    super({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: () => ({
          test: {
            type: testType,
            args: {
              id: {
                description: 'The id of the test.',
                type: new GraphQLNonNull(GraphQLUUID),
              },
            },
            resolve: (root, { id }) => resolver.getTest(id),
          },
          tests: {
            type: new GraphQLNonNull(new GraphQLList(testType)),
            resolve: () => resolver.getTests(),
          },
          run: {
            type: runType,
            args: {
              testId: {
                description: 'The id of the test.',
                type: new GraphQLNonNull(GraphQLUUID),
              },
              id: {
                description: 'The id of the run.',
                type: new GraphQLNonNull(GraphQLUUID),
              },
            },
            resolve: (root, { testId, id }) => resolver.getRun(testId, id),
          },
          runs: {
            type: new GraphQLNonNull(new GraphQLList(runType)),
            args: {
              testId: {
                description: 'The id of the test.',
                type: new GraphQLNonNull(GraphQLUUID),
              },
            },
            resolve: (root, { testId }) => resolver.getRuns(testId),
          },
          variables: {
            type: new GraphQLNonNull(new GraphQLList(keyValueType)),
            resolve: () => resolver.getVariables(),
          },
        }),
      }),
      mutation: new GraphQLObjectType({
        name: 'Mutation',
        fields: () => ({
          createTest: {
            type: testType,
            args: {
              test: {
                description: 'The test to create.',
                type: new GraphQLNonNull(testInputType),
              },
            },
            resolve: (root, { test }) => resolver.createTest(test),
          },
          createVariables: {
            type: new GraphQLList(keyValueType),
            args: {
              variables: {
                description: 'The variables to create.',
                type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(keyValueInputType))),
              },
            },
            resolve: (root, { variables }) => resolver.createVariables(variables),
          },
          runTest: {
            type: runType,
            args: {
              id: {
                description: 'The id of the test to run.',
                type: new GraphQLNonNull(GraphQLUUID),
              },
            },
            resolve: (root, { id }) => testRunner.runById(id),
          },
          updateTest: {
            type: testType,
            args: {
              test: {
                description: 'The test to replace.',
                type: new GraphQLNonNull(testUpdateInputType),
              },
            },
            resolve: (root, { test }) => resolver.updateTest(test),
          },
          deleteTest: {
            type: testType,
            args: {
              id: {
                description: 'The id of the test to delete.',
                type: new GraphQLNonNull(GraphQLUUID),
              },
            },
            resolve: (root, { id }) => resolver.deleteTest(id),
          },
          deleteRun: {
            type: runType,
            args: {
              testId: {
                description: 'The id of the test.',
                type: new GraphQLNonNull(GraphQLUUID),
              },
              id: {
                description: 'The id of the run to delete.',
                type: new GraphQLNonNull(GraphQLUUID),
              },
            },
            resolve: (root, { testId, id }) => resolver.deleteRun(testId, id),
          },
        }),
      }),
      types: [
        httpMethodEnum,
        assertionTargetEnum,
        comparisonEnum,
        assertionType,
        keyValueType,
        requestType,
        responseType,
        resultType,
        runType,
        testType,
        keyValueInputType,
        requestInputType,
        assertionInputType,
        testInputType,
        testUpdateInputType,
      ],
    });
  }
}
