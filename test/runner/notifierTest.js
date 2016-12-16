import { assert } from 'chai';
import { describe, it } from 'mocha';
import sinon from 'sinon';
import Notifier from '../../src/runner/notifier';

describe('Notifier', () => {
  it('populates properties', () => {
    new Notifier().notify({});
  });
});
