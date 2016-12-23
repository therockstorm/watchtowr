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
    return Mapper.toApi(tests, isList, error);
  }

  static toApiVariable(variables, isList = false, error = new Error('Variable not found.')) {
    return Mapper.toApi(variables, isList, error);
  }

  static toApi(obj, isList = false, error = new Error('Not found.')) {
    if (!obj || !obj.length) return error;
    return isList ? obj : obj[0];
  }
}
