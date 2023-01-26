const input = document.getElementById("file_upload");
const display = document.getElementById("file_display");

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
    const data = await axios(request);
    return data;
}

const uploadImage = async (event) => {
    const file = event.target.files[0];
    const base64 = await convertBase64(file);
    display.src = base64;
    const annotation = await getAnnotations(base64);
    console.log(annotation);
};



input.addEventListener("change", (e) => {
    uploadImage(e);
});