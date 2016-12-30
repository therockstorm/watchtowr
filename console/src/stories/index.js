import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import Button from './Button';
import '../components/CustomGraphiQL.css';
import CustomGraphiQL from '../components/CustomGraphiQL';

storiesOf('Button', module).add('with text', () => (
  <Button onClick={action('clicked')}>Hello Button</Button>
)).add('with some emoji', () => (
  <Button onClick={action('clicked')}>😀 😎 👍 💯</Button>
));

const parameters = {};
storiesOf('CustomGraphiQL', module).add('default view', () => (
  <CustomGraphiQL parameters={parameters} />
));
