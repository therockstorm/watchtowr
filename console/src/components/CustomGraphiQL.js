import React, { Component } from 'react';
import GraphiQL from 'graphiql';
import fetch from 'isomorphic-fetch';
import { buildClientSchema, introspectionQuery } from 'graphql/utilities';
import 'graphiql/graphiql.css';
import Form from './Form';
import logo from '../../icons/watchtowr.png';

const styles = { height: '100vh' };
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

export default class CustomGraphiQL extends Component {
  static updateURL() {
    const newSearch = `?${Object.keys(parameters)
      .filter(key => (Boolean(parameters[key])))
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(parameters[key])}`).join('&')}`;
    history.replaceState(null, null, `${newSearch}/#/graphiql`);
  }

  static onEditQuery(newQuery) {
    parameters.query = newQuery;
    CustomGraphiQL.updateURL();
  }

  static onEditVariables(newVariables) {
    parameters.variables = newVariables;
    CustomGraphiQL.updateURL();
  }

  constructor(props) {
    super(props);
    this.state = {
      fetcher: this.fetcher.bind(this),
      query: parameters.query,
      variables: parameters.variables,
      defaultQuery: `# Write GraphQL queries aware of the current schema with this in-browser
# IDE. Access auto-complete with Ctrl-Space and press the run button
# above or Cmd-Enter to execute queries. Access "Docs" on the far right.

# We'll get you started with a simple query showing your list of tests!
query {
  tests {
    id
    name
  }
}
`,
      onEditQuery: CustomGraphiQL.onEditQuery.bind(this),
      onEditVariables: CustomGraphiQL.onEditVariables.bind(this),
      apiKey: '',
    };
    this.onApiKeyChange = this._onApiKeyChange.bind(this);
  }

  updateSchema() {
    return this.fetcher({ query: introspectionQuery }).then((result) => {
      if (result && result.data) {
        this.setState({ schema: buildClientSchema(result.data) });
      }
    });
  }

  _onApiKeyChange(event) {
    this.setState({ apiKey: event.target.value }, this.updateSchema);
  }

  fetcher(params) {
    return fetch('https://api.watchtowr.io/graphql', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'x-api-key': this.state.apiKey,
      },
      body: JSON.stringify(params),
    }).then(res => res.json()).catch(err => (err instanceof TypeError ? "Error: Make sure you've added your 'X-API-Key' header above." : err));
  }

  render() {
    return (
      <div style={styles}>
        <GraphiQL {...this.state} >
          <GraphiQL.Logo>
            <img src={logo} height="34px" alt="logo" />
          </GraphiQL.Logo>
          <GraphiQL.Toolbar>
            <Form>
              <input
                id="api-key"
                type="password"
                placeholder="X-API-Key Header"
                onChange={this.onApiKeyChange}
              />
            </Form>
          </GraphiQL.Toolbar>
        </GraphiQL>
      </div>
    );
  }
}
