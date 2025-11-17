let tg = window.Telegram.WebApp;
tg.expand();

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
        tasks: tasks
    }));
};

function showResult(text) {
    let block = document.getElementById("result");
    block.classList.remove("hidden");
    block.textContent = text;
}
