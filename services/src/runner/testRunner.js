import axios from 'axios';
import { astFromValue } from 'graphql/utilities';
import RunBuilder from './runBuilder';
import Reader from '../storage/reader';
import Writer from '../storage/writer';
import Notifier from './notifier';
import Util from '../util/util';
import { httpMethodEnum } from '../graphql/schema';

export default class TestRunner {
  constructor(reader = new Reader(), writer = new Writer(), runBuilder = new RunBuilder(),
    notifier = new Notifier()) {
    this.reader = reader;
    this.writer = writer;
    this.runBuilder = runBuilder;
    this.notifier = notifier;
  }

  runAll() {
    return this.reader.getTests().then(tests => (tests.length ?
      this._getVariables().then(variables => tests.map(test => () => this._run(test, variables))
        .reduce((curr, next) => curr.then(next), Promise.resolve())) :
      Promise.resolve()));
  }

  runById(testId) {
    return this.reader.getTest(testId).then(test => (
      test.length ?
      this._getVariables().then(variables => this._run(test[0], variables).then(true)) :
      new Error('Test not found.')
    ));
  }

  _run(test, variables) {
    return new Promise((resolve) => {
      const started = new Date().getTime();
      const startedHighRes = process.hrtime();
      return axios.request({
        url: Util.replaceAll(test.request.url, variables),
        method: astFromValue(test.request.method, httpMethodEnum).value,
        headers: TestRunner._mapHeaders(test.request.headers, variables),
        data: test.request.body ? Util.replaceAll(
          test.request.body, Object.assign({}, this.globalVars, variables)) : test.request.body,
        timeout: 90000,
        validateStatus: status => status >= 100 && status < 600,
      }).then(res => res).catch((err) => {
        Util.error(err);
        return { status: 0 };
      }).then((res) => {
        this.runBuilder.create(started, startedHighRes, test.assertions, res);
        this.writer.createRun(test.id, this.runBuilder.build()).then((run) => {
          const valid = run && run.results && run.results.every(result => result.success);
          if (!valid) this.notifier.notify(test, run);
          resolve();
        });
      });
    });
  }

  _getVariables() {
    return Promise.resolve(this.reader.getVariables().then((vars) => {
      const variables = {
        '{{randomString}}': Util.randomString(),
        '{{randomInt}}': Util.randomInt(),
      };
      vars.map(v => (variables[v.key] = v.value));
      return variables;
    }));
  }

  static _mapHeaders(testHeaders, variables) {
    const headers = { 'User-Agent': 'watchtowr/1.0' };
    if (testHeaders) {
      testHeaders.map(header => (headers[header.key] = Util.replaceAll(header.value, variables)));
    }
    return headers;
  }
}
