import { graphql } from 'graphql';
import Schema from './graphql/schema';
import Util from './util/util';

class Response {
  static create(body, context) {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
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

export function handle( // eslint-disable-line import/prefer-default-export
  event, context, cb, schema = new Schema()) {
  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return cb(null, Response.error('Request body with valid JSON required.', context));
  }
  if (!body.query) {
    return cb(null, Response.error('Request body query parameter required.', context));
  }

  return graphql(schema, body.query)
    .then(res => cb(null, Response.create(res, context)))
    .catch(err => cb(null, Response.error(err, context)));
}
