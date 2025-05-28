document.addEventListener("DOMContentLoaded", () => {
  /* Переключатель темы */
  const themeToggleBtn = document.getElementById("themeToggle");
  themeToggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    themeToggleBtn.textContent = document.body.classList.contains("dark-theme")
      ? "Светлая тема"
      : "Темная тема";
  });

  /* Плеер в профиле кастомного интерфейса */
  const audio = document.getElementById("audioPlayer");
  const playPauseBtn = document.getElementById("playPauseBtn");
  const progressContainer = document.querySelector(".progress-container");
  const progress = document.querySelector(".progress");
  const currentTimeEl = document.querySelector(".current-time");
  const durationEl = document.querySelector(".duration");

  // Функция форматирования времени (м:с)
  function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  }

  // Переключение воспроизведения
  function togglePlayPause() {
    if (audio.paused) {
      audio.play();
      playPauseBtn.textContent = 'Pause';
    } else {
      audio.pause();
      playPauseBtn.textContent = 'Play';
    }
  }

  playPauseBtn.addEventListener("click", togglePlayPause);

  // Обновление индикатора времени и прогресса
  audio.addEventListener("timeupdate", () => {
    const { duration, currentTime } = audio;
    const progressPercent = (currentTime / duration) * 100;
    progress.style.width = progressPercent + '%';
    currentTimeEl.textContent = formatTime(currentTime);
    durationEl.textContent = isNaN(duration) ? '0:00' : formatTime(duration);
  });

  // Установка текущего времени при клике по прогресс-бару
  progressContainer.addEventListener("click", (e) => {
    const width = progressContainer.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;
    audio.currentTime = (clickX / width) * duration;
  });

  // Обновляем позицию плеера, чтобы он "следовал" за положением пользователя
  function updatePlayerPosition() {
    const player = document.querySelector('.player-container');
    const newTop = window.scrollY + window.innerHeight - player.offsetHeight;
    player.style.top = newTop + 'px';
  }
  document.addEventListener("scroll", updatePlayerPosition);
  window.addEventListener("resize", updatePlayerPosition);
  updatePlayerPosition();

  /* --- IntersectionObserver для эффекта fade-in (как ранее) --- */
  const fadeElements = document.querySelectorAll('.fade-in');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  fadeElements.forEach(el => observer.observe(el));
});

/**
 * Функция, вызываемая при клике на карточку трека.
 * Обновляет источник плеера, добавляет класс active к выбранной карточке и запускает воспроизведение.
 * @param {HTMLElement} elem - Кликнутая карточка трека.
 * @param {string} trackSrc - Путь к аудиофайлу.
 */
function playTrack(elem, trackSrc) {
  document.querySelectorAll('.track-card.active').forEach(card => card.classList.remove('active'));
  elem.classList.add('active');

  const audio = document.getElementById("audioPlayer");
  audio.src = trackSrc;
  audio.load();
  audio.play().catch(error => {
    console.error("Ошибка воспроизведения:", error);
  });

  // Обновляем кнопку плеера, если текущий трек был изменен
  const playPauseBtn = document.getElementById("playPauseBtn");
  playPauseBtn.textContent = "Pause";
}
