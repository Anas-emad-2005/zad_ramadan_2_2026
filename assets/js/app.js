/**
 * app.js  – زاد رمضان
 * Main application orchestrator.
 *
 * Responsibilities:
 *  1. Audit streak on load (detect missed days without re-counting today).
 *  2. Render daily content (Quran, dhikr, reminder).
 *  3. Render adhkar accordion (morning / evening / sleep).
 *  4. Render daily tasks with locked-in completion state from localStorage.
 *  5. Handle task completion:
 *       - Guard: skip if already done today.
 *       - Add points ONLY once per task per day.
 *       - Check streak threshold (≥3 tasks) exactly once.
 *  6. Render reward cards and handle modal.
 *  7. Render points, progress bar, level badge.
 *  8. Gift modal.
 *  9. Hero parallax.
 * 10. Toast notifications.
 */

'use strict';

/* ════════════════════════════════════════════════════════════
   CONSTANTS
════════════════════════════════════════════════════════════ */

/*
 * We expose a much larger pool of potential daily tasks (30 in total) and
 * randomly select a smaller subset to present to the user each day.  This
 * prevents repetition and keeps the experience fresh over the course of
 * Ramadan.  The selection is keyed by date so that reloading the page on
 * the same day will always show the same set of tasks, but a new set is
 * generated on subsequent days.  Each task has a unique id, an Arabic
 * label, an icon emoji and an associated points value.
 */
const ALL_TASKS = [
    { id: 'task1',  label: 'قراءة جزء من القرآن',       icon: '📖', points: 15 },
    { id: 'task2',  label: 'الدعاء للوالدين',            icon: '🤲', points: 20  },
    { id: 'task3',  label: 'الصدقة اليومية',             icon: '💰', points: 15 },
    { id: 'task4',  label: 'صلاة الضحى',                 icon: '🌅', points: 10 },
    { id: 'task5',  label: 'صلاة التهجد',                icon: '🌙', points: 20 },
    { id: 'task6',  label: 'قراءة تفسير آية',            icon: '📚', points: 10 },
    { id: 'task7',  label: 'صلة الرحم',                 icon: '👪', points: 15 },
    { id: 'task8',  label: 'التسبيح والتحميد',            icon: '✨', points: 15  },
    { id: 'task9',  label: 'الصلاة على النبي ﷺ',          icon: '🕌', points: 20  },
    { id: 'task10', label: 'تحفيظ آية لطفل',             icon: '👶', points: 10 },
    { id: 'task11', label: 'حفظ حديث',                  icon: '💬', points: 10 },
    { id: 'task12', label: 'تدبر سورة قصيرة',             icon: '📘', points: 10 },
    { id: 'task13', label: 'قراءة أذكار الصباح',          icon: '🌤️', points: 15  },
    { id: 'task14', label: 'قراءة أذكار المساء',          icon: '🌇', points: 10  },
    { id: 'task15', label: 'دعاء الاستغفار',             icon: '🕊', points: 10  },
    { id: 'task16', label: 'صلاة الوتر',                icon: '🏹', points: 15 },
    { id: 'task17', label: 'ذكر الله خلال العمل',        icon: '⚙️', points: 10  },
    { id: 'task18', label: 'تسبيحات بعد الصلاة',          icon: '👐', points: 10  },
    { id: 'task19', label: 'صدقة سرية',                 icon: '🙌', points: 15 },
    { id: 'task20', label: 'تعليم شخص شيئاً نافعاً',       icon: '📖', points: 15 },
    { id: 'task21', label: 'المحافظة على الوضوء',        icon: '🚿', points: 5  },
    { id: 'task22', label: 'إهداء كتاب ديني',            icon: '🎁', points: 15 },
    { id: 'task23', label: 'قراءة سيرة النبي ﷺ',          icon: '📜', points: 10 },
    { id: 'task24', label: 'مساعدة فقير',               icon: '🫂', points: 15 },
    { id: 'task25', label: 'الابتسامة في وجه الناس',       icon: '😊', points: 10  },
    { id: 'task26', label: 'كفالة يتيم',                 icon: '🧒', points: 20 },
    { id: 'task27', label: 'تنظيف المسجد',               icon: '🧹', points: 10 },
    { id: 'task28', label: 'قراءة ذكر النوم',             icon: '🛏️', points: 10  },
    { id: 'task29', label: 'قيام الليل',                icon: '🌌', points: 20 },
    { id: 'task30', label: 'التصدق بوقت لعمل تطوعي',      icon: '⏰', points: 15 },
];

// Number of tasks to display each day.  The UI was designed for five tasks,
// so we select five from the pool each day.
const NUM_DAILY_TASKS = 5;

// Prefix used to persist the randomly selected task IDs in localStorage.
const DAILY_SELECTION_KEY_PREFIX = 'zad_daily_task_selection_';

/**
 * Returns the array of tasks for the current day.  It will either
 * read an existing selection from localStorage or pick a fresh random
 * subset of tasks from the ALL_TASKS pool and persist the IDs for
 * tomorrow's loads.  This ensures tasks remain stable within the same
 * day but vary across days.
 */
function getDailyTasks() {
    const todayKey = new Date().toISOString().slice(0, 10);
    const storageKey = `${DAILY_SELECTION_KEY_PREFIX}${todayKey}`;
    try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            const ids = JSON.parse(stored);
            const selected = ids
                .map(id => ALL_TASKS.find(task => task.id === id))
                .filter(Boolean);
            // If for some reason stored IDs are invalid or empty, fall back to fresh selection.
            if (selected.length === NUM_DAILY_TASKS) {
                return selected;
            }
        }
    } catch (err) {
        // ignore parse errors and fall through to generate new tasks
    }
    // Generate a new random selection
    const shuffled = ALL_TASKS.slice().sort(() => 0.5 - Math.random());
    const chosen = shuffled.slice(0, NUM_DAILY_TASKS);
    const ids = chosen.map(t => t.id);
    localStorage.setItem(storageKey, JSON.stringify(ids));
    return chosen;
}

const STREAK_THRESHOLD = 3; // min tasks to count as a completed day

const LEVELS = [
    { min: 0, max: 49, label: 'بداية طيبة' },
    { min: 50, max: 99, label: 'ماشي صح' },
    { min: 100, max: 149, label: 'ممتاز' },
    { min: 150, max: Infinity, label: 'واصل' },
];

const CHARITY_IDEAS = [
    { icon: '📖', text: 'طباعة مصحف وإهداؤه لمسجد أو شخص يحتاجه' },
    { icon: '💧', text: 'المساهمة في حفر بئر لمجتمعٍ محتاج' },
    { icon: '📚', text: 'نشر علم نافع يبقى أجره بعد الممات' },
    { icon: '🎓', text: 'دعم طالب علم لإتمام دراسته الشرعية' },
    { icon: '🌳', text: 'زرع شجرة، فكل طائر يأكل منها صدقة' },
    { icon: '🏥', text: 'التبرع لمستشفى أو مركز طبي خيري' },
    { icon: '🍞', text: 'إطعام أسرة فقيرة وجبة يومياً في رمضان' },
];

/* ════════════════════════════════════════════════════════════
   UTILITIES
════════════════════════════════════════════════════════════ */

/* ── Toast queue: max 1 visible at a time, auto-hide 1500ms ── */
const _toastQueue = [];
const TOAST_MAX = 1;
const TOAST_DELAY = 1500;

/**
 * Show a brief, auto-dismissing toast.
 * Max 2 toasts visible simultaneously. Excess are dismissed first.
 * @param {string} msg    – Arabic text
 * @param {string} [type] – 'success' | 'info' | 'warning'
 */
function showToast(msg, type = 'success') {
    const container = document.getElementById('toast-container');

    // If at limit, dismiss the oldest toast immediately
    while (_toastQueue.length >= TOAST_MAX) {
        const oldest = _toastQueue.shift();
        if (oldest) {
            clearTimeout(oldest.dataset.timer);
            _dismissToast(oldest);
        }
    }

    const colorClass = type === 'success' ? 'toast-success'
        : type === 'warning' ? 'toast-warning'
            : 'toast-info';

    const toastEl = document.createElement('div');
    toastEl.className = `zad-toast ${colorClass}`;
    toastEl.setAttribute('role', 'status');
    toastEl.setAttribute('aria-live', 'polite');
    toastEl.innerHTML = `<span class="zad-toast-msg">${msg}</span>`;

    container.appendChild(toastEl);
    _toastQueue.push(toastEl);

    // Trigger enter animation on next frame
    requestAnimationFrame(() => toastEl.classList.add('zad-toast-show'));

    // Auto-hide after delay (1500ms max)
    const timer = setTimeout(() => _dismissToast(toastEl), TOAST_DELAY);
    toastEl.dataset.timer = timer;
}

function _dismissToast(toastEl) {
    clearTimeout(toastEl.dataset.timer);
    toastEl.classList.remove('zad-toast-show');
    toastEl.classList.add('zad-toast-hide');
    toastEl.addEventListener('animationend', () => {
        toastEl.remove();
        const idx = _toastQueue.indexOf(toastEl);
        if (idx !== -1) _toastQueue.splice(idx, 1);
    }, { once: true });
}

/**
 * Play a subtle click sound (if available in /assets/audio/click.mp3).
 */
function playClickSound() {
    try {
        const audio = new Audio('./assets/audio/click.mp3');
        audio.volume = 0.25;
        audio.play().catch(() => { }); // silently ignore if not available
    } catch (_) { }
}

/**
 * Resolve current level label based on total points.
 */
function getLevel(points) {
    return LEVELS.find(l => points >= l.min && points <= l.max) || LEVELS[0];
}

/*
 * Challenge configuration
 *
 * The Ramadan challenge runs over the month of Ramadan.  It ends at
 * midnight on 20‑03‑2026, which means the final active day is
 * 19‑03‑2026.  This yields a 30‑day challenge window when counting
 * from the first day of Ramadan (18‑02‑2026).
 *
 * After the end date the user can no longer complete tasks or earn
 * additional points.  The tasks section will display a celebratory
 * message instead of action buttons.  Streaks and existing points
 * remain visible for historical interest.
 */
const CHALLENGE_END_DATE = new Date('2026-03-20');
// Normalise to midnight so comparisons ignore time of day
CHALLENGE_END_DATE.setHours(0, 0, 0, 0);

function isChallengeActive() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today < CHALLENGE_END_DATE;
}

/* ════════════════════════════════════════════════════════════
   RENDER: DAILY CONTENT
════════════════════════════════════════════════════════════ */

function renderDailyContent() {
    const { aya, dhikr, reminder } = DailyContent.getToday();

    // آية اليوم
    document.getElementById('aya-text').textContent = aya.text;
    document.getElementById('aya-source').textContent = aya.source;

    // ذكر اليوم
    document.getElementById('dhikr-text').textContent = dhikr.text;
    document.getElementById('dhikr-count').textContent = dhikr.count;

    // تذكير اليوم
    document.getElementById('reminder-text').textContent = reminder;
}

/* ════════════════════════════════════════════════════════════
   RENDER: ADHKAR ACCORDION
════════════════════════════════════════════════════════════ */

function buildAdhkarItems(list) {
    return list.map((item, idx) => `
    <div class="adhkar-item d-flex align-items-start gap-3 p-3 mb-2 rounded-3">
      <span class="adhkar-num">${idx + 1}</span>
      <div class="flex-grow-1">
        <p class="adhkar-item-text mb-1">${item.text}</p>
        <span class="badge adhkar-count-badge">${item.count}</span>
      </div>
    </div>
  `).join('');
}

function renderAdhkar() {
    document.getElementById('morning-adhkar-list').innerHTML =
        buildAdhkarItems(Adhkar.morningAdhkar);
    document.getElementById('evening-adhkar-list').innerHTML =
        buildAdhkarItems(Adhkar.eveningAdhkar);
    document.getElementById('sleep-adhkar-list').innerHTML =
        buildAdhkarItems(Adhkar.sleepAdhkar);
}

/* ════════════════════════════════════════════════════════════
   MODAL: ADHKAR POPUP
════════════════════════════════════════════════════════════ */

/**
 * Open the adhkar modal with the specified category.
 * @param {string} category 'morning' | 'evening' | 'sleep'
 */
function openAdhkarModal(category) {
    let title = '';
    let list = [];
    switch (category) {
        case 'morning':
            title = 'أذكار الصباح';
            list = Adhkar.morningAdhkar;
            break;
        case 'evening':
            title = 'أذكار المساء';
            list = Adhkar.eveningAdhkar;
            break;
        case 'sleep':
            title = 'أذكار النوم';
            list = Adhkar.sleepAdhkar;
            break;
        default:
            title = 'أذكار';
            list = [];
    }
    // Set modal title and body
    const titleEl = document.getElementById('adhkar-modal-label');
    const bodyEl = document.getElementById('adhkar-modal-body');
    if (titleEl) titleEl.textContent = title;
    if (bodyEl) bodyEl.innerHTML = buildAdhkarItems(list);
    // Show the modal using Bootstrap
    const modalEl = document.getElementById('adhkar-modal');
    if (modalEl) {
        const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
        modalInstance.show();
    }
}

/* ════════════════════════════════════════════════════════════
   DISPLAY: ADHKAR INLINE BELOW SECTION HEADING
════════════════════════════════════════════════════════════ */
/**
 * Render the selected adhkar list inline within the adhkar section.
 * Instead of pushing the list to the bottom of the page, we inject
 * it into the #adhkar-display container just below the section
 * heading.  The container is initially hidden via d-none and
 * revealed when populated.  Passing an unknown category clears
 * the display.
 *
 * @param {string} category 'morning' | 'evening' | 'sleep'
 */
function renderAdhkarDisplay(category) {
    const display = document.getElementById('adhkar-display');
    if (!display) return;
    let title = '';
    let list = [];
    switch (category) {
        case 'morning':
            title = 'أذكار الصباح';
            list = Adhkar.morningAdhkar;
            break;
        case 'evening':
            title = 'أذكار المساء';
            list = Adhkar.eveningAdhkar;
            break;
        case 'sleep':
            title = 'أذكار النوم';
            list = Adhkar.sleepAdhkar;
            break;
        default:
            // Unknown category: clear any existing content and hide
            display.innerHTML = '';
            display.classList.add('d-none');
            return;
    }
    // Build HTML with heading and items
    let html = `<h3 class="adhkar-display-title mb-3">${title}</h3>`;
    html += buildAdhkarItems(list);
    display.innerHTML = html;
    display.classList.remove('d-none');
    // Optionally scroll into view when a list is rendered
    display.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ════════════════════════════════════════════════════════════
   RENDER: CHARITY IDEAS
════════════════════════════════════════════════════════════ */

function renderCharity() {
    const container = document.getElementById('charity-list');
    container.innerHTML = CHARITY_IDEAS.map(idea => `
    <div class="col-12 col-sm-6 col-lg-4">
      <div class="charity-card d-flex align-items-center gap-3 p-3 rounded-3 h-100">
        <span class="charity-icon">${idea.icon}</span>
        <p class="charity-text mb-0">${idea.text}</p>
      </div>
    </div>
  `).join('');
}

/* ════════════════════════════════════════════════════════════
   RENDER: TASKS
════════════════════════════════════════════════════════════ */

function renderTasks() {
    const container = document.getElementById('tasks-container');

    // If the challenge period has ended, display a celebratory message
    // and skip rendering interactive tasks.  This prevents further
    // points from being earned and clearly signals the end of Ramadan.
    if (!isChallengeActive()) {
        container.innerHTML = `
      <div class="alert alert-success text-center py-4 rounded-3" role="alert">
        🎉 تهانينا! لقد انتهى تحدي رمضان لهذا العام. عيد مبارك 🌙
      </div>
    `;
        return;
    }

    const completedIDs = Storage.getCompletedTaskIDs();

    // Fetch the tasks for today from the dynamic daily pool rather than
    // rendering the full static list.  This ensures variety between
    // days while preserving the same set during a single day.
    const todayTasks = getDailyTasks();

    container.innerHTML = todayTasks.map(task => {
        const done = completedIDs.has(task.id);
        return `
      <div class="task-card ${done ? 'task-done' : ''}" id="task-card-${task.id}">
        <div class="task-info d-flex align-items-center gap-3">
          <span class="task-icon">${task.icon}</span>
          <span class="task-label">${task.label}</span>
        </div>
        <div class="task-meta d-flex align-items-center gap-2">
          <span class="task-points-badge">+${task.points} رصيد</span>
          <button
            class="btn task-btn ${done ? 'task-btn-done' : 'task-btn-active'}"
            id="btn-task-${task.id}"
            data-task-id="${task.id}"
            data-task-points="${task.points}"
            data-task-label="${task.label}"
            ${done ? 'disabled aria-disabled="true"' : ''}
            aria-label="إتمام ${task.label}"
          >
            ${done ? '✔ تمّ' : 'إتمام'}
          </button>
        </div>
      </div>
    `;
    }).join('');

    // Attach listeners on non-done tasks
    container.querySelectorAll('.task-btn:not([disabled])').forEach(btn => {
        btn.addEventListener('click', handleTaskComplete);
    });
}

/* ════════════════════════════════════════════════════════════
   HANDLE: TASK COMPLETION  (strict once-per-day logic)
════════════════════════════════════════════════════════════ */

function handleTaskComplete(e) {
    const btn = e.currentTarget;
    const taskId = btn.dataset.taskId;
    const points = parseInt(btn.dataset.taskPoints, 10);
    const label = btn.dataset.taskLabel;

    // Guard: if the challenge has ended, prevent any further
    // completions.  Inform the user and return early.  This ensures
    // points cannot be added after the specified Ramadan window.
    if (!isChallengeActive()) {
        showToast('انتهى التحدي! اليوم عيد ولا يمكن إضافة المزيد من النقاط.', 'info');
        return;
    }

    // ── Guard: already completed today (belt-and-suspenders) ──
    if (!Storage.isTaskPending(taskId)) {
        showToast('هذه المهمة أُنجزت مسبقاً اليوم 👍', 'info');
        return;
    }

    // ── Persist completion for today; returns false if duplicate ──
    const saved = Storage.completeTask(taskId);
    if (!saved) {
        showToast('هذه المهمة أُنجزت مسبقاً اليوم 👍', 'info');
        return;
    }

    // ── Add points (only here, never on load) ──
    const newTotal = Storage.addPoints(points);

    // ── Check for newly-unlocked rewards ──
    const newRewards = Rewards.checkAndUnlock(newTotal);
    newRewards.forEach(r => {
        setTimeout(() => showToast(`🎁 فتحت جائزة جديدة: ${r.title}`, 'info'), 400);
    });

    // ── Streak: only advance if ≥ threshold tasks done today ──
    const completedCount = Storage.completedTaskCount();
    if (completedCount >= STREAK_THRESHOLD) {
        Storage.tryAdvanceStreak();
    }

    // ── Update UI ──
    playClickSound();
    updateTaskCard(taskId);
    updateScoreboard(newTotal);
    renderRewards(); // refresh lock states
    showToast(`أحسنت! ${label} ✔ (+${points} رصيد)`, 'success');
}

/**
 * Visually mark a task card as completed.
 */
function updateTaskCard(taskId) {
    const card = document.getElementById(`task-card-${taskId}`);
    const btn = document.getElementById(`btn-task-${taskId}`);

    if (!card || !btn) return;

    card.classList.add('task-done');
    btn.textContent = '✔ تمّ';
    btn.disabled = true;
    btn.setAttribute('aria-disabled', 'true');
    btn.classList.remove('task-btn-active');
    btn.classList.add('task-btn-done');
    btn.removeEventListener('click', handleTaskComplete);
}

/* ════════════════════════════════════════════════════════════
   RENDER / UPDATE: SCOREBOARD (points, progress, level, streak)
════════════════════════════════════════════════════════════ */

function updateScoreboard(totalPoints) {
    const level = getLevel(totalPoints);
    const streak = Storage.getStreak();

    // Points number
    document.getElementById('total-points').textContent = totalPoints;

    // Level
    document.getElementById('level-label').textContent = level.label;

    // Streak
    document.getElementById('streak-count').textContent = streak;
    document.getElementById('streak-suffix').textContent =
        streak === 1 ? 'يوم' : (streak <= 10 ? 'أيام' : 'يوماً');

    // Progress bar (cap at 1000 for display)
    // To support a longer Ramadan challenge, the progress bar now caps
    // at 1000 points instead of 250.  This value controls the
    // percentage calculation for both the bar and the circular
    // indicator.  If totalPoints exceeds MAX_DISPLAY, the progress
    // indicator will remain at 100%.
    const MAX_DISPLAY = 1000;
    const pct = Math.min(100, Math.round((totalPoints / MAX_DISPLAY) * 100));
    const bar = document.getElementById('progress-bar');
    bar.style.width = `${pct}%`;
    bar.setAttribute('aria-valuenow', pct);
    bar.textContent = `${pct}%`;

    // SVG circle progress (r=42, circumference ≈ 264)
    const CIRCUMFERENCE = 2 * Math.PI * 42;
    const offset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;
    const circle = document.getElementById('progress-circle-fill');
    if (circle) {
        circle.style.strokeDashoffset = offset;
        circle.style.strokeDasharray = CIRCUMFERENCE;
    }
    const circleLabel = document.getElementById('circle-pct');
    if (circleLabel) circleLabel.textContent = `${pct}%`;
}

/* ════════════════════════════════════════════════════════════
   RENDER: REWARDS GRID
════════════════════════════════════════════════════════════ */

function renderRewards() {
    const container = document.getElementById('rewards-grid');
    const annotated = Rewards.getAllAnnotated();

    container.innerHTML = annotated.map(r => `
    <div class="col-6 col-md-4">
      <div class="reward-card ${r.unlocked ? 'reward-unlocked' : 'reward-locked'}"
           role="${r.unlocked ? 'button' : 'presentation'}"
           tabindex="${r.unlocked ? '0' : '-1'}"
           ${r.unlocked
            ? `data-bs-toggle="modal" data-bs-target="#reward-modal"
                data-reward-content="${encodeURIComponent(r.content)}"
                data-reward-title="${encodeURIComponent(r.title)}"
                aria-label="فتح جائزة: ${r.title}"`
            : 'aria-hidden="true"'}>
        <div class="reward-icon">${r.unlocked ? r.icon : '🔒'}</div>
        <div class="reward-threshold">${r.threshold} رصيد</div>
        <div class="reward-title-card">${r.unlocked ? r.title : 'مقفل'}</div>
      </div>
    </div>
  `).join('');

    // Re-attach modal content on card click
    container.querySelectorAll('.reward-unlocked').forEach(card => {
        card.addEventListener('click', () => {
            const title = decodeURIComponent(card.dataset.rewardTitle || '');
            const content = decodeURIComponent(card.dataset.rewardContent || '');
            document.getElementById('reward-modal-label').textContent = title;
            document.getElementById('reward-modal-body').innerHTML = content;
        });
        card.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') card.click();
        });
    });
}

/* ════════════════════════════════════════════════════════════
   HERO: PARALLAX MOUSE EFFECT
════════════════════════════════════════════════════════════ */

function initHeroParallax() {
    const hero = document.getElementById('hero');
    if (!hero) return;

    // Respect reduced-motion preference
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    let ticking = false;

    hero.addEventListener('mousemove', (e) => {
        if (ticking) return;
        ticking = true;

        requestAnimationFrame(() => {
            const rect = hero.getBoundingClientRect();
            const xPct = (e.clientX - rect.left) / rect.width - 0.5; // −0.5 … +0.5
            const yPct = (e.clientY - rect.top) / rect.height - 0.5;

            const translateX = (xPct * 18).toFixed(2); // max 9px shift
            const translateY = (yPct * 10).toFixed(2);

            hero.style.backgroundPosition =
                `calc(50% + ${translateX}px) calc(50% + ${translateY}px)`;

            ticking = false;
        });
    });

    hero.addEventListener('mouseleave', () => {
        hero.style.transition = 'background-position 0.8s ease';
        hero.style.backgroundPosition = '50% 50%';
        setTimeout(() => (hero.style.transition = ''), 800);
    });
}

/* ════════════════════════════════════════════════════════════
   STREAK MISSED-DAY BANNER
════════════════════════════════════════════════════════════ */

function showMissedDayBanner() {
    const lastDate = Storage.getLastCompletedDate();
    if (!lastDate || lastDate === Storage.TODAY) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    // If they missed at least one day (not yesterday, not today)
    if (lastDate !== yesterdayStr && lastDate !== Storage.TODAY) {
        const banner = document.getElementById('streak-break-banner');
        if (banner) banner.classList.remove('d-none');
    }
}

/* ════════════════════════════════════════════════════════════
   INIT
════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Audit streak before any rendering (detect missed days)
    Storage.auditStreakOnLoad();

    // 2. Render all sections
    renderDailyContent();
    renderAdhkar();
    renderCharity();
    renderTasks();
    updateScoreboard(Storage.getTotalPoints());
    renderRewards();
    showMissedDayBanner();

    // 3. Hero parallax
    initHeroParallax();

    // 4. Gift modal button
    const giftBtn = document.getElementById('gift-btn');
    if (giftBtn) {
        giftBtn.addEventListener('click', () => {
            const modal = new bootstrap.Modal(document.getElementById('gift-modal'));
            modal.show();
        });
    }

    // 5. Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // 6. Bind adhkar triggers
    // Each adhkar trigger renders the appropriate list inline under
    // the adhkar heading instead of using a modal.  We prevent the
    // default behaviour and stop propagation to ensure Bootstrap’s
    // accordion/collapse does not attempt to toggle the hidden
    // sections.  Unknown categories clear the display.
    document.querySelectorAll('.adhkar-trigger').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const category = btn.getAttribute('data-category');
            renderAdhkarDisplay(category || '');
        });
    });

});
