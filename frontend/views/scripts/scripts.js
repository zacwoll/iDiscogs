const input = document.getElementById("file_upload");
const display = document.getElementById("file_display");
const annotation_header = document.getElementById('annotation_header');

const form = document.getElementById('form-container');
const inputs = form.getElementsByTagName('input');


/** convertBase64
 * Converts data from uploaded file to base64 to send to Google
 */
const convertBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);

        fileReader.onload = () => {
            resolve(fileReader.result);
        };

        fileReader.onerror = (error) => {
            reject(error);
        };
    });
};

/* getAnnotations
 * Gets Annotations from Google
 */
const getAnnotations = async (fileData) => {
    const request = {
        method: 'POST',
        url: '/requestAnnotation',
        data: {
            data: fileData
        },
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }
    const {data} = await axios(request);
    return data;
}

/* getDiscogsResults
 * Gets paginated results from discogs
 */
const getDiscogsResults = async (query) => {
    const request = {
        method: 'POST',
        url: '/search',
        data: { query },
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }
    const {data} = await axios(request);
    return data;
}

const uploadImage = async (event) => {
    // get the file
    const file = event.target.files[0];
    // convert the file to Base64
    const base64 = await convertBase64(file);
    // Set display to the picture
    display.src = base64;
    // Turn display on
    display.style.display = 'block';
    // Get Annotation Data
    const data = await getAnnotations(base64);
    const bestGuess = data.annotation.bestGuessLabels[0].label;
    console.log(data.annotation.bestGuessLabels);

    // Change What Google Says
    annotation_header.innerText = bestGuess;
    search_box.value = bestGuess;
    console.log(getDiscogsResults(createQuery()));

    // Place query in the form
};

const createQuery = () => {
    let query = {};
    Array.from(inputs).forEach((i) => {
        query[i.name] = i.value;
    });
    console.log(query);
    return JSON.stringify(query);
}

const clearForm = () => {
    Array.from(inputs).forEach((i) => {
        i.value = '';
    });
}

input.addEventListener("change", (e) => {
    uploadImage(e);
});