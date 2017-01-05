import aws from 'aws-sdk';
import { assert } from 'chai';
import { describe, it } from 'mocha';
import sinon from 'sinon';
import Notifier from '../../src/runner/notifier';

const sesStub = sinon.stub(new aws.SES());

describe('Notifier', () => {
  it('does not notify if test null', () => {
    new Notifier(sesStub).notify({}, { id: '1' });
    assert.isFalse(sesStub.sendEmail.called);
  });

  it('does not notify if test id empty', () => {
    new Notifier(sesStub).notify({ name: 't' }, { id: '1' });
    assert.isFalse(sesStub.sendEmail.called);
  });

  it('does not notify if test name empty', () => {
    new Notifier(sesStub).notify({ id: '1' }, { id: '1' });
    assert.isFalse(sesStub.sendEmail.called);
  });

  it('does not notify if run null', () => {
    new Notifier(sesStub).notify({ id: '1', name: 't' });
    assert.isFalse(sesStub.sendEmail.called);
  });

  it('does not notify if run id empty', () => {
    new Notifier(sesStub).notify({ id: '1', name: 't' }, {});
    assert.isFalse(sesStub.sendEmail.called);
  });

  it('sends email', () => {
    new Notifier(sesStub).notify({ id: '1', name: 't' }, { id: '1' });
    assert.isTrue(sesStub.sendEmail.called);
  });
});
