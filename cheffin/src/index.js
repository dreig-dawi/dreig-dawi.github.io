import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import Home from './Home/Home.tsx';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import ChefProfile from './pages/ChefProfile/ChefProfile';
import Chat from './pages/Chat/Chat';
import NotFound from './pages/NotFound/NotFound';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout/Layout';

// Create a wrapper component that includes the Layout for routes that need it
const WithLayout = ({ component: Component }) => (
  <Layout>
    <Component />
  </Layout>
);

export default function Router() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<App />} />
                    <Route path="/home" element={<WithLayout component={Home} />} />
                    <Route path="/login" element={<WithLayout component={Login} />} />
                    <Route path="/register" element={<WithLayout component={Register} />} />
                    <Route path="/chef/:username" element={<WithLayout component={ChefProfile} />} />
                    <Route path="/chat" element={<WithLayout component={Chat} />} />
                    <Route path="/chat/:username" element={<WithLayout component={Chat} />} />
                    
                    {/* NotFound route must be last */}
                    <Route path="*" element={<WithLayout component={NotFound} />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
