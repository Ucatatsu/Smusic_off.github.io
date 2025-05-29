document.addEventListener("DOMContentLoaded", function() {
  // Инициализация плеера с использованием Yandex Audio‑JS
  var myPlayer = new ya.music.Audio("html5", null);

  myPlayer.initPromise().then(function() {
    console.log("Аудио-плеер готов");
    // Устанавливаем аудиоисточник (путь можно менять при выборе трека)
    myPlayer.setSrc("music/track1.mp3");
    updateTotalTime();
  }, function() {
    console.error("Ошибка инициализации плеера");
  });

  // Элементы управления плеером
  var playPauseBtn = document.getElementById("playPauseBtn");
  var prevBtn = document.getElementById("prevBtn");
  var nextBtn = document.getElementById("nextBtn");
  var progressContainer = document.querySelector(".progress-container");
  var progressFill = document.querySelector(".progress-fill");
  var currentTimeDisplay = document.getElementById("currentTime");
  var totalTimeDisplay = document.getElementById("totalTime");
  var muteBtn = document.getElementById("muteBtn");
  var volumeSlider = document.getElementById("volumeSlider");

  // Функция для форматирования времени (секунды в mm:ss)
  function formatTime(seconds) {
    var minutes = Math.floor(seconds / 60);
    var secs = Math.floor(seconds % 60);
    return minutes + ":" + (secs < 10 ? '0' + secs : secs);
  }

  // Функция обновления отображения общей длительности трека
  function updateTotalTime() {
    var duration = myPlayer.getDuration();
    totalTimeDisplay.textContent = formatTime(duration);
    // Обновляем максимальное значение прогресс-бара
    // Здесь можно задать значение в секундах
  }

  // Функция обновления текущего времени трека и положения прогресса
  function updateCurrentTime() {
    var currentTime = myPlayer.getPosition();
    currentTimeDisplay.textContent = formatTime(currentTime);
    var percent = (currentTime / myPlayer.getDuration()) * 100;
    progressFill.style.width = percent + "%";
  }

  // Обработка нажатия кнопки Play/Pause
  playPauseBtn.addEventListener("click", function() {
    if (myPlayer.isPlaying()) {
      myPlayer.pause();
      playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    } else {
      myPlayer.play();
      playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }
  });

  // Периодическое обновление текущего времени (каждые 500 мс)
  setInterval(function() {
    if (myPlayer.isPlaying()) {
      updateCurrentTime();
    }
  }, 500);

  // Обработка клика по прогресс-бару для перемотки
  progressContainer.addEventListener("click", function(e) {
    var rect = progressContainer.getBoundingClientRect();
    var offsetX = e.clientX - rect.left;
    var percent = offsetX / rect.width;
    var seekTime = percent * myPlayer.getDuration();
    myPlayer.setPosition(seekTime);
    updateCurrentTime();
  });

  // Обработка кнопки Mute/Unmute
  muteBtn.addEventListener("click", function() {
    var isMuted = myPlayer.isMuted();
    myPlayer.setMuted(!isMuted);
    muteBtn.innerHTML = isMuted 
      ? '<i class="fas fa-volume-up"></i>' 
      : '<i class="fas fa-volume-mute"></i>';
  });

  // Обработка изменения громкости с помощью ползунка
  volumeSlider.addEventListener("input", function() {
    var vol = volumeSlider.value / 100; // переводим из диапазона 0-100 в 0-1
    myPlayer.setVolume(vol);
  });

  // Заглушки для кнопок предыдущего и следующего трека
  prevBtn.addEventListener("click", function() {
    console.log("Предыдущий трек");
    // Реализуйте переключение на предыдущий трек здесь
  });

  nextBtn.addEventListener("click", function() {
    console.log("Следующий трек");
    // Реализуйте переключение на следующий трек здесь
  });

  // Дополнительные кнопки shuffle и repeat можно подключить аналогичным образом
});
