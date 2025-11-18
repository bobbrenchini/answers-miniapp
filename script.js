// script.js
document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("fileInput");
  const sendBtn = document.getElementById("send");
  const resultBlock = document.getElementById("result");
  const fileLabel = document.getElementById("fileLabel");
  const egeField = document.getElementById("ege");
  const tasksField = document.getElementById("tasks");

  let workbook = null;
  let inTelegram = !!(window.Telegram && window.Telegram.WebApp);
  const tg = inTelegram ? window.Telegram.WebApp : null;

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

  // helper: parse groups separated by '/'
  function parseGroups(text) {
    // split on '/', trim each group; return array of groups (strings)
    return text.split('/').map(g => g.trim()).filter(g => g.length > 0);
  }

  // helper: parse one group's list of numbers (commas or spaces)
  function parseNumbersInGroup(groupText) {
    return groupText.split(/[\s,]+/).map(x => x.trim()).filter(x => x.length > 0);
  }

  // Load file (.xls)
  fileInput.setAttribute("accept", ".xls");
  fileInput.addEventListener("change", (e) => {
    const f = e.target.files[0];
    if(!f) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target.result;
      try {
        workbook = XLSX.read(data, { type: "binary" });
        if(!workbook.SheetNames || workbook.SheetNames.length === 0) {
          alert("Не найден лист в файле. Проверьте файл.");
          workbook = null;
          return;
        }
        // Hide file input (requirement): no success text
        fileInput.style.display = "none";
        fileLabel.style.display = "none";
      } catch(err) {
        console.error(err);
        alert("Ошибка чтения файла. Убедитесь, что это корректный .xls");
        workbook = null;
      }
    };
    reader.readAsBinaryString(f);
  });

  // format result: single task block to text
  function buildTaskBlock(ege, taskList, sheetArray) {
    const header = sheetArray[0].map(h => String(h).trim());
    const colIdx = header.indexOf(String(ege).trim());
    let block = `Задание ${ege}${TASK_NAMES[ege] ? ' — ' + TASK_NAMES[ege] : ''}:\n`;
    if(colIdx < 0) {
      block += `Ошибка: номер ЕГЭ ${ege} не найден в заголовках.\n`;
      return block;
    }
    const firstCol = 0;
    for(const t of taskList) {
      const row = sheetArray.find(r => String(r[firstCol]).trim() === String(t).trim());
      let answer = row ? row[colIdx] : "неверный номер введённого задания";
      if(typeof answer === 'number' && Number.isInteger(answer)) answer = answer.toString();
      block += `№${t}: ${answer}\n`;
    }
    return block;
  }

  // Client-side processing (site, not telegram)
  function processClient(groupsEge, groupsTasks) {
    if(!workbook) {
      resultBlock.textContent = "Ошибка: файл с ответами не загружен.";
      resultBlock.classList.remove("hidden");
      return;
    }
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const sheetArray = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    let out = "";
    for(let i=0;i<groupsEge.length;i++){
      const ege = groupsEge[i];
      const tasks = groupsTasks[i];
      out += buildTaskBlock(ege, tasks, sheetArray) + "\n";
    }
    resultBlock.textContent = out.trim();
    resultBlock.classList.remove("hidden");
  }

  // When send button clicked
  sendBtn.addEventListener("click", () => {
    resultBlock.classList.add("hidden");
    resultBlock.textContent = "";

    const rawEge = egeField.value.trim();
    const rawTasks = tasksField.value.trim();
    if(!rawEge || !rawTasks) {
      resultBlock.textContent = "Заполните оба поля (ЕГЭ и номера заданий).";
      resultBlock.classList.remove("hidden");
      return;
    }

    const egeGroupsRaw = parseGroups(rawEge); // array of strings
    const taskGroupsRaw = parseGroups(rawTasks);

    // For each group of tasks, parse numbers inside
    const egeGroups = egeGroupsRaw.map(g => g); // keep strings
    const taskGroups = taskGroupsRaw.map(g => parseNumbersInGroup(g));

    // Validate counts
    if(egeGroups.length !== taskGroups.length) {
      resultBlock.textContent = `Ошибка: количество групп в поле ЕГЭ (${egeGroups.length}) не равно количеству групп в поле номеров (${taskGroups.length}).`;
      resultBlock.classList.remove("hidden");
      return;
    }

    // Validate that each group's numbers are not empty and numeric-ish
    for(let i=0;i<taskGroups.length;i++){
      if(taskGroups[i].length === 0) {
        resultBlock.textContent = `Ошибка: группа номеров №${i+1} пуста.`;
        resultBlock.classList.remove("hidden");
        return;
      }
    }

    // If inside Telegram — send to bot as JSON
    if(inTelegram && tg) {
      const payload = {
        type: "multi_query",
        ege_groups: egeGroups,
        task_groups: taskGroups
      };
      try {
        tg.sendData(JSON.stringify(payload));
        // Optionally show a small notice to user
        resultBlock.textContent = "Запрос отправлен боту — ответ придёт в этот чат.";
        resultBlock.classList.remove("hidden");
      } catch(err) {
        console.error(err);
        resultBlock.textContent = "Ошибка отправки данных боту.";
        resultBlock.classList.remove("hidden");
      }
      return;
    }

    // Otherwise — client-side processing
    processClient(egeGroups, taskGroups);
  });

});
