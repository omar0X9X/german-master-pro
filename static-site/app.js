(function () {
  "use strict";

  const STORE = {
    done: "ta3lim.done.v2",
    legacyDone: "ta3lim.done.v1",
    theme: "ta3lim.theme.v1",
    level: "ta3lim.level.v1",
    profile: "ta3lim.profile.v1",
    records: "ta3lim.records.v1",
    activity: "ta3lim.activity.v1"
  };

  function readJSON(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value == null ? fallback : value;
    } catch {
      return fallback;
    }
  }

  const legacy = readJSON(STORE.legacyDone, []);
  const current = readJSON(STORE.done, []);

  const state = {
    data: null,
    level: localStorage.getItem(STORE.level) || "A1",
    filter: "الكل",
    done: new Set([...legacy, ...current]),
    profile: Object.assign({ dailyMinutes: 210 }, readJSON(STORE.profile, {})),
    records: readJSON(STORE.records, {}),
    activity: readJSON(STORE.activity, [])
  };

  const $ = (selector) => document.querySelector(selector);

  const els = {
    levels: [...document.querySelectorAll(".level-btn")],
    label: $("#levelLabel"),
    title: $("#levelTitle"),
    goal: $("#levelGoal"),
    videoCount: $("#videoCount"),
    resourceCount: $("#resourceCount"),
    categoryCount: $("#categoryCount"),
    roadmap: $("#roadmap"),
    lessons: $("#lessons"),
    lessonProgress: $("#lessonProgress"),
    filters: $("#filters"),
    resources: $("#resources"),
    pct: $("#progressPercent"),
    bar: $("#progressBar"),
    text: $("#progressText"),
    theme: $("#themeToggle"),
    reset: $("#resetProgress"),
    dailyMinutes: $("#dailyMinutes"),
    nextLessonStat: $("#nextLessonStat"),
    dueReviewsStat: $("#dueReviewsStat"),
    streakStat: $("#streakStat"),
    levelCompletionStat: $("#levelCompletionStat"),
    todayPlanTitle: $("#todayPlanTitle"),
    todayMinutes: $("#todayMinutes"),
    todayPlan: $("#todayPlan"),
    coachTitle: $("#coachTitle"),
    coachText: $("#coachText"),
    skillCoverage: $("#skillCoverage")
  };

  function level() {
    return state.data.levels.find((item) => item.id === state.level) || state.data.levels[0];
  }

  function lessonKeyFor(levelId, lesson) {
    return "video::" + levelId + "::" + lesson.id;
  }

  function resourceKeyFor(levelId, resource) {
    return "resource::" + levelId + "::" + resource.id;
  }

  function legacyResourceKeyFor(levelId, resource) {
    return levelId + "::" + resource.id;
  }

  function lessonKey(lesson) {
    return lessonKeyFor(state.level, lesson);
  }

  function resourceKey(resource) {
    return resourceKeyFor(state.level, resource);
  }

  function isResourceDoneFor(levelId, resource) {
    return state.done.has(resourceKeyFor(levelId, resource)) ||
      state.done.has(legacyResourceKeyFor(levelId, resource));
  }

  function isResourceDone(resource) {
    return isResourceDoneFor(state.level, resource);
  }

  function save() {
    localStorage.setItem(STORE.done, JSON.stringify([...state.done]));
    localStorage.setItem(STORE.level, state.level);
    localStorage.setItem(STORE.profile, JSON.stringify(state.profile));
    localStorage.setItem(STORE.records, JSON.stringify(state.records));
    localStorage.setItem(STORE.activity, JSON.stringify(state.activity));
  }

  function dateKey(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + d;
  }

  function markActivity() {
    const today = dateKey();
    if (!state.activity.includes(today)) state.activity.push(today);
    state.activity = [...new Set(state.activity)].sort().slice(-400);
  }

  function streak() {
    const days = new Set(state.activity);
    let cursor = new Date();
    if (!days.has(dateKey(cursor))) {
      cursor.setDate(cursor.getDate() - 1);
      if (!days.has(dateKey(cursor))) return 0;
    }

    let count = 0;
    while (days.has(dateKey(cursor))) {
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }

  function scheduleRecord(key, difficulty = "normal", isReview = false) {
    const now = Date.now();
    const intervals = { hard: 1, normal: 3, easy: 7 };
    const days = intervals[difficulty] || 3;
    const old = state.records[key] || {};

    state.records[key] = {
      completedAt: old.completedAt || now,
      lastReviewedAt: now,
      nextReviewAt: now + days * 86400000,
      difficulty,
      reviews: (old.reviews || 0) + (isReview ? 1 : 0)
    };

    markActivity();
    save();
  }

  function markDone(key) {
    state.done.add(key);
    scheduleRecord(key, "normal", false);
  }

  function unmarkDone(key, legacyKey) {
    state.done.delete(key);
    if (legacyKey) state.done.delete(legacyKey);
    delete state.records[key];
    if (legacyKey) delete state.records[legacyKey];
    save();
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(STORE.theme, theme);
    els.theme.textContent = theme === "dark" ? "☀" : "☾";
    els.theme.setAttribute("aria-label", theme === "dark" ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الليلي");
  }

  function categories() {
    return ["الكل", ...new Set(level().resources.map((resource) => resource.skill))];
  }

  function kindLabel(kind) {
    const labels = {
      core: "درس أساسي",
      pronunciation: "تدريب نطق",
      listening: "استماع",
      exam: "اختبار",
      review: "مراجعة"
    };
    return labels[kind] || "فيديو";
  }

  function difficultyControls(key) {
    const record = state.records[key] || {};
    const current = record.difficulty || "normal";
    return (
      '<div class="memory-controls">' +
        '<span>المراجعة:</span>' +
        '<button type="button" data-diff="hard" class="' + (current === "hard" ? "active" : "") + '">صعب • غداً</button>' +
        '<button type="button" data-diff="normal" class="' + (current === "normal" ? "active" : "") + '">متوسط • 3 أيام</button>' +
        '<button type="button" data-diff="easy" class="' + (current === "easy" ? "active" : "") + '">سهل • 7 أيام</button>' +
      "</div>"
    );
  }

  function wireDifficulty(container, key) {
    container.querySelectorAll("[data-diff]").forEach((button) => {
      button.addEventListener("click", () => {
        scheduleRecord(key, button.dataset.diff, true);
        renderAll();
      });
    });
  }

  function renderLevelHeader() {
    const data = level();
    const lessons = data.lessons || [];

    els.levels.forEach((button) => {
      button.classList.toggle("active", button.dataset.level === state.level);
    });

    els.label.textContent = data.id + " • " + data.label;
    els.title.textContent = data.title;
    els.goal.textContent = data.goal;
    els.videoCount.textContent = lessons.length;
    els.resourceCount.textContent = data.resources.length;
    els.categoryCount.textContent = new Set([
      ...lessons.map((item) => item.skill),
      ...data.resources.map((item) => item.skill)
    ]).size;
  }

  function renderRoadmap() {
    els.roadmap.innerHTML = "";

    level().roadmap.forEach((step, index) => {
      const card = document.createElement("article");
      card.className = "step-card";
      card.innerHTML =
        '<div class="step-no">' + (index + 1) + "</div>" +
        "<h3>" + step.title + "</h3>" +
        "<p>" + step.text + "</p>";
      els.roadmap.appendChild(card);
    });
  }

  function renderLessons() {
    const lessons = [...(level().lessons || [])].sort((a, b) => a.order - b.order);
    els.lessons.innerHTML = "";

    lessons.forEach((lesson) => {
      const key = lessonKey(lesson);
      const done = state.done.has(key);
      const card = document.createElement("article");
      card.className = "lesson-card" + (done ? " done" : "") + (lesson.kind === "review" ? " review" : "");

      card.innerHTML =
        '<div class="lesson-index">' + String(lesson.order).padStart(2, "0") + "</div>" +
        '<div class="lesson-body">' +
          '<div class="lesson-meta">' +
            '<span class="lesson-kind">' + kindLabel(lesson.kind) + "</span>" +
            '<span>' + lesson.skill + "</span>" +
            '<span>' + lesson.provider + "</span>" +
          "</div>" +
          "<h3>" + lesson.title + "</h3>" +
          "<p>" + lesson.note + "</p>" +
          '<div class="resource-actions">' +
            '<a class="open-link" href="' + lesson.url + '" target="_blank" rel="noopener noreferrer">▶ فتح الفيديو</a>' +
            '<button type="button" class="done-btn">' + (done ? "✓ مكتمل" : "علّم كمكتمل") + "</button>" +
          "</div>" +
          (done ? difficultyControls(key) : "") +
        "</div>";

      card.querySelector(".done-btn").addEventListener("click", () => {
        if (state.done.has(key)) unmarkDone(key);
        else markDone(key);
        renderAll();
      });

      if (done) wireDifficulty(card, key);
      els.lessons.appendChild(card);
    });

    const completed = lessons.filter((item) => state.done.has(lessonKey(item))).length;
    els.lessonProgress.textContent = completed + "/" + lessons.length;
  }

  function renderFilters() {
    els.filters.innerHTML = "";

    categories().forEach((category) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "filter-btn" + (category === state.filter ? " active" : "");
      button.textContent = category;
      button.addEventListener("click", () => {
        state.filter = category;
        renderFilters();
        renderResources();
      });
      els.filters.appendChild(button);
    });
  }

  function renderResources() {
    const list = level().resources.filter(
      (resource) => state.filter === "الكل" || resource.skill === state.filter
    );

    els.resources.innerHTML = "";

    if (!list.length) {
      els.resources.innerHTML = '<p class="empty">لا توجد موارد في هذا التصنيف.</p>';
      return;
    }

    list.forEach((resource) => {
      const done = isResourceDone(resource);
      const key = resourceKey(resource);
      const legacyKey = legacyResourceKeyFor(state.level, resource);
      const card = document.createElement("article");
      card.className = "resource-card" + (done ? " done" : "");

      card.innerHTML =
        '<div class="resource-top">' +
          '<span class="provider-name">' + resource.provider + "</span>" +
          '<span class="badge">' + resource.skill + "</span>" +
        "</div>" +
        "<h3>" + resource.title + "</h3>" +
        "<p>" + resource.note + "</p>" +
        '<div class="resource-actions">' +
          '<a class="open-link" href="' + resource.url + '" target="_blank" rel="noopener noreferrer">فتح الموقع</a>' +
          '<button type="button" class="done-btn">' + (done ? "✓ مكتمل" : "علّم كمكتمل") + "</button>" +
        "</div>" +
        (done ? difficultyControls(key) : "");

      card.querySelector(".done-btn").addEventListener("click", () => {
        if (isResourceDone(resource)) unmarkDone(key, legacyKey);
        else markDone(key);
        renderAll();
      });

      if (done) wireDifficulty(card, key);
      els.resources.appendChild(card);
    });
  }

  function estimateMinutes(item, type) {
    if (type === "review") return 15;
    if (type === "resource") {
      if (item.skill === "اختبار") return 40;
      if (item.skill === "الكتابة") return 30;
      if (item.skill === "القراءة") return 25;
      return 20;
    }

    const byKind = {
      core: 40,
      pronunciation: 25,
      listening: 30,
      exam: 45,
      review: 30
    };
    return byKind[item.kind] || 30;
  }

  function levelItems(lvl) {
    const items = [];

    (lvl.lessons || []).forEach((lesson) => {
      const key = lessonKeyFor(lvl.id, lesson);
      items.push({
        key,
        levelId: lvl.id,
        item: lesson,
        type: "lesson",
        done: state.done.has(key),
        skill: lesson.skill,
        title: lesson.title,
        url: lesson.url
      });
    });

    lvl.resources.forEach((resource) => {
      const key = resourceKeyFor(lvl.id, resource);
      items.push({
        key,
        levelId: lvl.id,
        item: resource,
        type: "resource",
        done: isResourceDoneFor(lvl.id, resource),
        skill: resource.skill,
        title: resource.title,
        url: resource.url
      });
    });

    return items;
  }

  function dueReviews(lvl) {
    const now = Date.now();
    return levelItems(lvl)
      .filter((entry) => entry.done)
      .filter((entry) => state.records[entry.key] && state.records[entry.key].nextReviewAt <= now)
      .sort((a, b) => state.records[a.key].nextReviewAt - state.records[b.key].nextReviewAt);
  }

  function skillStats(lvl) {
    const map = {};

    levelItems(lvl).forEach((entry) => {
      if (!map[entry.skill]) map[entry.skill] = { total: 0, done: 0 };
      map[entry.skill].total += 1;
      if (entry.done) map[entry.skill].done += 1;
    });

    return Object.entries(map)
      .map(([skill, value]) => ({
        skill,
        total: value.total,
        done: value.done,
        pct: value.total ? Math.round((value.done / value.total) * 100) : 0
      }))
      .sort((a, b) => a.pct - b.pct || b.total - a.total);
  }

  function buildTodayPlan() {
    const lvl = level();
    const target = Number(state.profile.dailyMinutes) || 210;
    const tasks = [];
    const used = new Set();
    let total = 0;

    const reviews = dueReviews(lvl).slice(0, 2);
    reviews.forEach((entry) => {
      const minutes = estimateMinutes(entry.item, "review");
      tasks.push(Object.assign({}, entry, { planType: "review", minutes }));
      used.add(entry.key);
      total += minutes;
    });

    const lessons = [...(lvl.lessons || [])]
      .sort((a, b) => a.order - b.order)
      .map((lesson) => ({
        key: lessonKeyFor(lvl.id, lesson),
        levelId: lvl.id,
        item: lesson,
        type: "lesson",
        planType: "lesson",
        done: state.done.has(lessonKeyFor(lvl.id, lesson)),
        skill: lesson.skill,
        title: lesson.title,
        url: lesson.url
      }))
      .filter((entry) => !entry.done);

    if (lessons.length) {
      const entry = lessons[0];
      const minutes = estimateMinutes(entry.item, "lesson");
      tasks.push(Object.assign({}, entry, { minutes }));
      used.add(entry.key);
      total += minutes;
    }

    const coverage = skillStats(lvl);
    const weakSkills = coverage.map((entry) => entry.skill);
    const practice = lvl.resources
      .map((resource) => ({
        key: resourceKeyFor(lvl.id, resource),
        levelId: lvl.id,
        item: resource,
        type: "resource",
        planType: "resource",
        done: isResourceDoneFor(lvl.id, resource),
        skill: resource.skill,
        title: resource.title,
        url: resource.url
      }))
      .filter((entry) => !entry.done)
      .sort((a, b) => weakSkills.indexOf(a.skill) - weakSkills.indexOf(b.skill));

    for (const entry of practice) {
      const minutes = estimateMinutes(entry.item, "resource");
      if (tasks.length >= 5) break;
      if (used.has(entry.key)) continue;
      if (total + minutes > target + 15 && tasks.length >= 2) continue;
      tasks.push(Object.assign({}, entry, { minutes }));
      used.add(entry.key);
      total += minutes;
      if (total >= target * 0.72) break;
    }

    for (const entry of lessons.slice(1)) {
      if (tasks.length >= 6 || total >= target) break;
      const minutes = estimateMinutes(entry.item, "lesson");
      if (total + minutes > target + 15) break;
      tasks.push(Object.assign({}, entry, { minutes }));
      used.add(entry.key);
      total += minutes;
    }

    return { tasks, total, target };
  }

  function renderSmartHub() {
    const lvl = level();
    const lessons = [...(lvl.lessons || [])].sort((a, b) => a.order - b.order);
    const nextLesson = lessons.find((lesson) => !state.done.has(lessonKeyFor(lvl.id, lesson)));
    const reviews = dueReviews(lvl);
    const items = levelItems(lvl);
    const completed = items.filter((entry) => entry.done).length;
    const completion = items.length ? Math.round((completed / items.length) * 100) : 0;

    els.dailyMinutes.value = String(state.profile.dailyMinutes);
    els.nextLessonStat.textContent = nextLesson ? "درس " + String(nextLesson.order).padStart(2, "0") : "اكتمل";
    els.dueReviewsStat.textContent = reviews.length;
    els.streakStat.textContent = streak() + " يوم";
    els.levelCompletionStat.textContent = completion + "%";

    const plan = buildTodayPlan();
    els.todayMinutes.textContent = plan.total + " / " + plan.target + " دقيقة";
    els.todayPlanTitle.textContent = plan.tasks.length
      ? "خطة " + lvl.id + " لليوم"
      : "كملت عناصر المستوى الحالية";

    els.todayPlan.innerHTML = "";

    if (!plan.tasks.length) {
      els.todayPlan.innerHTML = '<p class="empty">ما بقا حتى عنصر غير مكتمل في هذا المستوى. دير اختبار المستوى أو انتقل للمستوى التالي.</p>';
    } else {
      plan.tasks.forEach((task, index) => {
        const row = document.createElement("article");
        row.className = "today-task" + (task.planType === "review" ? " review-task" : "");
        const typeLabel = task.planType === "review"
          ? "مراجعة مستحقة"
          : task.planType === "lesson"
            ? "درس"
            : "تطبيق " + task.skill;

        row.innerHTML =
          '<div class="today-order">' + (index + 1) + "</div>" +
          '<div class="today-task-body">' +
            '<div class="today-task-meta"><span>' + typeLabel + '</span><span>≈ ' + task.minutes + " د</span></div>" +
            "<strong>" + task.title + "</strong>" +
            '<div class="today-actions"><a href="' + task.url + '" target="_blank" rel="noopener noreferrer">ابدأ</a>' +
            (task.planType === "review"
              ? '<button type="button" data-review-key="' + task.key + '" data-review-diff="hard">صعب</button>' +
                '<button type="button" data-review-key="' + task.key + '" data-review-diff="normal">متوسط</button>' +
                '<button type="button" data-review-key="' + task.key + '" data-review-diff="easy">سهل</button>'
              : "") +
            "</div>" +
          "</div>";
        els.todayPlan.appendChild(row);
      });

      els.todayPlan.querySelectorAll("[data-review-key]").forEach((button) => {
        button.addEventListener("click", () => {
          scheduleRecord(button.dataset.reviewKey, button.dataset.reviewDiff, true);
          renderAll();
        });
      });
    }

    const coverage = skillStats(lvl);
    els.skillCoverage.innerHTML = "";
    coverage.forEach((entry) => {
      const row = document.createElement("div");
      row.className = "skill-row";
      row.innerHTML =
        '<div><span>' + entry.skill + "</span><strong>" + entry.pct + "%</strong></div>" +
        '<div class="mini-bar"><i style="width:' + entry.pct + '%"></i></div>';
      els.skillCoverage.appendChild(row);
    });

    const weakest = coverage.find((entry) => entry.total >= 2) || coverage[0];
    const examDone = items
      .filter((entry) => entry.skill === "اختبار")
      .some((entry) => entry.done);

    if (completion === 0) {
      els.coachTitle.textContent = "ابدأ بالدرس 01";
      els.coachText.textContent = "ما عندناش بيانات كافية عليك دابا. أول ما تكمل وتقيّم الدروس، المحرك غادي يبدأ يرتب المراجعات تلقائياً.";
    } else if (completion >= 85 && examDone) {
      els.coachTitle.textContent = "المسار قريب يكتمل";
      els.coachText.textContent = "داخل هذا المنهج أنت قريب من إكمال المستوى. هاد النسبة كتقيس إنجاز المسار، ماشي شهادة أن مستواك اللغوي مضمون.";
    } else if (weakest) {
      els.coachTitle.textContent = "أقل مهارة تدربت عليها: " + weakest.skill;
      els.coachText.textContent = "التغطية الحالية " + weakest.pct + "%. هذا لا يعني بالضرورة أنها أضعف مهارة عندك؛ يعني فقط أن عندك تدريب أقل عليها داخل الموقع.";
    }
  }

  function renderProgress() {
    const items = [];

    state.data.levels.forEach((lvl) => {
      (lvl.lessons || []).forEach((lesson) => {
        const key = lessonKeyFor(lvl.id, lesson);
        items.push({ key, done: state.done.has(key) });
      });

      lvl.resources.forEach((resource) => {
        const modern = resourceKeyFor(lvl.id, resource);
        const legacyKey = legacyResourceKeyFor(lvl.id, resource);
        items.push({ key: modern, done: state.done.has(modern) || state.done.has(legacyKey) });
      });
    });

    const completed = items.filter((item) => item.done).length;
    const pct = items.length ? Math.round((completed / items.length) * 100) : 0;

    els.pct.textContent = pct + "%";
    els.bar.style.width = pct + "%";
    els.text.textContent = completed + " من " + items.length + " درس/مورد مكتمل";
  }

  function migrateRecords() {
    const now = Date.now();

    state.data.levels.forEach((lvl) => {
      (lvl.lessons || []).forEach((lesson) => {
        const key = lessonKeyFor(lvl.id, lesson);
        if (state.done.has(key) && !state.records[key]) {
          state.records[key] = {
            completedAt: now,
            lastReviewedAt: now,
            nextReviewAt: now + 3 * 86400000,
            difficulty: "normal",
            reviews: 0
          };
        }
      });

      lvl.resources.forEach((resource) => {
        const key = resourceKeyFor(lvl.id, resource);
        const legacyKey = legacyResourceKeyFor(lvl.id, resource);
        if ((state.done.has(key) || state.done.has(legacyKey)) && !state.records[key]) {
          state.records[key] = {
            completedAt: now,
            lastReviewedAt: now,
            nextReviewAt: now + 3 * 86400000,
            difficulty: "normal",
            reviews: 0
          };
        }
      });
    });

    save();
  }

  function renderAll() {
    renderLevelHeader();
    renderSmartHub();
    renderRoadmap();
    renderLessons();
    renderFilters();
    renderResources();
    renderProgress();
  }

  els.levels.forEach((button) => {
    button.addEventListener("click", () => {
      state.level = button.dataset.level;
      state.filter = "الكل";
      save();
      renderAll();
      document.querySelector(".level-intro").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  els.dailyMinutes.addEventListener("change", () => {
    state.profile.dailyMinutes = Number(els.dailyMinutes.value) || 210;
    save();
    renderSmartHub();
  });

  els.theme.addEventListener("click", () => {
    applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
  });

  els.reset.addEventListener("click", () => {
    if (!confirm("مسح جميع علامات التقدم والمراجعات؟")) return;
    state.done.clear();
    state.records = {};
    state.activity = [];
    save();
    renderAll();
  });

  const savedTheme = localStorage.getItem(STORE.theme);
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(savedTheme || (prefersDark ? "dark" : "light"));

  fetch("./data/curriculum.json", { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error("HTTP " + response.status);
      return response.json();
    })
    .then((data) => {
      state.data = data;
      if (!data.levels.some((item) => item.id === state.level)) state.level = "A1";
      migrateRecords();
      renderAll();
    })
    .catch((error) => {
      console.error(error);
      els.todayPlan.innerHTML = '<p class="empty">تعذر تشغيل محرك الدراسة.</p>';
      els.lessons.innerHTML = '<p class="empty">تعذر تحميل مسار الفيديوهات.</p>';
      els.resources.innerHTML = '<p class="empty">تعذر تحميل ملف الموارد.</p>';
    });
})();