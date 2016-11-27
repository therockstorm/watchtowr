import equal from 'deep-equal';
import Reader from '../storage/reader';
import Writer from '../storage/writer';

const testNotFound = new Error('Test not found.');

export default class Resolver {
  constructor(reader = new Reader(), writer = new Writer()) {
    this.reader = reader;
    this.writer = writer;
  }

  getRun(testId, runId) {
    return this.reader.getRun(testId, runId)
      .then(run => (run.length ? Resolver._mapRun(run) : new Error('Step not found.')));
  }

  getRuns(testId) {
    return testId ? this.reader.getRuns(testId)
      .then(runs => runs.map(run => Resolver._mapRun(run))) : [];
  }

  deleteRun(testId, runId) {
    return this.reader.deleteRun(testId, runId);
  }

  createTest(test) {
    return this.writer.createTest(test);
  }

  getTest(testId) {
    return this.reader.getTest(testId).then(test => (test.length ? test : testNotFound));
  }

  getTests() {
    return this.reader.getTests();
  }

  updateTest(test) {
    return new Promise((resolve, reject) => {
      this.reader.getTest(test.id).then((existingTest) => {
        if (!existingTest.id) return reject(testNotFound);
        if (equal(existingTest, test)) return resolve(test);

        return resolve(this.writer.updateTest(test));
      });
    });
  }

  deleteTest(testId) {
    this.reader.getRuns(testId).then(runs => runs.map(run => this.deleteRun(run.id)));
    return this.reader.deleteTest(testId);
  }

  static _mapRun(run) {
    const runCopy = run;
    runCopy.started = new Date(Number(runCopy.started)).toISOString();
    runCopy.success = runCopy.results.every(result => result.success);
    return runCopy;
  }
}
