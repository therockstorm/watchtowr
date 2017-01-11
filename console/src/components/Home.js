import React, { Component } from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import Snackbar from 'material-ui/Snackbar';
import './Home.css';
import logo from '../../icons/watchtowr.png';

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false, value: '', error: '' };
    this.handleChange = this._handleChange.bind(this);
    this.handleTouchTap = this._handleTouchTap.bind(this);
    this.handleRequestClose = this._handleRequestClose.bind(this);
  }

  _handleChange(event) {
    this.setState({ value: event.target.value, error: '' });
  }

  _handleTouchTap() {
    if (!this.state.value.includes('@')) this.setState({ error: 'Please enter a valid email' });
    else this.setState({ open: true, value: '' });
  }

  _handleRequestClose() {
    this.setState({ open: false });
  }

  render() {
    return (
      <div>
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
          </header>
          <div className="center">
            <p><img src={logo} alt="logo" /></p>
            <h2>API Testing and Monitoring</h2>
            <TextField
              floatingLabelText="Email"
              type="email"
              value={this.state.value}
              errorText={this.state.error}
              onChange={this.handleChange}
            /><br />
            <RaisedButton label="Subscribe to learn more" onTouchTap={this.handleTouchTap} />
            <Snackbar
              open={this.state.open}
              message="Thanks!"
              autoHideDuration={3000}
              onRequestClose={this.handleRequestClose}
            />
          </div>
        </main>
      </div>
    );
  }
}
