document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const themeToggleBtn = document.getElementById("themeToggle");
  const audio = document.getElementById("audioPlayer"); // Может отсутствовать на некоторых страницах

  // Применение сохранённой темы (если есть)
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    body.classList.add("dark-theme");
    themeToggleBtn.textContent = "Светлая тема";
  } else {
    themeToggleBtn.textContent = "Темная тема";
  }

  // Переключатель темы с сохранением выбранного режима в localStorage
  themeToggleBtn.addEventListener("click", () => {
    body.classList.toggle("dark-theme");
    const isDark = body.classList.contains("dark-theme");
    themeToggleBtn.textContent = isDark ? "Светлая тема" : "Темная тема";
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });

  // Если аудиоплеер присутствует, то применяем сохранённый уровень громкости и позицию воспроизведения
  if (audio) {
    // Применение сохранённого уровня громкости
    const savedVolume = localStorage.getItem("volume");
    if (savedVolume !== null) {
      audio.volume = parseFloat(savedVolume);
    }
    audio.addEventListener("volumechange", () => {
      localStorage.setItem("volume", audio.volume);
    });

    // Сохранение позиции воспроизведения трека
    audio.addEventListener("timeupdate", () => {
      if (audio.src) {
        localStorage.setItem("progress_" + audio.src, audio.currentTime);
      }
    });
  }

  // Функция обновления положения плеера (если он присутствует)
  function updatePlayerPosition() {
    const player = document.querySelector('.player-container');
    if (!player) return; // Если плеер отсутствует, просто выходим
    const newTop = window.scrollY + window.innerHeight - player.offsetHeight;
    player.style.top = newTop + 'px';
  }
  
  document.addEventListener("scroll", updatePlayerPosition);
  window.addEventListener("resize", updatePlayerPosition);
  updatePlayerPosition();

  // IntersectionObserver для эффектов плавного появления (fade-in)
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
 * Если аудиоплеер присутствует, обновляет его источник, устанавливает сохранённую позицию (если она сохранена)
 * и устанавливает активное состояние для выбранной карточки.
 * @param {HTMLElement} elem - Элемент карточки трека.
 * @param {string} trackSrc - Путь к аудиофайлу.
 */
function playTrack(elem, trackSrc) {
  // Если аудиоплеер отсутствует, прекращаем выполнение функции
  const audio = document.getElementById("audioPlayer");
  if (!audio) return;

  document.querySelectorAll('.track-card.active')
          .forEach(card => card.classList.remove('active'));
  elem.classList.add('active');

  audio.src = trackSrc;
  audio.load();

  // Если для данного трека ранее сохранена позиция, устанавливаем её
  const savedProgress = localStorage.getItem("progress_" + trackSrc);
  if (savedProgress !== null) {
    audio.currentTime = Number(savedProgress);
  }

  audio.play().catch(error => {
    console.error("Ошибка воспроизведения:", error);
  });
}
