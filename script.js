document.addEventListener('DOMContentLoaded', () => {
    const inputEGE = document.getElementById('egeNumbers');
    const inputTasks = document.getElementById('taskNumbers');
    const showBtn = document.getElementById('showAnswers');
    const fileInput = document.getElementById('fileInput');
    const output = document.getElementById('output');
    let answersFile = null;

    // Функция проверки файла
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const ext = file.name.split('.').pop().toLowerCase();
        if (ext !== 'xls' && ext !== 'xlsx') {
            alert('Пожалуйста, выберите файл формата xls или xlsx!');
            return;
        }

        // Файл принят, скрываем поле
        fileInput.style.display = 'none';
        answersFile = file;
        // Можно здесь добавить проверку структуры через FileReader и XLSX, если нужно
    });

    // Функция обработки запроса
    function showAnswers() {
        if (!answersFile) {
            alert('Сначала прикрепите файл с ответами!');
            return;
        }

        // Получаем значения полей
        const egeNumbersRaw = inputEGE.value.trim();
        const taskNumbersRaw = inputTasks.value.trim();

        if (!egeNumbersRaw || !taskNumbersRaw) {
            alert('Заполните оба поля!');
            return;
        }

        // Преобразуем данные: поддержка разделения через /
        const egeGroups = egeNumbersRaw.split('/');
        const taskGroups = taskNumbersRaw.split('/');

        if (egeGroups.length !== taskGroups.length) {
            alert('Количество групп ЕГЭ и тренировочных заданий не совпадает!');
            return;
        }

        // Генерация вывода
        output.innerHTML = ''; // очистка предыдущих результатов
        for (let i = 0; i < egeGroups.length; i++) {
            const egeNum = egeGroups[i].trim();
            const taskNums = taskGroups[i].split(/[\s,]+/).map(x => x.trim()).filter(x => x !== '');
            const heading = document.createElement('h3');
            heading.textContent = `Задание ${egeNum}:`;
            output.appendChild(heading);

            taskNums.forEach(task => {
                const p = document.createElement('p');
                // Здесь placeholder для ответа — на сервере нужно подставлять реальный ответ
                p.textContent = `№${task}: [ответ будет здесь]`;
                output.appendChild(p);

                // Пример отправки действия на сервер для логирования
                // fetch('/log', { method: 'POST', body: JSON.stringify({ege: egeNum, task: task}) });
            });
        }
    }

    // Привязка кнопки
    showBtn.addEventListener('click', showAnswers);

    // Нажатие Enter в любом поле имитирует клик на кнопку
    function triggerEnter(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            showBtn.click();
        }
    }

    inputEGE.addEventListener('keydown', triggerEnter);
    inputTasks.addEventListener('keydown', triggerEnter);
});
