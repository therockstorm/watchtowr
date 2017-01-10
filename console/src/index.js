import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import App from './App';
import Home from './components/Home';
import CustomGraphiQL from './components/CustomGraphiQL';
import './index.css';

ReactDOM.render(
  <Router history={browserHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={Home} />
    </Route>
    <Route path="/graphiql" component={CustomGraphiQL} />
  </Router>, document.getElementById('root'),
);
