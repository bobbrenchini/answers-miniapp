let tg = window.Telegram.WebApp;
tg.expand();

const settingsBtn = document.getElementById("settingsBtn");
const settingsDiv = document.getElementById("settings");
const themeSelect = document.getElementById("themeSelect");
const fileInput = document.getElementById("fileInput");
const sendBtn = document.getElementById("send");
const resultBlock = document.getElementById("result");

let answersFile = null; // Автоподгрузка

// Показ/скрытие настроек
settingsBtn.onclick = () => settingsDiv.classList.toggle("hidden");

// Смена темы
themeSelect.onchange = () => {
    document.body.className = themeSelect.value;
};

// Автоподгрузка файла
answersFile = "answers.xlsx"; // На сервере рядом с bot.py

// Пользователь может выбрать файл вручную
fileInput.onchange = (e) => {
    answersFile = e.target.files[0]; // Локальный файл
};

// Отправка данных в Telegram Bot
sendBtn.onclick = () => {
    const ege = document.getElementById("ege").value.trim();
    const tasks = document.getElementById("tasks").value.trim();

    if (!ege || !tasks) {
        showResult("Пожалуйста, заполните все поля.");
        return;
    }

    tg.sendData(JSON.stringify({
        ege: ege,
        tasks: tasks,
        answersFile: answersFile
    }));
};

function showResult(text) {
    resultBlock.classList.remove("hidden");
    resultBlock.textContent = text;
}
