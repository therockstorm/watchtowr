import DataLoader from 'dataloader';
import Mapper from './mapper';
import Reader from '../storage/reader';
import Writer from '../storage/writer';

export default class Resolver {
  constructor(reader = new Reader(), writer = new Writer(),
    runsLoader = new DataLoader(keys => reader.getRuns(keys))) {
    this.reader = reader;
    this.writer = writer;
    this.runsLoader = runsLoader;
  }

  getRun(testId, runId) {
    return this.reader.getRun(testId, runId).then(Mapper.toApiRun);
  }

  getLastFailure(testId) {
    return this.runsLoader.load(testId).then((r) => {
      for (let i = r.runs.length - 1; i >= 0; i -= 1) {
        if (!r.runs[i].results.every(result => result.success)) return Mapper.toApiRun([r.runs[i]]);
      }
      return null;
    });
  }

  getRuns(testId) {
    return this.runsLoader.load(testId).then(r => Mapper.toApiRun(r.runs, true, []));
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

  createVariables(variables) {
    return this.writer.createVariables(Mapper.toVariables(variables));
  }

  getVariables() {
    return this.reader.getVariables().then(variables => Mapper.toApiVariable(variables, true, []));
  }

  updateTest(test) {
    return this.getTest(test.id).then(t => (t instanceof Error ? t : this.writer.updateTest(test)));
  }

  deleteTest(testId) {
    return this.writer.deleteTest(testId).then(Mapper.toApiTest);
  }
}
