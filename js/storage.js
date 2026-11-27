// Sauvegarde locale (localStorage) de la progression d'Adrien & des minutes de Switch

const STORAGE_KEY = "dichou_space_marine_ce1_v1";

function getTodayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const DEFAULT_STATE = {
  level: 1,
  xp: 0,
  switchMinutes: 0,
  totalSwitchEarned: 0,
  dailyDate: getTodayKey(),
  dailySwitchEarned: 0,
  totalMonstersDefeated: 0,
  monstersLog: {}, // { grot: 3, nurgling: 1, ... }
  switchHistory: [], // { date, delta, label }
  stats: {
    calcul: { ok: 0, total: 0 },
    multiplia: { ok: 0, total: 0 },
    numeration: { ok: 0, total: 0 },
    grammaire: { ok: 0, total: 0 },
    orthographe: { ok: 0, total: 0 },
    monde: { ok: 0, total: 0 }
  },
  settings: {
    difficulty: "milieu", // debut | milieu | fin
    dailySwitchCap: 45,   // Plafond journalier en minutes (défaut : 45 min/jour)
    soundEnabled: true,
    parentPin: "1992"
  }
};

function syncDailyCounter(st) {
  const today = getTodayKey();
  if (st.dailyDate !== today) {
    st.dailyDate = today;
    st.dailySwitchEarned = 0;
  }
  return st;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    const parsed = JSON.parse(raw);
    const merged = {
      ...structuredClone(DEFAULT_STATE),
      ...parsed,
      stats: { ...structuredClone(DEFAULT_STATE.stats), ...(parsed.stats || {}) },
      settings: { ...structuredClone(DEFAULT_STATE.settings), ...(parsed.settings || {}) },
      monstersLog: { ...(parsed.monstersLog || {}) },
      switchHistory: Array.isArray(parsed.switchHistory) ? parsed.switchHistory : []
    };
    if (merged.settings.parentPin === "1234") {
      merged.settings.parentPin = "1992";
    }
    return syncDailyCounter(merged);
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Impossible de sauvegarder:", e);
  }
}

function resetState() {
  const fresh = structuredClone(DEFAULT_STATE);
  saveState(fresh);
  return fresh;
}
