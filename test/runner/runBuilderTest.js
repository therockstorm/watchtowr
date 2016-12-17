import { assert } from 'chai';
import { describe, it } from 'mocha';
import sinon from 'sinon';
import RunBuilder from '../../src/runner/runBuilder';

const startedTime = new Date().getTime();
const startedHighRes = 123;
const elapsed = 654.321;
const response = { status: 200 };
let assertions = [];

function createRunBuilder() {
  const rb = new RunBuilder();
  rb.create(startedTime, startedHighRes, assertions, response);
  return rb;
}

describe('RunBuilder', () => {
  beforeEach(() => {
    sinon.stub(process, 'hrtime').withArgs(startedHighRes).returns([0, elapsed * 1000000]);
  });

  afterEach(() => process.hrtime.restore());

  it('populates properties', () => {
    const runBuilder = createRunBuilder();

    assert.strictEqual(runBuilder.startedTime, startedTime);
    assert.strictEqual(runBuilder.elapsed, elapsed);
    assert.strictEqual(runBuilder.assertions, assertions);
    assert.strictEqual(runBuilder.response, response);
  });

  describe('build', () => {
    it('returns success: false for unknown target', () => {
      assertions = [{ target: 99, comparison: 1, value: '200' }];

      const result = createRunBuilder().build();

      assert.deepEqual(result, {
        started: startedTime,
        elapsedMs: elapsed,
        response: { statusCode: response.status },
        results: [{ expected: assertions[0], success: false }],
      });
    });

    function setAssertions(target, actual, other) {
      assertions = [
        { target, comparison: 1, value: actual },
        { target, comparison: 1, value: other },
        { target, comparison: 2, value: actual },
        { target, comparison: 2, value: other },
        { target, comparison: 3, value: actual },
        { target, comparison: 3, value: other },
        { target, comparison: 99, value: other },
      ];
    }

    function assertResult(result, actual) {
      assert.deepEqual(result, {
        started: startedTime,
        elapsedMs: elapsed,
        response: { statusCode: response.status },
        results: [
          { expected: assertions[0], actual: actual.toString(), success: true },
          { expected: assertions[1], actual: actual.toString(), success: false },
          { expected: assertions[2], actual: actual.toString(), success: false },
          { expected: assertions[3], actual: actual.toString(), success: true },
          { expected: assertions[4], actual: actual.toString(), success: false },
          { expected: assertions[5], actual: actual.toString(), success: true },
          { expected: assertions[6], actual: actual.toString(), success: false },
        ],
      });
    }

    it('asserts STATUS_CODE target', () => {
      const actual = response.status;
      setAssertions(1, actual, actual + 1);

      const result = createRunBuilder().build();

      assertResult(result, actual);
    });

    it('asserts ELAPSED_TIME_MS target', () => {
      const actual = elapsed;
      setAssertions(2, actual, actual + 0.001);

      const result = createRunBuilder().build();

      assertResult(result, actual);
    });
  });
});
