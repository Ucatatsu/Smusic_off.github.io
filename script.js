/**
 * Функция для воспроизведения выбранного трека.
 * @param {string} trackSrc - Путь к аудиофайлу относительно корня сайта.
 */
function playTrack(trackSrc) {
  const audioPlayer = document.getElementById("audioPlayer");
  const audioSource = audioPlayer.querySelector("source");

  // Устанавливаем новый источник аудиофайла
  audioSource.src = trackSrc;
  audioPlayer.load();

  // Пытаемся воспроизвести трек
  audioPlayer.play().catch(error => {
    console.error("Ошибка воспроизведения:", error);
  });
}
