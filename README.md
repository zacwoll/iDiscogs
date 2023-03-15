# iDiscogs

iDiscogs is a web application that allows users to search for albums on Discogs.com using image recognition technology. The app is built with Node.js and uses the Express.js framework to handle HTTP requests and responses. The front-end is designed using Pug templates and styled with CSS.
 
Welcome to iDiscogs, a web application that makes it easy to search for albums using just a picture! With iDiscogs, you can snap a photo of an album cover and let our image recognition technology do the rest. Our app will then use the Discogs API to provide you with a list of search results that best match the album in your photo.

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [Technologies Used](#technologies-used)

## Installation
1. Clone the repository: `git clone https://github.com/zacwoll/iDiscogs.git`
2. Navigate to the project directory: `cd iDiscogs`
3. Install the required packages: `npm install`

## Usage
1. Start the server: `npm start`
2. Open your web browser and navigate to `http://localhost:3000`
3. Upload an image of an album cover and click the "Search" button
4. The app will use Google Vision API to recognize the album cover and send a search query to Discogs.com. 
5. The search results will be displayed on the screen.

## Technologies Used
- Node.js
- Express.js
- Pug templates
- CSS
- Google Vision API
- Discogs API

    This project was inspired by the desire to make searching for albums more accessible and convenient.
    Thanks to the Discogs API for providing access to a vast collection of albums.