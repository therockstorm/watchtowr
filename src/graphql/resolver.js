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
      // console.log(JSON.stringify(r));
      for (let i = r.runs.length - 1; i >= 0; i -= 1) {
        if (!r.runs[i].results.every(result => result.success)) return Mapper.toApiRun([r.runs[i]]);
      }
      return null;
    });
  }

// Should return test not found, returns empty list instead
// query {
//   runs(testId: "11e6c73c-9002-da10-b145-35b599cc3f91") {
//     elapsedMs
//     results {
//       actual
//     }
//   }
// }
  getRuns(testId) {
    return this.runsLoader.load(testId).then(r => Mapper.toApiRun(r.runs, true, []));
  }

  deleteRun(testId, runId) {
    return this.writer.deleteRun(testId, runId).then(Mapper.toApiRun);
  }

  createTest(test) {
    return this.writer.createTest(test);
  }

  createVariables(variables) {
    return variables;
  }

  getTest(testId) {
    return this.reader.getTest(testId).then(Mapper.toApiTest);
  }

  getTests() {
    return this.reader.getTests().then(tests => Mapper.toApiTest(tests, true, []));
  }

  getVariables() {
    return [{ key: 'myKey', value: 'myValue' }];
  }

  updateTest(test) {
    return this.getTest(test.id).then(t => (t instanceof Error ? t : this.writer.updateTest(t)));
  }

  deleteTest(testId) {
    return this.writer.deleteTest(testId).then(Mapper.toApiTest);
  }
}
