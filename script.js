document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const themeToggleBtn = document.getElementById("themeToggle");
  const audio = document.getElementById("audioPlayer"); // Может отсутствовать на некоторых страницах
  const header = document.querySelector('header');
  const playerContainer = document.querySelector('.player-container');

  // Применяем сохранённую тему
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    body.classList.add("dark-theme");
    themeToggleBtn.textContent = "Светлая тема";
  } else {
    themeToggleBtn.textContent = "Темная тема";
  }

  // Переключатель темы
  themeToggleBtn.addEventListener("click", () => {
    body.classList.toggle("dark-theme");
    const isDark = body.classList.contains("dark-theme");
    themeToggleBtn.textContent = isDark ? "Светлая тема" : "Темная тема";
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });

  // Настройки аудиоплеера
  if (audio) {
    const savedVolume = localStorage.getItem("volume");
    if (savedVolume !== null) {
      audio.volume = parseFloat(savedVolume);
    }
    audio.addEventListener("volumechange", () => {
      localStorage.setItem("volume", audio.volume);
    });
    audio.addEventListener("timeupdate", () => {
      if (audio.src) {
        localStorage.setItem("progress_" + audio.src, audio.currentTime);
      }
    });
  }

  /* --- Анимация появления карточек через IntersectionObserver --- */
  const trackCards = document.querySelectorAll('.track-card');
  const cardObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('appear');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  
  trackCards.forEach(card => {
    cardObserver.observe(card);
  });
  
  /* --- Эффект следования карточки за курсором --- */
  trackCards.forEach(card => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const maxTilt = 15;
      const tiltX = -((y - centerY) / centerY) * maxTilt;
      const tiltY = ((x - centerX) / centerX) * maxTilt;
      card.style.transform = `perspective(1000px) scale(1.05) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(1000px) scale(1) rotateX(0deg) rotateY(0deg)";
    });
  });
  
  /* --- Баннер: изначально занимает 50vh, а при скролле – стандартная высота --- */
  const banner = document.querySelector('.banner');
  if (banner) {
    banner.classList.add('fullscreen');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        banner.classList.remove('fullscreen');
      } else {
        banner.classList.add('fullscreen');
      }
    }, { passive: true });
  }
  
  /* --- Верхняя панель (header) --- */
  function updateTopBar() {
    if (window.scrollY < 50) {
      header.classList.add("header-initial");
      header.classList.remove("header-scrolled");
    } else {
      header.classList.remove("header-initial");
      header.classList.add("header-scrolled");
    }
  }
  updateTopBar();
  window.addEventListener('scroll', updateTopBar, { passive: true });
  
  /* --- Актуализация состояния плеера (аналогично header) --- */
  function updatePlayer() {
    if (window.scrollY < 50) {
      playerContainer.classList.remove("player-scrolled");
    } else {
      playerContainer.classList.add("player-scrolled");
    }
  }
  updatePlayer();
  window.addEventListener('scroll', updatePlayer, { passive: true });
});

/**
 * Функция воспроизведения трека по клику на карточку.
 * Обновляет источник аудио, устанавливает сохранённую позицию и отмечает активную карточку.
 * @param {HTMLElement} elem - Карточка трека.
 * @param {string} trackSrc - Путь к аудиофайлу.
 */
function playTrack(elem, trackSrc) {
  const audio = document.getElementById("audioPlayer");
  if (!audio) return;
  document.querySelectorAll('.track-card.active').forEach(card => card.classList.remove('active'));
  elem.classList.add('active');
  audio.src = trackSrc;
  audio.load();
  const savedProgress = localStorage.getItem("progress_" + trackSrc);
  if (savedProgress !== null) {
    audio.currentTime = Number(savedProgress);
  }
  audio.play().catch(error => {
    console.error("Ошибка воспроизведения:", error);
  });
}
