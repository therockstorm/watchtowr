import React, { Component, PropTypes } from 'react';
import GraphiQL from 'graphiql';
import fetch from 'isomorphic-fetch';
import 'graphiql/graphiql.css';
import Footer from './Footer';
import Form from './Form';
import './CustomGraphiQL.css';
import logo from '../../icons/watchtowr.png';

const styles = { height: '100vh' };

export default class CustomGraphiQL extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fetcher: this.fetcher.bind(this),
      query: props.parameters.query,
      variables: props.parameters.variables,
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
      onEditQuery: this.onEditQuery.bind(this),
      onEditVariables: this.onEditVariables.bind(this),
      apiKey: '',
    };
    this.onApiKeyChange = this._onApiKeyChange.bind(this);
  }

  onEditQuery(newQuery) {
    this.props.parameters.query = newQuery;
    this.updateURL();
  }

  onEditVariables(newVariables) {
    this.props.parameters.variables = newVariables;
    this.updateURL();
  }

  _onApiKeyChange(event) {
    this.setState({ apiKey: event.target.value });
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
      credentials: 'include',
      // mode: 'no-cors',
    })
      .then(res => res.json())
      .catch(err => (err instanceof TypeError ? "Error: Make sure you've added your 'X-API-Key' header above." : err));
  }

  updateURL() {
    const newSearch = `?${Object.keys(this.props.parameters)
      .filter(key => (Boolean(this.props.parameters[key])))
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(this.props.parameters[key])}`).join('&')}`;
    history.replaceState(null, null, newSearch);
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
          <GraphiQL.Footer>
            <Footer />
          </GraphiQL.Footer>
        </GraphiQL>
      </div>
    );
  }
}

CustomGraphiQL.propTypes = { parameters: PropTypes.object };
