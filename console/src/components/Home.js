import React, { Component } from 'react';
import { Link } from 'react-router';
import './Home.css';

class Home extends Component {
  render() {
    return (
      <div className="globalContent">
        <main>
          <header>
            <div className="stripes">
              <div className="background" />
              <div className="stripe s1" />
              <div className="stripe s2" />
              <div className="stripe s3" />
              <div className="stripe s4" />
              <div className="stripe s5" />
            </div>
            <div className="container lead">
              <h1>Watchtowr</h1>
              <h2>API Testing and Monitoring</h2>
              <Link to="/graphiql">GraphiQL</Link>
            </div>
          </header>
        </main>
      </div>
    );
  }
}

export default Home;
