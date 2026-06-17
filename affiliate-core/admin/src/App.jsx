import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
    const [token, setToken] = useState(localStorage.getItem('adminToken'));

    const setAuth = (newToken) => {
        localStorage.setItem('adminToken', newToken);
        setToken(newToken);
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        setToken(null);
    };

    return (
        <BrowserRouter basename="/admin">
            <div className="min-h-screen bg-gray-100">
                <Routes>
                    <Route path="/login" element={!token ? <Login setAuth={setAuth} /> : <Navigate to="/" />} />
                    <Route path="/" element={token ? <Dashboard token={token} logout={logout} /> : <Navigate to="/login" />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
