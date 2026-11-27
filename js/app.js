// ==========================================
// ÉTAT GLOBAL
// ==========================================
let state = loadState();
sfx.setEnabled(state.settings.soundEnabled);

let battle = {
  planetId: "campagne",
  multTable: 2,
  monster: null,
  monsterHp: 3,
  monsterMaxHp: 3,
  heroShield: 3,
  combo: 0,
  question: null,
  locked: false,
  pendingLevelUp: null // { newLevel, newArmorUnlocked, armor }
};

// ==========================================
// UTILITAIRES DOM
// ==========================================
const $ = (id) => document.getElementById(id);

function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  $(screenId).classList.add("active");
}

function openModal(id) {
  $(id).classList.add("open");
}

function closeModal(id) {
  $(id).classList.remove("open");
}

function launchConfetti(count = 36) {
  const colors = ["#facc15", "#38bdf8", "#22c55e", "#f97316", "#ec4899", "#a855f7"];
  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.className = "confetti-piece";
    el.style.left = `${Math.random() * 100}vw`;
    el.style.background = pick(colors);
    el.style.animationDuration = `${1.6 + Math.random() * 1.4}s`;
    el.style.animationDelay = `${Math.random() * 0.35}s`;
    el.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3400);
  }
}

// ==========================================
// RENDU HUD & ACCUEIL
// ==========================================
function renderHUD() {
  syncDailyCounter(state);
  const armor = getArmorForLevel(state.level);
  const xpNeeded = XP_PER_LEVEL(state.level);
  const pct = Math.min(100, Math.round((state.xp / xpNeeded) * 100));
  const dailyCap = state.settings.dailySwitchCap || 45;

  $("hud-avatar").src = armor.image;
  $("hud-hero-name").textContent = armor.title;
  $("hud-level").textContent = `Niv. ${state.level}`;
  $("hud-xp-fill").style.width = `${pct}%`;
  $("hud-xp-text").textContent = `${state.xp} / ${xpNeeded} XP`;
  $("hud-switch-min").textContent = state.switchMinutes;
  $("hud-switch-daily").textContent = `(auj. ${state.dailySwitchEarned}/${dailyCap})`;
  $("btn-sound").textContent = state.settings.soundEnabled ? "🔊" : "🔇";

  // Home Showcase
  $("home-armor-tier").textContent = `Armure Niveau ${armor.tier} / ${ARMORS.length}`;
  $("home-hero-img").src = armor.image;
  $("home-armor-name").textContent = armor.name;
  $("home-weapon-tag").textContent = `⚔️ ${armor.weapon}`;
  $("home-defeated").textContent = state.totalMonstersDefeated;
  $("home-total-switch").textContent = `${state.totalSwitchEarned} min`;

  const nextArmor = ARMORS.find((a) => a.minLevel > state.level);
  if (nextArmor) {
    const totalXpNow = getTotalXpForLevel(state.level) + state.xp;
    const totalXpTarget = getTotalXpForLevel(nextArmor.minLevel);
    const remainingXp = Math.max(0, totalXpTarget - totalXpNow);
    $("home-next-armor").textContent = `🔒 Prochaine armure au Niveau ${nextArmor.minLevel} : ${nextArmor.name} (encore ${remainingXp.toLocaleString("fr-FR")} XP !)`;
  } else {
    $("home-next-armor").textContent = "👑 Armure Ultime débloquée ! Tu es le Primarque du CE1 !";
  }
}

function renderPlanets() {
  const grid = $("planets-grid");
  grid.innerHTML = "";
  PLANETS.forEach((p) => {
    const btn = document.createElement("button");
    btn.className = "planet-card";
    btn.style.background = p.gradient;
    btn.innerHTML = `
      <div class="planet-top">
        <span class="planet-icon">${p.icon}</span>
        <span class="planet-badge">${p.badge}</span>
      </div>
      <div class="planet-name">${p.name}</div>
      <div class="planet-sub">${p.subtitle}</div>
    `;
    btn.addEventListener("click", () => {
      sfx.click();
      startBattle(p.id, false);
    });
    grid.appendChild(btn);
  });
}

// ==========================================
// MOTEUR DE COMBAT
// ==========================================
function chooseMonster(forceBoss = false) {
  if (forceBoss) {
    return MONSTERS.find((m) => m.isBoss);
  }
  const regular = MONSTERS.filter((m) => !m.isBoss && m.minLevel <= state.level + 1);
  return pick(regular.length ? regular : MONSTERS.filter((m) => !m.isBoss));
}

function startBattle(planetId, forceBoss = false) {
  syncDailyCounter(state);
  const planet = PLANETS.find((p) => p.id === planetId) || PLANETS[0];
  const monster = chooseMonster(forceBoss);
  const armor = getArmorForLevel(state.level);
  const dailyCap = state.settings.dailySwitchCap || 45;
  const remainingToday = Math.max(0, dailyCap - state.dailySwitchEarned);
  const rewardMin = Math.min(monster.switchMin, remainingToday);

  battle = {
    planetId,
    multTable: battle.multTable || 2,
    monster,
    monsterHp: monster.hp,
    monsterMaxHp: monster.hp,
    heroShield: 3,
    combo: 0,
    question: null,
    locked: false,
    pendingLevelUp: null
  };

  $("battle-mission-name").textContent = `${planet.icon} ${planet.name}`;
  $("battle-hero-img").src = armor.image;
  $("battle-hero-name").textContent = `${armor.title} (${armor.name})`;
  $("hero-bubble").textContent = armor.battleCry;

  const mImg = $("battle-monster-img");
  mImg.src = monster.image;
  mImg.classList.toggle("flip-x", Boolean(monster.flipX));
  $("battle-monster-name").textContent = monster.name;
  $("monster-bubble").textContent = pick(monster.taunts);
  $("monster-frame").classList.toggle("boss-frame", Boolean(monster.isBoss));
  $("monster-reward-chip").textContent =
    rewardMin > 0
      ? `🎮 Récompense : +${rewardMin} min Switch`
      : `⭐ Plafond Switch atteint (Mode XP Armure !)`;

  const isMult = planetId === "multiplia";
  $("mult-toolbar").style.display = isMult ? "flex" : "none";
  $("mult-cheatsheet").style.display = "none";
  if (isMult) renderMultCheatsheet();

  updateBattleBars();
  showScreen("screen-battle");
  loadNextQuestion();
}

function renderMultCheatsheet() {
  const t = battle.multTable || 2;
  const items = [];
  for (let i = 1; i <= 10; i++) {
    items.push(`<span>${i} × ${t} = ${i * t}</span>`);
  }
  $("mult-cheatsheet").innerHTML = items.join("");
}

function updateBattleBars() {
  // Hearts for monster
  let mHearts = "";
  for (let i = 0; i < battle.monsterMaxHp; i++) {
    mHearts += i < battle.monsterHp ? "❤️" : "🖤";
  }
  $("monster-hp").textContent = mHearts;

  // Shields for Adrien (never game over, recharges automatically!)
  let shields = "";
  for (let i = 0; i < 3; i++) {
    shields += i < battle.heroShield ? "🛡️" : "💠";
  }
  $("hero-shields").textContent = shields;

  // Combo
  const comboEl = $("battle-combo");
  if (battle.combo >= 2) {
    comboEl.textContent = "🔥 SUPER ATTAQUE PRÊTE ! (x2 Dégâts)";
    comboEl.classList.add("super-ready");
    $("question-super-hint").textContent = "⚡ Bonne réponse = DOUBLE DÉGÂTS !";
  } else {
    comboEl.textContent = `⚡ Combo : ${battle.combo} / 2`;
    comboEl.classList.remove("super-ready");
    $("question-super-hint").textContent = "";
  }
}

function loadNextQuestion() {
  if (document.activeElement && document.activeElement.blur) {
    document.activeElement.blur();
  }
  battle.locked = false;
  battle.question = generateQuestion(battle.planetId, state.settings.difficulty, { multTable: battle.multTable });

  $("question-tag").textContent = battle.question.tag;
  $("question-prompt").textContent = battle.question.prompt;
  $("question-visual").innerHTML = battle.question.visual || "";

  const banner = $("feedback-banner");
  banner.className = "feedback-banner";
  $("btn-next-question").style.display = "none";

  const grid = $("choices-grid");
  grid.innerHTML = "";
  battle.question.choices.forEach((choice) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = choice;
    btn.addEventListener("click", () => handleAnswer(choice, btn));
    grid.appendChild(btn);
  });
}

function fireProjectile(isSuper) {
  const armor = getArmorForLevel(state.level);
  const fx = $("fx-layer");

  const proj = document.createElement("div");
  proj.className = "projectile";
  proj.textContent = isSuper ? "🌟💥" : armor.projectile;
  proj.style.color = isSuper ? "#facc15" : armor.projectileColor;
  fx.appendChild(proj);
  setTimeout(() => proj.remove(), 500);

  const heroFrame = $("hero-frame");
  heroFrame.classList.remove("attack-lunge");
  void heroFrame.offsetWidth;
  heroFrame.classList.add("attack-lunge");

  setTimeout(() => {
    const mFrame = $("monster-frame");
    mFrame.classList.remove("hit-shake");
    void mFrame.offsetWidth;
    mFrame.classList.add("hit-shake");

    const dmg = document.createElement("div");
    dmg.className = "float-dmg";
    dmg.textContent = isSuper ? "SUPER ! -2 PV 💥" : "-1 PV !";
    fx.appendChild(dmg);
    setTimeout(() => dmg.remove(), 950);
  }, 240);
}

function handleAnswer(selected, btnEl) {
  if (battle.locked) return;
  battle.locked = true;

  const q = battle.question;
  const isCorrect = selected === q.answer;

  // Record educational stats
  if (state.stats[q.subject]) {
    state.stats[q.subject].total += 1;
    if (isCorrect) state.stats[q.subject].ok += 1;
    saveState(state);
  }

  // Highlight buttons
  document.querySelectorAll(".choice-btn").forEach((b) => {
    b.disabled = true;
    if (b.textContent === q.answer) b.classList.add("correct");
  });

  const banner = $("feedback-banner");
  const fbText = $("feedback-text");

  if (isCorrect) {
    const isSuper = battle.combo >= 2;
    const damage = isSuper ? 2 : 1;
    battle.combo = isSuper ? 0 : battle.combo + 1;
    battle.monsterHp = Math.max(0, battle.monsterHp - damage);

    if (isSuper) {
      sfx.superAttack();
    } else {
      sfx.laser();
      setTimeout(() => sfx.hit(), 220);
    }

    fireProjectile(isSuper);
    $("hero-bubble").textContent = isSuper ? "SUPER ATTAQUE DE L'EMPEREUR ! 🌟" : pick(ADRIEN_PRAISES);
    $("monster-bubble").textContent = battle.monsterHp === 0 ? battle.monster.defeatLine : pick(battle.monster.hitLines);

    banner.className = "feedback-banner show ok";
    fbText.textContent = `✅ Bravo ! ${q.hint}`;
    updateBattleBars();

    setTimeout(() => {
      if (battle.monsterHp <= 0) {
        handleVictory();
      } else {
        loadNextQuestion();
      }
    }, 1250);
  } else {
    btnEl.classList.add("wrong");
    sfx.boing();
    battle.combo = 0;
    battle.heroShield = battle.heroShield > 1 ? battle.heroShield - 1 : 3; // Bouclier qui se recharge (jamais punitif !)

    const mFrame = $("monster-frame");
    mFrame.classList.remove("monster-lunge");
    void mFrame.offsetWidth;
    mFrame.classList.add("monster-lunge");

    $("monster-bubble").textContent = pick(battle.monster.missLines);
    $("hero-bubble").textContent = "Pas grave ! Mon bouclier tient bon, je retiens la règle !";

    banner.className = "feedback-banner show oops";
    fbText.textContent = `💡 Presque ! ${q.hint}`;
    $("btn-next-question").style.display = "inline-flex";
    updateBattleBars();
  }
}

function handleVictory() {
  sfx.victory();
  setTimeout(() => sfx.switchCoin(), 350);
  launchConfetti(32);

  syncDailyCounter(state);
  const m = battle.monster;
  const oldArmor = getArmorForLevel(state.level);
  const dailyCap = state.settings.dailySwitchCap || 45;
  const remainingToday = Math.max(0, dailyCap - state.dailySwitchEarned);
  const gainedMin = Math.min(m.switchMin, remainingToday);
  const gainedXp = m.xp;

  // Update state
  if (gainedMin > 0) {
    state.switchMinutes += gainedMin;
    state.totalSwitchEarned += gainedMin;
    state.dailySwitchEarned += gainedMin;
    state.switchHistory.unshift({
      date: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      delta: `+${gainedMin} min`,
      label: `Victoire : ${m.name}`
    });
    state.switchHistory = state.switchHistory.slice(0, 30);
  }
  state.totalMonstersDefeated += 1;
  state.monstersLog[m.id] = (state.monstersLog[m.id] || 0) + 1;

  // XP & Level up check
  state.xp += gainedXp;
  let leveledUp = false;
  while (state.xp >= XP_PER_LEVEL(state.level)) {
    state.xp -= XP_PER_LEVEL(state.level);
    state.level += 1;
    leveledUp = true;
  }

  const newArmor = getArmorForLevel(state.level);
  const unlockedNewArmor = newArmor.tier > oldArmor.tier;

  if (leveledUp) {
    battle.pendingLevelUp = {
      newLevel: state.level,
      unlockedNewArmor,
      armor: newArmor
    };
  }

  saveState(state);
  renderHUD();

  // Animate Switch pill
  const pill = $("switch-pill");
  pill.classList.remove("pop");
  void pill.offsetWidth;
  pill.classList.add("pop");

  // Show victory modal
  const reachedCap = state.dailySwitchEarned >= dailyCap;
  $("victory-monster-line").textContent = reachedCap
    ? `« ${m.defeatLine} » — 🏆 Bravo ! Tu as atteint tes ${dailyCap} min de Switch du jour ! Continue pour l'XP de ton armure !`
    : `« ${m.defeatLine} »`;
  $("victory-switch").textContent = gainedMin > 0 ? `+${gainedMin} min` : `Max ${dailyCap}m/j`;
  $("victory-xp").textContent = `+${gainedXp} XP`;
  openModal("modal-victory");
}

function maybeShowLevelUp(afterCallback) {
  if (battle.pendingLevelUp) {
    const info = battle.pendingLevelUp;
    battle.pendingLevelUp = null;
    sfx.levelUp();
    launchConfetti(55);

    $("levelup-title").textContent = info.unlockedNewArmor
      ? "🛡️ NOUVELLE ARMURE DÉBLOQUÉE !"
      : `🌟 NIVEAU ${info.newLevel} ATTEINT !`;
    $("levelup-subtitle").textContent = info.unlockedNewArmor
      ? `${info.armor.title} — ${info.armor.name}`
      : `Adrien devient encore plus puissant !`;
    $("levelup-img").src = info.armor.image;
    $("levelup-desc").textContent = info.unlockedNewArmor
      ? `${info.armor.description} Arme : ${info.armor.weapon} !`
      : `Continue de battre des monstres pour débloquer la prochaine armure Space Marine !`;

    $("btn-close-levelup").onclick = () => {
      sfx.click();
      closeModal("modal-levelup");
      if (afterCallback) afterCallback();
    };
    openModal("modal-levelup");
  } else if (afterCallback) {
    afterCallback();
  }
}

// ==========================================
// ARMURERIE & BESTIAIRE
// ==========================================
let galleryTab = "armors";

function renderGallery() {
  const container = $("gallery-content");
  container.innerHTML = "";
  $("tab-armors").classList.toggle("active", galleryTab === "armors");
  $("tab-monsters").classList.toggle("active", galleryTab === "monsters");

  if (galleryTab === "armors") {
    ARMORS.forEach((a) => {
      const unlocked = state.level >= a.minLevel;
      const reqXp = getTotalXpForLevel(a.minLevel);
      const card = document.createElement("div");
      card.className = `gallery-card ${unlocked ? "unlocked" : "locked"}`;
      card.innerHTML = `
        <img src="${a.image}" alt="${a.name}" />
        <h4>${unlocked ? `✅ ${a.name}` : `🔒 Niveau ${a.minLevel}`}</h4>
        <p style="color:#38bdf8; font-weight:700; margin-bottom:4px;">${unlocked ? `⚔️ ${a.weapon}` : `⭐ ${reqXp.toLocaleString("fr-FR")} XP cumulés`}</p>
        <p>${unlocked ? a.description : `Atteins le niveau ${a.minLevel} pour débloquer cette armure !`}</p>
      `;
      container.appendChild(card);
    });
  } else {
    MONSTERS.forEach((m) => {
      const count = state.monstersLog[m.id] || 0;
      const card = document.createElement("div");
      card.className = `gallery-card ${count > 0 ? "unlocked" : ""}`;
      card.innerHTML = `
        <img src="${m.image}" alt="${m.name}" />
        <h4>${m.name}</h4>
        <p style="color:#facc15; font-weight:700; margin-bottom:4px;">🎮 +${m.switchMin} min • Battu ${count} fois</p>
        <p>${m.bio}</p>
      `;
      container.appendChild(card);
    });
  }
}

// ==========================================
// ESPACE PARENTS
// ==========================================
function openParentModal() {
  $("parent-pin-gate").style.display = "block";
  $("parent-dashboard").style.display = "none";
  $("parent-pin-input").value = "";
  $("parent-pin-error").textContent = "";
  openModal("modal-parents");
  setTimeout(() => $("parent-pin-input").focus(), 100);
}

function renderParentDashboard() {
  syncDailyCounter(state);
  const dailyCap = state.settings.dailySwitchCap || 45;
  $("parent-switch-balance").textContent = `${state.switchMinutes} min`;
  $("parent-daily-progress").textContent = `${state.dailySwitchEarned} / ${dailyCap} min`;
  $("setting-difficulty").value = state.settings.difficulty;
  $("setting-daily-cap").value = String(dailyCap);

  // History
  const hist = $("parent-history");
  if (state.switchHistory.length === 0) {
    hist.innerHTML = `<p style="color:#94a3b8;">Aucun mouvement pour le moment.</p>`;
  } else {
    hist.innerHTML = state.switchHistory
      .map(
        (h) => `
        <div class="history-item">
          <span>${h.date} — ${h.label}</span>
          <strong style="color:${h.delta.startsWith("+") ? "#4ade80" : "#f87171"}">${h.delta}</strong>
        </div>`
      )
      .join("");
  }

  // Stats
  const labels = {
    calcul: "➕ Calcul",
    multiplia: "⭐ Tables de multiplication",
    numeration: "⏰ Numération & Heure",
    grammaire: "📖 Grammaire & Conjugaison",
    orthographe: "✏️ Orthographe",
    monde: "🌍 Questionner le Monde"
  };
  const statsEl = $("parent-stats");
  statsEl.innerHTML = Object.entries(labels)
    .map(([key, label]) => {
      const s = state.stats[key] || { ok: 0, total: 0 };
      const pct = s.total > 0 ? Math.round((s.ok / s.total) * 100) : 0;
      return `
        <div class="stat-row">
          <span style="min-width:190px;">${label}</span>
          <div class="stat-bar"><div class="stat-bar-fill" style="width:${pct}%"></div></div>
          <span style="min-width:95px; text-align:right; color:#e2e8f0;">${s.total > 0 ? `${pct}% (${s.ok}/${s.total})` : "—"}</span>
        </div>
      `;
    })
    .join("");
}

function spendSwitchMinutes(amount) {
  const toSpend = amount === "all" ? state.switchMinutes : Math.min(state.switchMinutes, Number(amount));
  if (toSpend <= 0) return;
  state.switchMinutes -= toSpend;
  state.switchHistory.unshift({
    date: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    delta: `-${toSpend} min`,
    label: "Minutes de Switch encaissées"
  });
  saveState(state);
  renderHUD();
  renderParentDashboard();
}

// ==========================================
// ÉVÉNEMENTS
// ==========================================
function bindEvents() {
  $("btn-sound").addEventListener("click", () => {
    state.settings.soundEnabled = !state.settings.soundEnabled;
    sfx.setEnabled(state.settings.soundEnabled);
    saveState(state);
    renderHUD();
    if (state.settings.soundEnabled) sfx.click();
  });

  $("btn-fight-boss").addEventListener("click", () => {
    sfx.click();
    startBattle("campagne", true);
  });

  $("btn-back-home").addEventListener("click", () => {
    sfx.click();
    showScreen("screen-home");
    renderHUD();
  });

  $("btn-next-question").addEventListener("click", () => {
    sfx.click();
    loadNextQuestion();
  });

  // Planète Multiplia : sélecteur de table & aide visuelle
  document.querySelectorAll(".table-pill").forEach((pill) => {
    pill.addEventListener("click", () => {
      sfx.click();
      battle.multTable = Number(pill.dataset.table);
      document.querySelectorAll(".table-pill").forEach((p) => p.classList.toggle("active", p === pill));
      renderMultCheatsheet();
      loadNextQuestion();
    });
  });

  $("btn-toggle-cheatsheet").addEventListener("click", () => {
    sfx.click();
    const cs = $("mult-cheatsheet");
    cs.style.display = cs.style.display === "none" ? "flex" : "none";
  });

  $("btn-next-monster").addEventListener("click", () => {
    sfx.click();
    closeModal("modal-victory");
    maybeShowLevelUp(() => startBattle(battle.planetId, false));
  });

  $("btn-victory-home").addEventListener("click", () => {
    sfx.click();
    closeModal("modal-victory");
    maybeShowLevelUp(() => {
      showScreen("screen-home");
      renderHUD();
    });
  });

  // Gallery
  const openGallery = () => {
    sfx.click();
    renderGallery();
    openModal("modal-gallery");
  };
  $("btn-gallery").addEventListener("click", openGallery);
  $("btn-open-armory-home").addEventListener("click", openGallery);
  $("tab-armors").addEventListener("click", () => {
    galleryTab = "armors";
    renderGallery();
  });
  $("tab-monsters").addEventListener("click", () => {
    galleryTab = "monsters";
    renderGallery();
  });

  // Parents
  $("btn-parents").addEventListener("click", () => {
    sfx.click();
    openParentModal();
  });

  const checkPin = () => {
    const val = $("parent-pin-input").value.trim();
    if (val === state.settings.parentPin) {
      $("parent-pin-gate").style.display = "none";
      $("parent-dashboard").style.display = "block";
      renderParentDashboard();
    } else {
      $("parent-pin-error").textContent = "Code incorrect (code par défaut : 1234)";
    }
  };
  $("btn-unlock-parents").addEventListener("click", checkPin);
  $("parent-pin-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") checkPin();
  });

  document.querySelectorAll("[data-spend]").forEach((btn) => {
    btn.addEventListener("click", () => spendSwitchMinutes(btn.dataset.spend));
  });

  $("btn-add-bonus-5").addEventListener("click", () => {
    state.switchMinutes += 5;
    state.totalSwitchEarned += 5;
    state.switchHistory.unshift({
      date: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      delta: "+5 min",
      label: "Bonus Parents ⭐"
    });
    saveState(state);
    renderHUD();
    renderParentDashboard();
  });

  $("setting-difficulty").addEventListener("change", (e) => {
    state.settings.difficulty = e.target.value;
    saveState(state);
  });

  $("setting-daily-cap").addEventListener("change", (e) => {
    state.settings.dailySwitchCap = Number(e.target.value);
    saveState(state);
    renderHUD();
    renderParentDashboard();
  });

  $("btn-reset-game").addEventListener("click", () => {
    if (confirm("Réinitialiser toute la progression d'Adrien et les minutes de Switch ?")) {
      state = resetState();
      renderHUD();
      renderParentDashboard();
    }
  });

  // Modal close buttons & backdrop click
  document.querySelectorAll(".modal-close").forEach((btn) => {
    btn.addEventListener("click", () => closeModal(btn.dataset.close));
  });
  document.querySelectorAll(".modal-backdrop").forEach((backdrop) => {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop && backdrop.id !== "modal-victory" && backdrop.id !== "modal-levelup") {
        backdrop.classList.remove("open");
      }
    });
  });
}

// ==========================================
// PWA : INSTALLATION TÉLÉPHONE & HORS-LIGNE
// ==========================================
let deferredInstallPrompt = null;

function setupPWA() {
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }

  // Cacher le bouton si déjà installé en mode appli
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  if (isStandalone && $("btn-install-app")) {
    $("btn-install-app").style.display = "none";
  }

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    if ($("install-native-wrap")) {
      $("install-native-wrap").style.display = "block";
    }
  });

  if ($("btn-install-app")) {
    $("btn-install-app").addEventListener("click", () => {
      sfx.click();
      openModal("modal-install");
    });
  }

  if ($("btn-trigger-install")) {
    $("btn-trigger-install").addEventListener("click", async () => {
      if (!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      if (outcome === "accepted") {
        closeModal("modal-install");
        $("btn-install-app").style.display = "none";
      }
    });
  }
}

// ==========================================
// DÉMARRAGE
// ==========================================
renderPlanets();
renderHUD();
bindEvents();
setupPWA();
