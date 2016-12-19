import Mapper from './mapper';
import Reader from '../storage/reader';
import Writer from '../storage/writer';

export default class Resolver {
  constructor(reader = new Reader(), writer = new Writer()) {
    this.reader = reader;
    this.writer = writer;
  }

  getRun(testId, runId) {
    return this.reader.getRun(testId, runId).then(Mapper.toApiRun);
  }

  getRuns(testId) {
    return this.reader.getRuns(testId).then(runs => Mapper.toApiRun(runs, true, []));
  }

  deleteRun(testId, runId) {
    return this.writer.deleteRun(testId, runId).then(Mapper.toApiRun);
  }

  createTest(test) {
    return this.writer.createTest(test);
  }

  getTest(testId) {
    return this.reader.getTest(testId).then(Mapper.toApiTest);
  }

  getTests() {
    return this.reader.getTests().then(tests => Mapper.toApiTest(tests, true, []));
  }

  updateTest(test) {
    return this.getTest(test.id).then(t => (t instanceof Error ? t : this.writer.updateTest(t)));
  }

  deleteTest(testId) {
    return this.writer.deleteTest(testId).then(Mapper.toApiTest);
  }
}
