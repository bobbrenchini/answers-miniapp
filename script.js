let tg = window.Telegram.WebApp;
tg.expand();

const settingsBtn = document.getElementById("settingsBtn");
const settingsDiv = document.getElementById("settings");
const themeSelect = document.getElementById("themeSelect");
const fileInput = document.getElementById("fileInput");
let answersFile = null; // ссылка на файл Excel

// Показ/скрытие настроек
settingsBtn.onclick = () => settingsDiv.classList.toggle("hidden");

// Смена темы
themeSelect.onchange = () => {
    document.body.className = themeSelect.value;
};

// Автоподгрузка файла (по умолчанию)
answersFile = "answers.xlsx"; // на сервере PythonAnywhere рядом с bot.py

// Пользователь может выбрать файл вручную
fileInput.onchange = (e) => {
    answersFile = e.target.files[0]; // локальный файл
};

document.getElementById("send").onclick = () => {
    let ege = document.getElementById("ege").value.trim();
    let tasks = document.getElementById("tasks").value.trim();

    if (!ege || !tasks) {
        showResult("Пожалуйста, заполните все поля.");
        return;
    }

    // Отправляем данные боту
    tg.sendData(JSON.stringify({
        ege: ege,
        tasks: tasks,
        answersFile: answersFile // путь или объект файла
    }));
};

function showResult(text) {
    const block = document.getElementById("result");
    block.classList.remove("hidden");
    block.textContent = text;
}
