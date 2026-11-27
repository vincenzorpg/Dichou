// Sauvegarde locale (localStorage) de la progression d'Adrien & des minutes de Switch

const STORAGE_KEY = "dichou_space_marine_ce1_v1";

const DEFAULT_STATE = {
  level: 1,
  xp: 0,
  switchMinutes: 0,
  totalSwitchEarned: 0,
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
    switchMultiplier: 1,  // 1 | 2
    soundEnabled: true,
    parentPin: "1234"
  }
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    const parsed = JSON.parse(raw);
    return {
      ...structuredClone(DEFAULT_STATE),
      ...parsed,
      stats: { ...structuredClone(DEFAULT_STATE.stats), ...(parsed.stats || {}) },
      settings: { ...structuredClone(DEFAULT_STATE.settings), ...(parsed.settings || {}) },
      monstersLog: { ...(parsed.monstersLog || {}) },
      switchHistory: Array.isArray(parsed.switchHistory) ? parsed.switchHistory : []
    };
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
