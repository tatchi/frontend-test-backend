import React from 'react';
import logo from './logo.svg';
import './App.css';
import { fetchBandwidth } from './api';

function App() {
  React.useEffect(() => {
    fetchBandwidth({ from: 1586072930418, to: 1587052130418 }).then(
      console.log
    );
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
