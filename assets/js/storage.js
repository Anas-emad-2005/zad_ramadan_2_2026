/**
 * storage.js
 * Handles all LocalStorage read/write for زاد رمضان.
 * Keys:
 *   zad_total_points           – cumulative, never reset
 *   zad_streak                 – day streak count
 *   zad_last_completed_date    – ISO date of last day with ≥3 tasks done
 *   zad_daily_tasks_YYYY-MM-DD – completed task IDs for that day
 *   zad_unlocked_rewards       – array of unlocked reward IDs, never reset
 */

'use strict';

const Storage = (() => {

  /* ── Key helpers ─────────────────────────────────────────── */

  const TODAY = new Date().toISOString().slice(0, 10);

  const KEYS = {
    TOTAL_POINTS      : 'zad_total_points',
    STREAK            : 'zad_streak',
    LAST_COMPLETED    : 'zad_last_completed_date',
    DAILY_TASKS       : `zad_daily_tasks_${TODAY}`,
    UNLOCKED_REWARDS  : 'zad_unlocked_rewards',
  };

  /* ── Generic helpers ─────────────────────────────────────── */

  function getJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function setJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  /* ── Points ──────────────────────────────────────────────── */

  function getTotalPoints() {
    return getJSON(KEYS.TOTAL_POINTS, 0);
  }

  /**
   * Add points. Points are ONLY added externally on first task completion.
   * This function does NOT check duplication – the task layer does.
   */
  function addPoints(amount) {
    const current = getTotalPoints();
    setJSON(KEYS.TOTAL_POINTS, current + amount);
    return current + amount;
  }

  /* ── Daily tasks ─────────────────────────────────────────── */

  /**
   * Returns the Set of completed task IDs for today.
   * Old daily keys are automatically orphaned (never read again),
   * so they don't pollute storage meaningfully.
   */
  function getCompletedTaskIDs() {
    return new Set(getJSON(KEYS.DAILY_TASKS, []));
  }

  /**
   * Returns true if this task hasn't been completed today yet.
   */
  function isTaskPending(taskId) {
    return !getCompletedTaskIDs().has(taskId);
  }

  /**
   * Mark a task as completed for today.
   * Returns false (no-op) if already completed.
   */
  function completeTask(taskId) {
    const completed = getCompletedTaskIDs();
    if (completed.has(taskId)) return false; // already done – guard
    completed.add(taskId);
    setJSON(KEYS.DAILY_TASKS, [...completed]);
    return true;
  }

  /**
   * How many tasks have been completed today.
   */
  function completedTaskCount() {
    return getCompletedTaskIDs().size;
  }

  /* ── Streak ──────────────────────────────────────────────── */

  function getStreak() {
    return getJSON(KEYS.STREAK, 0);
  }

  function getLastCompletedDate() {
    return getJSON(KEYS.LAST_COMPLETED, null);
  }

  /**
   * Attempt to advance the streak.
   * Rules:
   *  - Only triggers when today's completed tasks cross the threshold (≥3).
   *  - If last completed date === today  → already counted, skip.
   *  - If last completed date === yesterday → increment streak.
   *  - Any other case (missed day, null, skipped) → reset to 1.
   *  - Never increments on page reload (today === lastCompleted guard).
   */
  function tryAdvanceStreak() {
    const lastDate = getLastCompletedDate();

    // Already handled today – do nothing.
    if (lastDate === TODAY) return getStreak();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    let newStreak;
    if (lastDate === yesterdayStr) {
      // Exact consecutive day – extend streak.
      newStreak = getStreak() + 1;
    } else {
      // Missed at least one day or first time.
      newStreak = 1;
    }

    setJSON(KEYS.STREAK, newStreak);
    setJSON(KEYS.LAST_COMPLETED, TODAY);
    return newStreak;
  }

  /**
   * Reset streak to 0 if last completed date is not today and not yesterday.
   * Called on page load so a missed day is immediately reflected.
   * Does NOT touch points or rewards.
   */
  function auditStreakOnLoad() {
    const lastDate = getLastCompletedDate();
    if (!lastDate) return; // first visit

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    const isSameDay   = lastDate === TODAY;
    const isYesterday = lastDate === yesterdayStr;

    if (!isSameDay && !isYesterday) {
      // User missed at least one day – streak is broken.
      setJSON(KEYS.STREAK, 0);
    }
  }

  /* ── Rewards ─────────────────────────────────────────────── */

  function getUnlockedRewards() {
    return new Set(getJSON(KEYS.UNLOCKED_REWARDS, []));
  }

  function unlockReward(rewardId) {
    const unlocked = getUnlockedRewards();
    if (unlocked.has(rewardId)) return false;
    unlocked.add(rewardId);
    setJSON(KEYS.UNLOCKED_REWARDS, [...unlocked]);
    return true;
  }

  function isRewardUnlocked(rewardId) {
    return getUnlockedRewards().has(rewardId);
  }

  /* ── Public API ──────────────────────────────────────────── */

  return {
    TODAY,
    KEYS,
    getTotalPoints,
    addPoints,
    getCompletedTaskIDs,
    isTaskPending,
    completeTask,
    completedTaskCount,
    getStreak,
    getLastCompletedDate,
    tryAdvanceStreak,
    auditStreakOnLoad,
    getUnlockedRewards,
    unlockReward,
    isRewardUnlocked,
  };

})();
