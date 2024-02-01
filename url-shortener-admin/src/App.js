// App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AdminPage from './AdminPage';
import StatsPage from './StatsPage';
import Navbar from './Navbar';

const App = () => {
  return (
    <Router>
    

      <Routes>
        <Route path="/" element={<><Navbar/><AdminPage /></>} />
        <Route path="/stats" element={<><Navbar/><StatsPage /></>} />

      </Routes>
    </Router>
  );
};

export default App;
