export interface InteractionWarning {
  severity: "low" | "medium" | "high";
  message: string;
  drugs: string[];
  mechanism?: string;
  recommendation?: string;
}

// Helper function to normalize strings for comparison (lowercase, remove accents, remove extra spaces)
function normalizeString(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .replace(/[^a-z0-9\s-]/g, " ") // Keep alphanumeric, spaces, and hyphens
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
}

// Helper to check if a normalized drug name matches a normalized keyword
function matchKeyword(normName: string, keyword: string): boolean {
  // If keyword is very short, require a word boundary to avoid false positives (e.g. "fer" in "fervex")
  if (keyword.length <= 3) {
    const escaped = keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    return regex.test(normName);
  }
  return normName.includes(keyword);
}

// Comprehensive mapping of drug classes and specific drugs to keyword lists (in French / Algerian market names)
const DRUG_CLASSES: Record<string, string[]> = {
  NSAID: [
    "ibuprofene", "ketoprofene", "diclofenac", "naproxene", "acide niflumique",
    "meloxicam", "piroxicam", "celecoxib", "advil", "nurofen", "upfen", "algifen",
    "mebufen", "ketum", "profenid", "voltarene", "flector", "clafen", "xenid", "brexin"
  ],
  ANTICOAGULANT: [
    "warfarine", "acenocoumarol", "sintrom", "rivaroxaban", "apixaban", "dabigatran",
    "fluindione", "previscan", "coumadine", "xarelto", "eliquis", "pradaxa"
  ],
  ANTIPLATELET: [
    "acide acetylsalicylique", "acetylsalicylate", "clopidogrel", "ticagrelor",
    "prasugrel", "aspirine", "kardegic", "aspegic", "catalgine", "plavix", "tromban",
    "clopigen", "brilique"
  ],
  CLOPIDOGREL: [
    "clopidogrel", "plavix", "tromban", "clopigen"
  ],
  METHOTREXATE: [
    "methotrexate", "imeth", "novatrex", "ledertrexate"
  ],
  SULFONAMIDE_ANTIBIOTIC: [
    "trimethoprime", "sulfamethoxazole", "co-trimoxazole", "bactrim"
  ],
  PDE5_INHIBITOR: [
    "sildenafil", "tadalafil", "vardenafil", "viagra", "cialis", "levitra", "safra", "vega"
  ],
  NITRATE: [
    "trinitrine", "isosorbide", "nitroglycerine", "risordan", "lenitral", "diafusar"
  ],
  ACE_ARB: [
    "ramipril", "enalapril", "perindopril", "candesartan", "valsartan", "irbesartan",
    "lisinopril", "losartan", "telmisartan", "triatec", "coversyl", "renitec", "tareg",
    "kenzen", "aprovil", "cozaar", "micardis", "lopril"
  ],
  POTASSIUM_SPARING_DIURETIC: [
    "spironolactone", "eplerenone", "amiloride", "aldactone", "inspra"
  ],
  POTASSIUM_SUPPLEMENT: [
    "potassium", "diffu-k", "kaleorid"
  ],
  DIURETIC_LOOP_THIAZIDE: [
    "furosemide", "hydrochlorothiazide", "indapamide", "lasilix", "esidrex", "fludex"
  ],
  STATIN: [
    "simvastatine", "atorvastatine", "rosuvastatine", "tahor", "crestor", "zocor", "lipitor"
  ],
  MACROLIDE: [
    "clarithromycine", "erythromycine", "azithromycine", "josamycine", "roxithromycine",
    "zeclar", "zithromax", "biclar"
  ],
  AZOLE_ANTIFUNGAL: [
    "ketoconazole", "itraconazole", "fluconazole", "voriconazole", "posaconazole",
    "miconazole", "daktarin", "triflucan", "vfend", "sporanox"
  ],
  FIBRATE: [
    "fenofibrate", "gemfibrozil", "lipanthyl", "secral"
  ],
  SSRI_SNRI: [
    "fluoxetine", "sertraline", "paroxetine", "citalopram", "escitalopram", "venlafaxine",
    "duloxetine", "seroplex", "prozac", "deroxat", "zoloft", "cymbalta", "effexor"
  ],
  TRAMADOL: [
    "tramadol", "tramal", "contramal", "biodalgic", "topalgic", "ixprim", "zaldiar"
  ],
  TRIPTAN: [
    "sumatriptan", "zolmitriptan", "naratriptan", "almotriptan", "eletriptan",
    "frovatriptan", "zomig", "imiject", "naramig"
  ],
  MAOI: [
    "selegiline", "rasagiline", "iproniazide", "marsilid"
  ],
  LINEZOLID: [
    "linezolid", "zyvoxid"
  ],
  DIGOXIN: [
    "digoxine", "digoxin", "hemigoxine"
  ],
  AMIODARONE: [
    "amiodarone", "cordarone"
  ],
  VERAPAMIL_DILTIAZEM: [
    "verapamil", "diltiazem", "tildiem", "isoptine", "monotildiem"
  ],
  BETA_BLOCKER: [
    "bisoprolol", "metoprolol", "atenolol", "propranolol", "carvedilol", "nebivolol",
    "detensiel", "avlocardyl", "cardensiel", "lopressor", "seloken", "tenormine", "temerit"
  ],
  LITHIUM: [
    "lithium", "teralithe"
  ],
  METFORMIN: [
    "metformine", "glifermin", "glucophage", "stagid"
  ],
  IODINATED_CONTRAST: [
    "iohexol", "iopamidol", "iodixanol", "xenetix", "telebrix", "visipaque", "omnipaque"
  ],
  LEVOTHYROXINE: [
    "levothyroxine", "levothyrox", "euthyrox"
  ],
  CATION_SUPPLEMENT: [
    "calcium", "ferreux", "tardyferon", "fumafer", "ascofer", "ranferon", "magnesium",
    "magne-b6", "magne b6", "aluminium", "maalox", "maldox", "gaviscon", "ranitidine", "famotidine"
  ],
  PPI: [
    "omeprazole", "esomeprazole", "pantoprazole", "rabeprazole", "inipomp", "mopral",
    "ogastoro", "inexium", "eupantyl", "pantoloc"
  ],
  ALLOPURINOL: [
    "allopurinol", "zyloric"
  ],
  PENICILLIN_AMP: [
    "ampicilline", "amoxicilline", "clamoxyl", "augmentin", "amoxiclav", "ciblor"
  ],
  COLCHICINE: [
    "colchicine", "colchimax"
  ],
  CORTICOSTEROID: [
    "prednisolone", "methylprednisolone", "dexamethasone", "cortancyl", "solupred",
    "medrol", "celestene"
  ],
  FLUOROQUINOLONE: [
    "ciprofloxacine", "levofloxacine", "norfloxacine", "ofloxacine", "tavanic",
    "ciflox", "noroxine"
  ],
  THEOPHYLLINE: [
    "theophylline", "dilatrane", "theostat"
  ],
  ALCOHOL: [
    "alcool", "ethanol", "boisson alcoolisee"
  ],
  PARACETAMOL: [
    "paracetamol", "doliprane", "dafalgan", "efferalgan", "paracet"
  ]
};

// Interface for internal representation of interaction rules
interface InteractionRule {
  required: string[];
  severity: "low" | "medium" | "high";
  message: string;
  mechanism?: string;
  recommendation?: string;
}

// High-quality drug-drug interaction database
const INTERACTION_RULES: InteractionRule[] = [
  {
    required: ["METHOTREXATE", "PENICILLIN_AMP"],
    severity: "high",
    message: "L'association de la pénicilline (amoxicilline) et du méthotrexate peut augmenter la toxicité du méthotrexate.",
    mechanism: "Inhibition de la sécrétion tubulaire rénale du méthotrexate par les pénicillines, entraînant une augmentation de sa concentration plasmatique et du risque de toxicité.",
    recommendation: "Association à éviter ou à utiliser avec une surveillance hématologique et rénale étroite. Ajuster la dose de méthotrexate si nécessaire."
  },
  {
    required: ["FLUOROQUINOLONE", "THEOPHYLLINE"],
    severity: "medium",
    message: "Risque de surdosage en théophylline par diminution de son métabolisme hépatique.",
    mechanism: "Inhibition du cytochrome CYP1A2 par la fluoroquinolone (principalement la ciprofloxacine), augmentant de manière significative la concentration plasmatique de la théophylline.",
    recommendation: "Réduire la posologie de la théophylline et surveiller sa concentration plasmatique (théophyllinémie) lors de l'association. Informer le patient des signes de surdosage."
  },
  {
    required: ["NSAID", "ANTICOAGULANT"],
    severity: "high",
    message: "Risque accru d'hémorragies sévères (notamment gastro-intestinales).",
    mechanism: "Synergie pharmacodynamique : altération de la fonction plaquettaire par l'AINS combinée à l'effet anticoagulant de l'anticoagulant oral (AVK ou AOD).",
    recommendation: "Association déconseillée. Si l'association est inévitable, utiliser la dose minimale d'AINS, surveiller étroitement la clinique et l'INR (pour les AVK), et envisager la prescription systématique d'un protecteur gastrique (IPP)."
  },
  {
    required: ["NSAID", "ANTIPLATELET"],
    severity: "medium",
    message: "Risque accru de saignements gastro-intestinaux et réduction possible de l'effet cardioprotecteur de l'aspirine.",
    mechanism: "Compétition au niveau des récepteurs COX-1 plaquettaires et effet anti-agrégant cumulatif altérant l'hémostase.",
    recommendation: "Surveiller les signes d'hémorragie. Si de l'aspirine à faible dose est prescrite, prendre l'aspirine au moins 30 minutes avant l'AINS ou 8 heures après."
  },
  {
    required: ["METHOTREXATE", "NSAID"],
    severity: "high",
    message: "Augmentation majeure de la toxicité du méthotrexate (hématologique, rénale, digestive).",
    mechanism: "Diminution de la filtration glomérulaire et de la sécrétion tubulaire active du méthotrexate par les AINS, entraînant un surdosage.",
    recommendation: "Association contre-indiquée pour le méthotrexate utilisé à fortes doses (oncologie). À faibles doses (polyarthrite), surveiller étroitement la formule sanguine (NFS) et la fonction rénale."
  },
  {
    required: ["METHOTREXATE", "SULFONAMIDE_ANTIBIOTIC"],
    severity: "high",
    message: "Risque de toxicité hématologique sévère et d'aplasie médullaire aiguë (pancytopénie).",
    mechanism: "Synergie de l'effet antifolate (inhibition séquentielle de la synthèse de l'acide folique) combinée à un déplacement du méthotrexate de ses protéines plasmatiques.",
    recommendation: "Association contre-indiquée ou fortement déconseillée. Utiliser une alternative thérapeutique pour traiter l'infection bactérienne."
  },
  {
    required: ["PDE5_INHIBITOR", "NITRATE"],
    severity: "high",
    message: "Contre-indication absolue : risque d'hypotension artérielle sévère et brutale pouvant être fatale.",
    mechanism: "Synergie des effets vasodilatateurs par accumulation du GMP cyclique induite par l'action combinée des deux molécules.",
    recommendation: "Ne jamais associer de dérivés nitrés (sublingual ou oral) chez un patient ayant pris un inhibiteur de la PDE5 dans les dernières 24h (ou 48h pour le tadalafil)."
  },
  {
    required: ["ACE_ARB", "POTASSIUM_SPARING_DIURETIC"],
    severity: "high",
    message: "Risque d'hyperkaliémie sévère et potentiellement mortelle.",
    mechanism: "Effet additif de rétention de potassium dû à la baisse d'aldostérone (induit par l'IEC/ARA II) et à l'effet épargneur de potassium du diurétique.",
    recommendation: "Association déconseillée sauf en cas d'insuffisance cardiaque sévère sous contrôle strict. Surveiller fréquemment la kaliémie et la créatininémie."
  },
  {
    required: ["ACE_ARB", "POTASSIUM_SUPPLEMENT"],
    severity: "high",
    message: "Risque d'hyperkaliémie sévère et potentiellement mortelle.",
    mechanism: "Accumulation de potassium par baisse de l'excrétion rénale d'origine aldostéronique causée par l'IEC ou l'ARA II.",
    recommendation: "Association déconseillée sauf hypokaliémie documentée. Contrôler régulièrement le ionogramme sanguin."
  },
  {
    required: ["ACE_ARB", "NSAID", "DIURETIC_LOOP_THIAZIDE"],
    severity: "high",
    message: "Triple association à haut risque ('Triple Whammy') : Risque d'insuffisance rénale aiguë.",
    mechanism: "L'AINS bloque la synthèse des prostaglandines vasoconstrictant l'artériole afférente glomérulaire, l'IEC/ARA II dilate l'artériole efférente, et le diurétique induit une hypovolémie. La pression d'ultrafiltration glomérulaire s'effondre.",
    recommendation: "Éviter cette triple association. Si nécessaire, surveiller étroitement la fonction rénale (créatininémie, urée) et s'assurer d'une hydratation adéquate."
  },
  {
    required: ["STATIN", "MACROLIDE"],
    severity: "high",
    message: "Risque accru de toxicité musculaire sévère (myopathie ou rhabdomyolyse).",
    mechanism: "Inhibition puissante du cytochrome CYP3A4 par le macrolide (clarithromycine, érythromycine) bloquant le métabolisme hépatique de la statine et augmentant ses taux plasmatiques.",
    recommendation: "Suspendre temporairement le traitement par statine (surtout simvastatine et atorvastatine) pendant toute la durée de l'antibiothérapie par macrolide."
  },
  {
    required: ["SSRI_SNRI", "TRAMADOL"],
    severity: "high",
    message: "Risque de syndrome sérotoninergique (agitation, myoclonies, confusion) et risque accru de convulsions.",
    mechanism: "Effets cumulatifs sur les récepteurs sérotoninergiques centraux et diminution du seuil épileptogène par le tramadol.",
    recommendation: "Surveiller étroitement l'apparition de signes d'alerte sérotoninergique. Préférer un antalgique non sérotoninergique si possible."
  },
  {
    required: ["ANTICOAGULANT", "AZOLE_ANTIFUNGAL"],
    severity: "high",
    message: "Risque hémorragique majeur par surdosage de l'anticoagulant oral.",
    mechanism: "Inhibition enzymatique du CYP2C9 par l'antifongique azolé, bloquant le métabolisme de l'anticoagulant oral (AVK ou AOD).",
    recommendation: "Contre-indication absolue avec le miconazole (y compris gel buccal). Pour les autres antifongiques, contrôler fréquemment l'INR (pour les AVK) et adapter la posologie de l'anticoagulant."
  },
  {
    required: ["AMIODARONE", "MACROLIDE"],
    severity: "high",
    message: "Risque élevé de torsades de pointes et de troubles du rythme ventriculaire graves.",
    mechanism: "Prolongation additive de l'intervalle QT cardiaque et risque d'arythmie sévère.",
    recommendation: "Association déconseillée. En cas de prescription nécessaire, réaliser un ECG préalable pour surveiller l'intervalle QTc et corriger l'hypokaliémie."
  },
  {
    required: ["AMIODARONE", "FLUOROQUINOLONE"],
    severity: "high",
    message: "Risque élevé de torsades de pointes (troubles du rythme cardiaque potentiellement mortels).",
    mechanism: "Effet pharmacodynamique additif allongeant l'intervalle QT sur l'ECG.",
    recommendation: "Association déconseillée. Réaliser un suivi ECG récurrent et surveiller les taux d'électrolytes (potassium, magnésium)."
  },
  {
    required: ["LITHIUM", "NSAID"],
    severity: "high",
    message: "Risque de surdosage en lithium pouvant entraîner une toxicité neurologique et rénale.",
    mechanism: "Diminution de l'excrétion rénale du lithium consécutive à l'inhibition des prostaglandines rénales par l'AINS.",
    recommendation: "Surveiller la lithémie de façon rapprochée. Ajuster la posologie du lithium pendant l'association et après l'arrêt de l'AINS."
  },
  {
    required: ["LITHIUM", "ACE_ARB"],
    severity: "medium",
    message: "Risque d'augmentation de la lithémie et de toxicité du lithium.",
    mechanism: "La réduction de l'angiotensine II ou de son action diminue le débit de filtration glomérulaire, réduisant la clairance rénale du lithium.",
    recommendation: "Contrôler régulièrement la lithémie et adapter la posologie. Surveiller la fonction rénale."
  },
  {
    required: ["LITHIUM", "DIURETIC_LOOP_THIAZIDE"],
    severity: "high",
    message: "Risque de toxicité grave par augmentation rapide de la lithémie.",
    mechanism: "La déplétion hydrosodée induite par le diurétique provoque une réabsorption tubulaire compensatrice accrue de lithium.",
    recommendation: "Association déconseillée ou nécessitant une surveillance très étroite de la kaliémie, de la lithémie et une réduction des doses de lithium."
  },
  {
    required: ["DIGOXIN", "AMIODARONE"],
    severity: "high",
    message: "Risque de bradycardie sévère et de surdosage en digoxine (troubles du rythme, nausées).",
    mechanism: "Inhibition de la P-glycoprotéine (transporteur d'efflux), entraînant une réduction de l'excrétion rénale et biliaire de la digoxine.",
    recommendation: "Réduire de moitié la dose de digoxine dès l'introduction de l'amiodarone. Mesurer la digoxinémie et surveiller l'ECG."
  },
  {
    required: ["DIGOXIN", "VERAPAMIL_DILTIAZEM"],
    severity: "high",
    message: "Risque d'intoxication digitalique et de troubles conductifs majeurs (bloc auriculoventriculaire).",
    mechanism: "Inhibition de la P-glycoprotéine et synergie des effets dépresseurs sur la conduction auriculoventriculaire.",
    recommendation: "Réduire la dose de digoxine, surveiller les concentrations plasmatiques de digoxine, la fréquence cardiaque et l'ECG."
  },
  {
    required: ["METFORMIN", "IODINATED_CONTRAST"],
    severity: "high",
    message: "Risque d'acidose lactique sévère en cas d'insuffisance rénale induite par le produit de contraste.",
    mechanism: "Le produit de contraste iodé peut provoquer une insuffisance rénale aiguë fonctionnelle, bloquant l'excrétion de la metformine qui s'accumule.",
    recommendation: "Suspendre le traitement par metformine dès le jour de l'examen radiologique. Ne le reprendre que 48h après, après vérification de la fonction rénale (créatininémie normale)."
  },
  {
    required: ["LEVOTHYROXINE", "CATION_SUPPLEMENT"],
    severity: "medium",
    message: "Diminution de l'absorption et de l'efficacité de la lévothyroxine.",
    mechanism: "Adsorption ou formation de complexes insolubles dans le tube digestif en présence de fer, calcium, magnésium ou aluminium.",
    recommendation: "Prendre la lévothyroxine à jeun le matin et différer la prise de suppléments minéraux ou d'antiacides d'au moins 4 heures."
  },
  {
    required: ["CLOPIDOGREL", "PPI"],
    severity: "medium",
    message: "Risque de diminution de l'effet anti-agrégant plaquettaire du clopidogrel.",
    mechanism: "Inhibition du cytochrome CYP2C19 par certains IPP (surtout oméprazole, ésoméprazole), limitant la conversion du clopidogrel en son métabolite actif.",
    recommendation: "Éviter l'oméprazole et l'ésoméprazole chez les patients sous clopidogrel. Préférer le pantoprazole ou le rabéprazole."
  },
  {
    required: ["ALLOPURINOL", "PENICILLIN_AMP"],
    severity: "low",
    message: "Risque accru d'éruptions cutanées d'origine allergique.",
    mechanism: "Mécanisme immunologique synergique favorisant les réactions d'hypersensibilité cutanée.",
    recommendation: "Informer le patient du risque d'éruption. Surveiller l'apparition de rougeurs ou démangeaisons cutanées."
  },
  {
    required: ["FLUOROQUINOLONE", "CATION_SUPPLEMENT"],
    severity: "medium",
    message: "Diminution très significative de l'absorption digestive et de l'efficacité de l'antibiotique.",
    mechanism: "Chélation de la fluoroquinolone par les ions métalliques (fer, calcium, magnésium, zinc) dans la lumière intestinale.",
    recommendation: "Prendre la fluoroquinolone au moins 2 heures avant ou 4 à 6 heures après les pansements digestifs, antiacides ou suppléments."
  },
  {
    required: ["BETA_BLOCKER", "VERAPAMIL_DILTIAZEM"],
    severity: "high",
    message: "Risque de bradycardie sévère, de bloc auriculoventriculaire et d'insuffisance cardiaque aiguë.",
    mechanism: "Effets additifs dépresseurs majeurs sur l'automatisme sinusal, la conduction et la contractilité myocardique.",
    recommendation: "Association déconseillée. Si elle s'avère indispensable, elle nécessite une surveillance clinique étroite et un tracé ECG régulier."
  },
  {
    required: ["MACROLIDE", "COLCHICINE"],
    severity: "high",
    message: "Risque de toxicité aiguë grave à la colchicine (aplasie médullaire, rhabdomyolyse, défaillance viscérale) pouvant être mortelle.",
    mechanism: "Inhibition du CYP3A4 et de la glycoprotéine P par le macrolide, entraînant une hausse massive des taux sanguins de colchicine.",
    recommendation: "Association strictement contre-indiquée. Utiliser un autre antibiotique ou suspendre temporairement la colchicine."
  },
  {
    required: ["CORTICOSTEROID", "NSAID"],
    severity: "medium",
    message: "Risque accru d'ulcères et d'hémorragies gastro-intestinales.",
    mechanism: "Effet synergique délétère sur la cytoprotection de la barrière muqueuse de l'estomac.",
    recommendation: "Associer un inhibiteur de la pompe à protons (IPP) en prévention, en particulier chez les patients âgés ou ayant des antécédents d'ulcère."
  },
  {
    required: ["PARACETAMOL", "ALCOHOL"],
    severity: "medium",
    message: "Risque d'augmentation de la toxicité hépatique du paracétamol.",
    mechanism: "L'alcoolisme chronique induit l'enzyme CYP2E1, ce qui accroît la production du métabolite réactif hépatotoxique (NAPQI) du paracétamol.",
    recommendation: "Limiter la posologie maximale de paracétamol à 2g ou 3g par jour chez les patients ayant une consommation chronique d'alcool."
  }
];

export function checkInteractions(medications: { medicineName: string }[]): InteractionWarning[] {
  const warnings: InteractionWarning[] = [];
  if (medications.length < 2) return warnings;

  // 1. Process and normalize each input medication to find its matching classes
  const activeDrugs = medications.map(med => {
    const norm = normalizeString(med.medicineName);
    const matchedClasses: string[] = [];

    for (const [className, keywords] of Object.entries(DRUG_CLASSES)) {
      if (keywords.some(kw => matchKeyword(norm, kw))) {
        matchedClasses.push(className);
      }
    }

    return {
      originalName: med.medicineName,
      normalizedName: norm,
      classes: matchedClasses
    };
  });

  // 2. Evaluate each interaction rule against the active drugs
  for (const rule of INTERACTION_RULES) {
    // Check if every required class/drug in rule.required is present in at least one active drug
    const allRequiredMatched = rule.required.every(reqClass => {
      return activeDrugs.some(ad => ad.classes.includes(reqClass));
    });

    if (allRequiredMatched) {
      // Collect the names of all drugs in the prescription that contributed to this warning
      const drugNames = activeDrugs
        .filter(ad => ad.classes.some(c => rule.required.includes(c)))
        .map(ad => ad.originalName.charAt(0).toUpperCase() + ad.originalName.slice(1));

      // Remove duplicate names and sort to maintain consistency
      const uniqueDrugNames = [...new Set(drugNames)].sort();

      // Avoid pushing duplicate warnings for the same message
      if (!warnings.some(w => w.message === rule.message)) {
        warnings.push({
          severity: rule.severity,
          message: rule.message,
          mechanism: rule.mechanism,
          recommendation: rule.recommendation,
          drugs: uniqueDrugNames
        });
      }
    }
  }

  return warnings;
}
