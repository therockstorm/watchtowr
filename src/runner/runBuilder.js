import { astFromValue } from 'graphql/utilities';
import Util from '../util/util';
import { assertionTargetEnum, comparisonEnum } from '../graphql/schema';

export default class RunBuilder {
  create(startedTime, startedHighRes, assertions, response) {
    this.startedTime = startedTime;
    this.elapsed = Number((process.hrtime(startedHighRes)[1] / 1000000).toFixed(3));
    this.assertions = assertions;
    this.response = response;
  }

  build() {
    return {
      started: this.startedTime,
      elapsedMs: this.elapsed,
      response: {
        statusCode: this.response.status,
      },
      results: this.runAssertions(),
    };
  }

  runAssertions() {
    return this.assertions.map((a) => {
      const target = astFromValue(a.target, assertionTargetEnum) || {};
      switch (target.value) {
        case 'STATUS_CODE':
          return {
            expected: a,
            actual: this.response.status.toString(),
            success: RunBuilder.compare(a, this.response.status, Number(a.value)),
          };
        case 'ELAPSED_TIME_MS':
          return {
            expected: a,
            actual: this.elapsed.toString(),
            success: RunBuilder.compare(a, this.elapsed, a.value),
          };
        default:
          Util.error(new Error(`Invalid assertion target=${a.target}`));
          return { expected: a, success: false };
      }
    });
  }

  static compare(assertion, actual, expected) {
    const comparison = astFromValue(assertion.comparison, comparisonEnum) || {};
    switch (comparison.value) {
      case 'EQUAL':
        return actual === expected;
      case 'NOT_EQUAL':
        return actual !== expected;
      case 'LESS_THAN':
        return actual < expected;
      default:
        Util.error(new Error(`Invalid assertion comparison=${assertion.comparison}`));
        return false;
    }
  }
}
