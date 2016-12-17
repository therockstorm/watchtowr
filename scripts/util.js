export default class Util {
  static required(val, name) {
    if (val) return val;
    console.error(`${name} required`);
    return process.exit(1);
  }
}
