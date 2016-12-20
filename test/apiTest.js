import { buildSchema } from 'graphql';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { it } from 'mocha';
import { handle } from '../src/api';

chai.use(chaiAsPromised);
const expect = chai.expect;
const context = { awsRequestId: 'ad32vn' };

function response(body) {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'X-Request-Id': context.awsRequestId,
    },
    body,
  };
}

function error(msg) {
  return response(`{"errors":[{"message":"${msg}"}]}`);
}

it('returns error no body', () => (
  handle({}, context, ((err, res) => (
    expect(res).to.deep.equal(error('Request body with valid JSON required.'))
  )))
));

it('returns error if invalid JSON', () => (
  handle({ body: '{' }, context, ((err, res) => (
    expect(res).to.deep.equal(error('Request body with valid JSON required.'))
  )))
));

it('returns error if missing query prop', () => (
  handle({ body: '{ "x": "y" }' }, context, ((err, res) => (
    expect(res).to.deep.equal(error("'query' parameter required."))
  )))
));

it('returns error if variables provided in invalid format', () => (
  handle({ body: `{ "query": ${JSON.stringify('query { tests }')}, "variables": "{" }` }, context, ((err, res) => (
    expect(res).to.deep.equal(error("'variables' parameter provided but invalid."))
  )))
));

it('returns succesfully', () => (
  handle({ body: `{ "query": ${JSON.stringify('query { tests }')} }` }, context, ((err, res) => (
    expect(res).to.deep.equal(response('{"data":{"tests":null}}'))
  )), buildSchema('type Test { id: ID } type Query { tests: Int } '))
));
