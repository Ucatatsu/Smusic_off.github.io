function uploadFile() {
    const fileInput = document.getElementById("fileInput");
    const audioPlayer = document.getElementById("audioPlayer");

    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const fileURL = URL.createObjectURL(file);
        audioPlayer.src = fileURL;
        audioPlayer.play();
    } else {
        alert("Выберите аудиофайл для загрузки!");
    }
}
