// Données du jeu : Armures d'Adrien, Bestiaire Warhammer 40k, Planètes CE1

const ARMORS = [
  {
    tier: 1,
    minLevel: 1,
    name: "Scout de l'Espace",
    title: "Recrue Adrien",
    image: "assets/images/armor_1.jpg",
    weapon: "Blaster d'Entraînement",
    projectile: "⚡",
    projectileColor: "#38bdf8",
    auraColor: "#38bdf8",
    description: "Armure légère de jeune éclaireur. Parfaite pour esquiver les farces des Grots !",
    battleCry: "Pour la Galaxie ! C'est parti !"
  },
  {
    tier: 2,
    minLevel: 3,
    name: "Space Marine Tactique",
    title: "Frère Adrien",
    image: "assets/images/armor_2.jpg",
    weapon: "Bolter Lourd",
    projectile: "💥",
    projectileColor: "#60a5fa",
    auraColor: "#3b82f6",
    description: "Une vraie armure énergétique avec de grosses épaulières et des sceaux de pureté !",
    battleCry: "Mon Bolter est chargé de bonnes réponses !"
  },
  {
    tier: 3,
    minLevel: 6,
    name: "Sergent Vétéran",
    title: "Sergent Adrien",
    image: "assets/images/armor_3.jpg",
    weapon: "Épée Tronçonneuse & Plasma",
    projectile: "🔥",
    projectileColor: "#f59e0b",
    auraColor: "#ef4444",
    description: "Crête rouge héroïque, cape de commandant et épée tronçonneuse qui crépite !",
    battleCry: "VROUM ! Mon épée tronçonneuse coupe les erreurs en deux !"
  },
  {
    tier: 4,
    minLevel: 10,
    name: "Capitaine Terminator",
    title: "Capitaine Adrien",
    image: "assets/images/armor_4.jpg",
    weapon: "Marteau Tonnerre",
    projectile: "⚡🔨",
    projectileColor: "#22d3ee",
    auraColor: "#06b6d4",
    description: "Armure Terminator ultra-blindée ! Même un Big Boss Ork rebondit sur son bouclier !",
    battleCry: "BZZZT ! Voici la puissance du Marteau Tonnerre !"
  },
  {
    tier: 5,
    minLevel: 15,
    name: "Primarque Légendaire",
    title: "Primarque Adrien",
    image: "assets/images/armor_5.jpg",
    weapon: "Épée Solaire Cosmique",
    projectile: "🌟⚔️",
    projectileColor: "#facc15",
    auraColor: "#eab308",
    description: "L'armure ultime dorée aux ailes de lumière ! Le plus grand héros de tout le CE1 !",
    battleCry: "Par les étoiles dorées, aucun monstre ne résiste au CE1 !"
  }
];

const MONSTERS = [
  {
    id: "grot",
    name: "Grot Farceur",
    faction: "Orks",
    image: "assets/images/monster_grot.jpg",
    flipX: true,
    hp: 3,
    xp: 35,
    switchMin: 1,
    isBoss: false,
    minLevel: 1,
    accentColor: "#84cc16",
    bio: "Un tout petit gobelin vert qui a volé un casque trois fois trop grand pour sa tête.",
    taunts: [
      "Hihi ! Mon casque m'empêche de voir, mais tu vas quand même te tromper !",
      "Je parie ma chaussette trouée que tu sais pas !",
      "Gnéhéhé ! Les maths c'est trop dur pour les humains !"
    ],
    hitLines: [
      "Aïe ! Mon grand casque a tourné à l'envers !",
      "Ouille ! Ça chatouille pas !",
      "Hé ! T'as pas le droit d'être aussi fort !"
    ],
    missLines: [
      "Hihi ! Raté ! Je fais la danse du Grot !",
      "Bwahaha ! Mon lance-pierre fait BOING !"
    ],
    defeatLine: "Oups ! Je file me cacher dans une boîte en carton !"
  },
  {
    id: "nurgling",
    name: "Nurgling Rigolo",
    faction: "Chaos Rigolo",
    image: "assets/images/monster_nurgling.jpg",
    flipX: true,
    hp: 3,
    xp: 40,
    switchMin: 1,
    isBoss: false,
    minLevel: 1,
    accentColor: "#4ade80",
    bio: "Une petite boule verte toute rebondissante qui adore faire des bulles de savon géantes.",
    taunts: [
      "Bloop bloop ! Mes bulles vont avaler tes bonnes réponses !",
      "Plop ! Je rebondis partout, tu peux pas m'attraper !",
      "Glouglou ! Qui veut une bulle de savon spatial ?"
    ],
    hitLines: [
      "POP ! Tu as éclaté ma plus belle bulle !",
      "Bloop ! Ça me fait faire des bulles par les oreilles !",
      "Boing ! Arrête de me faire rebondir !"
    ],
    missLines: [
      "Bloop ! Une bulle sur ton casque !",
      "Hi hi ! Tu as glissé sur du savon !"
    ],
    defeatLine: "POOOOP ! Je m'envole dans une bulle géante !"
  },
  {
    id: "termagant",
    name: "Termagant Tyranide",
    faction: "Tyranides",
    image: "assets/images/monster_termagant.jpg",
    hp: 3,
    xp: 45,
    switchMin: 2,
    isBoss: false,
    minLevel: 1,
    accentColor: "#c084fc",
    bio: "Un insecte spatial violet super excité qui adore grignoter les crayons à papier.",
    taunts: [
      "Krik-krak ! Je vais croquer tes tables de multiplication !",
      "Bzzzt ! J'ai six pattes pour compter plus vite que toi !",
      "Skriii ! Montre-moi ce que tu sais faire, Space Marine !"
    ],
    hitLines: [
      "Krik ! Mes antennes font des étincelles !",
      "Aïe ! Ma carapace violette !",
      "Skrii ! Trop rapide pour moi !"
    ],
    missLines: [
      "Krik-krak ! J'ai grignoté un bout de ton bouclier !",
      "Bzzzt ! Esquive d'insecte spatial !"
    ],
    defeatLine: "Krik... Je retourne faire la sieste dans ma ruche !"
  },
  {
    id: "ork_boy",
    name: "Boyz Ork « Kass'Tout »",
    faction: "Orks",
    image: "assets/images/monster_ork_boy.jpg",
    hp: 4,
    xp: 55,
    switchMin: 2,
    isBoss: false,
    minLevel: 2,
    accentColor: "#f97316",
    bio: "Un gros Ork costaud avec une clé à molette géante. Il sait compter : 1, 2, 3... BEAUCOUP !",
    taunts: [
      "WAAAGH ! Moi je sais compter jusqu'à 3 : UN, DEUX, BEAUCOUP !",
      "Grrr ! Ma clé à molette est plus forte que ta règle !",
      "Baston de neurones ! Prêt, p'tit Marine ?"
    ],
    hitLines: [
      "OUCH ! Qui a éteint la lumière ?!",
      "Aïe ! Ma clé à molette a fait DONG !",
      "Waaagh... enfin, ouille plutôt !"
    ],
    missLines: [
      "BWAHAHA ! KLANG sur ton bouclier !",
      "WAAAGH ! C'est moi le plus malin !"
    ],
    defeatLine: "Bon d'accord, t'es trop fort... Je vais réviser mes additions !"
  },
  {
    id: "necron",
    name: "Guerrier Nécron Grinçant",
    faction: "Nécrons",
    image: "assets/images/monster_necron.jpg",
    hp: 4,
    xp: 60,
    switchMin: 2,
    isBoss: false,
    minLevel: 2,
    accentColor: "#10b981",
    bio: "Un robot squelette qui dort depuis 60 millions d'années et qui a besoin d'huile dans les genoux.",
    taunts: [
      "BIP-BOUP ! Mes circuits ont oublié la grammaire !",
      "KRIIIK... J'ai besoin d'huile, et toi d'une bonne réponse !",
      "ANALYSE EN COURS : niveau de CE1 détecté !"
    ],
    hitLines: [
      "BIP-BOP-ERREUR 404 ! Mes boulons se dévissent !",
      "ZZZT ! Court-circuit dans mon ordinateur !",
      "ALERTE ! Intelligence d'Adrien trop élevée !"
    ],
    missLines: [
      "BIP ! Rayon vert sur le bouclier !",
      "CALCUL RÉUSSI : petit choc électrique !"
    ],
    defeatLine: "MISE EN VEILLE... Bonne nuit... *ronfle en binaire*"
  },
  {
    id: "squig",
    name: "Squig Glouton",
    faction: "Orks",
    image: "assets/images/monster_squig.svg",
    hp: 4,
    xp: 65,
    switchMin: 3,
    isBoss: false,
    minLevel: 3,
    accentColor: "#ef4444",
    bio: "Une énorme boule rouge sur pattes qui veut croquer tout ce qui passe, surtout les devoirs !",
    taunts: [
      "MIAM ! Donne-moi tes syllabes, j'ai trop faim !",
      "CHOMP CHOMP ! J'adore manger les virgules !",
      "GROUMF ! Tes bonnes réponses ont l'air délicieuses !"
    ],
    hitLines: [
      "BEURK ! Cette bonne réponse pique la langue !",
      "Aïe ! J'ai avalé une étoile !",
      "BOING ! Je roule comme un ballon !"
    ],
    missLines: [
      "CHOMP ! J'ai croqué un petit bout de bouclier !",
      "MIAM ! Encore !"
    ],
    defeatLine: "Burp ! J'ai trop mangé de savoir... je roule loin d'ici !"
  },
  {
    id: "chaos_marine",
    name: "Marine du Chaos Grognon",
    faction: "Chaos",
    image: "assets/images/monster_chaos_marine.svg",
    hp: 4,
    xp: 75,
    switchMin: 3,
    isBoss: false,
    minLevel: 4,
    accentColor: "#a855f7",
    bio: "Un chevalier de l'espace qui râle tout le temps parce que ses grandes cornes se coincent dans les portes.",
    taunts: [
      "Grrr ! Mes cornes se sont encore coincées dans le vaisseau !",
      "Personne n'est plus fort que moi en CE1 ! Enfin... presque !",
      "Hmph ! Voyons si tu connais vraiment celle-là !"
    ],
    hitLines: [
      "Grrr ! Tu as rayé mon armure violette !",
      "Non ! Pas mes belles cornes !",
      "Zut et rezut ! Tu es vraiment balèze !"
    ],
    missLines: [
      "Haha ! La puissance du Grognon !",
      "Et voilà un éclair violet !"
    ],
    defeatLine: "Bon ça suffit, je rentre chez moi bouder ! Bravo Adrien..."
  },
  {
    id: "ork_boss",
    name: "BOSS : Big Boss Gorgutz",
    faction: "Boss Ork",
    image: "assets/images/monster_ork_boss.jpg",
    hp: 5,
    xp: 120,
    switchMin: 5,
    isBoss: true,
    minLevel: 1,
    accentColor: "#facc15",
    bio: "Le roi géant des Orks ! Son armure en ferraille fait un boucan terrible, mais il offre un ÉNORME bonus de minutes de Switch !",
    taunts: [
      "MÉGA-WAAAGH ! C'est moi le BOSS ! Prêt pour le défi suprême ?",
      "Ma pince géante va écraser tes cahiers ! BWAHAHA !",
      "Si tu me bats, je te donne mon trésor de minutes de Switch !"
    ],
    hitLines: [
      "BAM ! Mon réacteur crache de la fumée !",
      "OUCH ! Ce p'tit Space Marine tape SUPER FORT !",
      "KLANG ! Mes boulons sautent partout !"
    ],
    missLines: [
      "MÉGA-CHOC ! Tiens bon, Space Marine !",
      "BWAHAHA ! Mon armure de Boss est trop dure !"
    ],
    defeatLine: "NOOOON ! Un élève de CE1 m'a vaincu ! Tiens, prends ton MÉGA BONUS de Switch !"
  }
];

const PLANETS = [
  {
    id: "campagne",
    name: "Campagne Galactique",
    subtitle: "Tout le programme CE1 mélangé !",
    icon: "🚀",
    color: "#38bdf8",
    gradient: "linear-gradient(135deg, #0284c7, #6366f1)",
    badge: "Recommandé"
  },
  {
    id: "calcul",
    name: "Planète Calculia",
    subtitle: "Additions, soustractions, tables, doubles",
    icon: "➕",
    color: "#f59e0b",
    gradient: "linear-gradient(135deg, #d97706, #ea580c)",
    badge: "Maths"
  },
  {
    id: "numeration",
    name: "Planète Numéria",
    subtitle: "Lire l'heure, centaines/dizaines, euros, < > =",
    icon: "⏰",
    color: "#10b981",
    gradient: "linear-gradient(135deg, #059669, #0d9488)",
    badge: "Maths"
  },
  {
    id: "grammaire",
    name: "Planète Grammatika",
    subtitle: "Verbe, nom, adjectif, pluriel, conjugaison",
    icon: "📖",
    color: "#a855f7",
    gradient: "linear-gradient(135deg, #7c3aed, #c026d3)",
    badge: "Français"
  },
  {
    id: "orthographe",
    name: "Planète Orthographia",
    subtitle: "Sons pièges (s/ss, c/ç, m/b/p), accords, a/à",
    icon: "✏️",
    color: "#ec4899",
    gradient: "linear-gradient(135deg, #db2777, #e11d48)",
    badge: "Français"
  },
  {
    id: "monde",
    name: "Planète Exploratia",
    subtitle: "Saisons, mois, animaux, eau, espace",
    icon: "🌍",
    color: "#22d3ee",
    gradient: "linear-gradient(135deg, #0891b2, #2563eb)",
    badge: "Monde"
  }
];

const ADRIEN_PRAISES = [
  "BIM ! En plein dans le mille !",
  "Trop fort, Adrien !",
  "Puissance Space Marine !",
  "Wouah, quel cerveau galactique !",
  "KABOOM ! Super réponse !",
  "L'Imperium est fier de toi !"
];

const XP_PER_LEVEL = (level) => 80 + (level - 1) * 35;

function getArmorForLevel(level) {
  let current = ARMORS[0];
  for (const armor of ARMORS) {
    if (level >= armor.minLevel) {
      current = armor;
    }
  }
  return current;
}
