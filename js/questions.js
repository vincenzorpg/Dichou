// Moteur de questions complet — Programme officiel CE1 (ludique & thématisé Space Marine !)

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function makeNumericChoices(answer, spread = 8, minVal = 0) {
  const set = new Set([answer]);
  const candidates = [
    answer + 1, answer - 1, answer + 2, answer - 2,
    answer + 10, answer - 10, answer + 5, answer - 5
  ].filter(v => v >= minVal && v !== answer);

  while (set.size < 4 && candidates.length > 0) {
    const idx = randInt(0, candidates.length - 1);
    set.add(candidates.splice(idx, 1)[0]);
  }
  let guard = 0;
  while (set.size < 4 && guard < 40) {
    guard++;
    const delta = randInt(-spread, spread);
    const val = answer + delta;
    if (val >= minVal && val !== answer) set.add(val);
  }
  return shuffle([...set].map(String));
}

// ==========================================
// HORLOGE SVG POUR LIRE L'HEURE (NUMÉRATION)
// ==========================================
function buildClockSVG(hours, minutes) {
  const hourAngle = ((hours % 12) + minutes / 60) * 30 - 90;
  const minAngle = minutes * 6 - 90;

  const hRad = (hourAngle * Math.PI) / 180;
  const mRad = (minAngle * Math.PI) / 180;

  const hx = 100 + Math.cos(hRad) * 44;
  const hy = 100 + Math.sin(hRad) * 44;
  const mx = 100 + Math.cos(mRad) * 66;
  const my = 100 + Math.sin(mRad) * 66;

  let ticks = "";
  for (let i = 1; i <= 12; i++) {
    const a = ((i * 30 - 90) * Math.PI) / 180;
    const tx = 100 + Math.cos(a) * 76;
    const ty = 100 + Math.sin(a) * 76 + 5;
    ticks += `<text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" text-anchor="middle" fill="#e2e8f0" font-size="14" font-weight="700" font-family="Fredoka, sans-serif">${i}</text>`;
  }

  return `
    <svg viewBox="0 0 200 200" class="clock-svg" aria-label="Horloge">
      <circle cx="100" cy="100" r="92" fill="#0f172a" stroke="#38bdf8" stroke-width="6"/>
      <circle cx="100" cy="100" r="86" fill="#1e293b" stroke="#0284c7" stroke-width="2"/>
      ${ticks}
      <!-- Grande aiguille (minutes - jaune) -->
      <line x1="100" y1="100" x2="${mx.toFixed(1)}" y2="${my.toFixed(1)}" stroke="#facc15" stroke-width="5" stroke-linecap="round"/>
      <!-- Petite aiguille (heures - rouge/orange) -->
      <line x1="100" y1="100" x2="${hx.toFixed(1)}" y2="${hy.toFixed(1)}" stroke="#f97316" stroke-width="7" stroke-linecap="round"/>
      <circle cx="100" cy="100" r="7" fill="#38bdf8"/>
    </svg>
  `;
}

// ==========================================
// 1. PLANÈTE CALCULIA (Maths — Calcul CE1)
// ==========================================
function genCalcul(difficulty) {
  const types =
    difficulty === "debut"
      ? ["add_simple", "sub_simple", "comp10", "double", "probleme"]
      : difficulty === "fin"
      ? ["add_hard", "sub_hard", "comp100", "double_moitie", "mult_easy", "probleme"]
      : ["add_med", "sub_med", "comp10", "comp100", "double_moitie", "probleme"];

  const t = pick(types);

  if (t === "add_simple") {
    const a = randInt(5, 35);
    const b = randInt(3, 19);
    const ans = a + b;
    return {
      subject: "calcul",
      tag: "Addition",
      prompt: `Combien font ${a} + ${b} ?`,
      choices: makeNumericChoices(ans, 6, 1),
      answer: String(ans),
      hint: `${a} + ${b} = ${ans} !`
    };
  }

  if (t === "add_med" || t === "add_hard") {
    const a = t === "add_hard" ? randInt(45, 250) : randInt(18, 69);
    const b = t === "add_hard" ? randInt(25, 140) : randInt(12, 39);
    const ans = a + b;
    return {
      subject: "calcul",
      tag: "Addition",
      prompt: `Calcule vite : ${a} + ${b} = ?`,
      choices: makeNumericChoices(ans, 12, 1),
      answer: String(ans),
      hint: `On ajoute les unités puis les dizaines : ${a} + ${b} = ${ans}.`
    };
  }

  if (t === "sub_simple") {
    const a = randInt(12, 39);
    const b = randInt(3, Math.min(9, a - 1));
    const ans = a - b;
    return {
      subject: "calcul",
      tag: "Soustraction",
      prompt: `Combien font ${a} − ${b} ?`,
      choices: makeNumericChoices(ans, 5, 0),
      answer: String(ans),
      hint: `En reculant de ${b} depuis ${a}, on arrive à ${ans}.`
    };
  }

  if (t === "sub_med" || t === "sub_hard") {
    const a = t === "sub_hard" ? randInt(60, 150) : randInt(30, 89);
    const b = t === "sub_hard" ? randInt(15, 49) : randInt(11, 29);
    const ans = a - b;
    return {
      subject: "calcul",
      tag: "Soustraction",
      prompt: `Calcule : ${a} − ${b} = ?`,
      choices: makeNumericChoices(ans, 10, 0),
      answer: String(ans),
      hint: `${a} − ${b} = ${ans} (car ${ans} + ${b} = ${a}).`
    };
  }

  if (t === "comp10") {
    const a = randInt(1, 9);
    const ans = 10 - a;
    return {
      subject: "calcul",
      tag: "Complément à 10",
      prompt: `Complète pour faire 10 : ${a} + ? = 10`,
      choices: makeNumericChoices(ans, 4, 0),
      answer: String(ans),
      hint: `${a} + ${ans} = 10 !`
    };
  }

  if (t === "comp100") {
    const a = difficulty === "fin" ? pick([15, 25, 35, 45, 55, 65, 75, 85, 30, 40, 60, 70]) : pick([10, 20, 30, 40, 50, 60, 70, 80, 90]);
    const ans = 100 - a;
    return {
      subject: "calcul",
      tag: "Complément à 100",
      prompt: `Pour recharger le bouclier à 100 % : ${a} + ? = 100`,
      choices: makeNumericChoices(ans, 20, 5),
      answer: String(ans),
      hint: `${a} + ${ans} = 100 !`
    };
  }

  if (t === "double" || t === "double_moitie") {
    const askHalf = t === "double_moitie" && Math.random() < 0.5;
    if (askHalf) {
      const n = pick([6, 8, 10, 12, 14, 16, 18, 20, 24, 30, 40, 50, 60, 100]);
      const ans = n / 2;
      return {
        subject: "calcul",
        tag: "Moitié",
        prompt: `Quelle est la moitié de ${n} ?`,
        choices: makeNumericChoices(ans, 6, 1),
        answer: String(ans),
        hint: `La moitié de ${n}, c'est ${ans} (car ${ans} + ${ans} = ${n}).`
      };
    } else {
      const n = difficulty === "debut" ? randInt(3, 12) : pick([6, 7, 8, 9, 12, 15, 20, 25, 30, 40, 50]);
      const ans = n * 2;
      return {
        subject: "calcul",
        tag: "Double",
        prompt: `Quel est le double de ${n} ?`,
        choices: makeNumericChoices(ans, 8, 2),
        answer: String(ans),
        hint: `Le double de ${n}, c'est ${n} + ${n} = ${ans}.`
      };
    }
  }

  if (t === "mult_easy" || t === "mult_ce1") {
    const tables = t === "mult_easy" ? [2, 5, 10] : [2, 3, 4, 5, 10];
    const a = pick(tables);
    const b = randInt(2, 10);
    const ans = a * b;
    return {
      subject: "calcul",
      tag: `Table de ${a}`,
      prompt: `Tir laser ! Combien font ${a} × ${b} ?`,
      choices: makeNumericChoices(ans, 8, 1),
      answer: String(ans),
      hint: `${a} × ${b} = ${ans} !`
    };
  }

  // Petit problème rigolo Space Marine
  const scenarios = [
    () => {
      const a = randInt(8, 25);
      const b = randInt(5, 15);
      const ans = a + b;
      return {
        prompt: `Adrien a ${a} piles laser. Il trouve un coffre avec ${b} piles de plus. Combien en a-t-il en tout ?`,
        ans,
        hint: `On fait une addition : ${a} + ${b} = ${ans} piles !`
      };
    },
    () => {
      const a = randInt(18, 35);
      const b = randInt(4, 12);
      const ans = a - b;
      return {
        prompt: `Un vaisseau Ork transporte ${a} Grots. ${b} Grots sautent en parachute ! Combien en reste-t-il ?`,
        ans,
        hint: `On fait une soustraction : ${a} − ${b} = ${ans} Grots.`
      };
    },
    () => {
      const a = randInt(6, 15);
      const ans = a * 2;
      return {
        prompt: `Adrien a ${a} étoiles d'or et trouve exactement le DOUBLE dans un coffre ! Combien a-t-il trouvé ?`,
        ans,
        hint: `Le double de ${a}, c'est ${a} + ${a} = ${ans} étoiles !`
      };
    }
  ];
  const sc = pick(scenarios)();
  return {
    subject: "calcul",
    tag: "Problème Spatial",
    prompt: sc.prompt,
    choices: makeNumericChoices(sc.ans, 8, 1),
    answer: String(sc.ans),
    hint: sc.hint
  };
}

// ==========================================
// 2. PLANÈTE NUMÉRIA (Nombres, Heure, Mesures)
// ==========================================
function genNumeration(difficulty) {
  const types = ["heure", "cdu", "compare", "suite", "euros", "mesure"];
  const t = pick(types);

  if (t === "heure") {
    const h = randInt(1, 11);
    const minChoices =
      difficulty === "debut" ? [0, 30] : difficulty === "fin" ? [0, 15, 30, 45] : [0, 15, 30];
    const m = pick(minChoices);

    const formatTime = (hh, mm) => {
      if (mm === 0) return `${hh} h 00`;
      return `${hh} h ${mm}`;
    };

    const ans = formatTime(h, m);
    const wrongs = new Set([ans]);
    const pool = [
      formatTime((h % 12) + 1, m),
      formatTime(h === 1 ? 12 : h - 1, m),
      formatTime(h, (m + 30) % 60),
      formatTime(h, (m + 15) % 60),
      formatTime((h + 2) % 12 || 12, 0)
    ];
    for (const p of pool) {
      if (wrongs.size < 4) wrongs.add(p);
    }

    return {
      subject: "numeration",
      tag: "Lire l'heure",
      prompt: "Quelle heure indique l'horloge du vaisseau ?",
      visual: buildClockSVG(h, m),
      choices: shuffle([...wrongs]),
      answer: ans,
      hint: `La petite aiguille orange montre les heures (${h} h) et la grande aiguille jaune montre les minutes (${m === 0 ? "pile" : m + " min"}).`
    };
  }

  if (t === "cdu") {
    if (Math.random() < 0.55) {
      const c = difficulty === "debut" ? randInt(1, 3) : randInt(1, 9);
      const d = randInt(0, 9);
      const u = randInt(0, 9);
      const ans = c * 100 + d * 10 + u;
      const distractors = new Set([
        String(ans),
        String(d * 100 + c * 10 + u),
        String(c * 100 + u * 10 + d),
        String(c * 100 + ((d + 1) % 10) * 10 + u),
        String(c * 10 + d + u)
      ]);
      const arr = [...distractors].slice(0, 4);
      while (arr.length < 4) arr.push(String(ans + arr.length * 10));
      return {
        subject: "numeration",
        tag: "Centaines / Dizaines / Unités",
        prompt: `Quel nombre correspond à : ${c} centaine${c > 1 ? "s" : ""}, ${d} dizaine${d > 1 ? "s" : ""} et ${u} unité${u > 1 ? "s" : ""} ?`,
        choices: shuffle(arr),
        answer: String(ans),
        hint: `${c}00 + ${d}0 + ${u} = ${ans} !`
      };
    } else {
      const c = randInt(1, 9);
      const d = randInt(0, 9);
      let u = randInt(0, 9);
      if (u === d) u = (u + 2) % 10;
      if (c === d) return genNumeration(difficulty);
      const num = c * 100 + d * 10 + u;
      const ask = pick(["centaines", "dizaines", "unités"]);
      const ans = ask === "centaines" ? c : ask === "dizaines" ? d : u;
      return {
        subject: "numeration",
        tag: "Chiffre de...",
        prompt: `Dans le nombre ${num}, quel est le chiffre des ${ask} ?`,
        choices: makeNumericChoices(ans, 4, 0),
        answer: String(ans),
        hint: `Dans ${num} : ${c} est aux centaines, ${d} aux dizaines, ${u} aux unités.`
      };
    }
  }

  if (t === "compare") {
    const a = randInt(20, 500);
    const delta = pick([-100, -10, -1, 0, 1, 10, 100]);
    const b = Math.max(10, a + delta);
    const ans = a < b ? "<" : a > b ? ">" : "=";
    return {
      subject: "numeration",
      tag: "Comparer (< > =)",
      prompt: `Quel signe faut-il mettre entre ces nombres ?   ${a}  ___  ${b}`,
      choices: shuffle(["<", ">", "=", "Impossible"]),
      answer: ans,
      hint: `La bouche du crocodile mange toujours le plus grand nombre ! Ici : ${a} ${ans} ${b}.`
    };
  }

  if (t === "suite") {
    const step = pick([2, 5, 10, 100]);
    const start = step === 100 ? randInt(1, 4) * 100 : randInt(2, 30);
    const seq = [start, start + step, start + step * 2, start + step * 3];
    const ans = start + step * 4;
    return {
      subject: "numeration",
      tag: "Suite logique",
      prompt: `Continue la suite secrète : ${seq.join(" — ")} — ?`,
      choices: makeNumericChoices(ans, step * 2, 1),
      answer: String(ans),
      hint: `On ajoute +${step} à chaque fois : ${seq[3]} + ${step} = ${ans}.`
    };
  }

  if (t === "euros") {
    const bills = pick([
      { desc: "1 billet de 10 € + 1 billet de 5 € + 2 pièces de 1 €", ans: 17 },
      { desc: "2 billets de 10 € + 1 pièce de 2 €", ans: 22 },
      { desc: "1 billet de 20 € + 1 billet de 5 € + 1 pièce de 2 €", ans: 27 },
      { desc: "3 billets de 10 € + 1 billet de 5 €", ans: 35 },
      { desc: "1 billet de 50 € + 1 billet de 10 € + 2 pièces de 2 €", ans: 64 },
      { desc: "1 billet de 20 € + 2 billets de 10 € + 3 pièces de 1 €", ans: 43 }
    ]);
    return {
      subject: "numeration",
      tag: "Monnaie (€)",
      prompt: `À l'Armurerie Spatiale, Adrien a : ${bills.desc}. Combien a-t-il d'euros ?`,
      choices: makeNumericChoices(bills.ans, 8, 5).map(v => `${v} €`),
      answer: `${bills.ans} €`,
      hint: `En additionnant tous les billets et pièces, on trouve ${bills.ans} € !`
    };
  }

  const mesures = [
    { q: "Combien y a-t-il de centimètres dans 1 mètre (1 m) ?", a: "100 cm", c: ["10 cm", "100 cm", "1000 cm", "50 cm"], h: "1 mètre = 100 centimètres !" },
    { q: "Combien y a-t-il de minutes dans 1 heure ?", a: "60 minutes", c: ["30 minutes", "60 minutes", "100 minutes", "24 minutes"], h: "1 heure = 60 minutes !" },
    { q: "Combien y a-t-il d'heures dans une journée entière ?", a: "24 heures", c: ["12 heures", "24 heures", "60 heures", "7 heures"], h: "Une journée (jour + nuit) dure 24 heures !" },
    { q: "Quelle unité utilise-t-on pour peser un gros Ork ?", a: "Le kilogramme (kg)", c: ["Le kilogramme (kg)", "Le centimètre (cm)", "L'heure (h)", "Le litre (L)"], h: "Pour peser une masse lourde, on utilise le kilogramme (kg) !" },
    { q: "Combien y a-t-il de grammes dans 1 kilogramme (1 kg) ?", a: "1 000 g", c: ["10 g", "100 g", "1 000 g", "500 g"], h: "« Kilo » veut dire mille : 1 kg = 1 000 g !" }
  ];
  const m = pick(mesures);
  return {
    subject: "numeration",
    tag: "Mesures",
    prompt: m.q,
    choices: shuffle(m.c),
    answer: m.a,
    hint: m.h
  };
}

// ==========================================
// 3. PLANÈTE GRAMMATIKA (Grammaire & Conjugaison CE1)
// ==========================================
const GRAMMAR_BANK = [
  // Nature des mots
  { tag: "Trouver le Verbe", q: "Quel est le VERBE dans la phrase : « Adrien lance un éclair bleu. » ?", a: "lance", c: ["Adrien", "lance", "éclair", "bleu"], h: "Le verbe, c'est l'action : ce que fait Adrien (« lancer »)." },
  { tag: "Trouver le Verbe", q: "Quel est le VERBE dans la phrase : « Le petit Grot rigole très fort. » ?", a: "rigole", c: ["petit", "Grot", "rigole", "fort"], h: "« Rigole » est le verbe (l'action de rigoler) !" },
  { tag: "Trouver le Verbe", q: "Quel est le VERBE dans : « Les vaisseaux volent dans l'espace. » ?", a: "volent", c: ["vaisseaux", "volent", "dans", "espace"], h: "« Volent » est le verbe voler !" },
  { tag: "Trouver l'Adjectif", q: "Quel est l'ADJECTIF dans : « Un énorme Squig rouge bondit. » ?", a: "rouge", c: ["Squig", "bondit", "rouge", "Un"], h: "L'adjectif dit comment est le nom : le Squig est rouge !" },
  { tag: "Trouver l'Adjectif", q: "Quel est l'ADJECTIF dans : « Adrien porte une armure brillante. » ?", a: "brillante", c: ["Adrien", "porte", "armure", "brillante"], h: "« Brillante » décrit comment est l'armure : c'est un adjectif !" },
  { tag: "Trouver le Nom", q: "Quel mot est un NOM commun dans : « Le robot avance vite. » ?", a: "robot", c: ["Le", "robot", "avance", "vite"], h: "« Robot » est un nom (on peut mettre « un » ou « le » devant)." },
  { tag: "Trouver le Sujet", q: "Qui est le SUJET du verbe dans : « Le gros Ork mange une pizza. » ?", a: "Le gros Ork", c: ["Le gros Ork", "mange", "une pizza", "pizza"], h: "Qui est-ce qui mange ? C'est « Le gros Ork » !" },

  // Masculin / Féminin & Singulier / Pluriel
  { tag: "Pluriel", q: "Quel est le pluriel de « un cheval » ?", a: "des chevaux", c: ["des chevals", "des chevaux", "des chevales", "les cheval"], h: "Les noms en -al font souvent -aux au pluriel : des chevaux !" },
  { tag: "Pluriel", q: "Quel est le pluriel de « un vaisseau » ?", a: "des vaisseaux", c: ["des vaisseaus", "des vaisseaux", "des vaisseau", "des vaissaux"], h: "Les noms en -eau prennent un X au pluriel : des vaisseaux !" },
  { tag: "Pluriel", q: "Quel est le pluriel de « un gros monstre » ?", a: "des gros monstres", c: ["des grox monstres", "des gros monstres", "des gros monstre", "des grosse monstres"], h: "« Gros » a déjà un s, et « monstre » prend un s : des gros monstres !" },
  { tag: "Féminin", q: "Quel est le féminin de « un champion » ?", a: "une championne", c: ["une champione", "une championne", "une championesse", "une champion"], h: "On double le n : une championne !" },
  { tag: "Féminin", q: "Quel est le féminin de « un guerrier courageux » ?", a: "une guerrière courageuse", c: ["une guerrier courageuse", "une guerrière courageux", "une guerrière courageuse", "une guerrièrre courageuse"], h: "Guerrier → guerrière, courageux → courageuse !" },

  // Conjugaison Présent CE1
  { tag: "Conjugaison (Présent)", q: "Complète au présent : « Nous ___ prêts pour le combat ! » (être)", a: "sommes", c: ["sommes", "êtes", "sont", "suis"], h: "Verbe être au présent : nous sommes !" },
  { tag: "Conjugaison (Présent)", q: "Complète au présent : « Les Orks ___ des gros marteaux. » (avoir)", a: "ont", c: ["a", "as", "avons", "ont"], h: "Verbe avoir avec « ils / Les Orks » : ils ont !" },
  { tag: "Conjugaison (Présent)", q: "Complète au présent : « Tu ___ ton blaster laser. » (lancer)", a: "lances", c: ["lance", "lances", "lancent", "lançons"], h: "Avec « Tu », le verbe se termine presque toujours par un S : tu lances !" },
  { tag: "Conjugaison (Présent)", q: "Complète au présent : « Vous ___ très bien en CE1 ! » (jouer)", a: "jouez", c: ["joues", "jouons", "jouez", "jouent"], h: "Avec « Vous », le verbe se termine en -ez : vous jouez !" },
  { tag: "Conjugaison (Présent)", q: "Complète au présent : « Les Space Marines ___ la galaxie. » (protéger)", a: "protègent", c: ["protège", "protèges", "protégeons", "protègent"], h: "Avec « ils / Les Space Marines », on met -ent : ils protègent !" },
  { tag: "Conjugaison (Présent)", q: "Complète au présent : « Je ___ dans le vaisseau spatial. » (aller)", a: "vais", c: ["vas", "vais", "va", "allez"], h: "Verbe aller au présent : je vais !" },
  { tag: "Conjugaison (Présent)", q: "Complète au présent : « Nous ___ une super équipe ! » (faire)", a: "faisons", c: ["faites", "faisons", "font", "fait"], h: "Verbe faire au présent : nous faisons !" },
  { tag: "Conjugaison (Futur)", q: "Complète au futur : « Demain, Adrien ___ le Boss Ork ! » (gagner)", a: "gagnera", c: ["gagne", "gagnera", "gagneras", "gagnait"], h: "Au futur avec il / Adrien : il gagnera !" },
  { tag: "Conjugaison (Imparfait)", q: "Complète à l'imparfait : « Autrefois, le robot ___ dans le sable. » (dormir)", a: "dormait", c: ["dort", "dormira", "dormait", "dormaient"], h: "À l'imparfait avec il / le robot : il dormait !" },

  // Ponctuation
  { tag: "Ponctuation", q: "Quel point faut-il à la fin de : « Où se cache le Nurgling ___ »", a: "?", c: [".", "?", ",", ":"], h: "C'est une question, donc on met un point d'interrogation ( ? ) !" },
  { tag: "Ponctuation", q: "Quel point montre la surprise ou la joie : « Bravo Adrien ___ »", a: "!", c: ["?", "!", ",", "."], h: "Pour la joie ou la surprise, on utilise le point d'exclamation ( ! ) !" }
];

function genGrammaire() {
  const item = pick(GRAMMAR_BANK);
  return {
    subject: "grammaire",
    tag: item.tag,
    prompt: item.q,
    choices: shuffle(item.c),
    answer: item.a,
    hint: item.h
  };
}

// ==========================================
// 4. PLANÈTE ORTHOGRAPHIA (Orthographe & Sons CE1)
// ==========================================
const ORTHO_BANK = [
  // m devant m, b, p
  { tag: "Règle m, b, p", q: "Quelle est la bonne orthographe ?", a: "une chambre", c: ["une chanbre", "une chambre", "une chambbre", "une chenbre"], h: "Devant m, b et p, le « n » se transforme en « m » : chambre !" },
  { tag: "Règle m, b, p", q: "Quelle est la bonne orthographe ?", a: "un pompier", c: ["un ponpier", "un pompier", "un pompierre", "un ponpié"], h: "Devant le « p », on met un « m » : un pompier !" },
  { tag: "Règle m, b, p", q: "Quelle est la bonne orthographe ?", a: "une tempête", c: ["une tenpête", "une tempête", "une tampête", "une tenpète"], h: "Devant le « p », on écrit « m » : une tempête !" },
  { tag: "Règle m, b, p", q: "Quelle est la bonne orthographe ?", a: "une lampe", c: ["une lanpe", "une lampe", "une lempe", "une lamppe"], h: "Devant « p », on écrit « m » : une lampe !" },

  // s / ss
  { tag: "Son [s] : s ou ss", q: "Comment s'écrit l'animal qui nage dans l'eau ?", a: "un poisson", c: ["un poison", "un poisson", "un poizon", "un poissson"], h: "Entre deux voyelles, il faut deux « s » (ss) pour faire le son [s] : poisson !" },
  { tag: "Son [s] : s ou ss", q: "Quelle est la bonne orthographe ?", a: "un vaisseau", c: ["un vaiseau", "un vaisseau", "un vaiceau", "un vaissot"], h: "Entre deux voyelles, on écrit « ss » : un vaisseau !" },
  { tag: "Son [s] : s ou ss", q: "Quelle est la bonne orthographe ?", a: "la classe", c: ["la clase", "la classe", "la clace", "la claze"], h: "Entre « a » et « e », il faut « ss » pour entendre [s] : la classe !" },

  // c / ç / g / gu / ge
  { tag: "Son [s] : c ou ç", q: "Quelle est la bonne orthographe ?", a: "un garçon", c: ["un garcon", "un garçon", "un garson", "un garçont"], h: "Devant « o », il faut une cédille (ç) pour faire le son [s] : garçon !" },
  { tag: "Son [s] : c ou ç", q: "Quelle est la bonne orthographe ?", a: "une leçon", c: ["une lecon", "une leçon", "une leson", "une leçonx"], h: "Devant « o », on met une cédille : une leçon !" },
  { tag: "Son [g] : g ou gu", q: "Quelle est la bonne orthographe ?", a: "une guitare", c: ["une gitare", "une guitare", "une guittare", "une gytare"], h: "Devant « i », on écrit « gu » pour faire le son [g] : guitare !" },
  { tag: "Son [j] : g ou ge", q: "Quelle est la bonne orthographe ?", a: "un pigeon", c: ["un pigon", "un pigeon", "un pijon", "un pigeont"], h: "Devant « o », on met « ge » pour faire le son [j] : un pigeon !" },

  // Homophones CE1 (a/à, et/est, on/ont, son/sont)
  { tag: "Homophones : a / à", q: "Complète : « Adrien ___ une armure bleue. »", a: "a", c: ["a", "à", "as", "ont"], h: "On peut dire « avait » (verbe avoir), donc on écrit « a » sans accent !" },
  { tag: "Homophones : a / à", q: "Complète : « Le vaisseau part ___ toute vitesse ! »", a: "à", c: ["a", "à", "as", "ah"], h: "On ne peut pas dire « avait toute vitesse », donc on met « à » avec accent !" },
  { tag: "Homophones : et / est", q: "Complète : « Le Squig ___ tout rouge ! »", a: "est", c: ["et", "est", "es", "ai"], h: "On peut dire « était » (verbe être), donc c'est « est » !" },
  { tag: "Homophones : et / est", q: "Complète : « Adrien prend son épée ___ son bouclier. »", a: "et", c: ["et", "est", "es", "ait"], h: "On peut dire « et puis », donc on écrit « et » !" },
  { tag: "Homophones : on / ont", q: "Complète : « Les monstres ___ peur d'Adrien ! »", a: "ont", c: ["on", "ont", "sont", "a"], h: "On peut dire « avaient peur », donc c'est le verbe avoir : « ont » !" },
  { tag: "Homophones : son / sont", q: "Complète : « Les étoiles ___ très brillantes ce soir. »", a: "sont", c: ["son", "sont", "ont", "est"], h: "On peut dire « étaient brillantes », donc c'est le verbe être : « sont » !" },

  // Accords dans le groupe nominal
  { tag: "Accord", q: "Complète : « Des petites fusées ___ »", a: "rapides", c: ["rapide", "rapides", "rapid", "rapidees"], h: "« Des fusées » est au pluriel, donc l'adjectif prend un « s » : rapides !" },
  { tag: "Accord", q: "Complète : « Une grande planète ___ »", a: "bleue", c: ["bleu", "bleue", "bleus", "bleues"], h: "« Une planète » est au féminin singulier, donc on ajoute un « e » : bleue !" }
];

function genOrthographe() {
  const item = pick(ORTHO_BANK);
  return {
    subject: "orthographe",
    tag: item.tag,
    prompt: item.q,
    choices: shuffle(item.c),
    answer: item.a,
    hint: item.h
  };
}

// ==========================================
// 5. PLANÈTE EXPLORATIA (Questionner le Monde CE1)
// ==========================================
const MONDE_BANK = [
  { tag: "Le Temps", q: "Combien y a-t-il de mois dans une année ?", a: "12 mois", c: ["7 mois", "10 mois", "12 mois", "24 mois"], h: "De janvier à décembre, il y a 12 mois dans une année !" },
  { tag: "Le Temps", q: "Quel mois vient juste après avril ?", a: "Mai", c: ["Mars", "Mai", "Juin", "Février"], h: "Janvier, février, mars, avril, MAI !" },
  { tag: "Le Temps", q: "En quelle saison les feuilles des arbres tombent-elles ?", a: "L'automne", c: ["Le printemps", "L'été", "L'automne", "L'hiver"], h: "C'est en automne que les feuilles deviennent orange et tombent !" },
  { tag: "Le Temps", q: "Si aujourd'hui nous sommes mercredi, quel jour étions-nous HIER ?", a: "Mardi", c: ["Lundi", "Mardi", "Jeudi", "Vendredi"], h: "Le jour juste avant mercredi, c'est mardi !" },
  { tag: "Les Animaux", q: "Comment appelle-t-on un animal qui ne mange QUE des plantes ?", a: "Un herbivore", c: ["Un carnivore", "Un herbivore", "Un omnivore", "Un insectivore"], h: "Herbe → Herbivore (comme la vache ou le lapin) !" },
  { tag: "Les Animaux", q: "Le lion mange de la viande. Il est donc...", a: "Carnivore", c: ["Herbivore", "Carnivore", "Omnivore", "Végétarien"], h: "Un animal qui mange de la viande est un carnivore !" },
  { tag: "Les Animaux", q: "Comment appelle-t-on un animal qui mange de TOUT (plantes et viande) ?", a: "Un omnivore", c: ["Un carnivore", "Un herbivore", "Un omnivore", "Un mammifère"], h: "L'ours et l'être humain sont omnivores : ils mangent de tout !" },
  { tag: "Le Vivant", q: "Lequel de ces éléments est NON-VIVANT ?", a: "Un caillou", c: ["Un arbre", "Un chat", "Un caillou", "Une fourmi"], h: "Un caillou ne naît pas, ne grandit pas et ne se reproduit pas : il est non-vivant !" },
  { tag: "Les Plantes", q: "De quoi une plante a-t-elle surtout besoin pour pousser ?", a: "D'eau et de lumière", c: ["De chocolat", "D'eau et de lumière", "De glace", "De musique"], h: "Les plantes ont besoin d'eau, de terre et de lumière du soleil !" },
  { tag: "La Matière (Eau)", q: "Sous quelle forme est l'eau quand elle devient un glaçon ?", a: "Solide", c: ["Liquide", "Solide", "Gazeuse", "Poudre"], h: "Un glaçon est dur : c'est de l'eau à l'état solide !" },
  { tag: "La Matière (Eau)", q: "À quelle température l'eau gèle-t-elle pour devenir de la glace ?", a: "0 °C", c: ["0 °C", "20 °C", "50 °C", "100 °C"], h: "L'eau devient de la glace à 0 degré Celsius (0 °C) !" },
  { tag: "La Matière (Eau)", q: "Quand l'eau bout dans une casserole et fait de la fumée blanche, c'est de la...", a: "Vapeur d'eau (gaz)", c: ["Glace", "Vapeur d'eau (gaz)", "Neige", "Pluie"], h: "En chauffant très fort, l'eau se transforme en vapeur (état gazeux) !" },
  { tag: "L'Espace", q: "Autour de quoi tourne la planète Terre ?", a: "Le Soleil", c: ["La Lune", "Le Soleil", "Mars", "Un Ork géant"], h: "La Terre tourne autour du Soleil en une année (365 jours) !" },
  { tag: "L'Espace", q: "Pourquoi y a-t-il le jour et la nuit sur Terre ?", a: "La Terre tourne sur elle-même", c: ["Le Soleil s'éteint", "La Terre tourne sur elle-même", "La Lune cache tout", "Les nuages arrivent"], h: "La Terre fait un tour sur elle-même en 24 heures !" },
  { tag: "Géographie", q: "Sur quel continent se trouve la France ?", a: "L'Europe", c: ["L'Afrique", "L'Asie", "L'Europe", "L'Amérique"], h: "La France est en Europe !" },
  { tag: "Les Sens", q: "Combien l'être humain a-t-il de sens (vue, ouïe, odorat, goût, toucher) ?", a: "5 sens", c: ["3 sens", "4 sens", "5 sens", "7 sens"], h: "Nous avons 5 sens : la vue, l'ouïe, l'odorat, le goût et le toucher !" }
];

function genMonde() {
  const item = pick(MONDE_BANK);
  return {
    subject: "monde",
    tag: item.tag,
    prompt: item.q,
    choices: shuffle(item.c),
    answer: item.a,
    hint: item.h
  };
}

// ==========================================
// 6. PLANÈTE MULTIPLIA (Apprendre les tables en jouant !)
// ==========================================
function buildMultiplicationVisual(groups, perGroup, icon) {
  let html = `<div class="mult-groups">`;
  for (let g = 0; g < groups; g++) {
    html += `<div class="mult-group">`;
    for (let i = 0; i < perGroup; i++) {
      html += `<span>${icon}</span>`;
    }
    html += `</div>`;
  }
  html += `</div>`;
  const repeated = Array(groups).fill(perGroup).join(" + ");
  html += `<div class="mult-repeated">${groups} paquets de ${perGroup} = <strong>${repeated}</strong></div>`;
  return html;
}

function genMultiplicationLearn(tableChoice = 2) {
  const table = Number(tableChoice) || 2;
  const icons = ["⭐", "🚀", "🛡️", "⚡", "💎"];
  const icon = pick(icons);

  // 75% visuel + calcul direct, 25% comprendre le lien addition <-> multiplication
  const mode = Math.random() < 0.25 ? "link" : "visual";
  const maxFactor = table === 10 ? 9 : 6; // Progressif et visuelle-friendly !
  const factor = randInt(2, maxFactor);
  const ans = factor * table;

  if (mode === "link") {
    const repeated = Array(factor).fill(table).join(" + ");
    const correctExpr = `${factor} × ${table}`;
    const choices = new Set([correctExpr]);
    const candidates = [
      `${factor + 1} × ${table}`,
      `${Math.max(1, factor - 1)} × ${table}`,
      `${factor} + ${table}`,
      `${table} × ${table}`
    ];
    for (const c of candidates) {
      if (choices.size < 4 && c !== correctExpr) choices.add(c);
    }
    return {
      subject: "multiplia",
      tag: `Découverte Table de ${table}`,
      prompt: `À quelle multiplication correspond : ${repeated} ?`,
      visual: buildMultiplicationVisual(factor, table, icon),
      choices: shuffle([...choices]),
      answer: correctExpr,
      hint: `Il y a ${factor} paquets de ${table}, donc ça s'écrit ${factor} × ${table} (= ${ans}) !`
    };
  }

  return {
    subject: "multiplia",
    tag: `Table de ${table} (Visuel)`,
    prompt: `Combien font ${factor} × ${table} ? (Tu peux compter les paquets !)`,
    visual: buildMultiplicationVisual(factor, table, icon),
    choices: makeNumericChoices(ans, Math.max(6, table * 2), 2),
    answer: String(ans),
    hint: `${factor} paquets de ${table} (${Array(factor).fill(table).join(" + ")}) = ${ans} !`
  };
}

// ==========================================
// POINT D'ENTRÉE PRINCIPAL
// ==========================================
function generateQuestion(planetId, difficulty = "milieu", extra = {}) {
  let target = planetId;
  if (planetId === "campagne") {
    target = pick(["calcul", "numeration", "grammaire", "orthographe", "monde"]);
  }
  switch (target) {
    case "calcul":
      return genCalcul(difficulty);
    case "multiplia":
      return genMultiplicationLearn(extra.multTable || 2);
    case "numeration":
      return genNumeration(difficulty);
    case "grammaire":
      return genGrammaire();
    case "orthographe":
      return genOrthographe();
    case "monde":
      return genMonde();
    default:
      return genCalcul(difficulty);
  }
}
