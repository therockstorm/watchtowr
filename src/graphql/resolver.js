import DataLoader from 'dataloader';
import Mapper from './mapper';
import Reader from '../storage/reader';
import Writer from '../storage/writer';

export default class Resolver {
  constructor(reader = new Reader(), writer = new Writer()) {
    this.reader = reader;
    this.writer = writer;
    this.runByTestIdLoader = new DataLoader(keys => this.reader.getRuns(keys));
  }

  getRun(testId, runId) {
    return this.reader.getRun(testId, runId).then(Mapper.toApiRun);
  }

  getLastFailure(testId) {
    return this.runByTestIdLoader.load(testId).then((runs) => {
      // console.log('here=' + JSON.stringify(runs.runs));
      for (let i = runs.length - 1; i >= 0; i -= 1) {
        if (!runs[i].results.every(result => result.success)) return Mapper.toApiRun([runs[i]]);
      }
      return null;
    });
  }

  getRuns(testId) {
    return this.runByTestIdLoader.load(testId).then(runs => Mapper.toApiRun(runs.runs, true, []));
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
