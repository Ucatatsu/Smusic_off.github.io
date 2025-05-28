/**
 * Функция для воспроизведения выбранного трека.
 * @param {string} trackSrc - Путь к аудиофайлу.
 */
function playTrack(trackSrc) {
  const audioPlayer = document.getElementById("audioPlayer");
  const audioSource = audioPlayer.querySelector("source");

  audioSource.src = trackSrc;
  audioPlayer.load();
  audioPlayer.play().catch(error => {
    console.error("Ошибка воспроизведения:", error);
  });
}

/**
 * Функция обновления положения плеера так, чтобы он всегда располагался
 * на расстоянии от верхней границы документа, равном (прокрутка + высота окна - высота плеера).
 */
function updatePlayerPosition() {
  const player = document.querySelector('.player-container');
  // Вычисляем новое значение top
  const newTop = window.scrollY + window.innerHeight - player.offsetHeight;
  player.style.top = newTop + "px";
}

// Обновляем положение плеера при загрузке страницы, изменении размеров и прокрутке
document.addEventListener("DOMContentLoaded", updatePlayerPosition);
window.addEventListener("scroll", updatePlayerPosition);
window.addEventListener("resize", updatePlayerPosition);
