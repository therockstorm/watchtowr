import Runner from './runner/runner';
import Util from './util/util';

// eslint-disable-next-line import/prefer-default-export
export function handle(event, context, cb) {
  Util.log(JSON.stringify(event));

  new Runner().run().then(res => cb(null, res)).catch((err) => {
    Util.error(err);
    cb(err);
  });
}
