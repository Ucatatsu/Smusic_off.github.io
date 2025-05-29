// === Переключение темы с сохранением выбора в localStorage ===
document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const themeToggle = document.getElementById("themeToggle");
  
  // Проверяем сохранённую тему
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    body.classList.add("dark-theme");
    themeToggle.textContent = "Светлая тема";
  } else {
    themeToggle.textContent = "Темная тема";
  }
  
  themeToggle.addEventListener("click", function () {
    body.classList.toggle("dark-theme");
    const isDark = body.classList.contains("dark-theme");
    themeToggle.textContent = isDark ? "Светлая тема" : "Темная тема";
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
});

// === Конфигурация GitHub и защитного пароля ===
const OWNER = "Ucatatsu";       // Ваш GitHub-аккаунт
const REPO = "Smusic_off.github.io";  // Имя вашего репозитория
const BRANCH = "main";          // Обычно "main" или "master"
const TOKEN = "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"; // Ваш персональный токен
const expectedPassword = "zeroUTT"; // Пароль для входа

// === Функция для определения следующего номера трека ===
async function fetchNextTrackNumber() {
  try {
    const response = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/tracks`, {
      headers: { Authorization: `token ${TOKEN}` }
    });
    if (!response.ok) {
      console.warn("Не удалось получить список треков – используется номер 1.");
      return 1;
    }
    const files = await response.json();
    // Фильтруем файлы с расширением .mp3
    const mp3Files = files.filter(file => file.name.endsWith(".mp3"));
    return mp3Files.length + 1;
  } catch (error) {
    console.error("Ошибка при получении списка треков:", error);
    return 1;
  }
}

// === Простейшая клиентская защита (проверка пароля) и автозаполнение имён файлов ===
document.getElementById("login-button").addEventListener("click", function () {
  const password = document.getElementById("admin-password").value;
  const loginStatus = document.getElementById("login-status");
  if (password === expectedPassword) {
    document.getElementById("login-container").style.display = "none";
    document.getElementById("admin-content").style.display = "block";
    // При успешном входе заполняем имена файлов
    fetchNextTrackNumber().then(nextNumber => {
      document.getElementById("filenameInput").value = `track${nextNumber}.mp3`;
      document.getElementById("coverFilenameInput").value = `track${nextNumber}.jpg`;
    });
    // Загружаем список уже имеющихся треков
    loadUploadedTracks();
  } else {
    loginStatus.textContent = "Неверный пароль. Попробуйте ещё раз.";
  }
});

// === Функция для чтения файла в Base64 ===
function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function () {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = function (error) {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
}

// === Прогресс-трекеры для аудио и обложки ===
let progressAudio = 0;
let progressCover = 0;
function updateOverallProgress() {
  const overall = (progressAudio + progressCover) / 2;
  document.getElementById("progress-bar").style.width = overall + "%";
}

// === Функция для загрузки файла через XMLHttpRequest с отслеживанием прогресса ===
async function uploadFileWithProgress(path, message, content, progressCallback) {
  // Сначала пытаемся получить существующий SHA (если файл уже есть)
  let sha = null;
  try {
    const checkResponse = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`, {
      headers: { Authorization: `token ${TOKEN}` }
    });
    if (checkResponse.ok) {
      const data = await checkResponse.json();
      sha = data.sha;
    }
  } catch (err) {
    console.warn("Файл отсутствует, создаём новый...", err);
  }
  
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`;
    xhr.open("PUT", url);
    xhr.setRequestHeader("Authorization", `token ${TOKEN}`);
    xhr.setRequestHeader("Content-Type", "application/json");
    
    xhr.upload.onprogress = function(event) {
      if (event.lengthComputable) {
        progressCallback(event.loaded / event.total * 100);
      }
    };
    
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error("Ошибка при загрузке файла " + path + ": " + xhr.status));
        }
      }
    };
    
    const body = JSON.stringify({
      message,
      content,
      branch: BRANCH,
      sha: sha
    });
    xhr.send(body);
  });
}

// === Обработка отправки формы (загрузка аудио и обложки) ===
document.getElementById("uploadForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const audioFile = document.getElementById("fileInput").files[0];
  const audioFilename = document.getElementById("filenameInput").value.trim();
  const coverFile = document.getElementById("coverInput").files[0];
  const coverFilename = document.getElementById("coverFilenameInput").value.trim();
  const statusElement = document.getElementById("status");
  const progressContainer = document.getElementById("progress-container");
  
  if (!audioFile || !audioFilename || !coverFile || !coverFilename) {
    statusElement.textContent = "Выберите все необходимые файлы и заполните все поля!";
    return;
  }
  
  // Показываем прогресс-бар
  progressContainer.style.display = "block";
  progressAudio = 0;
  progressCover = 0;
  updateOverallProgress();

  try {
    const audioBase64 = await readFileAsBase64(audioFile);
    const coverBase64 = await readFileAsBase64(coverFile);

    // Загружаем аудио с отслеживанием прогресса
    const audioResponse = uploadFileWithProgress(
      `tracks/${audioFilename}`,
      `Добавление/обновление аудио трека: ${audioFilename}`,
      audioBase64,
      (prog) => { progressAudio = prog; updateOverallProgress(); }
    );
    
    // Загружаем обложку с отслеживанием прогресса
    const coverResponse = uploadFileWithProgress(
      `tracks/${coverFilename}`,
      `Добавление/обновление обложки для ${audioFilename}`,
      coverBase64,
      (prog) => { progressCover = prog; updateOverallProgress(); }
    );
    
    // Ожидаем обе загрузки
    const [audioRes, coverRes] = await Promise.all([audioResponse, coverResponse]);
    
    if (audioRes && coverRes) {
      statusElement.textContent = "✅ Аудио и обложка успешно загружены!";
      // Сброс прогресс-бара через пару секунд
      setTimeout(() => { progressContainer.style.display = "none"; document.getElementById("progress-bar").style.width = "0%"; }, 1500);
      // Обновляем список загруженных треков
      loadUploadedTracks();
    } else {
      statusElement.textContent = "❌ Ошибка загрузки!";
    }
  } catch (error) {
    console.error(error);
    statusElement.textContent = `❌ Ошибка: ${error.message}`;
  }
});

// === Панель загруженных треков: загрузка списка и удаление файлов ===
async function loadUploadedTracks() {
  const container = document.getElementById("uploadedTracks");
  container.innerHTML = "Загрузка списка треков...";

  try {
    const response = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/tracks`, {
      headers: { Authorization: `token ${TOKEN}` }
    });
    if (!response.ok) {
      container.innerHTML = "Не удалось загрузить треки.";
      return;
    }
    const files = await response.json();
    // Фильтруем только аудио-файлы (.mp3)
    const tracks = files.filter(file => file.name.endsWith(".mp3"));
    if (tracks.length === 0) {
      container.innerHTML = "Треков нет.";
      return;
    }
    container.innerHTML = "";
    tracks.forEach(track => {
      const trackElem = document.createElement("div");
      trackElem.classList.add("uploaded-track");
      trackElem.innerHTML = `<span>${track.name}</span> <button onclick="deleteTrack('${track.path}', '${track.sha}')">Удалить</button>`;
      container.appendChild(trackElem);
    });
  } catch (error) {
    console.error(error);
    container.innerHTML = "Ошибка при загрузке списка.";
  }
}

// Функция для удаления файла через GitHub API
async function deleteTrack(path, sha) {
  if (!confirm("Вы действительно хотите удалить этот трек?")) return;
  try {
    const response = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`, {
      method: "DELETE",
      headers: {
        Authorization: `token ${TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: `Удаление файла ${path}`,
        sha: sha,
        branch: BRANCH
      })
    });
    if (response.ok) {
      alert("Файл удалён.");
      loadUploadedTracks();
    } else {
      alert("Ошибка удаления файла.");
    }
  } catch (error) {
    console.error(error);
    alert("Ошибка: " + error.message);
  }
}
