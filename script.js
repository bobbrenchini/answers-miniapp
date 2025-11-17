document.addEventListener("DOMContentLoaded", function() {
    let tg = window.Telegram?.WebApp;
    if(tg) tg.expand();

    const settingsBtn = document.getElementById("settingsBtn");
    const settingsDiv = document.getElementById("settings");
    const themeSelect = document.getElementById("themeSelect");
    const fileInput = document.getElementById("fileInput");
    const sendBtn = document.getElementById("send");
    const resultBlock = document.getElementById("result");

    let answersFile = "answers.xlsx"; // Автоподгрузка

    settingsBtn.addEventListener("click", () => settingsDiv.classList.toggle("hidden"));
    themeSelect.addEventListener("change", () => document.body.className = themeSelect.value);
    fileInput.addEventListener("change", (e) => { answersFile = e.target.files[0]; });

    sendBtn.addEventListener("click", async () => {
        const ege = document.getElementById("ege").value.trim();
        const tasks = document.getElementById("tasks").value.trim();
        if (!ege || !tasks) { resultBlock.textContent = "Заполните все поля"; resultBlock.classList.remove("hidden"); return; }

        if(tg){
            tg.sendData(JSON.stringify({ege, tasks, answersFile}));
        } else {
            // Обычный сайт — fetch к серверу
            try {
                const res = await fetch("/get_answers", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ege, tasks})
                });
                const data = await res.json();
                resultBlock.textContent = data.result || data.error;
                resultBlock.classList.remove("hidden");
            } catch(err){
                resultBlock.textContent = "Ошибка сервера: "+err;
                resultBlock.classList.remove("hidden");
            }
        }
    });
});
