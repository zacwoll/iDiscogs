const axios = require('axios').default;

const url = 'https://jsonplaceholder.typicode.com/posts/1';
const post_url = 'https://jsonplaceholder.typicode.com/posts';
const gcp_api_url = 'https://vision.googleapis.com/v1/images:annotate?';
const GCP_API_KEY = 'AIzaSyDyQN2rdDE9UUj3uIrgbfLROFuL9L--0fE';

const fs = require('fs');

// function to encode file data to base64 encoded string
function b64req(file) {
  // read binary data
  let image = fs.readFileSync(file);
  // convert binary data to base64 encoded string
  return Buffer.from(image).toString('base64');
}

// console.log(b64req('./test.jpg'));
const imageData = b64req('test/test.jpg');
console.log(imageData.substring(0, 10));

// const gcp_api_url = 'https://vision.googleapis.com/v1/images:annotate?';
// const GCP_API_KEY = 'AIzaSyDyQN2rdDE9UUj3uIrgbfLROFuL9L--0fE';

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

