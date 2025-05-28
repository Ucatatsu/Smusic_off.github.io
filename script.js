document.addEventListener("DOMContentLoaded", () => {
  /* Переключатель темы */
  const themeToggleBtn = document.getElementById("themeToggle");
  themeToggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    themeToggleBtn.textContent = document.body.classList.contains("dark-theme")
      ? "Светлая тема"
      : "Темная тема";
  });

  /* Обновление положения плеера, чтобы он следовал за положением пользователя */
  function updatePlayerPosition() {
    const player = document.querySelector('.player-container');
    const newTop = window.scrollY + window.innerHeight - player.offsetHeight;
    player.style.top = newTop + 'px';
  }
  
  document.addEventListener("scroll", updatePlayerPosition);
  window.addEventListener("resize", updatePlayerPosition);
  updatePlayerPosition();

  /* IntersectionObserver для эффектов fade-in */
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
 * Обновляет источник плеера и добавляет класс active к выбранной карточке.
 * @param {HTMLElement} elem - Элемент карточки трека.
 * @param {string} trackSrc - Путь к аудиофайлу.
 */
function playTrack(elem, trackSrc) {
  document.querySelectorAll('.track-card.active')
          .forEach(card => card.classList.remove('active'));
  elem.classList.add('active');

  const audio = document.getElementById("audioPlayer");
  audio.src = trackSrc;
  audio.load();
  audio.play().catch(error => {
    console.error("Ошибка воспроизведения:", error);
  });
}
