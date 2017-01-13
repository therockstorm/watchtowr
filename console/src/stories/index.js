import React from 'react';
import { storiesOf, action } from '@kadira/storybook'; // eslint-disable-line import/no-extraneous-dependencies
import CustomGraphiQL from '../components/CustomGraphiQL';
import Form from '../components/Form';

const parameters = {};
storiesOf('CustomGraphiQL', module).add('default', () => (
  <CustomGraphiQL parameters={parameters} />
));

storiesOf('Form', module).add('default', () => (
  <Form>
    <input placeholder="Email" onChange={action('changed')} />
  </Form>
));
