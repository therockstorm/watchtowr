import axios from 'axios';
import RunBuilder from './runBuilder';
import Reader from '../storage/reader';
import Writer from '../storage/writer';
import Util from '../util/util';

export default class Runner {
  constructor(reader = new Reader(), writer = new Writer(), runBuilder = new RunBuilder(),
    date = new Date(), request = axios.request) {
    this.reader = reader;
    this.writer = writer;
    this.runBuilder = runBuilder;
    this.date = date;
    this.request = request;
  }

  run() {
    return new Promise((resolve, reject) => {
      this.reader.getTests().then(tests => tests.map((test) => {
        const started = this.date.getTime();
        const startedHighRes = process.hrtime();
        this.request({
          url: test.request.url,
          method: test.request.method,
          headers: Runner._mapHeaders(test.request.headers),
          data: test.request.body,
        }).then((res) => {
          const run = this.runBuilder(started, startedHighRes, test.assertions, res).build();
          // Util.log(JSON.stringify(run));
          resolve(this.writer.createRun(test.id, run));
        }).catch(err => Util.error(err));
        return true;
      })).catch(err => reject(err));
    });
  }

  static _mapHeaders(testHeaders) {
    const headers = { 'User-Agent': 'watchtowr/1.0' };
    if (testHeaders) testHeaders.map(header => (headers[header.key] = header.value));
    return headers;
  }
}
