import React from 'react';
import './Home.css';

function Home() {
    return (
        <div className="Home">
            <header className="Home-header">
                <h1>Welcome to Chefgram</h1>
                <p>Share your culinary creations with the world!</p>
            </header>
            <main className="Home-main">
                <div className="post">
                    <img src="https://www.svgrepo.com/show/474300/chef-hat.svg" alt="Chef Hat" />
                    <p>Chef John Doe's latest creation: Spaghetti Carbonara</p>
                </div>
                <div className="post">
                    <img src="https://www.svgrepo.com/show/474300/chef-hat.svg" alt="Chef Hat" />
                    <p>Chef Jane Smith's latest creation: Chocolate Cake</p>
                </div>
            </main>
        </div>
    );
}

export default Home;