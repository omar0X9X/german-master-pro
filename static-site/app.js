(function () {
  "use strict";

  var STORAGE = {
    progress: "germanPath.progress.v1",
    theme: "germanPath.theme.v1",
    view: "germanPath.view.v1"
  };

  var app = {
    data: null,
    level: "A1",
    week: 0,
    skill: "الكل",
    completed: new Set()
  };

  var els = {
    levelTabs: document.getElementById("levelTabs"),
    weekSelect: document.getElementById("weekSelect"),
    weekBadge: document.getElementById("weekBadge"),
    weekTitle: document.getElementById("weekTitle"),
    weekGoal: document.getElementById("weekGoal"),
    daysGrid: document.getElementById("daysGrid"),
    resourcesGrid: document.getElementById("resourcesGrid"),
    skillFilter: document.getElementById("skillFilter"),
    overallPercent: document.getElementById("overallPercent"),
    overallBar: document.getElementById("overallBar"),
    overallMeta: document.getElementById("overallMeta"),
    weekPercent: document.getElementById("weekPercent"),
    weekBar: document.getElementById("weekBar"),
    themeToggle: document.getElementById("themeToggle"),
    resetProgress: document.getElementById("resetProgress")
  };

  function safeParse(raw, fallback) {
    try { return JSON.parse(raw); } catch (_) { return fallback; }
  }

  function loadLocalState() {
    var saved = safeParse(localStorage.getItem(STORAGE.progress), []);
    if (Array.isArray(saved)) app.completed = new Set(saved);

    var view = safeParse(localStorage.getItem(STORAGE.view), null);
    if (view && typeof view === "object") {
      if (typeof view.level === "string") app.level = view.level;
      if (Number.isInteger(view.week)) app.week = Math.max(0, view.week);
    }

    var savedTheme = localStorage.getItem(STORAGE.theme);
    var preferredDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(savedTheme || (preferredDark ? "dark" : "light"));
  }

  function applyTheme(theme) {
    var next = theme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(STORAGE.theme, next);
    var use = els.themeToggle.querySelector("use");
    if (use) use.setAttribute("href", next === "dark" ? "#i-sun" : "#i-moon");
    els.themeToggle.setAttribute("aria-label", next === "dark" ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الليلي");
  }

  function saveView() {
    localStorage.setItem(STORAGE.view, JSON.stringify({ level: app.level, week: app.week }));
  }

  function saveProgress() {
    localStorage.setItem(STORAGE.progress, JSON.stringify(Array.from(app.completed)));
  }

  function levelData() {
    return app.data.levels.find(function (item) { return item.id === app.level; }) || app.data.levels[0];
  }

  function currentWeek() {
    var level = levelData();
    return level.weeks[app.week] || level.weeks[0];
  }

  function progressKey(dayIndex) {
    return app.level + "-w" + (app.week + 1) + "-d" + (dayIndex + 1);
  }

  function svgIcon(id) {
    return '<svg aria-hidden="true"><use href="#' + id + '"></use></svg>';
  }

  function renderLevels() {
    els.levelTabs.innerHTML = "";
    app.data.levels.forEach(function (level) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "level-tab";
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", level.id === app.level ? "true" : "false");
      button.textContent = level.id;
      button.addEventListener("click", function () {
        app.level = level.id;
        app.week = 0;
        app.skill = "الكل";
        saveView();
        renderAll();
      });
      els.levelTabs.appendChild(button);
    });
  }

  function renderWeeks() {
    var level = levelData();
    if (app.week >= level.weeks.length) app.week = 0;
    els.weekSelect.innerHTML = "";
    level.weeks.forEach(function (week, index) {
      var option = document.createElement("option");
      option.value = String(index);
      option.textContent = "الأسبوع " + week.number + " — " + week.title;
      option.selected = index === app.week;
      els.weekSelect.appendChild(option);
    });
  }

  function renderOverview() {
    var level = levelData();
    var week = currentWeek();
    els.weekBadge.textContent = level.id + " • " + level.label;
    els.weekTitle.textContent = "الأسبوع " + week.number + ": " + week.title;
    els.weekGoal.textContent = week.goal + " — محاور: " + week.focus.join("، ");
  }

  function renderDays() {
    var level = levelData();
    var week = currentWeek();
    els.daysGrid.innerHTML = "";

    level.dailyRoutine.forEach(function (day, index) {
      var done = app.completed.has(progressKey(index));
      var card = document.createElement("article");
      card.className = "day-card" + (done ? " done" : "");

      var focusItem = week.focus[index % week.focus.length];
      var tasks = day.tasks.slice();
      tasks.unshift("تطبيق محور الأسبوع: " + focusItem);

      card.innerHTML =
        '<div class="day-top">' +
          '<div><div class="day-number">' + (index + 1) + '</div></div>' +
          '<div><h3>' + day.title + '</h3><p class="muted">' + day.purpose + '</p></div>' +
        '</div>' +
        '<ul class="task-list">' +
          tasks.map(function (task) { return "<li>" + task + "</li>"; }).join("") +
        '</ul>' +
        '<div class="day-footer">' +
          '<span class="duration">' + svgIcon("i-clock") + day.minutes + ' دقيقة</span>' +
          '<button type="button" class="complete-btn" aria-pressed="' + done + '">' +
            svgIcon("i-check") + '<span>' + (done ? "مكتمل" : "تم") + '</span>' +
          '</button>' +
        '</div>';

      var button = card.querySelector(".complete-btn");
      button.addEventListener("click", function () {
        var key = progressKey(index);
        if (app.completed.has(key)) app.completed.delete(key);
        else app.completed.add(key);
        saveProgress();
        renderDays();
        renderProgress();
      });

      els.daysGrid.appendChild(card);
    });
  }

  function renderSkillFilter() {
    var level = levelData();
    var skills = ["الكل"];
    level.resources.forEach(function (resource) {
      if (skills.indexOf(resource.skill) === -1) skills.push(resource.skill);
    });

    if (skills.indexOf(app.skill) === -1) app.skill = "الكل";
    els.skillFilter.innerHTML = "";

    skills.forEach(function (skill) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "filter-btn" + (skill === app.skill ? " active" : "");
      button.textContent = skill;
      button.addEventListener("click", function () {
        app.skill = skill;
        renderSkillFilter();
        renderResources();
      });
      els.skillFilter.appendChild(button);
    });
  }

  function renderResources() {
    var level = levelData();
    var resources = level.resources.filter(function (resource) {
      return app.skill === "الكل" || resource.skill === app.skill;
    });

    els.resourcesGrid.innerHTML = "";
    if (!resources.length) {
      els.resourcesGrid.innerHTML = '<p class="empty">لا توجد فيديوهات في هذا التصنيف حالياً.</p>';
      return;
    }

    resources.forEach(function (resource) {
      var link = document.createElement("a");
      link.className = "resource-card";
      link.href = resource.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.innerHTML =
        '<span class="resource-icon">' + svgIcon("i-play") + '</span>' +
        '<span><h3>' + resource.title + '</h3><p>' + resource.channel + ' • ' + resource.note + '</p></span>' +
        '<span class="resource-meta">' + resource.skill + '</span>';
      els.resourcesGrid.appendChild(link);
    });
  }

  function renderProgress() {
    var total = app.data.levels.reduce(function (sum, level) {
      return sum + level.weeks.length * level.dailyRoutine.length;
    }, 0);

    var validKeys = new Set();
    app.data.levels.forEach(function (level) {
      level.weeks.forEach(function (_, weekIndex) {
        level.dailyRoutine.forEach(function (_, dayIndex) {
          validKeys.add(level.id + "-w" + (weekIndex + 1) + "-d" + (dayIndex + 1));
        });
      });
    });

    var done = Array.from(app.completed).filter(function (key) { return validKeys.has(key); }).length;
    var overall = total ? Math.round(done / total * 100) : 0;
    els.overallPercent.textContent = overall + "%";
    els.overallBar.style.width = overall + "%";
    els.overallMeta.textContent = done + " من " + total + " يوماً مكتمل";

    var weekDays = levelData().dailyRoutine.length;
    var weekDone = 0;
    for (var i = 0; i < weekDays; i += 1) if (app.completed.has(progressKey(i))) weekDone += 1;
    var weekPct = weekDays ? Math.round(weekDone / weekDays * 100) : 0;
    els.weekPercent.textContent = weekPct + "%";
    els.weekBar.style.width = weekPct + "%";
  }

  function renderAll() {
    renderLevels();
    renderWeeks();
    renderOverview();
    renderDays();
    renderSkillFilter();
    renderResources();
    renderProgress();
  }

  function showLoadError() {
    els.weekTitle.textContent = "تعذر تحميل ملف الخطة";
    els.weekGoal.textContent = "تأكد من تشغيل الموقع عبر خادم محلي أو GitHub Pages، وليس بفتح index.html مباشرة عبر file://.";
    els.daysGrid.innerHTML = '<p class="empty">ملف data/curriculum.json لم يُحمّل.</p>';
    els.resourcesGrid.innerHTML = '<p class="empty">لا يمكن عرض الفيديوهات قبل تحميل البيانات.</p>';
  }

  els.weekSelect.addEventListener("change", function () {
    app.week = Math.max(0, Number(els.weekSelect.value) || 0);
    saveView();
    renderOverview();
    renderDays();
    renderProgress();
  });

  els.themeToggle.addEventListener("click", function () {
    var current = document.documentElement.getAttribute("data-theme");
    applyTheme(current === "dark" ? "light" : "dark");
  });

  els.resetProgress.addEventListener("click", function () {
    if (!window.confirm("واش متأكد بغيتي تمسح جميع علامات التقدم؟")) return;
    app.completed.clear();
    saveProgress();
    renderDays();
    renderProgress();
  });

  loadLocalState();

  fetch("./data/curriculum.json", { cache: "no-store" })
    .then(function (response) {
      if (!response.ok) throw new Error("HTTP " + response.status);
      return response.json();
    })
    .then(function (data) {
      if (!data || !Array.isArray(data.levels) || !data.levels.length) throw new Error("Invalid curriculum");
      app.data = data;
      if (!app.data.levels.some(function (level) { return level.id === app.level; })) app.level = app.data.levels[0].id;
      renderAll();
    })
    .catch(function (error) {
      console.error("Curriculum load failed:", error);
      showLoadError();
    });
})();