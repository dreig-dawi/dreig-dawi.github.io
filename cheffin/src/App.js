import './App.css';
import {Link} from "react-router-dom";

function App() {
    return (
        <div className="App">
            <header className="App-header">
                <img src="https://www.svgrepo.com/show/474300/chef-hat.svg" className="App-logo" alt="logo"/>
                <p>
                    Pini aquí empieXa todo
                </p>
                {/* href="https://reactjs.org" */}
                <Link className="App-link" to="/home">
                    Gracias por la inspiración 👍
                </Link>
            </header>
        </div>
    );
}

export default App;
