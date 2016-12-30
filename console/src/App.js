import React, { Component } from 'react';
import CustomGraphiQL from './CustomGraphiQL';

const search = window.location.search;
const parameters = {};
search.substr(1).split('&').forEach((entry) => {
  const eq = entry.indexOf('=');
  if (eq >= 0) {
    parameters[decodeURIComponent(entry.slice(0, eq))] = decodeURIComponent(entry.slice(eq + 1));
  }
});

if (parameters.variables) {
  try {
    parameters.variables = JSON.stringify(JSON.parse(parameters.variables), null, 2);
  } catch (e) { // es-lint-ignore-this-line no-empty
  }
}

class App extends Component {
  render() {
    return <CustomGraphiQL parameters={parameters} />;
  }
}

export default App;
