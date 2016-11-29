import Mapper from './mapper';
import Reader from '../storage/reader';
import Writer from '../storage/writer';

export default class Resolver {
  constructor(reader = new Reader(), writer = new Writer()) {
    this.reader = reader;
    this.writer = writer;
  }

  getRun(testId, runId) {
    return this.reader.getRun(testId, runId).then(run => Mapper.toApiRun(run));
  }

  getRuns(testId) {
    return this.reader.getRuns(testId).then((runs) => {
      const mapped = Mapper.toApiRun(runs);
      return mapped instanceof Error ? [] : mapped;
    });
  }

  deleteRun(testId, runId) {
    return this.writer.deleteRun(testId, runId).then(run => Mapper.toApiRun(run));
  }

  createTest(test) {
    return this.writer.createTest(test);
  }

  getTest(testId) {
    return this.reader.getTest(testId).then(test => Mapper.toApiRun(test));
  }

  getTests() {
    return this.reader.getTests().then((tests) => {
      const mapped = Mapper.toApiTest(tests);
      return mapped instanceof Error ? [] : mapped;
    });
  }

  updateTest(test) {
    return this.getTest(test.id).then(t => (t instanceof Error ? t : this.writer.updateTest(test)));
  }

  deleteTest(testId) {
    this.reader.getRuns(testId).then(runs => runs.map(run => this.deleteRun(run.id)));
    return this.reader.deleteTest(testId).then(test => Mapper.toApiRun(test));
  }
}
