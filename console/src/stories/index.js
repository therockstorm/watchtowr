import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import Button from './Button';
import CustomGraphiQL from '../components/CustomGraphiQL';
import Footer from '../components/Footer';
import '../components/CustomGraphiQL.css';

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
