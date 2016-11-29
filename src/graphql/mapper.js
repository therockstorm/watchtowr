export default class Mapper {
  static toApiRun(run, error = new Error('Run not found.')) {
    if (!run || !run.length) return error;
    return run.map((r) => {
      const runCopy = r;
      runCopy.started = new Date(Number(runCopy.started) * 1000).toISOString();
      runCopy.success = runCopy.results.every(result => result.success);
      return runCopy;
    });
  }

  static toApiTest(test, error = new Error('Test not found.')) {
    if (!test || !test.length) return error;
    return test;
  }
}
