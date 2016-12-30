import TestRunner from './runner/testRunner';
import Util from './util/util';

// eslint-disable-next-line import/prefer-default-export
export function handle(event, context, cb) {
  Util.log(JSON.stringify(event));

  new TestRunner().runAll().then(res => cb(null, res)).catch((err) => {
    Util.error(err);
    cb(err);
  });
}
