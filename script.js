// script.js (complete updated)
document.addEventListener("DOMContentLoaded", () => {
  // DOM elements
  const header = document.getElementById("pageHeader");
  const fileInput = document.getElementById("fileInput");
  const fileLabel = document.getElementById("fileLabel");
  const classicBlock = document.getElementById("classicBlock");
  const selfBlock = document.getElementById("selfBlock");
  const ege = document.getElementById("ege");
  const tasks = document.getElementById("tasks");
  const ege_self = document.getElementById("ege_self");
  const knownAnswer = document.getElementById("knownAnswer");
  const rangeInput = document.getElementById("rangeInput");
  const sendBtn = document.getElementById("send");
  const resultBlock = document.getElementById("result");

  let workbook = null;
  let mode = "classic"; // "classic" or "self"
  const inTelegram = !!(window.Telegram && window.Telegram.WebApp);
  const tg = inTelegram ? window.Telegram.WebApp : null;

  // TASK_NAMES for header descriptions (used in classic output)
  const TASK_NAMES = {
    "1": "Анализ информационных моделей",
    "2": "Таблицы истинности логических выражений",
    "3": "Поиск и сортировка в базах данных",
    "4": "Кодирование и декодирование данных. Условие Фано",
    "5": "Анализ алгоритмов для исполнителей",
    "6": "Циклические алгоритмы для Исполнителя",
    "7": "Кодирование графической и видеоинформации",
    "7-2": "Кодирование звуковой информации",
    "7-v": "Скорость передачи информации",
    "8": "Комбинаторика",
    "9": "Обработка числовой информации в электронных таблицах",
    "10": "Поиск слов в текстовом документе",
    "11": "Вычисление количества информации",
    "12": "Машина Тьюринга (выполнение алгоритмов для исполнителя)",
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
    "27db": "Устаревший тип на обработку последовательностей"
  };

  // Initialize header mode attribute
  header.setAttribute("data-mode", mode);

  // Toggle mode when clicking header
  header.addEventListener("click", () => {
    if (mode === "classic") {
      mode = "self";
      classicBlock.classList.add("hidden");
      selfBlock.classList.remove("hidden");
    } else {
      mode = "classic";
      classicBlock.classList.remove("hidden");
      selfBlock.classList.add("hidden");
    }
    header.setAttribute("data-mode", mode);
    // hide previous results on mode change
    resultBlock.classList.add("hidden");
    resultBlock.textContent = "";
  });

  // File input: read workbook using SheetJS
  fileInput.addEventListener("change", (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const ext = f.name.split('.').pop().toLowerCase();
    if (ext !== "xls" && ext !== "xlsx") {
      alert("Пожалуйста, выберите файл .xls или .xlsx");
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target.result;
        // read as binary for compatibility
        workbook = XLSX.read(data, { type: "binary" });
        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          alert("Файл пустой или неверного формата.");
          workbook = null;
          return;
        }
        // hide input field after successful load (per request)
        fileInput.style.display = "none";
        fileLabel.style.display = "none";
      } catch (err) {
        console.error(err);
        alert("Ошибка чтения файла. Убедитесь, что это корректный .xls/.xlsx файл.");
        workbook = null;
      }
    };
    // use binary string read for xls compatibility
    reader.readAsBinaryString(f);
  });

  // Helpers
  function toStringSafe(v) {
    if (v === null || v === undefined) return "";
    if (typeof v === "number") {
      // convert floats that are ints to ints
      if (Number.isInteger(v)) return String(v);
      return String(v);
    }
    return String(v).trim();
  }

  // Parse sheet into array of arrays
  function getSheetArray() {
    if (!workbook) return null;
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet, { header: 1 });
  }

  // Utility: find col index by EGE label in header
  function findColIdx(headerRow, egeLabel) {
    egeLabel = String(egeLabel).trim();
    for (let i = 0; i < headerRow.length; i++) {
      if (String(headerRow[i]).trim() === egeLabel) return i;
    }
    return -1;
  }

  // Classic mode processing (like earlier)
  function processClassic(egeRaw, tasksRaw) {
    if (!workbook) {
      showResult("Файл с ответами не загружен!");
      return;
    }
    const sheetArr = getSheetArray();
    if (!sheetArr || sheetArr.length === 0) {
      showResult("Неверная структура файла.");
      return;
    }
    const headerRow = sheetArr[0].map(h => String(h).trim());
    const firstCol = 0;

    // parse groups
    const egeGroups = egeRaw.split('/').map(s => s.trim()).filter(s => s.length > 0);
    const taskGroupsRaw = tasksRaw.split('/').map(s => s.trim());
    if (egeGroups.length !== taskGroupsRaw.length) {
      showResult(`Ошибка: количество групп в поле ЕГЭ (${egeGroups.length}) != количестве групп в поле номеров (${taskGroupsRaw.length}).`);
      return;
    }

    let out = "";
    for (let i = 0; i < egeGroups.length; i++) {
      const egeLabel = egeGroups[i];
      const taskList = taskGroupsRaw[i].replace(/,/g, ' ').split(/\s+/).map(x => x.trim()).filter(x => x.length > 0);
      const colIdx = findColIdx(headerRow, egeLabel);
      const taskName = TASK_NAMES[egeLabel] ? ` — ${TASK_NAMES[egeLabel]}` : "";
      if (colIdx < 0) {
        out += `Задание ${egeLabel}${taskName}:\nОшибка: номер ЕГЭ ${egeLabel} не найден в таблице.\n\n`;
        continue;
      }
      out += `Задание ${egeLabel}${taskName}:\n`;
      for (const t of taskList) {
        // find row where firstCol equals t
        const row = sheetArr.find(r => String(r[firstCol] || "").trim() === String(t).trim());
        let ans = row ? toStringSafe(row[colIdx]) : "неверный номер введённого задания";
        out += `№${t}: ${ans}\n`;
      }
      out += `\n`;
    }
    showResult(out.trim());
  }

  // Self mode processing per spec
  function processSelf(egeLabel, knownRaw, rangeRaw) {
    if (!workbook) {
      showResult("Файл с ответами не загружен!");
      return;
    }
    egeLabel = String(egeLabel).trim();
    if (!egeLabel) {
      showResult("Введите номер задания ЕГЭ.");
      return;
    }
    const sheetArr = getSheetArray();
    if (!sheetArr || sheetArr.length === 0) {
      showResult("Неверная структура файла.");
      return;
    }
    const headerRow = sheetArr[0].map(h => String(h).trim());
    const colIdx = findColIdx(headerRow, egeLabel);
    if (colIdx < 0) {
      showResult(`Номер ЕГЭ ${egeLabel} не найден в таблице.`);
      return;
    }

    // parse range: empty => all
    let rangeStart = null, rangeEnd = null;
    if (rangeRaw && rangeRaw.trim()) {
      const m = rangeRaw.trim().match(/^(\d+)\s*-\s*(\d+)$/);
      if (!m) {
        showResult("Неверный формат диапазона. Используйте, например: 10-50 или оставьте пустым.");
        return;
      }
      rangeStart = parseInt(m[1], 10);
      rangeEnd = parseInt(m[2], 10);
      if (rangeStart > rangeEnd) {
        // swap
        [rangeStart, rangeEnd] = [rangeEnd, rangeStart];
      }
    }

    // parse knownRaw: user can type "56", "56?", "?899", "56 899", "56?" etc.
    // split by spaces or commas
    const rawParts = knownRaw.replace(/\u00A0/g,' ').trim().split(/[\s,]+/).map(x => x.trim()).filter(x => x.length > 0);
    // known tokens are those not consisting solely of '?'
    const knownTokens = rawParts.map(p => p.replace(/\?/g, '').trim()).filter(p => p.length > 0);
    if (knownTokens.length === 0) {
      showResult("Введите хотя бы одну известную часть ответа (например: 56 или 56?).");
      return;
    }

    const firstCol = 0;
    const matchesExact = [];   // exact matches where answer equals single token
    const matchesPart = [];    // matches where known token found as part of composite
    const matchesPartial = []; // matches where all known tokens present (for '?')

    // iterate rows (skip header)
    for (let r = 1; r < sheetArr.length; r++) {
      const row = sheetArr[r];
      if (!row || row.length === 0) continue;
      const taskNum = String(row[firstCol] || "").trim();
      if (!taskNum) continue;

      // apply range filter if present
      if (rangeStart !== null && rangeEnd !== null) {
        const tn = parseInt(taskNum, 10);
        if (Number.isNaN(tn) || tn < rangeStart || tn > rangeEnd) continue;
      }

      const cellVal = toStringSafe(row[colIdx]);
      if (!cellVal) continue;
      // split answer by spaces (treat multiple spaces) — answers are tokens
      const answerTokens = cellVal.split(/\s+/).map(x => x.trim()).filter(x => x.length > 0);

      // rule: if user provided a single known token without '?', and cellVal exactly equals it -> exact match
      // detect if user essentially provided single token without '?' and knownTokens length==1 and rawParts[0] doesn't contain '?'
      const userSingleNoQ = (rawParts.length === 1 && !rawParts[0].includes('?') && knownTokens.length === 1);

      if (userSingleNoQ && answerTokens.length === 1 && answerTokens[0] === knownTokens[0]) {
        matchesExact.push({task: taskNum, answer: cellVal});
        continue;
      }

      // if any answer token equals known token and cellVal length >1 => part of composite
      // Also for '?': check if all knownTokens are present among answerTokens
      let allKnownPresent = true;
      for (const kt of knownTokens) {
        if (!answerTokens.includes(kt)) {
          allKnownPresent = false;
          break;
        }
      }
      if (allKnownPresent) {
        matchesPartial.push({task: taskNum, answer: cellVal});
        continue;
      }

      // otherwise, if user provided single token and it's present among answer tokens -> part composite
      if (userSingleNoQ) {
        if (answerTokens.includes(knownTokens[0])) {
          matchesPart.push({task: taskNum, answer: cellVal});
          continue;
        }
      }
    } // end rows loop

    // Prepare output following requested behaviour:
    // Priority: exact -> partial (all known tokens) -> part (single token in composite) -> not found

    let out = "";
    if (matchesExact.length > 0) {
      out += `Найден(ы) точный(ые) ответ(ы):\n`;
      matchesExact.forEach(m => out += `Задача №${m.task} — ${m.answer}\n`);
      showResult(out.trim());
      return;
    }

    if (matchesPartial.length > 0) {
      out += `Найдено совпадение(я) по указанной(ым) частям ответа:\n`;
      matchesPartial.forEach(m => out += `Задача №${m.task} — ${m.answer}\n`);
      showResult(out.trim());
      return;
    }

    if (matchesPart.length > 0) {
      out += `Одиночного такого ответа нет, но он встречается как часть составного ответа:\n`;
      matchesPart.forEach(m => out += `Задача №${m.task} — ${m.answer}\n`);
      showResult(out.trim());
      return;
    }

    out += `Таких ответов не найдено.\n`;
    showResult(out.trim());
  }

  // Show result helper
  function showResult(text) {
    resultBlock.textContent = text;
    resultBlock.classList.remove("hidden");
  }

  // On click send
  sendBtn.addEventListener("click", () => {
    resultBlock.classList.add("hidden");
    resultBlock.textContent = "";

    if (mode === "classic") {
      const egeRaw = ege.value.trim();
      const tasksRaw = tasks.value.trim();
      if (!egeRaw || !tasksRaw) {
        showResult("Заполните оба поля: номер(а) ЕГЭ и номера заданий для тренировки.");
        return;
      }

      // If in Telegram WebApp, send data to bot
      if (inTelegram && tg) {
        const payload = {
          type: "multi_query",
          ege_groups: egeRaw.split('/').map(s => s.trim()).filter(s=>s),
          task_groups_raw: tasksRaw.split('/').map(s => s.trim())
        };
        try {
          tg.sendData(JSON.stringify(payload));
          showResult("Запрос отправлен боту — ответ придёт в чат Telegram.");
        } catch (err) {
          console.error(err);
          showResult("Ошибка отправки данных боту. Попробуйте снова.");
        }
        return;
      }

      // client-side processing
      processClassic(egeRaw, tasksRaw);
    } else {
      // self mode
      const egeLabel = ege_self.value.trim();
      const knownRaw = knownAnswer.value.trim();
      const rangeRaw = rangeInput.value.trim();
      if (!egeLabel || !knownRaw) {
        showResult("Введите номер ЕГЭ и хотя бы одну известную часть ответа.");
        return;
      }

      if (inTelegram && tg) {
        const payload = {
          type: "self_query",
          ege: egeLabel,
          known: knownRaw,
          range: rangeRaw
        };
        try {
          tg.sendData(JSON.stringify(payload));
          showResult("Запрос отправлен боту — ответ придёт в чат Telegram.");
        } catch (err) {
          console.error(err);
          showResult("Ошибка отправки данных боту. Попробуйте снова.");
        }
        return;
      }

      // client-side processing
      processSelf(egeLabel, knownRaw, rangeRaw);
    }
  });

  // Enter triggers click: in classic mode - ege/tasks fields; in self mode - ege_self/knownAnswer/rangeInput
  function handleEnter(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      sendBtn.click();
    }
  }

  // attach Enter listeners
  ege.addEventListener("keydown", handleEnter);
  tasks.addEventListener("keydown", handleEnter);
  ege_self.addEventListener("keydown", handleEnter);
  knownAnswer.addEventListener("keydown", handleEnter);
  rangeInput.addEventListener("keydown", handleEnter);

}); // DOMContentLoaded end
