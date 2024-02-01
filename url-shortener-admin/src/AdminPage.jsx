// AdminPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Import your CSS file
import { Link } from 'react-router-dom';

const AdminPage = () => {
    const [mainUrl, setMainUrl] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [phoneNumbers, setPhoneNumbers] = useState([]);
    const [shortenedUrls, setShortenedUrls] = useState([]);
    const [validNumbers, setValidNumbers] = useState([]);
    const [validPhoneCount, setValidPhoneCount] = useState(0);

    const [isValidPhoneNumbers, setIsValidPhoneNumbers] = useState(false);
    const [isCheckNo, setIsCheckNo] = useState(false);
    let check = false;//to chekc whether chekc button of viewing how many valid numbers is clicked or not
    const [isValidUrl, setIsValidUrl] = useState(false);
    const handleCheckValidPhones = () => {
        setValidPhoneCount(validNumbers.length);
        check = !check;
        setIsCheckNo(check);
    };

    const handleMainUrlChange = (e) => {
        const url = e.target.value;
        setMainUrl(url);

        // Regular expression for a simple URL format validation
        const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;

        // Check if the entered URL matches the regex, or if it's a www.google.com format
        setIsValidUrl(urlRegex.test(url) || /^www\.[a-zA-Z0-9-]+\.com$/.test(url));

    };

    const handleDownloadUrls = () => {
        // Prepare CSV content
        const csvContent = 'Phone No,Shortened URL\n' +
            shortenedUrls.map(url => `${url.phoneNumber},${`http://localhost:5000/shorten/${url.shortUrl}`}`).join('\n');

        // Create a Blob with the CSV content
        const blob = new Blob([csvContent], { type: 'text/csv' });

        // Create a download link and trigger the download
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'shortened_urls.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
    };







    const handlePhoneNumberChange = (e) => {
        const inputText = e.target.value;
        setPhoneNumber(inputText);
    
        // Regular expression for validating individual phone numbers
        const phoneRegex = /^\d{10}$/; // Assumes 10-digit phone numbers, adjust as needed
    
        // Check if each phone number in the string is valid
        const phoneNumbersArray = inputText.split(',').map((number) => number.trim());
    
        // Use a Set to store unique phone numbers
        const uniqueNumbersSet = new Set();
    
        // Check for duplicate numbers and invalid numbers
        const validNumbers = phoneNumbersArray.filter((number) => {
            if (!phoneRegex.test(number)) {
                return false; // Invalid numbers are not considered
            }
            const isUnique = !uniqueNumbersSet.has(number);
            uniqueNumbersSet.add(number);
            return isUnique;
        });
    
        // Update the state based on validation result
        setIsValidPhoneNumbers(validNumbers.length >= 1);
        setValidNumbers(validNumbers);
    };
    





    const handleUrlShortening = async () => {
        try {
            // Send a request to your backend to shorten the URL for each phone number
            const response = await axios.post('http://localhost:5000/api/shorten-url', {
                originalUrl: mainUrl,
                phoneNumbers: validNumbers,
            });

            //   setPhoneNumbers(response.data.shortenedUrls);
            setShortenedUrls(response.data.shortenedUrls);


            // Do something with the response if needed

            // Clear the form
            setMainUrl('');
            setPhoneNumber('');
            setPhoneNumbers([]);
        } catch (error) {
            console.error('Error shortening URL:', error);
        }
    };



    return (
        <div className="admin-page-container">
            <h1>Admin Page</h1>
            <div className="input-group">
                <label>Main URL</label>
                <input
                    type="text"
                    value={mainUrl}
                    onChange={handleMainUrlChange}
                    className={isValidUrl ? '' : 'invalid'}
                />
                {/* {!isValidUrl && <p className="error-message">Please enter a valid URL</p>} */}
            </div>
            <div className="input-group">
                <label>Phone Numbers</label>
                <input
                    type="text"
                    value={phoneNumber}
                    onChange={handlePhoneNumberChange}
                    className={isValidPhoneNumbers ? '' : 'invalid'}
                />
                {/* {!isValidPhoneNumbers && (
        <p className="error-message">Please enter valid phone numbers separated by commas</p>
      )} */}
            </div>

            <button className="check-button" onClick={handleCheckValidPhones}>
                Check Valid Phone Numbers
            </button>


            {isCheckNo && <p className="valid-phone-message">{`Number of valid phone numbers: ${validPhoneCount}`}</p>}


            <button
                className={`btn-shorten ${!(isValidPhoneNumbers && isValidUrl) ? 'blurred' : ''}`}
                onClick={handleUrlShortening}
                disabled={!(isValidPhoneNumbers && isValidUrl)}
            >
                Shorten URL
            </button>

            {/* {isValidPhoneNumbers && isValidUrl && (
                <p className="valid-phone-message">{`Number of valid phone numbers: ${validNumbers.length}`}</p>
            )} */}

            <button
                className={`download-button ${shortenedUrls.length > 0 ? '' : 'hidden'}`}
                onClick={handleDownloadUrls}
            >
                Download Shortened URLs
            </button>


            {shortenedUrls.length > 0 && (
                <div className="shortened-urls-list">
                    <h3>Shortened URLs:</h3>
                    <ul>
                        {shortenedUrls.map((url, index) => (
                            <li key={index}>
                                <strong>Phone:</strong> {url.phoneNumber}
                                <strong>  URL:</strong> {`http://localhost:5000/shorten/${url.shortUrl}`}

                            </li>
                        ))}
                    </ul>
                </div>
            )}


        </div>
    );
};

export default AdminPage;
