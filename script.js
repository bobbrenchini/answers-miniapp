document.addEventListener("DOMContentLoaded", function() {
    let tg = window.Telegram?.WebApp;
    if(tg) tg.expand();

    const settingsBtn = document.getElementById("settingsBtn");
    const settingsDiv = document.getElementById("settings");
    const themeSelect = document.getElementById("themeSelect");
    const fileInput = document.getElementById("fileInput");
    const sendBtn = document.getElementById("send");
    const resultBlock = document.getElementById("result");
    let workbook = null;

    const TASK_NAMES = {
        "1": "Анализ информационных моделей",
        "2": "Таблицы истинности логических выражений",
        "3": "Поиск и сортировка в базах данных",
        "4": "Кодирование и декодирование данных. Условие Фано",
        "5": "Анализ алгоритмов для исполнителей",
        "6": "Циклические алгоритмы для Исполнителя",
        "7": "Кодирование графической и звуковой информации",
        "7-2": "Кодирование звуковой информации",
        "7-v": "Скорость передачи информации",
        "8": "Комбинаторика",
        "9": "Обработка числовой информации в электронных таблицах",
        "10": "Поиск слова в текстовом документе",
        "11": "Вычисление количества информации",
        "12": "Машина Тьюринга",
        "13": "IP адреса и маски",
        "14": "Позиционные системы счисления",
        "15": "Истинность логического выражения",
        "16": "Вычисление значения рекурсивной функции",
        "17": "Обработка целочисленных данных. Проверка делимости",
        "18": "Динамическое программирование в электронных таблицах",
        "19-21": "Теория игр",
        "22": "Многопоточные вычисления",
        "23": "Динамическое программирование (количество программ)",
        "24": "Обработка символьных строк",
        "25": "Обработка целочисленных данных. Поиск делителей",
        "26": "Обработка данных с помощью сортировки",
        "27": "Кластерный анализ",
        "27-db": "Устаревший тип на обработку последовательностей"
    };

    // Показ/скрытие настроек
    settingsBtn.addEventListener("click", () => settingsDiv.classList.toggle("hidden"));
    themeSelect.addEventListener("change", () => document.body.className = themeSelect.value);

    // Чтение выбранного файла Excel
    fileInput.addEventListener("change", (e) => {
        const reader = new FileReader();
        reader.onload = (evt) => {
            const data = new Uint8Array(evt.target.result);
            workbook = XLSX.read(data, {type: "array"});
            alert("Файл успешно загружен!");
        };
        reader.readAsArrayBuffer(e.target.files[0]);
    });

    // Обработка кнопки "Показать ответы"
    sendBtn.addEventListener("click", () => {
        const ege = document.getElementById("ege").value.trim();
        const tasks = document.getElementById("tasks").value.trim();
    
        if(!ege || !tasks){
            resultBlock.textContent = "Заполните все поля и прикрепите файл с ответами.";
            resultBlock.classList.remove("hidden");
            return;
        }
        if(!workbook){
            resultBlock.textContent = "Файл с ответами не загружен!";
            resultBlock.classList.remove("hidden");
            return;
        }
    
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const df = XLSX.utils.sheet_to_json(sheet, {header:1}); // массив массивов
    
        // Первый ряд — номера ЕГЭ
        const header = df[0].map(h => String(h).trim());
        const firstCol = 0; // первый столбец — номера заданий
        const taskList = tasks.replace(/,/g,' ').split(/\s+/);
        const resultArr = [];
    
        // Найти индекс столбца с нужным номером ЕГЭ
        const colIdx = header.indexOf(String(ege));
        if(colIdx < 0){
            resultBlock.textContent = `Неверный номер ЕГЭ: ${ege}`;
            resultBlock.classList.remove("hidden");
            return;
        }
    
        taskList.forEach(taskNum => {
            // Найти строку с номером тренировочного задания
            const row = df.find(r => String(r[firstCol]).trim() === taskNum);
            let answer = row ? row[colIdx] : "неверный номер введённого задания";
    
            // Если число — убрать .0
            if(typeof answer === "number" && Number.isInteger(answer)) answer = answer.toString();
    
            resultArr.push(`№${taskNum}: ${answer}`);
        });
    
        const taskName = TASK_NAMES[ege] ? ` — ${TASK_NAMES[ege]}` : "";
        resultBlock.textContent = `Задание ${ege}${taskName}:\n` + resultArr.join("\n");
        resultBlock.classList.remove("hidden");
    });
});

