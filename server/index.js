const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');

const app = express();
const PORT = process.env.PORT || 5000;
dotenv.config();



app.use(cors());
app.use(bodyParser.json());




const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;




// MongoDB connection
mongoose.connect(`mongodb+srv://${username}:${password}@cluster0.3aewvpq.mongodb.net/?retryWrites=true&w=majority`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});





const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});





const clickSchema = new mongoose.Schema({
  urlId: { type: String, ref: 'Url', required: true },
  timestamp: { type: Date, default: Date.now },
  clickCount: { type: Number, default: 1 },
});





// Define MongoDB schemas
const urlSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true },
  shortUrl: { type: String, unique: true },
  creationDate: { type: Date, default: Date.now },
  phoneNumbers: [String],
});





// Define MongoDB models
const Url = mongoose.model('Url', urlSchema);
const Click = mongoose.model('Click', clickSchema);








// API endpoint to shorten a URL
// API endpoint to shorten a URL with a list of phone numbers
app.post('/api/shorten-url', async (req, res) => {
  try {
    const { originalUrl, phoneNumbers } = req.body;

    // Validate that originalUrl is provided
    if (!originalUrl) {
      return res.status(400).json({ error: 'Original URL is required' });
    }

    const shortenedUrls = [];

    // Create a separate URL document for each phone number
    for (const phoneNumber of phoneNumbers) {
      const urlDoc = await Url.create({ originalUrl, phoneNumbers: [phoneNumber] });

      // Generate a short URL based on the document's ID
      urlDoc.shortUrl = urlDoc._id;
      await urlDoc.save();

      shortenedUrls.push({ phoneNumber, shortUrl: urlDoc.shortUrl, originalUrl });
    }

    res.json({ shortenedUrls });
  } catch (error) {
    console.error('Error shortening URL:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});











// API endpoint to track URL clicks
app.get('/shorten/:id', async (req, res) => {
  const shortId = req.params.id;

 

  try {
    // Find the URL document based on the short ID
    const urlDoc = await Url.findOne({ shortUrl: shortId });

    if (!urlDoc) {
      // If the short URL is not found, add a new entry with initial click count of 1
      // const newUrlDoc = await Url.create({ shortUrl:shortId });
      // await Click.create({ urlId: newUrlDoc._id, clickCount: 1 });
      return res.status(404).json({ error: 'Short URL not found' });
    }

    // Find the corresponding URL in the Click collection using urlId
    const clickDoc = await Click.findOne({ urlId: urlDoc._id });

    if (clickDoc) {
      // If a click entry exists, increment the clickCount
      clickDoc.clickCount += 1;
      clickDoc.timestamp = new Date(); // Update timestamp for the latest click
      await clickDoc.save();
    } else {
      // If no click entry exists, create a new one with initial click count of 1
      await Click.create({ urlId: urlDoc._id, clickCount: 1 });
    }
        // Check if the original URL is an absolute URL
        const absoluteUrlPattern = /^(https?|ftp):\/\//;
        const absoluteUrl = absoluteUrlPattern.test(urlDoc.originalUrl);
    
        // Redirect to the original URL
        return res.redirect(absoluteUrl ? urlDoc.originalUrl : `http://${urlDoc.originalUrl}`);
  } catch (error) {
    console.error('Error updating click count:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});











// Assuming the API endpoint is /api/clicks
app.get('/api/clicks', async (req, res) => {
  try {
    const searchQuery = req.query.search;
   
    let query;
    if (/^\d{10}$/.test(searchQuery)) {
      // If the search query is a 10-digit number, treat it as a phone number
      query = { phoneNumbers: searchQuery };
    } else {
      // Otherwise, treat it as a short URL
      query = { originalUrl: searchQuery };
    }

    // Assuming 'Url' is your mongoose model for the Url schema
    const urlInfo = await Url.find(query);
    // console.log(urlInfo);
    const resultArray = [];

    if (urlInfo) {
      // If a matching record is found in the Url schema, search for clicks
      for (const urlIn of urlInfo) {
        // Find clicks for the current urlInfo object
        const clicks = await Click.find({ urlId: urlIn._id }).sort({ timestamp: 1 });
      
        // Push the result (urlInfo and corresponding clicks) to the result array
        resultArray.push({ urlIn, clicks });
      }

      if (resultArray.length > 0) {
        // If clicks are found, send the information back to the client
        res.json(resultArray);
      } else {
        res.status(404).json({ error: 'No Clicks Found' });
      }
    } else {
      res.status(404).json({ error: 'Not Found' });
    }
  } catch (error) {
    console.error('Error searching URL:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});










app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
