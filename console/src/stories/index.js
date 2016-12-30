import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import Button from './Button';
import CustomGraphiQL from '../components/CustomGraphiQL';
import Footer from '../components/Footer';
import Form from '../components/Form';

storiesOf('Button', module).add('with text', () => (
  <Button onClick={action('clicked')}>Hello Button</Button>
)).add('with some emoji', () => (
  <Button onClick={action('clicked')}>😀 😎 👍 💯</Button>
));

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
