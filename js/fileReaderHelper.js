fileReaderHelper =
{
    readFileAsText: async function (file) {
        return new Promise((resolve, reject) => {
            var fr = new FileReader();
            fr.onload = () => {
                resolve(fr.result)
            };
            fr.onerror = reject;
            fr.readAsText(file);
        });
    }
    ,
    readFileAsArrayBuffer: async function (file) {
        return new Promise((resolve, reject) => {
            var fr = new FileReader();
            fr.onload = () => {
                resolve(fr.result)
            };
            fr.onerror = reject;
            fr.readAsArrayBuffer(file);
        });
    }
    ,
    readFileAsDataURL: async function (file) {
        return new Promise((resolve, reject) => {
            var fr = new FileReader();
            fr.onload = () => {
                resolve(fr.result)
            };
            fr.onerror = reject;
            fr.readAsDataURL(file);
        });
    }
}

