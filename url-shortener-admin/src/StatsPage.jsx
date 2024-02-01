import React, { useState } from 'react';
import axios from 'axios';
import './App.css';



const StatsPage = () => {
  const [clickStats, setClickStats] = useState([]);
  const [userInfoList, setUserInfoList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(false);
  const [isMobileNumber, setIsMobileNumber] = useState(false);
  const [sortBy, setSortBy] = useState('clicks');
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState('asc');




  const fetchClickStats = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/clicks?search=${searchQuery}`);
      const dataArray = response.data; // Assuming dataArray is an array of { urlIn, clicks }

      // Extracting urlIn and clicks from each item in dataArray
      const extractedUrlInfoList = dataArray.map(item => item.urlIn);
      const extractedClickStats = dataArray.map(item => item.clicks).flat(); // Assuming clicks is an array

      // Set the state
      setUserInfoList(extractedUrlInfoList);
      setClickStats(extractedClickStats);

      if (extractedUrlInfoList.length > 0) {
        setError(false);
      } else {
        setError(true);
      }
    } catch (error) {
      setUserInfoList([]);
      setClickStats([]);
      setError(true);
      console.error('Error fetching click statistics:', error);
    }
  };






  // Function to handle sorting based on the selected criteria
  const handleSort = (criteria) => {
  setSortBy(criteria);

  // Determine the sorting order based on sortOrder state
  const orderFactor = sortOrder === 'asc' ? 1 : -1;

  // Sort userInfoList based on the selected criteria
  const sortedUserInfoList = [...userInfoList].sort((a, b) => {
    const clicksA = clickStats.filter((click) => click.urlId === a._id);
    const clicksB = clickStats.filter((click) => click.urlId === b._id);

    let comparison = 0;

    if (criteria === 'clicks') {
      comparison = orderFactor * (clicksB.length - clicksA.length);
    } else if (criteria === 'timestamp') {
      const latestTimestampA = clicksA.length > 0 ? clicksA[0].timestamp : 0;
      const latestTimestampB = clicksB.length > 0 ? clicksB[0].timestamp : 0;
      comparison = orderFactor * (latestTimestampB - latestTimestampA);
    }

    return comparison;
  });

  // Reverse sortOrder for the next click on the same criteria
  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');

  setUserInfoList(sortedUserInfoList);
};







  return (
    <div className="stats-container">
      <h1>URL Click Statistics</h1>
      <div className="search-bar">
        <div className="search-input">
          <label htmlFor="searchQuery">Search by Mobile Number or URL:</label>
          <input
            type="text"
            id="searchQuery"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);

              // Check if the current input is a mobile number
              const isMobileNumber = /^\d{0,10}$/.test(e.target.value);
              setIsMobileNumber(isMobileNumber);
            }}
            placeholder="Enter Mobile Number or URL"
          />
        </div>
        <button className="search-button" onClick={fetchClickStats}>
          Search
        </button>
      </div>

      {error && <p className="error-message">No clicks found for the given input</p>}

      <div className="sort-buttons">
        <button onClick={() => handleSort('clicks')} disabled={loading || !clickStats.length}>
          Sort by Clicks
        </button>
        <button onClick={() => handleSort('timestamp')} disabled={loading || !clickStats.length}>
          Sort by Timestamp
        </button>
      </div>


      <table className="stats-table">
        <thead>
          <tr>
            {!isMobileNumber && <th>Mobile Number</th>}
            {isMobileNumber && <th>Original URL</th>}
            <th>Click Count</th>
            <th>Latest Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {!error &&
       userInfoList.map((userInfo, index) => (
        <tr key={index}>
          {!isMobileNumber && userInfo && <td>{userInfo.phoneNumbers}</td>}
          {isMobileNumber && userInfo && <td>{userInfo.originalUrl}</td>}
          {clickStats
            .filter((click) => click.urlId === userInfo._id)
            .map((click, clickIndex) => (
              <React.Fragment key={clickIndex}>
                 <td>
                        {click.clickCount % 2 === 0
                            ? Math.floor(click.clickCount)
                            : Math.floor(click.clickCount-click.clickCount / 2)+1}
                    </td>
      
                <td>
                  {click.timestamp
                    ? new Date(click.timestamp).toLocaleString()
                    : "Not Clicked"}
                </td>
              </React.Fragment>
            ))}
          {!clickStats.some((click) => click.urlId === userInfo._id) && (
            <React.Fragment>
              <td>0</td> {/* Empty cell corresponding to clickCount */}
              <td>Not Clicked</td> {/* "Not Clicked" in the timestamp column */}
            </React.Fragment>
          )}
        </tr>
            ))}

        </tbody>
      </table>
    </div>
  );
};

export default StatsPage;
