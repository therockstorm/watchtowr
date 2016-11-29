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
    return this.reader.getRuns(testId).then(runs => Mapper.toApiRun(runs, []));
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
    return this.reader.getTests().then(tests => Mapper.toApiTest(tests, []));
  }

  updateTest(test) {
    return this.getTest(test.id).then(t => (t instanceof Error ? t : this.writer.updateTest(t)));
  }

  deleteTest(testId) {
    this.getRuns(testId).then(runs => runs.map(run => this.deleteRun(run.id)));
    return this.reader.deleteTest(testId);
  }
}
