// Navbar.js


import { Link } from 'react-router-dom';
import './App.css'; // Import the CSS file for styling

import React, { useState, useEffect } from 'react';
import axios from 'axios';



const Navbar = () => {
    const [clicks, setClicks] = useState([]);
    const handleViewStats = async () => {
        try {
          // Send a request to your backend to fetch all click entries
          const response = await axios.get('http://localhost:5000/api/clicks');
          setClicks(response.data.clicks);
        } catch (error) {
          console.error('Error fetching click entries:', error);
        }
      };
    
      // Use useEffect to fetch click entries when the component mounts
      useEffect(() => {
        handleViewStats();
      }, []); // Empty dependency array ensures the effect runs only once
  return (
    <nav className="navbar">
      <Link to="/" className="nav-link">Create URL</Link>
      <Link to="/stats" className="nav-link">Stats</Link>
    </nav>
  );
};

export default Navbar;
