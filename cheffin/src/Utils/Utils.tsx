export function getImgSrc(img: string): string {
    // const base64String = img.split(',')[1];
    // console.log(base64String);
    const byteCharacters = atob(img);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob  = new Blob([byteArray], { type: 'image/jpeg' });
    return URL.createObjectURL(blob);
}