const input = document.getElementById("file_upload");
const display = document.getElementById("file_display");
const annotation_header = document.getElementById('annotation_header');

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
    console.log(data.annotation.bestGuessLabels);

    annotation_header.innerText = data.annotation.bestGuessLabels[0].label;
};



input.addEventListener("change", (e) => {
    uploadImage(e);
});