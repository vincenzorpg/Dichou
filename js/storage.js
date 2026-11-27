// Sauvegarde locale (localStorage) + Synchronisation Cloud Firebase Realtime Database

const STORAGE_KEY = "dichou_space_marine_ce1_v1";
const FIREBASE_DB_URL = "https://dichou-gaming-default-rtdb.europe-west1.firebasedatabase.app/profiles/adrien.json";

function getTodayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const DEFAULT_STATE = {
  updatedAt: 0,
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

function normalizeState(rawObj) {
  if (!rawObj || typeof rawObj !== "object") return structuredClone(DEFAULT_STATE);
  const merged = {
    ...structuredClone(DEFAULT_STATE),
    ...rawObj,
    stats: { ...structuredClone(DEFAULT_STATE.stats), ...(rawObj.stats || {}) },
    settings: { ...structuredClone(DEFAULT_STATE.settings), ...(rawObj.settings || {}) },
    monstersLog: { ...(rawObj.monstersLog || {}) },
    switchHistory: Array.isArray(rawObj.switchHistory) ? rawObj.switchHistory : []
  };
  if (merged.settings.parentPin === "1234") {
    merged.settings.parentPin = "1992";
  }
  return syncDailyCounter(merged);
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    return normalizeState(JSON.parse(raw));
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

let cloudStatusCallback = null;
function setCloudStatusListener(cb) {
  cloudStatusCallback = cb;
}

function notifyCloudStatus(status, detail = "") {
  if (cloudStatusCallback) cloudStatusCallback(status, detail);
}

let pushTimer = null;
async function pushStateToCloud(state) {
  try {
    notifyCloudStatus("syncing", "Enregistrement sur Firebase...");
    const res = await fetch(FIREBASE_DB_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state)
    });
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        notifyCloudStatus("error", "Accès refusé (vérifie les Règles Firebase Realtime DB)");
      } else {
        notifyCloudStatus("error", `Erreur Firebase (${res.status})`);
      }
      return false;
    }
    notifyCloudStatus("ok", "Synchronisé ☁️");
    return true;
  } catch {
    notifyCloudStatus("offline", "Hors-ligne (sauvegardé sur l'appareil)");
    return false;
  }
}

function saveState(state, skipCloud = false) {
  state.updatedAt = Date.now();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Impossible de sauvegarder:", e);
  }
  if (!skipCloud) {
    clearTimeout(pushTimer);
    pushTimer = setTimeout(() => pushStateToCloud(state), 250);
  }
}

function hasProgress(st) {
  return Boolean(
    st && (st.level > 1 || st.xp > 0 || st.totalMonstersDefeated > 0 || st.totalSwitchEarned > 0 || st.switchMinutes > 0)
  );
}

async function syncWithCloud(localState) {
  try {
    notifyCloudStatus("syncing", "Synchronisation...");
    const res = await fetch(FIREBASE_DB_URL, { cache: "no-store" });
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        notifyCloudStatus("error", "Accès refusé (vérifie les Règles Firebase)");
      } else {
        notifyCloudStatus("error", `Erreur Firebase (${res.status})`);
      }
      return { state: localState, changed: false };
    }
    const cloudRaw = await res.json();
    if (!cloudRaw) {
      // Base vide : on pousse seulement si cet appareil a de la progression
      if (hasProgress(localState)) {
        if (!localState.updatedAt) localState.updatedAt = Date.now();
        await pushStateToCloud(localState);
      } else {
        notifyCloudStatus("ok", "Synchronisé ☁️");
      }
      return { state: localState, changed: false };
    }
    const cloudState = normalizeState(cloudRaw);
    const localTs = Number(localState.updatedAt || 0);
    const cloudTs = Number(cloudState.updatedAt || 0);
    const localHas = hasProgress(localState);
    const cloudHas = hasProgress(cloudState);

    // Protège la progression locale contre un profil cloud vide (0 XP)
    if (localHas && !cloudHas) {
      localState.updatedAt = Date.now();
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(localState));
      } catch {}
      await pushStateToCloud(localState);
      return { state: localState, changed: false };
    }

    if (cloudHas && !localHas) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudState));
      } catch {}
      notifyCloudStatus("ok", "Synchronisé ☁️");
      return { state: cloudState, changed: true };
    }

    if (cloudTs > localTs) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudState));
      } catch {}
      notifyCloudStatus("ok", "Synchronisé ☁️");
      return { state: cloudState, changed: true };
    } else if (localTs > cloudTs) {
      await pushStateToCloud(localState);
      return { state: localState, changed: false };
    } else {
      notifyCloudStatus("ok", "Synchronisé ☁️");
      return { state: localState, changed: false };
    }
  } catch {
    notifyCloudStatus("offline", "Mode hors-ligne");
    return { state: localState, changed: false };
  }
}

function resetState() {
  const fresh = structuredClone(DEFAULT_STATE);
  saveState(fresh);
  return fresh;
}
