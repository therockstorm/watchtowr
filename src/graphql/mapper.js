export default class Mapper {
  static toApiRun(run) {
    if (!run || !run.length) return new Error('Run not found.');
    return run.map((r) => {
      const runCopy = JSON.parse(JSON.stringify(r));
      runCopy.started = new Date(Number(runCopy.started) * 1000).toISOString();
      runCopy.success = runCopy.results.every(result => result.success);
      return runCopy;
    });
  }

  static toApiTest(test) {
    if (!test || !test.length) return new Error('Test not found.');
    return test;
  }
}
