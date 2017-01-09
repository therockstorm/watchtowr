import uuid from 'uuid';
import crypto from 'crypto';

export default class Util {
  static sequencialId() {
    // https://github.com/kelektiv/node-uuid/issues/75
    const id = uuid.v1().replace(/^(.{8})-(.{4})-(.{4})/, '$3$2-$1');
    return `${id.substr(0, 13)}-${id.substr(13)}`;
  }

  static error(msg) {
    if (process.env.NODE_ENV === 'development' && msg.code === 'ResourceNotFoundException') {
      console.log('!!!!!! Check AWS creds !!!!!!'); // eslint-disable-line no-console
    }
    Util.log(msg, true);
  }

  static log(msg, isError = false) {
    if (process.env.NODE_ENV === 'test') return;

    if (isError) console.error('[ERROR]', msg); // eslint-disable-line no-console
    else console.log('[INFO]', msg); // eslint-disable-line no-console
  }

  static replaceAll(str, map) {
    return str.replace(new RegExp(Object.keys(map).join('|'), 'gi'), matched => map[matched]);
  }

  static randomString() {
    return crypto.randomBytes(5).toString('hex');
  }
}
