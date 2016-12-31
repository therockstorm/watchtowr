import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import CustomGraphiQL from '../components/CustomGraphiQL';
import Footer from '../components/Footer';
import Form from '../components/Form';

const parameters = {};
storiesOf('CustomGraphiQL', module).add('default', () => (
  <CustomGraphiQL parameters={parameters} />
));

storiesOf('Footer', module).add('default', () => (
  <Footer />
));

storiesOf('Form', module).add('default', () => (
  <Form>
    <input placeholder="Email" onChange={action('changed')} />
  </Form>
));
