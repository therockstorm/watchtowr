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
    notifier = new Notifier(), date = new Date()) {
    this.reader = reader;
    this.writer = writer;
    this.runBuilder = runBuilder;
    this.notifier = notifier;
    this.date = date;
  }

  runAll() {
    const variables = this._getVariables();
    return this.reader.getTests()
      .then(tests => tests.map(test => () => this._run(test, variables))
        .reduce((curr, next) => curr.then(next), Promise.resolve()));
  }

  runById(testId) {
    return this.reader.getTest(testId).then(test => this._run(test[0], this._getVariables()));
  }

  _run(test, variables) {
    return new Promise((resolve, reject) => {
      const started = this.date.getTime();
      const startedHighRes = process.hrtime();
      const method = astFromValue(test.request.method, httpMethodEnum) || 'GET';
      const body = test.request.body;
      return axios.request({
        url: Util.replaceAll(test.request.url, variables),
        method: method.value,
        headers: TestRunner._mapHeaders(test.request.headers, variables),
        data: body ? Util.replaceAll(body, variables) : body,
        timeout: 60000,
      }).then((res) => {
        this.runBuilder.create(started, startedHighRes, test.assertions, res);
        const run = this.runBuilder.build();
        this.notifier.notify(test, run);
        resolve(this.writer.createRun(test.id, run));
      }).catch(err => reject(err));
    });
  }

  _getVariables() {
    const variables = {};
    this.reader.getVariables().map(variable => (variables[variable.key] = variable.value));
    return variables;
  }

  static _mapHeaders(testHeaders, variables) {
    const headers = { 'User-Agent': 'watchtowr/1.0' };
    if (testHeaders) {
      testHeaders.map(header => (headers[header.key] = Util.replaceAll(header.value, variables)));
    }
    return headers;
  }
}
