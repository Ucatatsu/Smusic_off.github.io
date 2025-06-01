// Объект с допустимыми логинами и паролями.
// Для добавления пользователей просто укажите соответствующие пары: ник: пароль.
const credentials = {
  UTT: 'zeroUTT',    // Ваш ник и пароль
  Unknown2013: 'k3T273j'  // Ник и пароль вашего друга
};

function getDefaultTracks() {
  // Если admin.html находится в /admin, а папка covers – в корне:
  return [
    { name: 'track1.mp3', cover: '../covers/track1.jpg', source: 'default' },
    { name: 'track2.mp3', cover: '../covers/track2.jpg', source: 'default' }
  ];
}


// Глобальный массив для хранения треков
let tracks = [];

// Загрузка треков из localStorage или установка дефолтных
function loadTracksFromStorage() {
  const stored = localStorage.getItem('tracks');
  if (stored) {
    try {
      tracks = JSON.parse(stored);
    } catch (e) {
      tracks = getDefaultTracks();
    }
  } else {
    tracks = getDefaultTracks();
  }
}

// Сохранение треков в localStorage
function saveTracksToStorage() {
  localStorage.setItem('tracks', JSON.stringify(tracks));
}

// Переменные для выбранных файлов при загрузке
let selectedAudio = null;
let selectedCover = null;

document.addEventListener('DOMContentLoaded', () => {
  // Применяем сохранённую тему
  const storedTheme = localStorage.getItem('theme');
  if (storedTheme && storedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    document.getElementById('themeToggle').textContent = 'Светлая тема';
  } else {
    document.getElementById('themeToggle').textContent = 'Темная тема';
  }
  
  // Переключение темы с обновлением текста кнопки
  const themeToggleBtn = document.getElementById('themeToggle');
  themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    const newTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    themeToggleBtn.textContent = newTheme === 'dark' ? 'Светлая тема' : 'Темная тема';
  });
  
  // Загружаем треки из localStorage
  loadTracksFromStorage();
  
  // Если пользователь уже авторизован, сразу показываем админ-панель
  if (localStorage.getItem('authorized') === 'true') {
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('adminPanel').classList.remove('hidden');
    document.getElementById('logoutBtn').classList.remove('hidden');
    loadTracks();
  }
  
  // Обработчик входа – используется объект credentials
  const loginBtn = document.getElementById('loginBtn');
  loginBtn.addEventListener('click', () => {
    // Предполагается, что HTML содержит поле ввода для ника с id="adminNickname"
    const nickname = document.getElementById('adminNickname').value.trim();
    const password = document.getElementById('adminPassword').value;
    const loginError = document.getElementById('loginError');
    
    // Проверяем, что поля не пустые
    if (!nickname || !password) {
      loginError.textContent = 'Пожалуйста, введите ник и пароль.';
      return;
    }
    
    // Если учетные данные найдены и совпадают
    if (credentials[nickname] && credentials[nickname] === password) {
      localStorage.setItem('authorized', 'true');
      document.getElementById('loginSection').classList.add('hidden');
      document.getElementById('adminPanel').classList.remove('hidden');
      document.getElementById('logoutBtn').classList.remove('hidden');
      loadTracks();
    } else {
      loginError.textContent = 'Неверный ник или пароль!';
    }
  });
  
  // Обработчик кнопки "Выйти"
  const logoutBtn = document.getElementById('logoutBtn');
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('authorized');
    window.location.reload();
  });
  
  // Назначаем обработчики для пустой карточки "Добавить трек"
  assignEmptyCardHandlers();
});

// Функция отображения треков
function loadTracks() {
  const container = document.getElementById('tracksContainer');
  container.innerHTML = '';
  
  tracks.forEach((track, index) => {
    const card = document.createElement('div');
    card.classList.add('track-card');
    card.innerHTML = `
      <img src="${track.cover}" alt="Обложка для ${track.name}">
      <div class="track-details">
        <h3>${track.name}</h3>
        <p>Источник: ${track.source}</p>
        <button onclick="deleteTrack(${index})">Удалить</button>
      </div>
    `;
    container.appendChild(card);
  });
  
  // Добавляем пустую карточку для загрузки нового трека
  const emptyCard = document.createElement('div');
  emptyCard.classList.add('track-card', 'empty-card');
  emptyCard.innerHTML = `
    <div class="plus" id="uploadCoverPlus" title="Загрузить обложку">+</div>
    <hr class="divider">
    <div class="plus" id="uploadAudioPlus" title="Загрузить аудио">+</div>
  `;
  container.appendChild(emptyCard);
  
  assignEmptyCardHandlers();
}

// Функция назначения обработчиков для пустой карточки
function assignEmptyCardHandlers() {
  const coverPlus = document.getElementById('uploadCoverPlus');
  const audioPlus = document.getElementById('uploadAudioPlus');
  
  if (coverPlus) {
    coverPlus.addEventListener('click', () => {
      document.getElementById('coverFile').click();
    });
  }
  if (audioPlus) {
    audioPlus.addEventListener('click', () => {
      document.getElementById('audioFile').click();
    });
  }
}

// Обработчики выбора файлов
document.getElementById('audioFile').addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    selectedAudio = e.target.files[0];
    tryUploadIfReady();
  }
});

document.getElementById('coverFile').addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    selectedCover = e.target.files[0];
    tryUploadIfReady();
  }
});

// Если оба файла выбраны, запускаем загрузку
function tryUploadIfReady() {
  if (selectedAudio && selectedCover) {
    uploadTrack();
  }
}

// Имитация загрузки нового трека
function uploadTrack() {
  const progressContainer = document.getElementById('progressContainer');
  const progressBar = document.getElementById('progressBar');
  progressContainer.classList.remove('hidden');
  
  let progress = 0;
  const interval = setInterval(() => {
    progress += 10;
    progressBar.style.width = progress + '%';
    if (progress >= 100) {
      clearInterval(interval);
      progressContainer.classList.add('hidden');
      
      const nextIndex = tracks.length + 1;
      const newTrack = {
        name: `track${nextIndex}.mp3`,
        cover: `covers/track${nextIndex}.jpg`,
        source: 'user upload'
      };
      tracks.push(newTrack);
      saveTracksToStorage();
      
      document.getElementById('audioFile').value = "";
      document.getElementById('coverFile').value = "";
      selectedAudio = null;
      selectedCover = null;
      
      loadTracks();
    }
  }, 200);
}

// Симуляция удаления трека
function deleteTrack(index) {
  if (confirm(`Удалить ${tracks[index].name}?`)) {
    tracks.splice(index, 1);
    saveTracksToStorage();
    loadTracks();
  }
}
