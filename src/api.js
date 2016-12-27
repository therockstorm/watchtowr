import { graphql } from 'graphql';
import Schema from './graphql/schema';
import Util from './util/util';

class Response {
  static create(body, context) {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Credentials': 'true',
        'X-Request-Id': context.awsRequestId,
      },
      body: JSON.stringify(body),
    };
  }

  static error(error, context) {
    let msg = error;
    if (error instanceof Error) {
      Util.error(error);
      msg = error.message;
    }
    return Response.create({ errors: [{ message: msg }] }, context);
  }
}

// eslint-disable-next-line import/prefer-default-export
export function handle(event, context, cb, schema = new Schema()) {
  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return cb(null, Response.error('Request body with valid JSON required.', context));
  }
  if (!body.query) {
    return cb(null, Response.error("'query' parameter required.", context));
  }

  let variables;
  if (body.variables) {
    try {
      variables = JSON.parse(body.variables);
    } catch (e) {
      return cb(null, Response.error("'variables' parameter provided but invalid.", context));
    }
  }

  return graphql(schema, body.query, schema.root, context, variables)
    .then(res => cb(null, Response.create(res, context)))
    .catch(err => cb(null, Response.error(err, context)));
}
