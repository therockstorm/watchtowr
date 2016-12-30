import aws from 'aws-sdk';
import { assert } from 'chai';
import { describe, it } from 'mocha';
import sinon from 'sinon';
import Notifier from '../../src/runner/notifier';

const sesStub = sinon.stub(new aws.SES());

describe('Notifier', () => {
  it('does not notify if run null', () => {
    new Notifier(sesStub).notify();
    assert.isFalse(sesStub.sendEmail.called);
  });

  it('does not notify if results null', () => {
    new Notifier(sesStub).notify({}, {});
    assert.isFalse(sesStub.sendEmail.called);
  });

  it('does not notify if results empty', () => {
    new Notifier(sesStub).notify({}, { results: [] });
    assert.isFalse(sesStub.sendEmail.called);
  });

  it('does not notify if results succeed', () => {
    new Notifier(sesStub).notify({}, { results: [{ success: true }] });
    assert.isFalse(sesStub.sendEmail.called);
  });

  it('sends email', () => {
    new Notifier(sesStub).notify({}, { results: [{ success: true }, { success: false }] });
    assert.isTrue(sesStub.sendEmail.called);
  });
});
