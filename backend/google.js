const axios = require('axios').default;

const gcp_api_url = 'https://vision.googleapis.com/v1/images:annotate?';
// TODO Take this API_KEY and place in env
const GCP_API_KEY = 'AIzaSyDyQN2rdDE9UUj3uIrgbfLROFuL9L--0fE';

export async function getAnnotation(imageData) {
    const response = await axios.post(gcp_api_url + 'key=' + GCP_API_KEY, {
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
    });

    const data = response.data.responses[0].webDetection;
    console.log(data);
    return data;
}
