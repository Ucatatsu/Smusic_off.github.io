/**
 * Функция воспроизведения выбранного трека.
 * Добавляет класс "active" к кликнутой карточке и обновляет источник плеера.
 * @param {HTMLElement} elem - Элемент карточки, по которому кликнули.
 * @param {string} trackSrc - Путь к аудиофайлу.
 */
function playTrack(elem, trackSrc) {
  // Убираем класс active у всех карточек
  document.querySelectorAll('.track-card.active').forEach(card => card.classList.remove('active'));
  // Добавляем класс active к нажатой карточке
  elem.classList.add('active');

  const audioPlayer = document.getElementById("audioPlayer");
  const audioSource = audioPlayer.querySelector("source");

  audioSource.src = trackSrc;
  audioPlayer.load();
  audioPlayer.play().catch(error => {
    console.error("Ошибка воспроизведения:", error);
  });
}

/**
 * Обновление положения плеера и параллакс эффекта для баннера.
 */
function updatePositions() {
  // Обновляем положение плеера так, чтобы его нижняя грань совпадала с нижней границей окна
  const player = document.querySelector('.player-container');
  const newTop = window.scrollY + window.innerHeight - player.offsetHeight;
  player.style.top = newTop + 'px';

  // Параллакс для баннера: смещаем background-position по вертикали
  const banner = document.querySelector('.banner');
  const parallaxSpeed = 0.5;
  banner.style.backgroundPosition = 'center ' + (-window.scrollY * parallaxSpeed) + 'px';
}

/**
 * Инициализация переключателя темы.
 */
document.getElementById("themeToggle").addEventListener("click", function() {
  document.body.classList.toggle("dark-theme");
  this.textContent = document.body.classList.contains("dark-theme") 
    ? "Светлая тема" 
    : "Темная тема";
});

/**
 * Используем IntersectionObserver для запуска анимации fade-in,
 * когда элементы появляются в зоне видимости.
 */
const fadeElements = document.querySelectorAll('.fade-in');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animationPlayState = 'running';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

fadeElements.forEach(el => {
  observer.observe(el);
});

// Обновление позиций плеера и баннера при загрузке, прокрутке и изменении размеров окна
document.addEventListener("DOMContentLoaded", updatePositions);
window.addEventListener("scroll", updatePositions);
window.addEventListener("resize", updatePositions);
