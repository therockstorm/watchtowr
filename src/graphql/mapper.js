export default class Mapper {
  static toApiRun(runs, isList = false, error = new Error('Run not found.')) {
    if (!runs || !runs.length) return error;
    const mapped = runs.map((r) => {
      const runCopy = r;
      runCopy.started = new Date(runCopy.started).toISOString();
      runCopy.success = runCopy.results.every(result => result.success);
      return runCopy;
    });
    return isList ? mapped : mapped[0];
  }

  static toApiTest(tests, isList = false, error = new Error('Test not found.')) {
    if (!tests || !tests.length) return error;
    return isList ? tests : tests[0];
  }
}
