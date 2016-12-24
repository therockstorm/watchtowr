import uuid from 'uuid';

export default class Util {
  static sequencialId() {
    // https://github.com/kelektiv/node-uuid/issues/75
    const id = uuid.v1().replace(/^(.{8})-(.{4})-(.{4})$/, '$3$2-$1');
    return `${id.substr(0, 13)}-${id.substr(13)}`;
  }

  static error(msg) {
    Util.log(msg, true);
  }

  static log(msg, isError = false) {
    if (process.env.NODE_ENV === 'test') return;

    if (isError) console.error(msg); // eslint-disable-line no-console
    else console.log(msg); // eslint-disable-line no-console
  }

  static replaceAll(str, map) {
    return str.replace(new RegExp(Object.keys(map).join('|'), 'gi'), matched => map[matched]);
  }
}
