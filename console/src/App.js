import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { blue500 } from 'material-ui/styles/colors';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import injectTapEventPlugin from 'react-tap-event-plugin';
import './App.css';

injectTapEventPlugin();

const muiTheme = getMuiTheme({
  palette: { primary1Color: blue500 },
});

class App extends Component {
  render() {
    return (<MuiThemeProvider muiTheme={muiTheme}>
      <div className="main">
        {this.props.children}
      </div>
    </MuiThemeProvider>);
  }
}

export default App;
