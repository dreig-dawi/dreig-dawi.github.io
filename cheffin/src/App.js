import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Pini aquí empiexa todo
        </p>
        /* href="https://reactjs.org" */
        <a
          className="App-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          Gracias por la inspiración 👍
        </a>
      </header>
    </div>
  );
}

export default App;
