import Runner from './runner/runner';
import Util from './util/util';

export function handle(event, context, cb) { // eslint-disable-line import/prefer-default-export
  Util.log(JSON.stringify(event));

  new Runner().run().then(res => cb(null, res)).catch((err) => {
    Util.error(err);
    cb(err);
  });
}
