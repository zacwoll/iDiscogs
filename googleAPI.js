const axios = require('axios').default;

const url = 'https://jsonplaceholder.typicode.com/posts/1';
const post_url = 'https://jsonplaceholder.typicode.com/posts';
const gcp_api_url = 'https://vision.googleapis.com/v1/images:annotate?';
const GCP_API_KEY = 'AIzaSyDyQN2rdDE9UUj3uIrgbfLROFuL9L--0fE';

// // Make a request for a user with a given ID
// axios.get(url)
//   .then(function (response) {
//     // handle success
//     console.log(response.data);
//   })
//   .catch(function (error) {
//     // handle error
//     console.log(error);
//   })
//   .then(function () {
//     // always executed
//   });

// // Make a post request for a given user
// axios.post(post_url, {
//         title: 'foo',
//         body: 'bar',
//         userId: 1
//     })
//   .then(function (response) {
//     console.log(response);
//   })
//   .catch(function (error) {
//     console.log(error);
//   });

const fs = require('fs');

// function to encode file data to base64 encoded string
function b64req(file) {
  // read binary data
  let image = fs.readFileSync(file);
  // convert binary data to base64 encoded string
  return Buffer.from(image).toString('base64');
}

// console.log(b64req('./test.jpg'));
const imageData = b64req('./test2.jpg');

axios.post(gcp_api_url + 'key=' + GCP_API_KEY, {
    "requests":[
        {
          "image":{
            content: imageData
          },
          "features":[
            {
              "type":"WEB_DETECTION",
              "maxResults":1
            }
          ]
        }
      ]
})
  .then(function (response) {
    console.log(JSON.stringify(response.data, null, 2));
  })
  .catch(function (error) {
    console.log(error);
  });

