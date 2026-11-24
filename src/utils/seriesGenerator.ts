import { LessonItem, SerieExerciseBlock, getVariantQuestions } from "../data/curriculum";

export interface MoroccanLessonMemo {
  lessonTitleAr: string;
  lessonTitleFr: string;
  coreDefinitionAr: string;
  coreDefinitionFr: string;
  essentialFormulasAr: string[];
  essentialFormulasFr: string[];
  commonPitfallsAr: string[];
  commonPitfallsFr: string[];
  inspectorAdviceAr: string;
  inspectorAdviceFr: string;
}

export type MoroccanDMType =
  | "RECHERCHE_SYNTHESE"
  | "TICE_GEOGEBRA"
  | "MODELISATION_OPTIMISATION"
  | "PREPARATOIRE_DS";

export interface MoroccanDMConfig {
  type: MoroccanDMType;
  titleAr: string;
  titleFr: string;
  descriptionAr: string;
  descriptionFr: string;
  estimatedHours: string;
  badgeColor: string;
}

export const MOROCCAN_DM_PRESETS: Record<MoroccanDMType, MoroccanDMConfig> = {
  RECHERCHE_SYNTHESE: {
    type: "RECHERCHE_SYNTHESE",
    titleAr: "فرض منزلي استكشافي وتوليفي (Recherche & Synthèse)",
    titleFr: "Devoir Maison de Recherche, Synthèse & Approfondissement",
    descriptionAr: "يركز على الربط الديداكتيكي بين عدة فصول، وتوظيف الاستدلال بالترجع والخلف، ومسائل البحث المفتوح.",
    descriptionFr: "Mobilisation transversale de plusieurs chapitres, raisonnements par récurrence/l'absurde et questions ouvertes.",
    estimatedHours: "2h30 à 3h00",
    badgeColor: "bg-indigo-100 text-indigo-900 border-indigo-300",
  },
  TICE_GEOGEBRA: {
    type: "TICE_GEOGEBRA",
    titleAr: "فرض منزلي مدعم بالتكنولوجيا والبرمجيات (TICE & GeoGebra)",
    titleFr: "Devoir Maison avec Expérimentation TICE & Simulation GeoGebra",
    descriptionAr: "يعتمد على التخمين البياني بواسطة برمجية GeoGebra أو خوارزميات بايثون قبل البرهان الجبري الصارم.",
    descriptionFr: "Conjecture graphique et expérimentation dynamique sous GeoGebra avant la démonstration analytique rigoureuse.",
    estimatedHours: "2h00",
    badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300",
  },
  MODELISATION_OPTIMISATION: {
    type: "MODELISATION_OPTIMISATION",
    titleAr: "فرض منزلي للنمذجة الرياضية والاستمثال (Modélisation Réelle)",
    titleFr: "Devoir Maison de Modélisation Concrète & Problèmes d'Optimisation",
    descriptionAr: "معالجة وضعيات واقعية مستقاة من الفيزياء والاقتصاد وعلم الأحياء وحساب المساحات والحجوم القصوية.",
    descriptionFr: "Modélisation de situations concrètes (physique, économie, SVT), recherche d'extrema et optimisation de ressources.",
    estimatedHours: "2h30",
    badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
  },
  PREPARATOIRE_DS: {
    type: "PREPARATOIRE_DS",
    titleAr: "فرض منزلي تحضيري تدريبي للفرض المحروس (Préparation au DS)",
    titleFr: "Devoir Maison d'Entraînement Ciblé & Consolidation Pré-DS",
    descriptionAr: "محاكاة شاملة لبنية الفرض المحروس القادم لتمكين المتعلم من التقييم الذاتي ومعالجة الثغرات قبل الامتحان.",
    descriptionFr: "Simulation conforme au format du prochain DS ministériel permettant l'auto-évaluation et la remédiation préventive.",
    estimatedHours: "2h00",
    badgeColor: "bg-blue-100 text-blue-900 border-blue-300",
  },
};

/**
 * يولد كبسولة ملخص الدرس التذكيري (Fiche Mémo / Rappel Express)
 * وفق المقاربة البيداغوجية لمفتشي مادة الرياضيات بالثانوي التأهيلي المغربي
 */
export function getMoroccanLessonMemo(lesson: LessonItem): MoroccanLessonMemo {
  const lAr = lesson.lessonAr;
  const lFr = lesson.lessonFr;
  const subCat = lesson.subCategory || "تحليل";
  const titleFr = lFr.toLowerCase();

  if (titleFr.includes("dériv") || titleFr.includes("اشتقاق") || titleFr.includes("etude de fonction")) {
    return {
      lessonTitleAr: lAr,
      lessonTitleFr: lFr,
      coreDefinitionAr: "العدد المشتق f'(x₀) يمثل المعامل الموجه لمماس منحنى الدالة عند النقطة (x₀, f(x₀))، والسرعة اللحظية لتغير الظاهرة.",
      coreDefinitionFr: "Le nombre dérivé f'(x₀) est le coefficient directeur de la tangente à (C_f) en x₀, soit la limite du taux d'accroissement quand x → x₀.",
      essentialFormulasAr: [
        "مشتقة الجداء: (u · v)' = u'v + uv'",
        "مشتقة الخارج: (u / v)' = (u'v - uv') / v²",
        "مشتقة المركب: (v ∘ u)'(x) = u'(x) · v'(u(x))",
        "مشتقة الجذر النوني: (ⁿ√u)' = u' / (n · ⁿ√(uⁿ⁻¹))",
        "معادلة المماس: (T) : y = f'(x₀)(x - x₀) + f(x₀)",
      ],
      essentialFormulasFr: [
        "Produit : (u · v)' = u'v + uv'",
        "Quotient : (u / v)' = (u'v - uv') / v²",
        "Composée : (v ∘ u)'(x) = u'(x) · v'(u(x))",
        "Racine n-ième : (ⁿ√u)' = u' / (n · ⁿ√(uⁿ⁻¹))",
        "Tangente en x₀ : y = f'(x₀)(x - x₀) + f(x₀)",
      ],
      commonPitfallsAr: [
        "نسيان شرط قابلية الاشتقاق قبل حساب المشتقة على مجال مفتوح.",
        "الخطأ الشائع في إشارة مشتقة الخارج: كتابة u'v + uv' بدل u'v - uv'.",
        "إغفال مشتقة الدالة الداخلية u'(x) عند اشتقاق الدالة المركبة f(u(x)).",
        "الخلط بين إشارة الدالة المشتقة f'(x) وإشارة الدالة الأصلية f(x).",
      ],
      commonPitfallsFr: [
        "Oublier de justifier la dérivabilité sur un intervalle ouvert avant tout calcul.",
        "Erreur de signe fréquente sur la dérivée d'un quotient : u'v - uv' et non u'v + uv'.",
        "Omission de la dérivée interne u'(x) lors de la dérivation d'une fonction composée.",
        "Confusion entre le signe de f'(x) (qui donne le sens de variation) et le signe de f(x).",
      ],
      inspectorAdviceAr: "توجيه المفتش: اضبط جدول إشارة f'(x) بعناية فائقة، ودون بدقة النهايات وقيم النقط المميزة في جدول التغيرات لضمان رسم منحنٍ سليم.",
      inspectorAdviceFr: "Conseil de l'Inspecteur : Soigner le tableau de variations en y reportant limites aux bornes et extremums pour sécuriser le tracé graphique de (C_f).",
    };
  }

  if (titleFr.includes("continu") || titleFr.includes("اتصال") || titleFr.includes("limite") || titleFr.includes("نهايات")) {
    return {
      lessonTitleAr: lAr,
      lessonTitleFr: lFr,
      coreDefinitionAr: "تكون الدالة f متصلة في النقطة x₀ إذا وفقط إذا كانت lim_{x→x₀} f(x) = f(x₀). مبرهنة القيم الوسيطية (TVI) تؤكد وجود الحلول للمعادلات المستعصية.",
      coreDefinitionFr: "f est continue en x₀ ssi lim_{x→x₀} f(x) = f(x₀). Le TVI assure l'existence de racines pour f(x) = 0 sur [a, b].",
      essentialFormulasAr: [
        "شرط الاتصال على اليمين واليسار: lim_{x→x₀⁺} f(x) = lim_{x→x₀⁻} f(x) = f(x₀)",
        "مبرهنة القيم الوسيطية: إذا كانت f متصلة على [a, b] وكان f(a)·f(b) < 0، فإنه يوجد على الأقل c ∈ ]a, b[ بحيث f(c) = 0",
        "مبرهنة الدالة العكسية: كل دالة متصلة ورتيبة قطعا على مجال I تقبل دالة عكسية f⁻¹ معرفة على f(I)",
        "نهايات الدوال المثلثية: lim_{x→0} sin(x)/x = 1 و lim_{x→0} (1 - cos(x))/x² = 1/2",
      ],
      essentialFormulasFr: [
        "Continuité à gauche/droite : lim_{x→x₀⁺} f(x) = lim_{x→x₀⁻} f(x) = f(x₀)",
        "Théorème des Valeurs Intermédiaires (TVI) : f continue sur [a,b] et f(a)f(b) < 0 ⇒ ∃ c ∈ ]a,b[, f(c) = 0",
        "Théorème de la bijection : f continue et strictement monotone sur I ⇒ f bijective de I sur f(I)",
        "Limites trigonométriques clés : lim_{x→0} sin(x)/x = 1 et lim_{x→0} (1 - cos(x))/x² = 1/2",
      ],
      commonPitfallsAr: [
        "تطبيق مبرهنة القيم الوسيطية دون التحقق من شرط الاتصال على مجال مغلق [a, b].",
        "الادعاء بوحدانية الحل دون التحقق الصارم من الرتابة قطعا للدالة.",
        "الخلط بين الأشكال غير المحددة الأربعة: (0/0، ∞/∞، 0×∞، +∞ - ∞).",
      ],
      commonPitfallsFr: [
        "Appliquer le TVI sans préciser la continuité sur l'intervalle fermé [a, b].",
        "Conclure à l'unicité de la solution sans prouver la stricte monotonie.",
        "Confusion entre formes indéterminées réelles et limites directes usuelles.",
      ],
      inspectorAdviceAr: "توجيه المفتش: صغ شروط مبرهنة القيم الوسيطية بدقة: الاتصال، الرتابة قطعا، وإشارة الجداء f(a)·f(b) لضمان النقطة الكاملة في الامتحان الوطني.",
      inspectorAdviceFr: "Conseil de l'Inspecteur : Rédiger rigoureusement les trois hypothèses du TVI : continuité, stricte monotonie et f(a)·f(b) < 0.",
    };
  }

  if (titleFr.includes("suite") || titleFr.includes("متتالي")) {
    return {
      lessonTitleAr: lAr,
      lessonTitleFr: lFr,
      coreDefinitionAr: "المتتالية العددية هي تطبيق من جزء من ℕ نحو ℝ. دراسة التقارب تعتمد على الرتابة والحدود (مكبرة / مصغرة) أو مبرهنات المقارنة والدرك.",
      coreDefinitionFr: "Une suite est une fonction définie sur une partie de ℕ à valeurs dans ℝ. Toute suite croissante et majorée converge dans ℝ.",
      essentialFormulasAr: [
        "متتالية حسابية: u_{n+1} = u_n + r ⇒ u_n = u_p + (n - p)r والـمجموع: S = (n - p + 1)(u_p + u_n)/2",
        "متتالية هندسية: u_{n+1} = q · u_n ⇒ u_n = u_p · qⁿ⁻ᵖ والـمجموع: S = u_p · (1 - qⁿ⁻ᵖ⁺¹)/(1 - q)",
        "مبرهنة التقارب المونوطوني: كل متتالية تزايدية ومكبرة متقاربة، وكل متتالية تناقصية ومصغرة متقاربة",
        "المتتالية المرتبطة بدالة u_{n+1} = f(u_n): إذا كانت متقاربة نحو ℓ و f متصلة فإن f(ℓ) = ℓ",
      ],
      essentialFormulasFr: [
        "Suite arithmétique : u_n = u_p + (n - p)r et Somme S = (nb termes)(premier + dernier)/2",
        "Suite géométrique : u_n = u_p · qⁿ⁻ᵖ et Somme S = premier · (1 - q^{nb}) / (1 - q)",
        "Théorème de convergence monotone : toute suite croissante majorée converge dans ℝ",
        "Suite récurrente u_{n+1} = f(u_n) : si u_n → ℓ et f continue, alors la limite vérifie f(ℓ) = ℓ",
      ],
      commonPitfallsAr: [
        "الخطأ في حساب عدد حدود المجموع: عدد الحدود هو (دليل النهاية - دليل البداية + 1).",
        "إغفال شرط استقرار المجال f(I) ⊂ I عند دراسة المتتاليات التراجعية u_{n+1} = f(u_n).",
        "الاستنتاج الخاطئ أن المتتالية المتقاربة يجب أن تكون حسابية أو هندسية بالضرورة.",
      ],
      commonPitfallsFr: [
        "Erreur récurrente sur le nombre de termes d'une somme : n - p + 1.",
        "Oublier de vérifier la stabilité de l'intervalle f(I) ⊂ I pour u_{n+1} = f(u_n).",
        "Confusion entre la convergence d'une suite et sa monotonie.",
      ],
      inspectorAdviceAr: "توجيه المفتش: في البرهان بالترجع، اكتب بوضوح عبارة «نفترض أن الخاصية صحيحة من أجل n ونبين صحتها من أجل n+1» مع التأكيد على التحقق من الرتبة الأولى.",
      inspectorAdviceFr: "Conseil de l'Inspecteur : Soigner la structure en 3 étapes du raisonnement par récurrence : initialisation, hérédité et conclusion.",
    };
  }

  if (titleFr.includes("complex") || titleFr.includes("عقدية")) {
    return {
      lessonTitleAr: lAr,
      lessonTitleFr: lFr,
      coreDefinitionAr: "الأعداد العقدية ℂ تمدد الحقل ℝ وتتيح حل جميع المعادلات الحدودية، وتقدم جسراً هندسياً رفيعاً للتحويلات المستوية (الإزاحة، التحاكي، الدوران).",
      coreDefinitionFr: "L'ensemble ℂ des nombres complexes permet la résolution des équations polynomiales et fournit un cadre algébrique élégant pour la géométrie plane.",
      essentialFormulasAr: [
        "الشكل الجبري: z = a + ib مع a, b ∈ ℝ و i² = -1",
        "المعيار والعمدة: |z| = √(a² + b²) و z = |z|(cos θ + i sin θ) = |z|e^{iθ}",
        "صيغة موآفر: (cos θ + i sin θ)ⁿ = cos(nθ) + i sin(nθ)",
        "صيغ أويلر: cos θ = (e^{iθ} + e^{-iθ})/2 و sin θ = (e^{iθ} - e^{-iθ})/(2i)",
        "التمثيل العقدي للدوران: R(Ω, θ) : z' - ω = e^{iθ}(z - ω)",
      ],
      essentialFormulasFr: [
        "Forme algébrique : z = a + ib avec a, b ∈ ℝ et i² = -1",
        "Module et argument : |z| = √(a² + b²) et z = |z|e^{iθ}",
        "Formule de Moivre : (cos θ + i sin θ)ⁿ = cos(nθ) + i sin(nθ)",
        "Formules d'Euler : cos θ = (e^{iθ} + e^{-iθ})/2 et sin θ = (e^{iθ} - e^{-iθ})/(2i)",
        "Écriture complexe d'une rotation : z' - ω = e^{iθ}(z - ω)",
      ],
      commonPitfallsAr: [
        "نسيان الإشارة السالبة في مربع الوحدة التخيلية: i² = -1 وليس 1.",
        "حساب المعيار: كتابة √(a² + (ib)²) بدل √(a² + b²).",
        "الخلط بين زوايا الدوران والتحاكي ذي النسبة السالبة.",
      ],
      commonPitfallsFr: [
        "Oublier que i² = -1 lors du développement d'expressions algébriques.",
        "Calcul de module : écrire faussement √(a² + (ib)²) au lieu de √(a² + b²).",
        "Confusion entre angle de rotation et argument d'un rapport de colinéarité.",
      ],
      inspectorAdviceAr: "توجيه المفتش: اربط دوماً بين المقادير العقدية والتأويل الهندسي: arg((z_C - z_A)/(z_B - z_A)) يمثل قياس الزاوية الموجهة (AB⃗, AC⃗).",
      inspectorAdviceFr: "Conseil de l'Inspecteur : Relier systématiquement l'algèbre complexe à la géométrie : arg((z_C - z_A)/(z_B - z_A)) = (AB⃗, AC⃗) [2π].",
    };
  }

  if (titleFr.includes("espace") || titleFr.includes("فضائية") || subCat === "هندسة فضائية") {
    return {
      lessonTitleAr: lAr,
      lessonTitleFr: lFr,
      coreDefinitionAr: "الهندسة الفضائية التحليلية تدرس التعامد، التوازي، المستويات، المستقيمات، والفلكات باستعمال المتجهات، الجداء السلمي والجداء المتجهي.",
      coreDefinitionFr: "La géométrie analytique de l'espace étudie droites, plans et sphères via les vecteurs, le produit scalaire et le produit vectoriel.",
      essentialFormulasAr: [
        "معادلة المستوى: ax + by + cz + d = 0 مع n⃗(a, b, c) متجهة منظمية",
        "التمثيل البارامتري لمستقيم: x = x_A + at, y = y_A + bt, z = z_A + ct (t ∈ ℝ)",
        "مسافة نقطة عن مستوى: d(M₀, (P)) = |ax₀ + by₀ + cz₀ + d| / √(a² + b² + c²)",
        "معادلة الفلكة: S(Ω, R) : (x - a)² + (y - b)² + (z - c)² = R²",
        "الجداء المتجهي u⃗ ∧ v⃗: منظم u⃗ ∧ v⃗ يمثل مساحة متوازي الأضلاع، ويكون عمودياً على u⃗ و v⃗",
      ],
      essentialFormulasFr: [
        "Équation cartésienne d'un plan : ax + by + cz + d = 0 avec n⃗(a, b, c) vecteur normal",
        "Représentation paramétrique de droite : x = x_A + at, y = y_A + bt, z = z_A + ct",
        "Distance d'un point à un plan : d(M₀, P) = |ax₀ + by₀ + cz₀ + d| / √(a² + b² + c²)",
        "Équation de la sphère : (x - a)² + (y - b)² + (z - c)² = R²",
        "Produit vectoriel u⃗ ∧ v⃗ orthogonal à u⃗ et v⃗ avec ||u⃗ ∧ v⃗|| = aire du parallélogramme",
      ],
      commonPitfallsAr: [
        "الخلط بين المتجهة المنظمية على مستوى n⃗ والمتجهة الموجهة لمستقيم u⃗.",
        "نسيان القيمة المطلقة في بسط صيغة مسافة نقطة عن مستوى.",
        "الخطأ في حساب محددات الجداء المتجهي وضبط إشارة المعامل j⃗.",
      ],
      commonPitfallsFr: [
        "Confusion entre vecteur normal à un plan et vecteur directeur d'une droite.",
        "Oubli de la valeur absolue au numérateur de la distance point-plan.",
        "Erreur de signe sur la composante en j⃗ lors du calcul de u⃗ ∧ v⃗.",
      ],
      inspectorAdviceAr: "توجيه المفتش: لتحديد تقاطع فلكة مع مستوى، قارن المسافة d(Ω, (P)) مع شعاع الفلكة R (تقاطع فارغ، نقطة تماس، أو دائرة شعاعها r = √(R² - d²)).",
      inspectorAdviceFr: "Conseil de l'Inspecteur : Pour l'intersection plan-sphère, comparer systématiquement d = d(Ω, P) à R pour conclure (vide, tangent, cercle r = √(R² - d²)).",
    };
  }

  // الوضع الافتراضي العام لدروس الرياضيات المغربية
  return {
    lessonTitleAr: lAr,
    lessonTitleFr: lFr,
    coreDefinitionAr: `المفاهيم المحورية والقدرات المستهدفة وفق التوجيهات التربوية المغربية لدرس « ${lAr} ».`,
    coreDefinitionFr: `Notions clés et compétences attendues selon les Orientations Pédagogiques pour « ${lFr} ».`,
    essentialFormulasAr: [
      `الخاصية الأساسية الأولى: الاستيعاب الدقيق للتعريف الرياضي لـ « ${lesson.capacitiesAr[0] || lAr} ».`,
      `الخاصية الأساسية الثانية: البرهان المنطقي والتطبيق المباشر في الوضعيات القياسية.`,
      `الخاصية الأساسية الثالثة: التوليف وحل المعادلات والمتراجحات والمسائل التطبيقية.`,
    ],
    essentialFormulasFr: [
      `Propriété fondamentale 1 : Maîtrise rigoureuse de « ${lesson.capacitiesFr[0] || lFr} ».`,
      `Propriété fondamentale 2 : Démonstration logique et application directe usuelle.`,
      `Propriété fondamentale 3 : Résolution d'équations, inéquations et problèmes de synthèse.`,
    ],
    commonPitfallsAr: [
      "إغفال شروط التطبيق ومجال الصلاحية قبل الشروع في العمليات الحسابية.",
      "عدم تعليل الخطوات والاستدلال بالنتائج دون إبراز المبرهنات المعتمدة.",
    ],
    commonPitfallsFr: [
      "Oublier de vérifier le domaine de validité avant les calculs.",
      "Donner des résultats bruts sans justifier par les théorèmes du programme.",
    ],
    inspectorAdviceAr: "توجيه المفتش: التزم بالدقة المنهجية، واكتب بوضوح القواعد الرياضية المستعملة وأطر النتائج النهائية.",
    inspectorAdviceFr: "Conseil de l'Inspecteur : Rédiger avec rigueur, citer explicitement les théorèmes mobilisés et encadrer les résultats finaux.",
  };
}

export interface CustomSerieExerciseOption {
  exerciseIndex: number;
  exerciseNumber: number;
  lessonTitleAr: string;
  lessonTitleFr: string;
  levelBadgeAr: string;
  levelBadgeFr: string;
  stars: "★" | "★★" | "★★★";
  difficulty: "N1" | "N2" | "N3" | "N4";
  targetCapacityAr: string;
  targetCapacityFr: string;
  questionsAr: string[];
  questionsFr: string[];
  hintAr: string;
  hintFr: string;
  suggestedPoints?: string;
  didacticSectionAr?: string;
  didacticSectionFr?: string;
}

/**
 * يولد سلسلة تمارين مخصصة بعدد محدد بدقة يختاره الأستاذ (من 1 إلى 20 تمريناً)
 * مع تدرج ديداكتيكي دقيق (N1 تطبيق مباشر -> N2 تعبئة وتمارين نموذجية -> N3 توليف وامتحانات -> N4 مبادرة وأولمبياد)
 */
export function generateCustomCountSerieExercises(
  lessons: LessonItem[],
  targetCount: number = 6,
  model: "A" | "B" = "A"
): SerieExerciseBlock[] {
  const safeCount = Math.min(20, Math.max(1, targetCount));
  const primaryLesson = lessons[0] || {
    lessonAr: "الرياضيات",
    lessonFr: "Mathématiques",
    weight: 100,
    capacitiesAr: ["التحكم في المعارف الرياضية الأساسية", "البرهان وحل المشكلات"],
    capacitiesFr: ["Maîtrise des connaissances de base", "Raisonnement et résolution"],
  };

  const allBlocks: SerieExerciseBlock[] = [];

  // إذا كانت السلسلة تحتوي على أكثر من درس، نوزع التمارين على الدروس المختارة بالتساوي والتدرج
  for (let i = 0; i < safeCount; i++) {
    const lessonForEx = lessons[i % lessons.length] || primaryLesson;
    const altModel: "A" | "B" = model === "A" ? "B" : "A";
    const { questionsAr, questionsFr } = getVariantQuestions(lessonForEx, model, false);
    const { questionsAr: altQuestionsAr, questionsFr: altQuestionsFr } = getVariantQuestions(
      lessonForEx,
      altModel,
      false
    );
    const { questionsAr: synthQuestionsAr, questionsFr: synthQuestionsFr } = getVariantQuestions(
      lessonForEx,
      model,
      true
    );
    const subCat = lessonForEx.subCategory || "تحليل";
    const titleFr = lessonForEx.lessonFr.toLowerCase();
    const cap0Ar = lessonForEx.capacitiesAr[0] || lessonForEx.lessonAr;
    const cap1Ar = lessonForEx.capacitiesAr[1] || cap0Ar;
    const cap2Ar = lessonForEx.capacitiesAr[2] || cap1Ar;
    const cap0Fr = lessonForEx.capacitiesFr[0] || lessonForEx.lessonFr;
    const cap1Fr = lessonForEx.capacitiesFr[1] || cap0Fr;
    const cap2Fr = lessonForEx.capacitiesFr[2] || cap1Fr;
    const exNum = i + 1;

    // تدرج بيداغوجي للصعوبة بناء على موقع التمرين بالنسبة للعدد الإجمالي
    const relativePos = safeCount > 1 ? i / (safeCount - 1) : 0;

    let badgeAr = "";
    let badgeFr = "";
    let stars: "★" | "★★" | "★★★" = "★";
    let qAr: string[] = [];
    let qFr: string[] = [];
    let hintAr = "";
    let hintFr = "";
    let partPts = "";

    const stripLeadingQuestionNum = (txt: string): string =>
      txt
        .replace(/^\s*(?:Partie\s+[IVX]+\s*[—\-:]\s*|الجزء\s+[IVXأ-ي]+\s*[—\-:]\s*)?/i, "")
        .replace(/^\s*\d+[\.\)]\s*(?:[a-cأ-ج][\)\.]\s*)?/i, "")
        .trim();

    if (relativePos < 0.25 || i === 0) {
      // المرحلة الأولى: تطبيق مباشر وأوتوماتيزمات الحساب (N1) بأسئلة رياضية حقيقية من الدرس
      stars = "★";
      partPts = "2.5";
      badgeAr = `التمرين ${exNum} (★) [تطبيق وأوتوماتيزمات N1] — ${lessonForEx.lessonAr}`;
      badgeFr = `Exercice ${exNum} (★) [Application & Automatismes N1] — ${lessonForEx.lessonFr}`;
      qAr = [
        `1. ${stripLeadingQuestionNum(questionsAr[0] || `أحسب وبسط التعبير الأساسي المرتبط بـ « ${cap0Ar} ».`)}`,
        `2. ${stripLeadingQuestionNum(altQuestionsAr[1] || questionsAr[1] || `تحقق جبرياً من العلاقة المرجعية لـ « ${cap1Ar} ».`)}`,
        `3. ${stripLeadingQuestionNum(questionsAr[2] || `استنتج مجموعة التعريف أو القيم الخاصة المرتبطة بـ « ${cap0Ar} ».`)}`,
      ];
      qFr = [
        `1. ${stripLeadingQuestionNum(questionsFr[0] || `Calculer et simplifier l'expression fondamentale liée à « ${cap0Fr} ».`)}`,
        `2. ${stripLeadingQuestionNum(altQuestionsFr[1] || questionsFr[1] || `Vérifier algébriquement la relation de référence sur « ${cap1Fr} ».`)}`,
        `3. ${stripLeadingQuestionNum(questionsFr[2] || `En déduire le domaine de validité et les valeurs remarquables pour « ${cap0Fr} ».`)}`,
      ];
      hintAr = `تذكير ديداكتيكي: وظف مباشرة القواعد المرجعية لدرس ${lessonForEx.lessonAr} (${cap0Ar}).`;
      hintFr = `Rappel didactique : Appliquer directement les formules de référence sur ${lessonForEx.lessonFr} (${cap0Fr}).`;
    } else if (relativePos < 0.50 || i === 1) {
      // المرحلة الثانية: تعبئة الموارد وطرق الحساب النموذجية (N2) بأسئلة رياضية حقيقية
      stars = "★★";
      partPts = "3.0";
      badgeAr = `التمرين ${exNum} (★★) [طرائق وتمارين نموذجية N2] — ${lessonForEx.lessonAr}`;
      badgeFr = `Exercice ${exNum} (★★) [Méthodes types & Modèles N2] — ${lessonForEx.lessonFr}`;
      qAr = [
        `1. ${stripLeadingQuestionNum(questionsAr[1] || questionsAr[0] || `حل في المجموعة المناسبة المعادلات والمتراجحات المرتبطة بـ « ${cap0Ar} ».`)}`,
        `2. ${stripLeadingQuestionNum(altQuestionsAr[2] || questionsAr[2] || `أدرس الإشارة والرتابة باستعمال خواص « ${cap1Ar} ».`)}`,
        `3. أعطِ تأويلاً هندسياً أو بيانياً للنتيجة المحصل عليها في إطار « ${cap2Ar} ».`,
      ];
      qFr = [
        `1. ${stripLeadingQuestionNum(questionsFr[1] || questionsFr[0] || `Résoudre les équations et inéquations associées à « ${cap0Fr} ».`)}`,
        `2. ${stripLeadingQuestionNum(altQuestionsFr[2] || questionsFr[2] || `Étudier le signe et les variations en mobilisant « ${cap1Fr} ».`)}`,
        `3. Interpréter géométriquement ou graphiquement le résultat obtenu dans le cadre de « ${cap2Fr} ».`,
      ];
      hintAr = `منهجية: انتبه لشروط التكافؤ المنطقي وإشارات العوامل عند توظيف « ${cap1Ar} ».`;
      hintFr = `Méthode : Dresser un tableau de signes rigoureux et justifier chaque équivalence sur « ${cap1Fr} ».`;
    } else if (relativePos < 0.75 || i === 2) {
      // المرحلة الثالثة: تمرين توليفي نوعي يربط عدة محاور (Type DS / Examen)
      stars = "★★";
      partPts = "3.5";
      badgeAr = `التمرين ${exNum} (★★) [توليفي ونمط الامتحان الوطني N3] — ${lessonForEx.lessonAr}`;
      badgeFr = `Exercice ${exNum} (★★) [Synthèse & Type Examen National N3] — ${lessonForEx.lessonFr}`;
      qAr = [
        `1. ${stripLeadingQuestionNum(questionsAr[2] || questionsAr[0] || `بين تحقق الشروط القبلية للمبرهنة الأساسية في « ${cap1Ar} ».`)}`,
        `2. ${stripLeadingQuestionNum(altQuestionsAr[3] || synthQuestionsAr[synthQuestionsAr.length - 1] || `استنتج وجود الحل الوحيد أو العلاقة التوليفية المرتبطة بـ « ${cap2Ar} ».`)}`,
        `3. مسألة توليفية: اربط بين النتائج السابقة واستنتج التأطير أو القيمة المضبوطة بدقة في إطار « ${cap2Ar} ».`,
      ];
      qFr = [
        `1. ${stripLeadingQuestionNum(questionsFr[2] || questionsFr[0] || `Démontrer les hypothèses du théorème fondamental sur « ${cap1Fr} ».`)}`,
        `2. ${stripLeadingQuestionNum(altQuestionsFr[3] || synthQuestionsFr[synthQuestionsFr.length - 1] || `En déduire l'existence de la solution ou la relation de synthèse liée à « ${cap2Fr} ».`)}`,
        `3. Synthèse : Relier les résultats précédents pour conclure avec un encadrement précis sur « ${cap2Fr} ».`,
      ];
      hintAr = `منهجية الامتحان: صغ الفرضيات والشروط القبلية بوضوح قبل تطبيق المبرهنة في « ${lessonForEx.lessonAr} ».`;
      hintFr = `Conseil examen : Rédiger explicitement toutes les hypothèses avant d'appliquer le théorème sur « ${lessonForEx.lessonFr} ».`;
    } else if (relativePos < 0.90 || i === safeCount - 2) {
      // المرحلة الرابعة: مسألة النمذجة والاستمثال والمسائل الهندسية / الفيزيائية المفتوحة
      stars = "★★★";
      partPts = "4.0";
      badgeAr = `التمرين ${exNum} (★★★) [مسألة نمذجة واستمثال واقعي] — ${lessonForEx.lessonAr}`;
      badgeFr = `Exercice ${exNum} (★★★) [Modélisation concrète & Optimisation] — ${lessonForEx.lessonFr}`;
      if (subCat === "هندسة فضائية" || titleFr.includes("espace")) {
        qAr = [
          `1. نعتبر مجسماً هندسياً في الفضاء (فلكة ومستويات متقاطعة). عبر عن حجم أو مساحة المقطع بدلالة وسيط h.`,
          `2. حدد قيمة الوسيط h التي يكون من أجلها الحجم قصوياً أو دنوياً (مسألة الاستمثال).`,
          `3. صمم طريقة هندسية للتحقق من النتيجة باستعمال برمجية GeoGebra 3D.`,
        ];
        qFr = [
          `1. Exprimer le volume ou l'aire de la section en fonction d'un paramètre réel h.`,
          `2. Déterminer la valeur exacte de h qui optimise le volume (maximum/minimum).`,
          `3. Valider la conjecture à l'aide d'une simulation dynamique sous GeoGebra 3D.`,
        ];
      } else if (subCat === "أعداد عقدية" || titleFr.includes("complexe")) {
        qAr = [
          `1. اربط بين التحويل العقدي والمجموع الهندسي لمسافات النقط في المستوى.`,
          `2. بين أن مجموعة النقط التي تحقق شرطاً معيناً هي دائرة أو واسط قطعة، وحدد عناصرها المميزة.`,
          `3. بين أن النقط تشكل مضلعاً منتظماً واستنتج مساحته بدلالة عدد الأضلاع n.`,
        ];
        qFr = [
          `1. Modéliser la configuration géométrique par les nombres complexes.`,
          `2. Déterminer la nature de l'ensemble des points M(z) vérifiant la condition géométrique.`,
          `3. Démontrer que les points forment un polygone régulier et exprimer son aire.`,
        ];
      } else if (subCat === "هندسة مستوية" || titleFr.includes("vector") || titleFr.includes("projection")) {
        qAr = [
          `1. ليكن ABCD متوازي أضلاع، و E و F نقطتين بحيث $\\vec{AE} = \\frac{1}{3}\\vec{AB}$ و $\\vec{CF} = \\frac{1}{3}\\vec{CD}$. بين أن المتجهتين $\\vec{EC}$ و $\\vec{AF}$ متساويتان.`,
          `2. ليكن G مركز ثقل المثلث ABD. عبر عن $\\vec{AG}$ بدلالة $\\vec{AB}$ و $\\vec{AD}$، ثم استنتج أن النقط A و G و C مستقيمية.`,
          `3. أنشئ مسقط النقطة G على المستقيم (AD) بتوازٍ مع (AB)، ثم حدد نسبته على القطعة [AD].`,
        ];
        qFr = [
          `1. Soit ABCD un parallélogramme, E et F définis par $\\vec{AE} = \\frac{1}{3}\\vec{AB}$ et $\\vec{CF} = \\frac{1}{3}\\vec{CD}$. Montrer que $\\vec{EC} = \\vec{AF}$.`,
          `2. Soit G le centre de gravité du triangle ABD. Exprimer $\\vec{AG}$ en fonction de $\\vec{AB}$ et $\\vec{AD}$, puis déduire l'alignement de A, G et C.`,
          `3. Construire le projeté de G sur (AD) parallèlement à (AB) et préciser sa position sur [AD].`,
        ];
        hintAr = `إرشاد هندسي: استعمل علاقة شال في الأساس $(\\vec{AB}, \\vec{AD})$ وخاصية الحفاظ على معامل الاستقامية بالإسقاط.`;
        hintFr = `Indication géométrique : Utiliser Chasles dans la base $(\\vec{AB}, \\vec{AD})$ et la conservation du rapport par projection.`;
      } else if (subCat === "منطق ومجموعات" || titleFr.includes("logique") || lessonForEx.lessonAr.includes("منطق")) {
        qAr = [
          `1. بين باستعمال الاستدلال بالخلف أنه لكل $n \\in \\mathbb{N}$ : العدد $\\sqrt{4n + 3}$ لا ينتمي إلى $\\mathbb{Q}$ (أو ليس مربعاً كاملاً).`,
          `2. بين بالاستدلال بالترجع أنه لكل $n \\in \\mathbb{N}^*$ : $\\sum_{k=1}^n k(k+1) = \\frac{n(n+1)(n+2)}{3}$.`,
          `3. بين بمضاد العكس أنه لكل $x, y \\in \\mathbb{R}^+$ : $x \\neq y \\implies \\frac{x}{x+1} \\neq \\frac{y}{y+1}$.`,
        ];
        qFr = [
          `1. Montrer par l'absurde que pour tout $n \\in \\mathbb{N}$, $4n + 3$ n'est pas un carré parfait.`,
          `2. Montrer par récurrence que pour tout $n \\in \\mathbb{N}^*$, $\\sum_{k=1}^n k(k+1) = \\frac{n(n+1)(n+2)}{3}$.`,
          `3. Montrer par contraposée que pour tous $x, y \\ge 0$ : $x \\neq y \\implies \\frac{x}{x+1} \\neq \\frac{y}{y+1}$.`,
        ];
        hintAr = `إرشاد منطقي: في مضاد العكس، انطلق من $\\frac{x}{x+1} = \\frac{y}{y+1}$ واثبت أن $x = y$.`;
        hintFr = `Indication logique : Pour la contraposée, partir de $\\frac{x}{x+1} = \\frac{y}{y+1}$ et en déduire $x = y$.`;
      } else if (titleFr.includes("généralité") || lessonForEx.lessonAr.includes("عموميات")) {
        qAr = [
          `1. نعتبر الدالة $f(x) = \\frac{x^2 - 2x + 5}{x^2 + 1}$. بين أن $f$ مصغورة بـ $\\frac{3 - \\sqrt{5}}{2}$ ومكبورة على $\\mathbb{R}$ بدراسة إشارة الفرق.`,
          `2. أدرس تغيرات الدالة $f$ على المجال $[0, +\\infty[$ انطلاقاً من معدل التغير $\\frac{f(a) - f(b)}{a - b}$، ثم ضع جدول تغيراتها.`,
          `3. استنتج المطاريف القصوى والدنيا للدالة على المجال المدروس.`,
        ];
        qFr = [
          `1. Soit $f(x) = \\frac{x^2 - 2x + 5}{x^2 + 1}$. Montrer que $f$ est bornée sur $\\mathbb{R}$ par étude de signe.`,
          `2. Étudier les variations de $f$ à l'aide du taux d'accroissement $\\frac{f(a) - f(b)}{a - b}$ et dresser le tableau de variations.`,
          `3. En déduire les extremums de $f$ sur l'intervalle étudié.`,
        ];
        hintAr = `إرشاد: استعمل معدل التغير $\\frac{f(a) - f(b)}{a - b}$ ومقارنة الدالة بثابت دون اللجوء إلى المشتقة.`;
        hintFr = `Indication : Utiliser le taux d'accroissement et la comparaison avec une constante (sans dérivation).`;
      } else if (titleFr.includes("suite") || lessonForEx.lessonAr.includes("متتاليات")) {
        qAr = [
          `1. يضع شخص مبلغاً قدره $10000\\text{ DH}$ في حساب بنكي بفائدة سنوية مركبة نسبتها $4\\%$. عبر عن الرصيد $u_n$ بعد $n$ سنة بدلالة $u_{n-1}$.`,
          `2. بين أن $(u_n)$ متتالية هندسية وحدد أساسها، ثم احسب الرصيد بعد $10$ سنوات.`,
          `3. استنتج المبلغ الإجمالي للودائع المتراكمة وحدد السنة التي يتجاوز فيها الرصيد ضعف المبلغ الأولي.`,
        ];
        qFr = [
          `1. Un capital de $10000\\text{ DH}$ est placé à intérêts composés au taux annuel de $4\\%$. Exprimer $u_n$ en fonction de $u_{n-1}$.`,
          `2. Montrer que $(u_n)$ est géométrique, préciser sa raison et calculer $u_{10}$.`,
          `3. Déterminer le rang $n$ à partir duquel le capital double.`,
        ];
        hintAr = `إرشاد: الرصيد السنوي يضرب في المعامل $(1 + 0,04) = 1,04$ كل سنة.`;
        hintFr = `Indication : Chaque année, le capital est multiplié par $1,04$.`;
      } else if (
        lessonForEx.lessonAr.includes("النسب") ||
        lessonForEx.lessonAr.includes("الحساب العددي") ||
        titleFr.includes("pourcentage") ||
        titleFr.includes("numérique")
      ) {
        qAr = [
          `1. ارتفع ثمن منتوج بنسبة $15\\%$ ثم انخفض بنسبة $10\\%$. حدد النسبة المئوية الإجمالية للتغير.`,
          `2. حل في $\\mathbb{R}$ المعادلة $2x^2 - 7x + 3 = 0$ ثم المتراجحة $2x^2 - 7x + 3 \\le 0$.`,
          `3. وظف النتيجة لتحديد هامش الربح الأمثل لمقاولة صغرى.`,
        ];
        qFr = [
          `1. Un prix augmente de $15\\%$ puis diminue de $10\\%$. Calculer le taux d'évolution global.`,
          `2. Résoudre dans $\\mathbb{R}$ l'équation $2x^2 - 7x + 3 = 0$ puis l'inéquation $2x^2 - 7x + 3 \\le 0$.`,
          `3. Interpréter le résultat dans le cadre d'un problème commercial simple.`,
        ];
        hintAr = `إرشاد: المعامل الضربي الإجمالي يساوي $(1 + 0,15)(1 - 0,10)$.`;
        hintFr = `Indication : Le coefficient multiplicateur global est $(1 + 0,15)(1 - 0,10)$.`;
      } else {
        qAr = [
          `1. نعتبر وضعية نمذجة لحساب مساحة حيز مستوٍ أو نمو ظاهرة طبيعية عبر الدالة f(x).`,
          `2. أوجد القيمة المثلى للمتغير x التي تجعل المردودية أو المساحة قصوية بدراسة إشارة المشتقة f'(x).`,
          `3. ناقش مصداقية النموذج والحلول الممكنة حسب الشروط الواقعية للمسألة.`,
        ];
        qFr = [
          `1. Modélisation : Traduire la situation concrète par une fonction f(x) à optimiser.`,
          `2. Déterminer l'extremum local en étudiant la dérivée première et dresser le bilan.`,
          `3. Interpréter la portée pratique et discuter les limites du modèle.`,
        ];
        hintAr = `إرشاد للنمذجة: حدد بوضوح المتغير المستقل ومجموعة تعريفه الواقعية قبل اشتقاق دالة الاستمثال.`;
        hintFr = `Indication modélisation : Poser précisément la variable et son intervalle de définition réel.`;
      }
    } else {
      // المرحلة الأخيرة: تحدي التميز والبحث المفتوح والأولمبياد (N4)
      stars = "★★★";
      partPts = "4.5";
      badgeAr = `التمرين ${exNum} (★★★) [تحدي التميز وأولمبياد الرياضيات N4] — ${lessonForEx.lessonAr}`;
      badgeFr = `Exercice ${exNum} (★★★) [Défi d'Excellence & Olympiades N4] — ${lessonForEx.lessonFr}`;
      if (subCat === "حسابيات" || subCat === "جبر" || titleFr.includes("arithm")) {
        qAr = [
          `1. مسألة أولمبياد مفتوحة: ليكن n عدداً صحيحاً طبيعياً. بين أن العدد $A = n(n + 1)(2n + 1)$ مضاعف للعدد 6.`,
          `2. حدد جميع الأزواج $(x, y) \\in \\mathbb{N}^2$ التي تحقق المعادلة: $xy = 2x + 3y + 1$.`,
          `3. سؤال المبادرة والبحث: استنتج حلول المعادلة $x^2 - y^2 = 2025$ في $\\mathbb{N}^2$.`,
        ];
        qFr = [
          `1. Défi Olympiades : Soit $n \\in \\mathbb{N}$. Démontrer que $A = n(n + 1)(2n + 1)$ est un multiple de 6.`,
          `2. Déterminer tous les couples $(x, y) \\in \\mathbb{N}^2$ vérifiant $xy = 2x + 3y + 1$.`,
          `3. Prise d'initiative : Résoudre dans $\\mathbb{N}^2$ l'équation $x^2 - y^2 = 2025$.`,
        ];
        hintAr = `تحدي حسابي: عمّل المعادلة على شكل $(x - 3)(y - 2) = 7$ وادرس قواسم 7 الموجبة.`;
        hintFr = `Piste arithmétique : Factoriser sous la forme $(x - 3)(y - 2) = 7$ et étudier les diviseurs positifs de 7.`;
      } else if (subCat === "هندسة مستوية" || titleFr.includes("vector") || titleFr.includes("projection")) {
        qAr = [
          `1. تحدي الهندسة المستوية: ليكن ABC مثلثاً، و P و Q نقطتين بحيث $\\vec{AP} = \\frac{1}{4}\\vec{AB}$ و $\\vec{AQ} = \\frac{1}{3}\\vec{AC}$.`,
          `2. ليكن R نقطة تقاطع المستقيمين (BQ) و (CP)، و S مسقط النقطة R على (AC) بتوازٍ مع (BC). عبر عن $\\vec{AR}$ بدلالة $\\vec{AB}$ و $\\vec{AC}$.`,
          `3. سؤال المبادرة: استنتج النسبة $\\frac{AS}{AC}$ باستعمال خاصيات الإسقاط في المستوى.`,
        ];
        qFr = [
          `1. Défi géométrique : Soit ABC un triangle, P et Q tels que $\\vec{AP} = \\frac{1}{4}\\vec{AB}$ et $\\vec{AQ} = \\frac{1}{3}\\vec{AC}$.`,
          `2. Soit R l'intersection de (BQ) et (CP), et S le projeté de R sur (AC) parallèlement à (BC). Exprimer $\\vec{AR}$ en fonction de $\\vec{AB}$ et $\\vec{AC}$.`,
          `3. Prise d'initiative : En déduire le rapport $\\frac{AS}{AC}$ par projection dans le plan.`,
        ];
        hintAr = `تحدي هندسي: استعمل استقامية النقط B, R, Q والنقط C, R, P لتحديد معاملات $\\vec{AR}$ في الأساس $(\\vec{AB}, \\vec{AC})$.`;
        hintFr = `Piste géométrique : Exploiter l'alignement de B, R, Q et de C, R, P dans la base $(\\vec{AB}, \\vec{AC})$.`;
      } else if (subCat === "أعداد عقدية" || titleFr.includes("complexe")) {
        qAr = [
          `1. مسألة التحدي الأولمبي: لكل عدد عقدي z يحقق z^n = 1 مع z ≠ 1، نعتبر المجموع S_n = ∑_{k=1}^{n-1} 1/(1 - e^{i2kπ/n}). تحقق أن 1/(1 - z) + 1/(1 - z̄) = 1.`,
          `2. برهن أن الجزء الحقيقي لكل حد من حدود المجموع ثابت ويساوي 1/2.`,
          `3. سؤال المبادرة: استنتج القيمة الدقيقة للمجموع S_n بدلالة n.`,
        ];
        qFr = [
          `1. Défi d'Excellence : Pour tout z racine n-ième de l'unité (z ≠ 1), on pose S_n = ∑_{k=1}^{n-1} 1/(1 - e^{i2kπ/n}). Vérifier que 1/(1 - z) + 1/(1 - z̄) = 1.`,
          `2. Établir que la partie réelle de chaque terme est constante égale à 1/2.`,
          `3. Prise d'initiative : En déduire la valeur exacte de la somme S_n en fonction de n.`,
        ];
        hintAr = `تحدي عقدي: استثمر المرافق الهندسي لجذور الوحدة في الدائرة المثلثية.`;
        hintFr = `Piste complexe : Utiliser le conjugué des racines n-ièmes de l'unité.`;
      } else if (subCat === "منطق ومجموعات" || titleFr.includes("logique") || lessonForEx.lessonAr.includes("منطق")) {
        qAr = [
          `1. بين باستعمال الاستدلال بالخلف أنه لكل $n \\in \\mathbb{N}$ : العدد $\\sqrt{4n + 3}$ لا ينتمي إلى $\\mathbb{Q}$ (أو ليس مربعاً كاملاً).`,
          `2. بين بالاستدلال بالترجع أنه لكل $n \\in \\mathbb{N}^*$ : $\\sum_{k=1}^n k(k+1) = \\frac{n(n+1)(n+2)}{3}$.`,
          `3. بين بمضاد العكس أنه لكل $x, y \\in \\mathbb{R}^+$ : $x \\neq y \\implies \\frac{x}{x+1} \\neq \\frac{y}{y+1}$.`,
        ];
        qFr = [
          `1. Montrer par l'absurde que pour tout $n \\in \\mathbb{N}$, $4n + 3$ n'est pas un carré parfait.`,
          `2. Montrer par récurrence que pour tout $n \\in \\mathbb{N}^*$, $\\sum_{k=1}^n k(k+1) = \\frac{n(n+1)(n+2)}{3}$.`,
          `3. Montrer par contraposée que pour tous $x, y \\ge 0$ : $x \\neq y \\implies \\frac{x}{x+1} \\neq \\frac{y}{y+1}$.`,
        ];
        hintAr = `إرشاد منطقي: في مضاد العكس، انطلق من $\\frac{x}{x+1} = \\frac{y}{y+1}$ واثبت أن $x = y$.`;
        hintFr = `Indication logique : Pour la contraposée, partir de $\\frac{x}{x+1} = \\frac{y}{y+1}$ et en déduire $x = y$.`;
      } else if (titleFr.includes("généralité") || lessonForEx.lessonAr.includes("عموميات")) {
        qAr = [
          `1. نعتبر الدالة $f(x) = \\frac{x^2 - 2x + 5}{x^2 + 1}$. بين أن $f$ مصغورة بـ $\\frac{3 - \\sqrt{5}}{2}$ ومكبورة على $\\mathbb{R}$ بدراسة إشارة الفرق.`,
          `2. أدرس تغيرات الدالة $f$ على المجال $[0, +\\infty[$ انطلاقاً من معدل التغير $\\frac{f(a) - f(b)}{a - b}$، ثم ضع جدول تغيراتها.`,
          `3. استنتج المطاريف القصوى والدنيا للدالة على المجال المدروس.`,
        ];
        qFr = [
          `1. Soit $f(x) = \\frac{x^2 - 2x + 5}{x^2 + 1}$. Montrer que $f$ est bornée sur $\\mathbb{R}$ par étude de signe.`,
          `2. Étudier les variations de $f$ à l'aide du taux d'accroissement $\\frac{f(a) - f(b)}{a - b}$ et dresser le tableau de variations.`,
          `3. En déduire les extremums de $f$ sur l'intervalle étudié.`,
        ];
        hintAr = `إرشاد: استعمل معدل التغير $\\frac{f(a) - f(b)}{a - b}$ ومقارنة الدالة بثابت دون اللجوء إلى المشتقة.`;
        hintFr = `Indication : Utiliser le taux d'accroissement et la comparaison avec une constante (sans dérivation).`;
      } else if (titleFr.includes("suite") || lessonForEx.lessonAr.includes("متتاليات")) {
        qAr = [
          `1. يضع شخص مبلغاً قدره $10000\\text{ DH}$ في حساب بنكي بفائدة سنوية مركبة نسبتها $4\\%$. عبر عن الرصيد $u_n$ بعد $n$ سنة بدلالة $u_{n-1}$.`,
          `2. بين أن $(u_n)$ متتالية هندسية وحدد أساسها، ثم احسب الرصيد بعد $10$ سنوات.`,
          `3. استنتج المبلغ الإجمالي للودائع المتراكمة وحدد السنة التي يتجاوز فيها الرصيد ضعف المبلغ الأولي.`,
        ];
        qFr = [
          `1. Un capital de $10000\\text{ DH}$ est placé à intérêts composés au taux annuel de $4\\%$. Exprimer $u_n$ en fonction de $u_{n-1}$.`,
          `2. Montrer que $(u_n)$ est géométrique, préciser sa raison et calculer $u_{10}$.`,
          `3. Déterminer le rang $n$ à partir duquel le capital double.`,
        ];
        hintAr = `إرشاد: الرصيد السنوي يضرب في المعامل $(1 + 0,04) = 1,04$ كل سنة.`;
        hintFr = `Indication : Chaque année, le capital est multiplié par $1,04$.`;
      } else if (
        lessonForEx.lessonAr.includes("النسب") ||
        lessonForEx.lessonAr.includes("الحساب العددي") ||
        titleFr.includes("pourcentage") ||
        titleFr.includes("numérique")
      ) {
        qAr = [
          `1. ارتفع ثمن منتوج بنسبة $15\\%$ ثم انخفض بنسبة $10\\%$. حدد النسبة المئوية الإجمالية للتغير.`,
          `2. حل في $\\mathbb{R}$ المعادلة $2x^2 - 7x + 3 = 0$ ثم المتراجحة $2x^2 - 7x + 3 \\le 0$.`,
          `3. وظف النتيجة لتحديد هامش الربح الأمثل لمقاولة صغرى.`,
        ];
        qFr = [
          `1. Un prix augmente de $15\\%$ puis diminue de $10\\%$. Calculer le taux d'évolution global.`,
          `2. Résoudre dans $\\mathbb{R}$ l'équation $2x^2 - 7x + 3 = 0$ puis l'inéquation $2x^2 - 7x + 3 \\le 0$.`,
          `3. Interpréter le résultat dans le cadre d'un problème commercial simple.`,
        ];
        hintAr = `إرشاد: المعامل الضربي الإجمالي يساوي $(1 + 0,15)(1 - 0,10)$.`;
        hintFr = `Indication : Le coefficient multiplicateur global est $(1 + 0,15)(1 - 0,10)$.`;
      } else if (
        lessonForEx.lessonAr.includes("مثلث") ||
        titleFr.includes("trigonom")
      ) {
        qAr = [
          `1. بسط التعبير $A(x) = \\cos^2(x) + \\sin^2(x) + \\cos(\\pi - x) + \\cos(x)$ لكل $x \\in \\mathbb{R}$.`,
          `2. حل في المجال $[0, 2\\pi[$ المعادلة $2\\cos(x) - 1 = 0$ ثم المتراجحة $2\\cos(x) - 1 \\ge 0$.`,
          `3. مثل مجموعة الحلول على الدائرة المثلثية.`,
        ];
        qFr = [
          `1. Simplifier l'expression $A(x) = \\cos^2(x) + \\sin^2(x) + \\cos(\\pi - x) + \\cos(x)$.`,
          `2. Résoudre dans $[0, 2\\pi[$ l'équation $2\\cos(x) - 1 = 0$ puis l'inéquation $2\\cos(x) - 1 \\ge 0$.`,
          `3. Représenter les solutions sur le cercle trigonométrique.`,
        ];
        hintAr = `إرشاد: تذكر أن $\\cos(\\pi - x) = -\\cos(x)$ و$\\cos(\\frac{\\pi}{3}) = \\frac{1}{2}$.`;
        hintFr = `Indication : Rappeler $\\cos(\\pi - x) = -\\cos(x)$ et $\\cos(\\frac{\\pi}{3}) = \\frac{1}{2}$.`;
      } else if (
        lessonForEx.lessonAr.includes("إحصاء") ||
        titleFr.includes("statistiq")
      ) {
        qAr = [
          `1. نعتبر سلسلة إحصائية قيمها $\\{5, 10, 15, 20\\}$ وحصيصاتها $\\{2, 5, 8, 5\\}$. احسب المعدل الحسابي $\\bar{x}$.`,
          `2. احسب التباين $V$ والانحراف الطرازي $\\sigma$ لهذه السلسلة.`,
          `3. أضف قيمة جديدة تساوي $\\bar{x}$ إلى السلسلة وعلق على تغير التشتت.`,
        ];
        qFr = [
          `1. Soit la série statistique de valeurs $\\{5, 10, 15, 20\\}$ et d'effectifs $\\{2, 5, 8, 5\\}$. Calculer la moyenne $\\bar{x}$.`,
          `2. Calculer la variance $V$ et l'écart-type $\\sigma$.`,
          `3. Interpréter la dispersion autour de la moyenne.`,
        ];
        hintAr = `إرشاد: $V = \\frac{1}{N}\\sum n_i x_i^2 - \\bar{x}^2$ و$\\sigma = \\sqrt{V}$.`;
        hintFr = `Indication : $V = \\frac{1}{N}\\sum n_i x_i^2 - \\bar{x}^2$ et $\\sigma = \\sqrt{V}$.`;
      } else if (
        lessonForEx.lessonAr.includes("اتصال") ||
        lessonForEx.lessonAr.includes("اشتقاق") ||
        lessonForEx.lessonAr.includes("تكامل") ||
        titleFr.includes("continuit") ||
        titleFr.includes("dériv") ||
        titleFr.includes("intégral")
      ) {
        qAr = [
          `1. مسألة التحدي والبحث المفتوح: لتكن $f$ دالة متصلة على $[0, 1]$ تحقق $f(0) = 0$ و$f(1) = 1$. نضع $g(x) = f(x + \\frac{1}{n}) - f(x) - \\frac{1}{n}$.`,
          `2. بين أنه لكل عدد صحيح $n \\ge 2$، يوجد عدد $c_n \\in ]0, 1[$ بحيث $f(c_n + \\frac{1}{n}) - f(c_n) = \\frac{1}{n}$.`,
          `3. سؤال المبادرة المفتوح: ادرس سلوك المتتالية $(c_n)$ عندما يؤول $n$ إلى $+\\infty$.`,
        ];
        qFr = [
          `1. Problème de Recherche & Olympiades : Soit $f$ continue sur $[0, 1]$ avec $f(0) = 0$ et $f(1) = 1$. On pose $g(x) = f(x + \\frac{1}{n}) - f(x) - \\frac{1}{n}$.`,
          `2. Démontrer que pour tout $n \\ge 2$, il existe $c_n \\in ]0, 1[$ tel que $f(c_n + \\frac{1}{n}) - f(c_n) = \\frac{1}{n}$.`,
          `3. Question ouverte : Étudier le comportement de $(c_n)$ quand $n \\to +\\infty$.`,
        ];
        hintAr = `تحدي أولمبياد: استعمل الدالة المساعدة $g(x) = f(x + \\frac{1}{n}) - f(x) - \\frac{1}{n}$ والمجموع التلسكوبي وطبق مبرهنة القيم الوسيطية.`;
        hintFr = `Piste Olympiades : Exploiter une somme télescopique et le théorème des valeurs intermédiaires.`;
      } else {
        qAr = [
          `1. تطبيق تركيبي حول « ${lessonForEx.lessonAr} »: ${lessonForEx.sampleExerciseAr?.[0] || `تحقق من الخاصية الأساسية المرتبطة بـ « ${cap0Ar} ».`}`,
          `2. توظيف وتعميق: ${lessonForEx.sampleExerciseAr?.[1] || `استثمر « ${cap1Ar} » لحل الوضعية واستنتاج النتيجة.`}`,
          `3. سؤال التحدي: استخلص قاعدة عامة أو تأويلاً مناسباً انطلاقاً من النتائج السابقة.`,
        ];
        qFr = [
          `1. Application de synthèse (« ${lessonForEx.lessonFr} ») : ${lessonForEx.sampleExerciseFr?.[0] || `Vérifier la propriété liée à « ${cap0Fr} ».`}`,
          `2. Approfondissement : ${lessonForEx.sampleExerciseFr?.[1] || `Mobiliser « ${cap1Fr} » pour conclure.`}`,
          `3. Question défi : Formuler une généralisation ou une interprétation pertinente.`,
        ];
        hintAr = `إرشاد منهجي: اربط بين معطيات التمرين وخاصيات « ${cap0Ar} ».`;
        hintFr = `Indication méthodologique : Articuler les données avec « ${cap0Fr} ».`;
      }
    }

    allBlocks.push({
      badgeAr,
      badgeFr,
      stars,
      partPoints: partPts,
      questionsAr: qAr,
      questionsFr: qFr,
      hintAr,
      hintFr,
      competenciesAr: [cap0Ar, cap1Ar],
      competenciesFr: [cap0Fr, cap1Fr],
    });
  }

  return allBlocks;
}

/**
 * المرحلة 4 من خارطة الطريق (أ):
 * هندسة سلاسل التمارين ذات المستويات الثلاثية الفارقية (3-Tier Differentiated Series)
 * مع شارات المناولة الصفية/المنزلية وتلميحات السبورة السريعة للأستاذ
 */
export interface DifferentiatedSeriesTierItem {
  tierCode: "TIER_1_APPLICATION" | "TIER_2_CONSOLIDATION" | "TIER_3_EXCELLENCE";
  tierTitleAr: string;
  tierTitleFr: string;
  usageBadgeAr: string;
  estimatedMinutes: number;
  teacherBoardHintAr: string;
  exercises: SerieExerciseBlock[];
}

export function buildThreeTierDifferentiatedSeries(
  lessons: LessonItem[],
  model: "A" | "B" = "A"
): DifferentiatedSeriesTierItem[] {
  const rawBlocks = generateCustomCountSerieExercises(lessons, 6, model);
  const firstLesson = lessons[0];
  const cap0 = firstLesson?.capacitiesAr?.[0] || firstLesson?.lessonAr || "القدرات الأساسية";

  return [
    {
      tierCode: "TIER_1_APPLICATION",
      tierTitleAr: "المستوى I: تمارين التطبيق المباشر وتثبيت القواعد (N1 — للجميع)",
      tierTitleFr: "Niveau I : Application directe et consolidation des réflexes (N1)",
      usageBadgeAr: "[للمناولة داخل القسم · 15 د لكل تمرين]",
      estimatedMinutes: 30,
      teacherBoardHintAr: `توجيه للأستاذ على السبورة: ركز على سلامة الترميز الرياضي والتحقق من شروط « ${cap0} » قبل الانتقال للحساب.`,
      exercises: rawBlocks.slice(0, 2),
    },
    {
      tierCode: "TIER_2_CONSOLIDATION",
      tierTitleAr: "المستوى II: تمارين التعمق والاستدلال ونمط الفروض المحروسة (N2)",
      tierTitleFr: "Niveau II : Approfondissement, méthodes types et préparation au DS (N2)",
      usageBadgeAr: "[للقسم والتحضير المنزلي · 25 د لكل تمرين]",
      estimatedMinutes: 50,
      teacherBoardHintAr:
        "توجيه للأستاذ: طالب المتعلمين بتعليل كل تكافؤ منطقي وتأطير النتيجة النهائية كما في شبكة تصحيح الفرض المحروس.",
      exercises: rawBlocks.slice(2, 4),
    },
    {
      tierCode: "TIER_3_EXCELLENCE",
      tierTitleAr: "المستوى III: مسائل التوليف والنمذجة وتحدي التميز (N3/N4)",
      tierTitleFr: "Niveau III : Problèmes de synthèse, modélisation et défi d'excellence (N3/N4)",
      usageBadgeAr: "[للتميز والعمل بالمجموعات · 35 د لكل مسألة]",
      estimatedMinutes: 70,
      teacherBoardHintAr:
        "توجيه للأستاذ: افسح المجال للمبادرة الفردية ومقارنة طرائق الحل المختلفة قبل تقديم الحل النموذجي.",
      exercises: rawBlocks.slice(4, 6),
    },
  ];
}

/**
 * المرحلة 4 من خارطة الطريق (ب):
 * مولد الفروض المنزلية المفرّدة بالمعاملات لمنع النقل الآلي (Anti-Plagiarism Parameterized DM)
 * مع سقالات البحث المرحلية (Guided Scaffolding) وسلم التنقيط المفتشي (20/20)
 */
export interface ParameterizedHomeworkGroupVariant {
  groupId: "A" | "B" | "C" | "D";
  groupLabelAr: string;
  parameters: { alpha: number; beta: number; gamma: number };
  exercises: Array<{
    exerciseNum: number;
    lessonTitleAr: string;
    questionsAr: string[];
    questionsFr: string[];
    guidedScaffoldingHintsAr: string[];
    guidedScaffoldingHintsFr: string[];
    answerKeySummaryAr: string;
  }>;
}

export interface ParameterizedHomeworkPack {
  dmTitleAr: string;
  dmType: MoroccanDMType;
  groups: ParameterizedHomeworkGroupVariant[];
  inspectorRubric20Pts: Array<{
    code: string;
    criterionAr: string;
    criterionFr: string;
    points: number;
  }>;
}

export function generateParameterizedHomeworkVariants(
  lessons: LessonItem[],
  dmType: MoroccanDMType = "PREPARATOIRE_DS"
): ParameterizedHomeworkPack {
  const safeLessons = lessons.length > 0 ? lessons : [];
  const groupIds: Array<"A" | "B" | "C" | "D"> = ["A", "B", "C", "D"];

  const groups: ParameterizedHomeworkGroupVariant[] = groupIds.map((groupId, gIdx) => {
    const alpha = gIdx + 2; // 2, 3, 4, 5
    const beta = (gIdx + 1) * 2 + 1; // 3, 5, 7, 9
    const gamma = gIdx + 1; // 1, 2, 3, 4

    const exercises = safeLessons.slice(0, 3).map((lesson, exIdx) => {
      const variant = getVariantQuestions(lesson, groupId, false, gIdx + 1, "STANDARD");
      const cap0Ar = lesson.capacitiesAr[0] || lesson.lessonAr;
      const cap1Ar = lesson.capacitiesAr[1] || cap0Ar;
      const cap0Fr = lesson.capacitiesFr[0] || lesson.lessonFr;

      return {
        exerciseNum: exIdx + 1,
        lessonTitleAr: lesson.lessonAr,
        questionsAr: variant.questionsAr.map(
          (q, qIdx) =>
            `${qIdx + 1}) [معطيات الفوج ${groupId}: α=${alpha}, β=${beta}] ${q}`
        ),
        questionsFr: variant.questionsFr.map(
          (q, qIdx) =>
            `${qIdx + 1}) [Données Groupe ${groupId} : α=${alpha}, β=${beta}] ${q}`
        ),
        guidedScaffoldingHintsAr: [
          `إرشاد منهجي 1 (سقالة بحث): استعمل خاصية « ${cap0Ar} » مع تعويض الوسيط α = ${alpha}.`,
          `إرشاد منهجي 2: اربط إشارة التعبير الناتج بالقيمة الحدية المرتبطة بـ β = ${beta} في إطار « ${cap1Ar} ».`,
        ],
        guidedScaffoldingHintsFr: [
          `Indication 1 : Mobiliser « ${cap0Fr} » avec le paramètre α = ${alpha}.`,
          `Indication 2 : Exploiter la valeur remarquable liée à β = ${beta}.`,
        ],
        answerKeySummaryAr: `مفتاح تصحيح الفوج ${groupId}: القيمة المميزة x₀ = ${beta}/${alpha} = ${(
          beta / alpha
        ).toFixed(2)}، مع ثبات بنية البرهان والاستنتاج الهندسي.`,
      };
    });

    return {
      groupId,
      groupLabelAr: `الفوج ${groupId} (معاملات التخصيص: α=${alpha}, β=${beta}, γ=${gamma})`,
      parameters: { alpha, beta, gamma },
      exercises,
    };
  });

  return {
    dmTitleAr: MOROCCAN_DM_PRESETS[dmType].titleAr,
    dmType,
    groups,
    inspectorRubric20Pts: [
      {
        code: "R1",
        criterionAr: "مجهود البحث الفردي واستثمار الإرشادات المنهجية",
        criterionFr: "Effort de recherche personnelle et exploitation des pistes",
        points: 4,
      },
      {
        code: "R2",
        criterionAr: "سلامة الاستدلال المنطقي وتبرير شروط المبرهنات",
        criterionFr: "Rigueur du raisonnement et justification des hypothèses",
        points: 10,
      },
      {
        code: "R3",
        criterionAr: "الدقة الحسابية من أجل معاملات الفوج (α, β) والإنشاء الهندسي",
        criterionFr: "Exactitude des calculs paramétrés et tracés graphiques",
        points: 4,
      },
      {
        code: "R4",
        criterionAr: "جودة التحرير الرياضي وتنظيم الورقة المزدوجة",
        criterionFr: "Qualité de la rédaction mathématique et soin de la copie",
        points: 2,
      },
    ],
  };
}

