import axios from 'axios';
import RunBuilder from './runBuilder';
import Reader from '../storage/reader';
import Writer from '../storage/writer';

export default class Runner {
  constructor(reader = new Reader(), writer = new Writer(), runBuilder = new RunBuilder(),
    date = new Date()) {
    this.reader = reader;
    this.writer = writer;
    this.runBuilder = runBuilder;
    this.date = date;
  }

  run() {
    return new Promise((resolve, reject) => {
      this.reader.getTests().then((tests) => {
        tests.map((test) => {
          const started = this.date.getTime();
          const startedHighRes = process.hrtime();
          return axios.request({
            url: test.request.url,
            method: test.request.method,
            headers: Runner._mapHeaders(test.request.headers),
            data: test.request.body,
          }).then((res) => {
            this.runBuilder.create(started, startedHighRes, test.assertions, res);
            resolve(this.writer.createRun(test.id, this.runBuilder.build()));
          }).catch(err => reject(err));
        });
      }).catch(err => reject(err));
    });
  }

  static _mapHeaders(testHeaders) {
    const headers = { 'User-Agent': 'watchtowr/1.0' };
    if (testHeaders) testHeaders.map(header => (headers[header.key] = header.value));
    return headers;
  }
}
