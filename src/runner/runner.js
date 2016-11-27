import axios from 'axios';
import Reader from '../storage/reader';
import Writer from '../storage/writer';
import Util from '../util/util';

export default class Runner {
  constructor(
    reader = new Reader(),
    writer = new Writer(),
    date = new Date(),
    request = axios.request) {
    this.reader = reader;
    this.writer = writer;
    this.date = date;
    this.request = request;
  }

  run() {
    return new Promise((resolve, reject) => {
      this.reader.getTests().then(tests => tests.map((test) => {
        const started = this.date.getTime();
        const start = process.hrtime();
        this.request({
          url: test.request.url,
          method: test.request.method,
          headers: Runner._mapHeaders(test.request.headers),
          data: test.request.body,
        }).then((res) => {
          const run = Runner._constructRun(started, start, test, res);
          // Util.log(JSON.stringify(run));
          resolve(this.writer.createRun(test.id, run));
        }).catch(err => Util.error(err));
        return true;
      })).catch(err => reject(err));
    });
  }

  static _constructRun(started, start, test, res) {
    const elapsed = Number((process.hrtime(start)[1] / 1000000).toFixed(3));
    return {
      started,
      elapsedMs: elapsed,
      response: {
        statusCode: res.status,
      },
      results: test.assertions.map(assertion => Runner._runAssertion(assertion, res, elapsed)),
    };
  }

  static _mapHeaders(testHeaders) {
    const headers = {
      'User-Agent': 'watchtowr/1.0',
    };
    if (testHeaders) {
      testHeaders.map(header => (headers[header.key] = header.value));
    }
    return headers;
  }

  static _runAssertion(assertion, res, elapsed) {
    switch (assertion.target) {
      case 'STATUS_CODE':
        return {
          expected: assertion,
          actual: res.status.toString(),
          success: Runner._compare(res.status, Number(assertion.value)),
        };
      case 'ELAPSED_TIME':
        return {
          expected: assertion,
          actual: elapsed.toString(),
          success: Runner._compare(elapsed, assertion.value),
        };
      default:
        Util.error(new Error(`Invalid assertion target=${assertion.target}`));
        return {
          expected: assertion,
          success: false,
        };
    }
  }

  static _compare(assertion, actual, expected) {
    switch (assertion.comparison) {
      case 'EQUAL':
        return actual === expected;
      case 'NOT_EQUAL':
        return actual !== expected;
      case 'LESS_THAN':
        return actual < expected;
      default:
        Util.error(new Error(`Invalid assertion comparison=${assertion.comparison}`));
        return false;
    }
  }
}
