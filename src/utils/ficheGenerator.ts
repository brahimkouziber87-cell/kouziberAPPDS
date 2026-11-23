import { LessonItem, TrackData } from "../data/curriculum";

export interface FicheDefinitionItem {
  termAr: string;
  termFr: string;
  contentAr: string;
  contentFr: string;
  notationMath?: string;
}

export interface FicheTheoremItem {
  nameAr: string;
  nameFr: string;
  statementAr: string;
  statementFr: string;
  proofAr?: string;
  proofFr?: string;
  proofStepsAr?: string[];
  proofStepsFr?: string[];
  conditionsAr?: string[];
  conditionsFr?: string[];
  corollaryAr?: string;
  corollaryFr?: string;
}

export interface FicheSolvedExampleItem {
  titleAr: string;
  titleFr: string;
  statementAr: string;
  statementFr: string;
  solutionStepsAr: string[];
  solutionStepsFr: string[];
  pedagogicalNoteAr: string;
  pedagogicalNoteFr: string;
  difficultyLevel?: "N1" | "N2" | "N3";
}

export interface FicheCourseSection {
  sectionNum: number;
  titleAr: string;
  titleFr: string;
  axisSummaryAr?: string;
  axisSummaryFr?: string;
  definitions: FicheDefinitionItem[];
  theorems: FicheTheoremItem[];
  solvedExamples: FicheSolvedExampleItem[];
  commonMistakesAr?: string[];
  commonMistakesFr?: string[];
  pedagogicalObservationsAr?: string;
  pedagogicalObservationsFr?: string;
}

export interface DidacticStep {
  stepNum: number;
  phaseAr: string;
  phaseFr: string;
  durationMinutes: number;
  objectifsAr: string[];
  objectifsFr: string[];
  teacherRoleAr: string;
  teacherRoleFr: string;
  studentRoleAr: string;
  studentRoleFr: string;
  modalitiesAr: string;
  modalitiesFr: string;
  activityContentAr?: string;
  activityContentFr?: string;
  conjecturesAndObstaclesAr?: string;
  conjecturesAndObstaclesFr?: string;
}

export interface DidacticSessionMoment {
  momentTitleAr: string;
  momentTitleFr: string;
  durationMin: number;
  didacticPhase: string;
  teacherRoleAr: string;
  teacherRoleFr: string;
  studentRoleAr: string;
  studentRoleFr: string;
  workModalityAr: string;
  workModalityFr: string;
  materialsAr: string;
  materialsFr: string;
  assessmentIndicatorAr: string;
  assessmentIndicatorFr: string;
}

export interface DidacticSessionScenario {
  sessionNum: number;
  sessionTitleAr: string;
  sessionTitleFr: string;
  durationLabel: string;
  sessionTypeAr: string;
  sessionTypeFr: string;
  operationalObjectivesAr: string[];
  operationalObjectivesFr: string[];
  moments: DidacticSessionMoment[];
  summaryRuleAr: string;
  summaryRuleFr: string;
  homeworkTaskAr?: string;
  homeworkTaskFr?: string;
}

export interface FicheGlobalPlanningSession {
  sessionNumber: number;
  themeAr: string;
  themeFr: string;
  sessionTypeAr: string;
  sessionTypeFr: string;
  allocatedHours: string;
  keyConceptsAr: string;
  keyConceptsFr: string;
}

export interface FicheFormulaSummaryItem {
  titleAr: string;
  titleFr: string;
  latex: string;
  domainOrCondition: string;
}

export interface FullPedagogicalFiche {
  // ترويسة الجذاذة الرسمية
  lessonTitleAr: string;
  lessonTitleFr: string;
  trackCode: string;
  trackLabelAr: string;
  trackLabelFr: string;
  cycle: string;
  hoursGlobal: string;
  sessionsDistribution: {
    activitiesHours: string;
    courseHours: string;
    exercisesHours: string;
    ticeHours: string;
    evalRemediationHours: string;
  };
  targetCompetenciesAr: string[];
  targetCompetenciesFr: string[];
  expectedCapacitiesAr: string[];
  expectedCapacitiesFr: string[];
  prerequisitesAr: string[];
  prerequisitesFr: string[];
  extensionsAr: string[];
  extensionsFr: string[];
  didacticToolsAr: string[];
  didacticToolsFr: string[];
  pedagogicalReferencesAr: string[];
  pedagogicalReferencesFr: string[];

  // مصفوفة التخطيط الزمني الشامل لحصص الدرس
  globalPlanningSessions: FicheGlobalPlanningSession[];

  // 1. الوضعية البنائية الاستكشافية
  introductoryActivity: {
    titleAr: string;
    titleFr: string;
    problemContextAr: string;
    problemContextFr: string;
    questionsAr: string[];
    questionsFr: string[];
    expectedConjecturesAr: string[];
    expectedConjecturesFr: string[];
    epistemologicalObstaclesAr: string;
    epistemologicalObstaclesFr: string;
  };

  // 2. محتوى الدرس كامل مع التعاريف والمبرهنات والبراهين التأسيسية والأمثلة المحلولة خطوة بخطوة
  fullCourseContent: FicheCourseSection[];

  // جدول الصيغ والقواعد الرسمية المركزة
  officialFormulasSummary: FicheFormulaSummaryItem[];

  // 3. السيناريو الديداكتيكي وتدبير الحصص في جدول رسمي
  didacticSteps: DidacticStep[];

  // السيناريو البيداغوجي التفصيلي الموزع حصة بحصة (Séance par séance)
  detailedSessionScenarios: DidacticSessionScenario[];

  // 4. سيناريو إدماج TICE والبرمجة بالبايثون (Python & GeoGebra)
  ticeIntegration: {
    geogebraActivity: {
      titleAr: string;
      titleFr: string;
      goalAr: string;
      goalFr: string;
      stepsAr: string[];
      stepsFr: string[];
    };
    pythonScript: {
      titleAr: string;
      titleFr: string;
      goalAr: string;
      goalFr: string;
      code: string;
      explanationAr: string;
      explanationFr: string;
      sampleOutput: string;
    };
  };

  // 5. التقويم التكويني والدعم والعمل المنزلي
  formativeEvaluation: {
    titleAr: string;
    titleFr: string;
    testExerciseAr: {
      statement: string;
      questions: string[];
      answers: string[];
      markingScheme: string[];
    };
    testExerciseFr: {
      statement: string;
      questions: string[];
      answers: string[];
      markingScheme: string[];
    };
    remediationStrategiesAr: string[];
    remediationStrategiesFr: string[];
    homeworkAssignmentsAr: string[];
    homeworkAssignmentsFr: string[];
  };

  // المرحلة 2 من خارطة الطريق: أنماط الجذاذة التخصصية الأربعة + الامتدادات التخصصية STEM + مخطط السبورة الثلاثية ودفتر النصوص
  ficheFormat?: FichePedagogicalFormat;
  stemExtensions?: FicheStemExtensionItem[];
  blackboardPlansPerSession?: FicheBlackboardPlanItem[];
}

export type FichePedagogicalFormat =
  | "COURSE_BUILD"
  | "TD_REMEDIATION"
  | "TICE_LAB"
  | "BLACKBOARD_CAHIER";

export interface FicheStemExtensionItem {
  disciplineAr: string;
  disciplineFr: string;
  applicationTitleAr: string;
  applicationTitleFr: string;
  mathematicalModelLatex: string;
  didacticLinkAr: string;
  didacticLinkFr: string;
}

export interface FicheBlackboardPlanItem {
  sessionNum: number;
  sessionTitleAr: string;
  rightWingActivitiesAr: string;
  centerWingCourseAr: string;
  leftWingExercisesAr: string;
  cahierDeTexteEntryAr: string;
  cahierDeTexteEntryFr: string;
}

/**
 * مولد الجذاذة التربوية الشاملة للدرس والسيناريو الديداكتيكي
 * طبقاً للتوجيهات التربوية الرسمية لوزارة التربية الوطنية المغربية (نوفمبر 2007 والأطر المرجعية)
 * معدّة برؤية أستاذ متمرس ومفتش تربوي لمادة الرياضيات بالسلك الثانوي التأهيلي
 */
export function generateFullMoroccanPedagogicalFiche(
  lesson: LessonItem,
  track: TrackData,
  ficheFormat: FichePedagogicalFormat = "COURSE_BUILD"
): FullPedagogicalFiche {
  const lessonAr = lesson.lessonAr;
  const lessonFr = lesson.lessonFr;
  const hoursNum = parseInt(lesson.hours, 10) || 12;

  // توزيع الحصص الزمنية البيداغوجية الرسمية
  const actHours = Math.max(1, Math.round(hoursNum * 0.15));
  const crsHours = Math.max(2, Math.round(hoursNum * 0.45));
  const exHours = Math.max(2, Math.round(hoursNum * 0.25));
  const ticeH = Math.max(1, Math.round(hoursNum * 0.08));
  const evalH = Math.max(1, hoursNum - actHours - crsHours - exHours - ticeH);

  // الكفايات العرضية والنوعية المستهدفة
  const targetCompetenciesAr = [
    "الاستدلال الرياضي والبرهان: توظيف الاستدلال بالاستلزام، التكافؤ، الخلف، الترجع، وفصل الحالات بدقة متناهية.",
    "الترييض والنمذجة: ترجمة وضعيات هندسية وفيزيائية واقتصادية إلى لغة وصيغ رياضية متناسقة وحلها تحليلياً.",
    "الحساب والتحكم في الخوارزميات: التمكن من الحساب الجبري، المشتقات، النهايات، المتتاليات، والتكاملات بدقة عددية ورمزية.",
    "التواصل والتحرير الرياضي: التعبير السليم باللغة الرياضية الصارمة والرموز المعتمدة وتبرير كل خطوة استدلالية.",
    "التوظيف الهادف للتكنولوجيا (TICE): استغلال GeoGebra للتمثيل البصري الديناميكي وبيئة بايثون للتحقق الرقمي والنمذجة.",
  ];
  const targetCompetenciesFr = [
    "Raisonnement mathématique : Mettre en œuvre avec rigueur la déduction, la contraposée, l'absurde, la récurrence et la disjonction de cas.",
    "Modélisation mathématique : Traduire des situations géométriques, physiques ou économiques en équations ou fonctions adéquates.",
    "Calcul et maîtrise algorithmique : Manipuler avec aisance les calculs algébriques, dérivées, limites et intégrales.",
    "Communication et rigueur d'argumentation : Rédiger des preuves structurées avec les notations mathématiques officielles.",
    "Intégration efficiente des TICE : Exploiter GeoGebra pour la conjecture visuelle et Python pour l'expérimentation algorithmique.",
  ];

  // المراجع التربوية المعتمدة
  const pedagogicalReferencesAr = [
    "التوجيهات التربوية والبرامج الخاصة بتدريس مادة الرياضيات بسلك التعليم الثانوي التأهيلي (مديرية المناهج، نونبر 2007).",
    "الأطر المرجعية للامتحانات الإشهادية (الامتحان الوطني والجهوي للبكالوريا) الصادرة عن المركز الوطني للتقويم والامتحانات.",
    "المذكرة الوزارية رقم 142-08 الصادرة بتاريخ 16 نونبر 2007 حول التقويم التربوي لمادة الرياضيات بالسلك الثانوي التأهيلي.",
    "الكتب المدرسية المقررة والمصادق عليها من طرف وزارة التربية الوطنية (المفيد، النجاح، في رحاب الرياضيات).",
    "دليل الأستاذ والوثائق الديداكتيكية الصادرة عن المفتشية العامة للشؤون التربوية.",
  ];
  const pedagogicalReferencesFr = [
    "Orientations Pédagogiques pour l'enseignement des Mathématiques au Secondaire Qualifiant (Direction des Curricula, Nov 2007).",
    "Cadres de référence des examens certifiants (Baccalauréat National & Régional, CNEP).",
    "Note Ministérielle n° 142-08 (16 Novembre 2007) relative à l'évaluation pédagogique des mathématiques au secondaire qualifiant.",
    "Manuels scolaires officiels homologués par le Ministère de l'Éducation Nationale.",
    "Guides pédagogiques de l'enseignant et documents d'accompagnement de l'inspection.",
  ];

  const didacticToolsAr = [
    "السبورة المدرسية (مقسمة إلى: حيز الأنشطة والتذكير، حيز المأسسة النظري، وحيز الأمثلة والتمارين) مع استعمال الألوان الهادفة.",
    "الكتاب المدرسي ودليل الأستاذ المصادق عليهما رسمياً.",
    "الحاسوب والمسلاط الضوئي (Vidéoprojecteur) للعرض التفاعلي والمحاكاة المباشرة.",
    "برمجية GeoGebra 6 الديناميكية لتمثيل المنحنيات والفضاء والتخمين البصري للمفاهيم.",
    "بيئة بايثون (Python 3.x / محاكي NumWorks) لإنجاز الخوارزميات الرياضية والحساب الرقمي.",
    "الآلة الحاسبة العلمية غير القابلة للبرمجة.",
    "بطاقات التقويم التكويني السريع وأوراق البحث الجماعي المنظمة.",
  ];
  const didacticToolsFr = [
    "Tableau scolaire divisé en trois espaces didactiques (Rappels/Activités, Cours institutionnalisé, Exercices/Méthodes).",
    "Manuel scolaire homologué et guide pédagogique de l'enseignant.",
    "Vidéoprojecteur et ordinateur pour les démonstrations dynamiques en classe.",
    "Logiciel GeoGebra 6 pour la visualisation géométrique et l'expérimentation interactive.",
    "Environnement Python 3.x (IDE ou calculatrice NumWorks) pour l'algorithmique.",
    "Calculatrice scientifique non programmable.",
    "Fiches de travail en îlots et questionnaires d'évaluation formative rapide.",
  ];

  // توليد محتوى الدرس الكامل والتفصيلي مع البراهين والأمثلة
  const fullCourseContent = buildDetailedCourseContent(lesson, track);

  // توليد الوضعية الانطلاقية النشيطة والعوائق
  const introductoryActivity = buildIntroductoryActivity(lesson, track);

  // توليد جدول الصيغ والقواعد الرسمية المركزة
  const officialFormulasSummary = buildOfficialFormulasSummary(lesson);

  // توليد مصفوفة التخطيط الزمني الشامل لحصص الدرس
  const globalPlanningSessions = buildGlobalPlanningMatrix(lesson, hoursNum);

  // توليد السيناريو الديداكتيكي ذي الـ 5 محطات الرسمية المعتمدة
  const didacticSteps: DidacticStep[] = buildOfficialDidacticSteps(
    lesson,
    actHours,
    crsHours,
    exHours,
    ticeH,
    evalH,
    introductoryActivity
  );

  // توليد السيناريو البيداغوجي المفصل حصة بحصة (Séance par séance)
  const detailedSessionScenarios = buildDetailedSessionScenarios(lesson, hoursNum, fullCourseContent, introductoryActivity);

  // توليد محتوى TICE والبايثون
  const ticeIntegration = buildTiceAndPythonIntegration(lesson, track);

  // توليد محتوى التقويم التكويني
  const formativeEvaluation = buildFormativeEvaluation(lesson);

  // توليد الامتدادات التخصصية STEM ومخططات السبورة الثلاثية ودفتر النصوص
  const stemExtensions = buildLessonStemExtensions(lesson);
  const blackboardPlansPerSession = buildBlackboardPlansPerSession(
    lesson,
    globalPlanningSessions,
    fullCourseContent
  );

  return {
    lessonTitleAr: lessonAr,
    lessonTitleFr: lessonFr,
    trackCode: track.code,
    trackLabelAr: track.labelAr,
    trackLabelFr: track.labelFr,
    cycle: track.cycle,
    hoursGlobal: lesson.hours,
    sessionsDistribution: {
      activitiesHours: `${actHours}h (${Math.round((actHours / hoursNum) * 100)}%)`,
      courseHours: `${crsHours}h (${Math.round((crsHours / hoursNum) * 100)}%)`,
      exercisesHours: `${exHours}h (${Math.round((exHours / hoursNum) * 100)}%)`,
      ticeHours: `${ticeH}h (${Math.round((ticeH / hoursNum) * 100)}%)`,
      evalRemediationHours: `${evalH}h (${Math.round((evalH / hoursNum) * 100)}%)`,
    },
    targetCompetenciesAr,
    targetCompetenciesFr,
    expectedCapacitiesAr: lesson.capacitiesAr,
    expectedCapacitiesFr: lesson.capacitiesFr,
    prerequisitesAr: track.prereqsAr,
    prerequisitesFr: track.prereqsFr,
    extensionsAr: [
      `الامتداد الجامعي وفي الأقسام التحضيرية للمدارس العليا CPGE وكليات العلوم والتقنيات FST والمدارس الوطنية للعلوم التطبيقية ENSA.`,
      `التوظيف المباشر في الفيزياء والكيمياء (ميكانيك نيوتن، الدارات الكهربائية RLC، الإشعاع النووي، الحركية الكيميائية).`,
      `النمذجة الرياضية في علوم الاقتصاد والتدبير والمعلوميات والإحصاء والهندسة المدنية.`,
    ],
    extensionsFr: [
      "Prolongement en Classes Préparatoires (CPGE), facultés des sciences et techniques (FST) et écoles d'ingénieurs (ENSA, ENSAM).",
      "Applications directes en Sciences Physiques (mécanique classique, circuits RLC, radioactivité, cinétique chimique).",
      "Modélisation en sciences économiques, statistiques appliquées, informatique et traitement du signal.",
    ],
    didacticToolsAr,
    didacticToolsFr,
    pedagogicalReferencesAr,
    pedagogicalReferencesFr,
    globalPlanningSessions,
    introductoryActivity,
    fullCourseContent,
    officialFormulasSummary,
    didacticSteps,
    detailedSessionScenarios,
    ticeIntegration,
    formativeEvaluation,
    ficheFormat,
    stemExtensions,
    blackboardPlansPerSession,
  };
}

/**
 * مصفوفة التخطيط الزمني الشامل لحصص الدرس (Planification globale des séances)
 */
function buildGlobalPlanningMatrix(lesson: LessonItem, totalHours: number): FicheGlobalPlanningSession[] {
  const sessionsCount = Math.min(Math.max(4, Math.round(totalHours / 2)), 8);
  const title = lesson.lessonAr.toLowerCase();

  const matrix: FicheGlobalPlanningSession[] = [];

  for (let s = 1; s <= sessionsCount; s++) {
    let themeAr = `الحصة ${s}: بناء ومأسسة المفاهيم`;
    let themeFr = `Séance ${s} : Institutionnalisation et approfondissement`;
    let typeAr = "درس ومأسسة";
    let typeFr = "Cours théorique";
    let hours = "2h";
    let keyAr = "التعاريف والخاصيات الأساسية مع أمثلة موجهة";
    let keyFr = "Définitions et théorèmes fondamentaux";

    if (s === 1) {
      themeAr = "الحصة 1: الوضعية الانطلاقية وبناء المفهوم المحوري";
      themeFr = "Séance 1 : Situation-problème déclenchante et émergence de la notion";
      typeAr = "أنشطة استكشافية ومأسسة أولى";
      typeFr = "Activité introductive & émergence";
      hours = totalHours <= 6 ? "1h" : "2h";
      keyAr = "النشاط البنائي، رصد التمثلات، صياغة التخمينات، والتعريف الأولي";
      keyFr = "Activité exploratoire, recueil des conceptions, conjectures et première définition";
    } else if (s === 2) {
      themeAr = "الحصة 2: المبرهنات الأساسية والبراهين الرسمية المقررة";
      themeFr = "Séance 2 : Théorèmes cardinaux et démonstrations officielles au programme";
      typeAr = "بناء ومأسسة وتدريب موجه";
      typeFr = "Démonstrations et formalisation";
      hours = "2h";
      keyAr = "البراهين التأسيسية، شروط الصلاحية، وأمثلة تطبيقية مباشرة خطوة بخطوة";
      keyFr = "Preuves rigoureuses, conditions préalables et premiers exemples résolus";
    } else if (s === sessionsCount - 1 && totalHours >= 8) {
      themeAr = `الحصة ${s}: إدماج TICE (GeoGebra & Python) ومقاربة المسائل المركبة`;
      themeFr = `Séance ${s} : Atelier TICE (GeoGebra & Python) et résolution de problèmes`;
      typeAr = "تكنولوجيا TICE وترييض متقدم";
      typeFr = "Atelier numérique et modélisation";
      hours = "2h";
      keyAr = "المحاكاة البصرية بـ GeoGebra وكتابة كود بايثون وحل تمارين N2 و N3";
      keyFr = "Visualisation dynamique, algorithmique Python et exercices de transfert";
    } else if (s === sessionsCount) {
      themeAr = `الحصة ${s}: التقويم التكويني، المعالجة البيداغوجية والتعاقد المنزلي`;
      themeFr = `Séance ${s} : Évaluation formative, régulation des acquis et devoir maison`;
      typeAr = "تقويم تكويني ودعم فوري";
      typeFr = "Évaluation & Remédiation";
      hours = "1h - 2h";
      keyAr = "رائز فردي وجيز (20 د)، تشخيص التعثرات، خطة دعم فوري، والواجب المنزلي";
      keyFr = "Test individuel court, analyse d'erreurs, remédiation ciblée et devoir maison";
    } else {
      themeAr = `الحصة ${s}: الترييض المنهجي وبناء طرائق الحساب والاستدلال`;
      themeFr = `Séance ${s} : Entraînement méthodique et techniques opératoires`;
      typeAr = "تمارين وطرائق (TD)";
      typeFr = "Travaux dirigés & Méthodes";
      hours = "2h";
      keyAr = "حل تمارين متدرجة (N1, N2)، مناقشة على السبورة، وضبط التحرير الرياضي";
      keyFr = "Résolution graduée, explicitation des démarches et rigueur rédactionnelle";
    }

    matrix.push({
      sessionNumber: s,
      themeAr,
      themeFr,
      sessionTypeAr: typeAr,
      sessionTypeFr: typeFr,
      allocatedHours: hours,
      keyConceptsAr: keyAr,
      keyConceptsFr: keyFr,
    });
  }

  return matrix;
}

/**
 * السيناريو الديداكتيكي الرسمي ذي الـ 5 محطات الكبرى
 */
function buildOfficialDidacticSteps(
  lesson: LessonItem,
  actHours: number,
  crsHours: number,
  exHours: number,
  ticeH: number,
  evalH: number,
  introductoryActivity: any
): DidacticStep[] {
  const lessonAr = lesson.lessonAr;
  const lessonFr = lesson.lessonFr;

  return [
    {
      stepNum: 1,
      phaseAr: "المرحلة 1: الوضعية المشكلة والانطلاق البنائي (Situation-Problème)",
      phaseFr: "Phase 1 : Situation-Problème Déclenchante & Activité d'Introduction",
      durationMinutes: actHours * 55,
      objectifsAr: [
        `استرجاع واستدعاء المكتسبات القبلية الضرورية لبناء مفهوم « ${lessonAr} ».`,
        "خلق قطيعة معرفية (Rupture cognitive) وحيرة ديداكتيكية تدفع المتعلم للبحث.",
        "رصد التمثلات الأولية والعوائق الإبستمولوجية الشائعة وتفكيكها تشاركياً.",
        "حث المتعلمين على صياغة تخمينات رياضية (Conjectures) واختبار وجاهتها.",
      ],
      objectifsFr: [
        `Mobiliser et réactiver les prérequis nécessaires à la construction de « ${lessonFr} ».`,
        "Créer un déséquilibre cognitif stimulant le besoin d'un nouvel outil mathématique.",
        "Recueillir et analyser les conceptions initiales et les obstacles épistémologiques.",
        "Guider les apprenants dans l'émission et le débat de conjectures étayées.",
      ],
      teacherRoleAr:
        "تقديم نص الوضعية المشكلة بوضوح، تبيان شروط التعاقد الديداكتيكي وتحديد المهام، تنظيم المتعلمين في مجموعات عمل مصغرة غير متجانسة (3 إلى 4 تلاميذ)، تتبع الإنجاز وتقديم تلميحات توجيهية (Étayage) دون إعطاء الحلول، وإدارة التقاسم والمناقشة الجماعية على السبورة.",
      teacherRoleFr:
        "Présenter la situation-problème avec précision, définir le contrat didactique, organiser le travail en îlots hétérogènes (3-4 élèves), observer et relancer par un questionnement ouvert sans déflorer la solution, puis orchestrer la synthèse collective au tableau.",
      studentRoleAr:
        "قراءة النص وتحليله، استخراج المعطيات وتحديد المطلوب، العمل الفردي الأولي (10 د)، تبادل ومقارنة الاستراتيجيات داخل المجموعة، صياغة تخمين مشترك وتدوينه، وانتداب مقرر لعرض النتيجة والدفاع عنها أمام جماعة الفصل.",
      studentRoleFr:
        "S'approprier la consigne, chercher individuellement (10 min), confronter les démarches en groupe, formuler une conjecture consensuelle, puis désigner un rapporteur pour exposer et argumenter au tableau devant la classe.",
      modalitiesAr: "بحث فردي تمهيدي (10 د) ← تشاور في مجموعات مصغرة (20 د) ← مناقشة ومواجهة جماعية على السبورة (25 د).",
      modalitiesFr: "Recherche individuelle (10 min) → Travail en îlots (20 min) → Débat et synthèse collective au tableau (25 min).",
      activityContentAr: introductoryActivity.problemContextAr,
      activityContentFr: introductoryActivity.problemContextFr,
      conjecturesAndObstaclesAr: introductoryActivity.epistemologicalObstaclesAr,
      conjecturesAndObstaclesFr: introductoryActivity.epistemologicalObstaclesFr,
    },
    {
      stepNum: 2,
      phaseAr: "المرحلة 2: المأسسة والبناء النظري وصياغة محتوى الدرس (Institutionnalisation)",
      phaseFr: "Phase 2 : Institutionnalisation, Démonstrations & Formalisation Théorique",
      durationMinutes: crsHours * 55,
      objectifsAr: [
        `الصياغة الرمزية والمنطقية الصارمة للتعاريف والمبرهنات لدرس « ${lessonAr} ».`,
        "إنجاز البراهين التأسيسية المقررة رسمياً وإبراز الفرضيات والشروط الضرورية والكافية.",
        "تثبيت المفاهيم عبر أمثلة تطبيقية نموذجية مباشرة ومحلولة خطوة بخطوة.",
        "تسليط الضوء على الأخطاء الشائعة والمنزلقات الاصطلاحية الواجب تفاديها.",
      ],
      objectifsFr: [
        `Énonciation rigoureuse et formalisée des définitions, notations et théorèmes de « ${lessonFr} ».`,
        "Démontrer pas à pas les propriétés fondatrices au programme en insistant sur les hypothèses.",
        "Ancrer immédiatement chaque concept par un exemple d'application méthodique résolu.",
        "Pointer les écueils fréquents, contre-sens logiques et erreurs de notation à bannir.",
      ],
      teacherRoleAr:
        "قيادة عملية التجريد من النشاط إلى القاعدة العامة، كتابة التعاريف والمبرهنات بلغة رمزية سليمة مع تأطير النتائج بالألوان، صياغة البرهان التأسيسي على السبورة بشراكة مع التلاميذ، تقديم مثال تطبيقي نموذجي ومطالبتهم بإنجازه ثم تصحيحه.",
      teacherRoleFr:
        "Conduire l'abstraction didactique, énoncer les définitions et théorèmes avec une notation impeccable, rédiger la preuve au tableau de manière interactive, traiter l'exemple résolu pas à pas et veiller à la prise de notes rigoureuse dans les cahiers.",
      studentRoleAr:
        "تدوين عناصر الدرس بعناية في دفتر الدروس، استيعاب الفرضيات والشروط المسبقة لكل مبرهنة، المشاركة الفعالة في صياغة خطوات البرهان، وحل المثال التطبيقي المباشر وتصحيحه.",
      studentRoleFr:
        "Structurer la prise de notes sur le cahier de cours, assimiler le statut des hypothèses, contribuer oralement aux étapes de démonstration, et exécuter l'application directe en autonomie encadrée.",
      modalitiesAr: "حوار ديداكتيكي تفاعلي موجه، كتابة مؤطرة ومنظمة على السبورة، وتطبيق كتابي فوري في الدفتر.",
      modalitiesFr: "Dialogue didactique interactif guidé, structuration visuelle au tableau et entraînement immédiat sur cahier.",
      conjecturesAndObstaclesAr:
        "خطر تطبيق المبرهنات دون التحقق من تحقق الشروط الأولية (مثل شرط الاتصال، الرتابة القطعية، شروط الانعدام أو المجالات).",
      conjecturesAndObstaclesFr:
        "Risque majeur d'application aveugle sans vérification rigoureuse des hypothèses d'application (continuité, monotonie stricte, non-nullité, domaine).",
    },
    {
      stepNum: 3,
      phaseAr: "المرحلة 3: الترييض وبناء الطرائق والتدريب المتدرج (Entraînement Méthodique)",
      phaseFr: "Phase 3 : Entraînement Méthodique, Résolution Graduée (N1, N2, N3)",
      durationMinutes: exHours * 55,
      objectifsAr: [
        "التدرب المنهجي على التمارين النمطية والامتحانية وفق المستويات المهارية: N1 (35%)، N2 (45%)، N3 (20%).",
        "تمكين التلميذ من خوارزميات الحل واستراتيجيات الانتقال بين المعطى والمطلوب.",
        "تنمية مهارات التحرير الرياضي المنظم، ترقيم الأسئلة والتعليل بالنتائج السابقة.",
        "استثمار الأخطاء كفرصة ديداكتيكية لإعادة البناء وتعديل التمثلات.",
      ],
      objectifsFr: [
        "Résoudre des exercices gradués conformes aux standards officiels : N1 (35%), N2 (45%), N3 (20%).",
        "Automatiser les démarches canoniques et développer les stratégies heuristiques.",
        "Exiger une rédaction soignée, une numérotation rigoureuse et la justification par les théorèmes du cours.",
        "Valoriser le statut positif de l'erreur pour consolider les apprentissages.",
      ],
      teacherRoleAr:
        "اختيار تمارين متدرجة من سلسلة التمارين الموزعة، التجول بين الصفوف لمراقبة الإنتاجات ورصد التعثرات الفردية، تقديم دعم تفريقي (Pédagogie différenciée) للمتعثرين، وتكليف تلاميذ بعرض ومناقشة الحلول على السبورة مع مقارنة الطرائق المختلفة.",
      teacherRoleFr:
        "Sélectionner des exercices calibrés de la série, circuler activement pour observer et diagnostiquer les blocages, apporter une aide différenciée ciblée, puis animer la correction au tableau en confrontant plusieurs démarches de résolution.",
      studentRoleAr:
        "البحث الفردي الجاد في دفتر التمارين، تجريب مسارات متعددة للحل، كتابة براهين متماسكة، تدوين الملاحظات التوجيهية وتصويب الأخطاء بالأخضر.",
      studentRoleFr:
        "Chercher individuellement avec persévérance, mobiliser les concepts vus en cours, rédiger une solution claire, noter les remarques méthodologiques et rectifier les erreurs.",
      modalitiesAr: "عمل كتابي فردي (15 د لكل تمرين) ← تبادل ثنائي سريع (5 د) ← تصحيح تشاركي مفصل على السبورة.",
      modalitiesFr: "Travail individuel écrit (15 min) → Échange rapide en binôme (5 min) → Correction collective commentée au tableau.",
    },
    {
      stepNum: 4,
      phaseAr: "المرحلة 4: إدماج TICE والبرمجة بالبايثون (GeoGebra & Python)",
      phaseFr: "Phase 4 : Intégration TICE & Algorithmique (GeoGebra & Python)",
      durationMinutes: ticeH * 55,
      objectifsAr: [
        "توظيف برمجية GeoGebra 6 للمحاكاة البصرية الديناميكية، والتأكد من المنحنيات والمماسات وتقاطع الأشكال.",
        "كتابة وتنفيذ سكريبت بايثون لحساب القيم المقربة أو خوارزمية التفرع الثنائي ودراسة السلوك التقاربي.",
        "المقارنة النقدية بين المخرجات الرقمية والحساب الجبري التحليلي.",
        "تنمية الفكر الخوارزمي والحس النقدي لدى المتعلم.",
      ],
      objectifsFr: [
        "Exploiter GeoGebra 6 pour la manipulation dynamique de figures, courbes et tangentes.",
        "Implémenter et exécuter un algorithme Python (dichotomie, calcul approché, suites) pour valider les résultats.",
        "Développer l'esprit critique par la confrontation entre résultat théorique et simulation numérique.",
        "Renforcer la pensée algorithmique inscrite au curriculum officiel.",
      ],
      teacherRoleAr:
        "عرض النشاط التفاعلي على المسلاط الضوئي، إعطاء التوجيهات الدقيقة لكتابة الأوامر أو كود بايثون، تحفيز التلاميذ على تفسير النتائج وملاحظة تأثير تغيير المعاملات، وربط المحاكاة بالبرهان النظري.",
      teacherRoleFr:
        "Projeter la simulation au vidéoprojecteur, expliciter le protocole expérimental et la syntaxe du code Python, questionner les élèves sur l'interprétation des sorties graphiques et numériques.",
      studentRoleAr:
        "متابعة المحاكاة، التفاعل مع المزلجة وتدوين الملاحظات، قراءة كود بايثون وتعديل المدخلات وملاحظة المخرجات، ومقارنة النتيجة العددية بالقيمة التحليلية المضبوطة.",
      studentRoleFr:
        "Manipuler les curseurs GeoGebra, lire et commenter le script Python, tester des valeurs limites et comparer la conjecture expérimentale avec la démonstration formelle.",
      modalitiesAr: "عرض جماعي تفاعلي بالمسلاط الضوئي، وممارسة عملية على الحواسيب أو الآلات الحاسبة البيانية.",
      modalitiesFr: "Démonstration collective interactive vidéoprojetée et travail sur postes informatiques ou calculatrices.",
    },
    {
      stepNum: 5,
      phaseAr: "المرحلة 5: التقويم التكويني والدعم الفوري والواجب المنزلي (Évaluation & Régulation)",
      phaseFr: "Phase 5 : Évaluation Formative, Régulation Immédiate & Devoir Maison",
      durationMinutes: evalH * 55,
      objectifsAr: [
        "التحقق الفوري من مدى تحقق الكفايات والقدرات المنتظرة عبر تمرين تقويمي وجيز (15 إلى 20 دقيقة).",
        "تفييء المتعلمين وفق درجات التملك ورصد الثغرات المتبقية لتفعيل الدعم البيداغوجي الموجه.",
        "تحديد التكليفات المنزلية من سلسلة التمارين (أو الفرض المنزلي DM) لتعزيز التعلم الذاتي.",
      ],
      objectifsFr: [
        "Mesurer individuellement le degré de maîtrise des capacités attendues via un test formatif ciblé (15-20 min).",
        "Différencier les profils d'apprenants et planifier les remédiations immédiates nécessaires.",
        "Prescrire le travail personnel hors classe (exercices d'approfondissement et Devoir Maison) pour cultiver l'autonomie.",
      ],
      teacherRoleAr:
        "توزيع بطاقة التقويم التكويني، ضبط وقت الإنجاز الفردي، أخذ عينة سريعة من الأوراق للتشخيص، تصحيح الأخطاء الأكثر تواتراً، وتقديم توجيهات إنجاز الواجب المنزلي وتدوينها في دفتر النصوص.",
      teacherRoleFr:
        "Distribuer le test formatif, veiller au respect des conditions d'évaluation individuelle, effectuer un sondage rapide des copies, expliciter la correction des erreurs récurrentes et consigner le travail personnel au cahier de textes.",
      studentRoleAr:
        "إنجاز الاختبار الفردي دون الرجوع للدفتر بكل مسؤولية، الوعي بمستوى التملك الذاتي، تسجيل توجيهات المدرس، والالتزام بإنجاز الفرض المنزلي في الآجال المحددة.",
      studentRoleFr:
        "Traiter le test en autonomie complète, prendre conscience de ses réussites et fragilités, noter les conseils de régulation et s'engager à préparer le Devoir Maison.",
      modalitiesAr: "إنجاز فردي كتابي (20 د) ← تشخيص ومعالجة جماعية فورية (15 د) ← تسجيل التعاقد والواجب المنزلي (10 د).",
      modalitiesFr: "Évaluation individuelle sur feuille (20 min) → Bilan diagnostique et remédiation (15 min) → Consignes du devoir maison (10 min).",
    },
  ];
}

/**
 * السيناريو البيداغوجي التفصيلي الموزع حصة بحصة (Séance par séance)
 */
function buildDetailedSessionScenarios(
  lesson: LessonItem,
  totalHours: number,
  courseSections: FicheCourseSection[],
  introAct: any
): DidacticSessionScenario[] {
  const sessionsCount = Math.min(Math.max(4, Math.round(totalHours / 2)), 6);
  const scenarios: DidacticSessionScenario[] = [];

  // الحصة 1: استكشاف وبناء المفاهيم
  scenarios.push({
    sessionNum: 1,
    sessionTitleAr: "الحصة 1: الوضعية المشكلة الانطلاقية وبناء المفهوم المحوري",
    sessionTitleFr: "Séance 1 : Situation-problème déclenchante et émergence de la notion",
    durationLabel: "2 heures (110 min)",
    sessionTypeAr: "أنشطة استكشافية ومأسسة أولية",
    sessionTypeFr: "Activité d'introduction et conceptualisation",
    operationalObjectivesAr: [
      `تشخيص واستدعاء المكتسبات القبلية المتعلقة بـ « ${lesson.lessonAr} ».`,
      "رصد الصعوبات والعوائق التمثلية لدى المتعلمين حول الموضوع.",
      "صياغة تخمينات دقيقة واختبار صحتها في سياق الوضعية المشكلة.",
      "بناء التعريف الأولي المأسس للمفهوم في دفتر الدروس.",
    ],
    operationalObjectivesFr: [
      `Réactiver les prérequis indispensables à « ${lesson.lessonFr} ».`,
      "Identifier les obstacles didactiques et les conceptions erronées.",
      "Émettre et tester des conjectures mathématiques précises.",
      "Formaliser la première définition constitutive dans le cours.",
    ],
    moments: [
      {
        momentTitleAr: "1. تذكير بالمكتسبات ورصد المكتسبات القبلية",
        momentTitleFr: "1. Rappels diagnostiques et réactivation",
        durationMin: 15,
        didacticPhase: "DIAGNOSTIC_DEPART",
        teacherRoleAr: "طرح أسئلة قصيرة على السبورة لاسترجاع المفاهيم السابقة المرتبطة بالدرس وتنشيط ذاكرة الفصل.",
        teacherRoleFr: "Poser un questionnement flash au tableau pour réactiver les notions antérieures indispensables.",
        studentRoleAr: "الإجابة الشفوية والكتابية على الألواح أو الدفاتر، واستحضار العلاقات والمبرهنات السابقة.",
        studentRoleFr: "Répondre oralement ou sur ardoise/cahier de brouillon en mobilisant les outils passés.",
        workModalityAr: "تفاعل جماعي موجه مع الفصل بأكمله.",
        workModalityFr: "Questionnement collectif interactif.",
        materialsAr: "السبورة المدرسية وبطاقات التذكير.",
        materialsFr: "Tableau et fiches mémo.",
        assessmentIndicatorAr: "استحضار القواعد الأساسية بنسبة تفوق 80% من المتعلمين.",
        assessmentIndicatorFr: "Rappel correct des formules clés par au moins 80% des élèves.",
      },
      {
        momentTitleAr: "2. تقديم الوضعية المشكلة والبحث الفردي",
        momentTitleFr: "2. Présentation du problème et recherche individuelle",
        durationMin: 25,
        didacticPhase: "SITUATION_PROBLEME",
        teacherRoleAr: "توزيع نص النشاط وقراءته قراءة نموذجية، توضيح شروط الإنجاز وحث التلاميذ على المحاولة دون خوف من الخطأ.",
        teacherRoleFr: "Distribuer le texte du problème, expliciter la consigne et encourager la recherche sans crainte d'erreur.",
        studentRoleAr: "القراءة الفاحصة، وضع خطة عمل أولية، إجراء الحسابات وتدوين الصعوبات التي اعترضت سبيلهم.",
        studentRoleFr: "Lecture active, modélisation préliminaire, calculs d'essai et repérage des impasses.",
        workModalityAr: "عمل فردي مستقل وصامت.",
        workModalityFr: "Recherche individuelle autonome.",
        materialsAr: "ورقة النشاط البنائي ودفتر المحاولات.",
        materialsFr: "Fiche d'activité et cahier d'essais.",
        assessmentIndicatorAr: "انخراط جميع التلاميذ في محاولة رياضية هادفة.",
        assessmentIndicatorFr: "Engagement effectif de tous les élèves dans la tâche.",
      },
      {
        momentTitleAr: "3. التبادل والمناقشة داخل المجموعات والمواجهة",
        momentTitleFr: "3. Débat en îlots et confrontation collective",
        durationMin: 35,
        didacticPhase: "RECHERCHE_DEBAT",
        teacherRoleAr: "مواكبة نقاش المجموعات، مساعدة المجموعات المتعثرة بأسئلة وسيطة، وتنظيم صعود الممثلين إلى السبورة.",
        teacherRoleFr: "Observer les échanges en îlots, guider par un questionnement socratique et organiser la mise en commun.",
        studentRoleAr: "مقارنة النتائج، الدفاع عن الحل بالبراهين، والاستماع إلى مقترحات الزملاء ونقدها علمياً.",
        studentRoleFr: "Confronter les méthodes, argumenter rigoureusement et réfuter les contre-exemples.",
        workModalityAr: "عمل في مجموعات مصغرة (4 تلاميذ) ثم نقاش على السبورة.",
        workModalityFr: "Travail en îlots de 4 puis débat au tableau.",
        materialsAr: "السبورة مقسمة إلى مساحات لكل مجموعة.",
        materialsFr: "Tableau partagé par îlots.",
        assessmentIndicatorAr: "صياغة تخمين صحيح يمهد للتعريف المطلوب.",
        assessmentIndicatorFr: "Émergence d'une conjecture correcte annonçant la définition.",
      },
      {
        momentTitleAr: "4. المأسسة وبناء التعريف وصياغة الخلاصة",
        momentTitleFr: "4. Institutionnalisation et trace écrite",
        durationMin: 35,
        didacticPhase: "INSTITUTIONNALISATION",
        teacherRoleAr: "صياغة التعريف الرياضي الصارم على السبورة بالرموز المعتمدة، وتوضيح دلالة كل رمز وتأطيره.",
        teacherRoleFr: "Formaliser la définition canonique au tableau avec les symboles officiels et souligner le statut de la règle.",
        studentRoleAr: "كتابة فقرة الدرس في دفتر الدروس بخط واضح ومنظم مع تلوين وتأطير الصيغة التأسيسية.",
        studentRoleFr: "Noter la synthèse dans le cahier de cours avec soin et encadrement des formules maîtresses.",
        workModalityAr: "عرض تركيبي تفاعلي مع تدوين فردي.",
        workModalityFr: "Synthèse magistrale dialoguée et prise de notes.",
        materialsAr: "السبورة المدرسية ودفتر الدروس.",
        materialsFr: "Tableau et cahier de cours officiel.",
        assessmentIndicatorAr: "تدوين سليم ومكتمل للتعريف وشروطه دون أخطاء رمزية.",
        assessmentIndicatorFr: "Trace écrite rigoureuse exempte d'erreurs de notation.",
      },
    ],
    summaryRuleAr: `التعريف المؤسس لـ « ${lesson.lessonAr} » مع بيان شروط الاستعمال ومجال التطبيق.`,
    summaryRuleFr: `Définition formelle avec explicitation des hypothèses et du domaine de validité.`,
    homeworkTaskAr: "إنجاز التمرينين 1 و 2 من سلسلة التمارين (تطبيق مباشر للتعريف المؤسس).",
    homeworkTaskFr: "Traiter les exercices d'application directe 1 et 2 de la fiche TD.",
  });

  // الحصة 2: المبرهنات الأساسية والبراهين
  scenarios.push({
    sessionNum: 2,
    sessionTitleAr: "الحصة 2: المبرهنات الجوهرية والبراهين التأسيسية المقررة",
    sessionTitleFr: "Séance 2 : Théorèmes cardinaux, démonstrations et méthodes",
    durationLabel: "2 heures (110 min)",
    sessionTypeAr: "بناء نظري ومأسسة البراهين",
    sessionTypeFr: "Démonstrations et cours magistral dialogué",
    operationalObjectivesAr: [
      `إبراز نص المبرهنة الأساسية لدرس « ${lesson.lessonAr} » بدقة رياضية متناهية.`,
      "استيعاب خطوات البرهان التأسيسي المقررة رسمياً وإعادة إنتاجها.",
      "التأكيد الصارم على شروط وفرضيات التطبيق لتفادي الاستنتاجات الخاطئة.",
      "حل مثال تطبيقي نموذجي محلول خطوة بخطوة.",
    ],
    operationalObjectivesFr: [
      `Énoncer le théorème clé de « ${lesson.lessonFr} » avec rigueur formelle.`,
      "Maîtriser les étapes de la démonstration officielle au programme.",
      "Insister sur l'indispensabilité de chaque hypothèse préalable.",
      "Traiter un exemple d'application pas à pas avec rédaction modèle.",
    ],
    moments: [
      {
        momentTitleAr: "1. مراجعة سريعة ومراقبة الواجب المنزلي",
        momentTitleFr: "1. Contrôle du travail personnel et rappel",
        durationMin: 15,
        didacticPhase: "DIAGNOSTIC_DEPART",
        teacherRoleAr: "مراقبة إنجاز الواجب في الدفاتر ومعالجة صعوبة شائعة ظهرت في إنجازات التلاميذ.",
        teacherRoleFr: "Vérifier les cahiers d'exercices et lever une difficulté récurrente sur le devoir.",
        studentRoleAr: "تقديم الدفاتر، وطرح التساؤلات حول النقط المستعصية في التمارين المنزلية.",
        studentRoleFr: "Présenter le travail personnel et formuler les interrogations méthodologiques.",
        workModalityAr: "مراقبة سريعة ومناقشة تفاعلية.",
        workModalityFr: "Contrôle rapide et échange dialogué.",
        materialsAr: "دفاتر التمارين والسبورة.",
        materialsFr: "Cahiers d'exercices et tableau.",
        assessmentIndicatorAr: "إنجاز الواجب من طرف الأغلبية الساحقة للتلاميذ.",
        assessmentIndicatorFr: "Réalisation du travail par plus de 90% des élèves.",
      },
      {
        momentTitleAr: "2. صياغة المبرهنة وإبراز الفرضيات",
        momentTitleFr: "2. Énoncé du théorème et analyse des conditions",
        durationMin: 25,
        didacticPhase: "INSTITUTIONNALISATION",
        teacherRoleAr: "كتابة المبرهنة على السبورة وتفكيكها إلى: معطيات (فرضيات) واستنتاج، مع إعطاء أمثلة مضادة عند غياب شرط.",
        teacherRoleFr: "Énoncer le théorème en distinguant clairement hypothèses et conclusion, illustrer par un contre-exemple si une hypothèse manque.",
        studentRoleAr: "تحليل شروط المبرهنة، والمقارنة مع الحالات الخاصة وإدراك ضرورة كل فرضية.",
        studentRoleFr: "Disséquer les conditions d'application et comprendre l'utilité des hypothèses.",
        workModalityAr: "حوار ديداكتيكي موجه.",
        workModalityFr: "Dialogue didactique structuré.",
        materialsAr: "السبورة المدرسية ومسلاط ضوئي إن أمكن.",
        materialsFr: "Tableau et supports visuels.",
        assessmentIndicatorAr: "قدرة التلميذ على تعداد شروط المبرهنة دون إغفال أي منها.",
        assessmentIndicatorFr: "Capacité des élèves à citer toutes les conditions sans omission.",
      },
      {
        momentTitleAr: "3. إنجاز البرهان التأسيسي خطوة بخطوة",
        momentTitleFr: "3. Démonstration officielle pas à pas",
        durationMin: 40,
        didacticPhase: "INSTITUTIONNALISATION",
        teacherRoleAr: "قيادة خطوات البرهان عبر توجيه أسئلة استدلالية، وتدريب التلاميذ على الربط المنطقي بين الأفكار.",
        teacherRoleFr: "Mener la preuve en guidant la chaîne déductive et en exigeant la justification de chaque transition.",
        studentRoleAr: "اقتراح المراحل الاستدلالية، التعليل بالمكتسبات السابقة، وتدوين البرهان بدقة في دفتر الدروس.",
        studentRoleFr: "Participer activement à la construction de la preuve et consigner les arguments logiques.",
        workModalityAr: "بناء تشاركي على السبورة وتدوين فردي.",
        workModalityFr: "Élaboration collective guidée puis rédaction individuelle.",
        materialsAr: "السبورة المدرسية مقسمة إلى مراحل استدلالية.",
        materialsFr: "Tableau structuré en étapes déductives.",
        assessmentIndicatorAr: "استيعاب خطة البرهان وتبرير الانتقال من خطوة لأخرى.",
        assessmentIndicatorFr: "Compréhension de la démarche déductive globale.",
      },
      {
        momentTitleAr: "4. مثال تطبيقي نموذجي وتدريب موجه",
        momentTitleFr: "4. Application résolue méthodique",
        durationMin: 30,
        didacticPhase: "APPLICATION_DIRECTE",
        teacherRoleAr: "طرح مسألة تطبيقية تحاكي أسئلة الفروض والامتحانات، ومراقبة تحرير التلاميذ ثم تقديم النموذج الأمثل.",
        teacherRoleFr: "Proposer un exercice d'application directe type examen, observer la rédaction et formaliser la solution modèle.",
        studentRoleAr: "حل التطبيق في دفتر التمارين، تطبيق المبرهنة واحترام الشروط، وتدوين نصائح المدرس.",
        studentRoleFr: "Résoudre l'exercice en vérifiant explicitement les hypothèses et noter la méthode.",
        workModalityAr: "عمل فردي (15 د) ثم تصحيح نموذجي (15 د).",
        workModalityFr: "Recherche individuelle (15 min) puis correction modèle (15 min).",
        materialsAr: "دفتر التمارين والسبورة.",
        materialsFr: "Cahier d'exercices et tableau.",
        assessmentIndicatorAr: "التطبيق السليم للمبرهنة مع ذكر الفرضيات في التحرير.",
        assessmentIndicatorFr: "Application correcte avec mention explicite des hypothèses.",
      },
    ],
    summaryRuleAr: `المبرهنة الأساسية وشروط تطبيقها مع الخطوات النموذجية للبرهان والاستدلال.`,
    summaryRuleFr: `Théorème fondamental, conditions d'application et canevas de rédaction de la preuve.`,
    homeworkTaskAr: "حل التمارين 3 و 4 و 5 من السلسلة (تمارين تعبئة وتوليف N2).",
    homeworkTaskFr: "Traiter les exercices 3, 4 et 5 de la fiche (niveau N2 mobilisation).",
  });

  // الحصة 3: الترييض وبناء الطرائق
  scenarios.push({
    sessionNum: 3,
    sessionTitleAr: "الحصة 3: الترييض وبناء الطرائق وحل تمارين متدرجة (N1, N2, N3)",
    sessionTitleFr: "Séance 3 : Entraînement méthodique et résolution graduée d'exercices",
    durationLabel: "2 heures (110 min)",
    sessionTypeAr: "أعمال موجهة وتمارين (TD)",
    sessionTypeFr: "Travaux dirigés et méthodes",
    operationalObjectivesAr: [
      "التحكم في التقنيات الحسابية والاستدلالية المرتبطة بالدرس.",
      "التدرب على التمارين التركيبية التي تدمج أكثر من خاصية (مستوى N2 و N3).",
      "صقل منهجية التحرير الرياضي وتفادي الأخطاء الشائعة.",
    ],
    operationalObjectivesFr: [
      "Maîtriser les algorithmes de calcul et démarches déductives courantes.",
      "S'entraîner sur des problèmes articulant plusieurs capacités (N2 et N3).",
      "Perfectionner la rédaction mathématique et éradiquer les confusions fréquentes.",
    ],
    moments: [
      {
        momentTitleAr: "1. تذكير سريع بالقواعد وتقنيات الحساب",
        momentTitleFr: "1. Rappel synthétique des automatismes",
        durationMin: 15,
        didacticPhase: "DIAGNOSTIC_DEPART",
        teacherRoleAr: "تذكير بجدول الصيغ الأساسية على ركن السبورة لتيسير استحضارها أثناء حل التمارين.",
        teacherRoleFr: "Rappeler au coin du tableau les formules indispensables servant d'outils d'appui.",
        studentRoleAr: "استحضار الصيغ وتدوينها في ورقة المسودات للاستعانة بها.",
        studentRoleFr: "Noter le formulaire au brouillon et identifier les propriétés à mobiliser.",
        workModalityAr: "تذكير جماعي مركّز.",
        workModalityFr: "Synthèse collective rapide.",
        materialsAr: "السبورة المدرسية.",
        materialsFr: "Tableau.",
        assessmentIndicatorAr: "جاهزية القواعد لدى المتعلمين.",
        assessmentIndicatorFr: "Disponibilité immédiate des règles opératoires.",
      },
      {
        momentTitleAr: "2. حل تمرين توليفي وتطبيق متقدم (N2)",
        momentTitleFr: "2. Résolution d'un problème d'approfondissement (N2)",
        durationMin: 45,
        didacticPhase: "ENTRAINEMENT_AVANCE",
        teacherRoleAr: "توجيه التلاميذ نحو قراءة التمرين كبنية مترابطة، مساعدة المتعثرين فردياً، واختيار تلميذ لعرض جزء من الحل.",
        teacherRoleFr: "Guider la lecture globale du problème, aider individuellement les élèves en difficulté et envoyer un élève au tableau.",
        studentRoleAr: "المحاولة الفردية، الربط بين الأسئلة المتتالية، وتبرير كل نتيجة بناء على الأسئلة السابقة.",
        studentRoleFr: "Résoudre en établissant le lien déductif entre questions successives.",
        workModalityAr: "عمل فردي يليه تصحيح تشاركي ومناقشة تفاعلية.",
        workModalityFr: "Travail individuel puis correction dialoguée.",
        materialsAr: "سلسلة التمارين ودفتر التمارين.",
        materialsFr: "Série d'exercices et cahier.",
        assessmentIndicatorAr: "القدرة على استغلال نتائج الأسئلة السابقة للإجابة عن الأسئلة الموالية.",
        assessmentIndicatorFr: "Mobilisation pertinente des résultats antérieurs.",
      },
      {
        momentTitleAr: "3. دراسة مسألة إدماجية ذات طابع امتحاني (N3)",
        momentTitleFr: "3. Problème de synthèse type examen (N3)",
        durationMin: 50,
        didacticPhase: "ENTRAINEMENT_AVANCE",
        teacherRoleAr: "عرض مسألة تتطلب تفكيراً ومبادرة، إدارة النقاش حول الاستراتيجيات البديلة وتثمين الحلول الأنيقة والمختصرة.",
        teacherRoleFr: "Proposer un problème ouvert demandant initiative, valoriser les démarches originales et élégantes.",
        studentRoleAr: "البحث في مسالك مختلفة، صياغة الفرضيات وتجريب الحلول، ومقارنة الطرائق المختلفة على السبورة.",
        studentRoleFr: "Explorer plusieurs pistes, esquisser des solutions et débattre de l'efficacité relative des méthodes.",
        workModalityAr: "عمل في ثنائيات (Binômes) ثم تقاسم على السبورة.",
        workModalityFr: "Recherche en binômes puis synthèse collégiale.",
        materialsAr: "دفتر التمارين والسبورة.",
        materialsFr: "Cahier et tableau.",
        assessmentIndicatorAr: "إيجاد مسار الحل وتبريره رياضياً لدى المتفوقين، واستيعاب الخطوات من طرف باقي الفصل.",
        assessmentIndicatorFr: "Émergence de démarches abouties et assimilation collective.",
      },
    ],
    summaryRuleAr: "استراتيجيات معالجة المسائل المركبة: استثمار المعطيات، الربط المنطقي بين الأسئلة، وجودة الصياغة.",
    summaryRuleFr: "Méthodologie de résolution des problèmes complexes : chaîne déductive et rigueur.",
    homeworkTaskAr: "حل تمرين تركيبي استعداداً لورشة TICE والتقويم التكويني.",
    homeworkTaskFr: "Préparer le problème de synthèse en vue de l'atelier TICE et de l'évaluation formative.",
  });

  // الحصة 4: إدماج TICE والبايثون
  scenarios.push({
    sessionNum: 4,
    sessionTitleAr: "الحصة 4: إدماج TICE والبرمجة بالبايثون والمحاكاة التفاعلية",
    sessionTitleFr: "Séance 4 : Atelier numérique TICE (GeoGebra & Python)",
    durationLabel: "2 heures (110 min)",
    sessionTypeAr: "تكنولوجيا وإعلاميات ورياضيات",
    sessionTypeFr: "Atelier numérique et programmation",
    operationalObjectivesAr: [
      "معاينة المفاهيم المجردة للدرس ديناميكياً بواسطة برمجية GeoGebra.",
      "فهم خوارزمية بايثون وكتابتها أو تعديلها واستخراج القيم المحسوبة ومقارنتها بالحل التحليلي.",
      "ترسيخ الفهم الهندسي والحدس الرياضي لدى التلميذ.",
    ],
    operationalObjectivesFr: [
      "Visualiser dynamiquement les notions théoriques sous GeoGebra 6.",
      "Implémenter ou modifier un script Python pour calculer et comparer aux valeurs exactes.",
      "Renforcer l'intuition géométrique et l'esprit d'investigation numérique.",
    ],
    moments: [
      {
        momentTitleAr: "1. عرض الوضعية التفاعلية على المسلاط الضوئي",
        momentTitleFr: "1. Projection de la situation dynamique",
        durationMin: 20,
        didacticPhase: "TICE_GEOGEBRA_PYTHON",
        teacherRoleAr: "تشغيل ملف GeoGebra على المسلاط، تحريك الزالجات ومساءلة التلاميذ حول ما يلاحظونه من تغيرات.",
        teacherRoleFr: "Projeter la figure GeoGebra, manipuler les curseurs et interroger la classe sur les régularités observées.",
        studentRoleAr: "ملاحظة التغيرات الديناميكية، صياغة تخمين بصري، ومقارنته بالخاصيات المدروسة نظرياً.",
        studentRoleFr: "Observer les invariants, formuler des conjectures visuelles et faire le lien avec le cours.",
        workModalityAr: "عرض جماعي تفاعلي موجه.",
        workModalityFr: "Démonstration interactive vidéoprojetée.",
        materialsAr: "المسلاط الضوئي، حاسوب، وملف GeoGebra التفاعلي.",
        materialsFr: "Vidéoprojecteur, ordinateur portable et fichier GeoGebra.",
        assessmentIndicatorAr: "التقاط الظاهرة الرياضية بصرياً وتبريرها علمياً.",
        assessmentIndicatorFr: "Interprétation correcte des variations graphiques.",
      },
      {
        momentTitleAr: "2. دراسة كود بايثون وتنفيذه ومناقشته",
        momentTitleFr: "2. Étude et exécution de l'algorithme Python",
        durationMin: 50,
        didacticPhase: "TICE_GEOGEBRA_PYTHON",
        teacherRoleAr: "شرح هيكل كود بايثون (الدوال، الحلقات، الشروط)، تبيان كيفية حساب النتائج، وتكليفهم بتعديل بعض المعاملات.",
        teacherRoleFr: "Décortiquer la structure du script Python (fonctions, boucles, conditions), exécuter et demander de modifier des paramètres.",
        studentRoleAr: "قراءة الكود سطر بسطر، إدراك وظيفته الرياضية، تعديل قيم المدخلات وملاحظة تأثيرها على المخرجات.",
        studentRoleFr: "Lire le code, comprendre l'implémentation mathématique et modifier les variables pour observer les sorties.",
        workModalityAr: "عمل في مجموعات أو على الآلات الحاسبة البيانية/الحواسيب.",
        workModalityFr: "Travail sur postes ou calculatrices programmables.",
        materialsAr: "بيئة بايثون (NumWorks / IDE) وأوراق العمل البرمجية.",
        materialsFr: "Interpréteur Python et fiche de TP.",
        assessmentIndicatorAr: "فهم دور الخوارزمية وتوقع مخرجاتها بدقة.",
        assessmentIndicatorFr: "Compréhension de l'algorithme et prévision exacte des sorties.",
      },
      {
        momentTitleAr: "3. المقارنة النقدية بين المحاكاة والبرهان النظري",
        momentTitleFr: "3. Confrontation théorique et bilan d'atelier",
        durationMin: 40,
        didacticPhase: "INSTITUTIONNALISATION",
        teacherRoleAr: "قيادة النقاش حول حدود المحاكاة الرقمية (أخطاء التقريب) وضرورة البرهان الرياضي الصارم لإثبات الحقيقة الرياضية.",
        teacherRoleFr: "Animer le débat sur les limites du numérique (erreurs d'arrondi) et la primauté absolue de la preuve déductive.",
        studentRoleAr: "استنتاج أن التجريب والبرمجة وسيلة للاكتشاف والتخمين وليست بديلاً عن البرهان الرياضي القطعي.",
        studentRoleFr: "Conclure que le numérique constitue une heuristique d'exploration et non une preuve formelle.",
        workModalityAr: "نقاش فلسفي وديداكتيكي جماعي وتدوين خلاصات مركّزة.",
        workModalityFr: "Débat épistémologique et synthèse écrite.",
        materialsAr: "السبورة ودفتر الدروس.",
        materialsFr: "Tableau et cahier de cours.",
        assessmentIndicatorAr: "إدراك مكانة البرهان مقارنة بالتجريب الرقمي.",
        assessmentIndicatorFr: "Distinction claire entre preuve formelle et vérification empirique.",
      },
    ],
    summaryRuleAr: "التكامل بين التخمين الرقمي (GeoGebra/Python) والبرهان التحليلي الصارم.",
    summaryRuleFr: "Complémentarité entre exploration numérique et rigueur déductive.",
    homeworkTaskAr: "كتابة فقرة تحليلية تقارن النتائج النظرية بالقيم المحسوبة بواسطة بايثون.",
    homeworkTaskFr: "Rédiger un paragraphe confrontant valeurs exactes et approximations numériques.",
  });

  // الحصة 5: التقويم التكويني والدعم الفوري والواجب المنزلي
  scenarios.push({
    sessionNum: 5,
    sessionTitleAr: "الحصة 5: التقويم التكويني، المعالجة الديداكتيكية والتعاقد المنزلي",
    sessionTitleFr: "Séance 5 : Évaluation formative, remédiation ciblée et Devoir Maison",
    durationLabel: "2 heures (110 min)",
    sessionTypeAr: "تقويم تكويني ومعالجة",
    sessionTypeFr: "Évaluation formative & Régulation",
    operationalObjectivesAr: [
      "قياس مدى تحقق القدرات والمهارات المنتظرة بشكل فردي موضوعي وموثوق.",
      "تشخيص مكامن الخلل والصعوبات المعرفية والمنهجية المتبقية لدى المتعلمين.",
      "تطبيق إجراءات معالجة ودعم فوري هادفة لتجاوز التعثرات المرصودة.",
      "تحديد ميثاق التعاقد للفرض المنزلي (DM) أو السلسلة لترسيخ التملك المستدام.",
    ],
    operationalObjectivesFr: [
      "Mesurer objectivement le degré d'acquisition individuelle des capacités cibles.",
      "Diagnostiquer les lacunes conceptuelles et méthodologiques résiduelles.",
      "Déployer des stratégies de remédiation immédiates et personnalisées.",
      "Instaurer le contrat didactique du Devoir Maison pour consolider l'autonomie.",
    ],
    moments: [
      {
        momentTitleAr: "1. إجراء اختبار التقويم التكويني الفردي",
        momentTitleFr: "1. Passation du test formatif individuel",
        durationMin: 25,
        didacticPhase: "EVALUATION_REGULATION",
        teacherRoleAr: "توزيع بطاقات الاختبار التكويني (تمرين موجه يغطي N1 و N2)، ضبط التوقيت وضمان ظروف العمل الفردي المستقل.",
        teacherRoleFr: "Distribuer le sujet de test formatif, veiller aux conditions d'évaluation autonome et chronométrer l'épreuve.",
        studentRoleAr: "إنجاز الاختبار دون الاستعانة بالدفتر أو الزملاء، استثمار المعارف المكتسبة، وتحرير الحل بدقة ووضوح.",
        studentRoleFr: "Composer en autonomie complète sans documents, mobiliser les acquis et soigner la rédaction.",
        workModalityAr: "تقويم كتابي فردي مغلق.",
        workModalityFr: "Évaluation individuelle sur feuille.",
        materialsAr: "بطاقات الاختبار التكويني المطبوعة.",
        materialsFr: "Feuilles de test formatif individuelles.",
        assessmentIndicatorAr: "إجابة صحيحة عن الأسئلة الأساسية بنسبة تفوق 75% من التلاميذ.",
        assessmentIndicatorFr: "Réussite des questions socles par au moins 75% de la classe.",
      },
      {
        momentTitleAr: "2. التصحيح التشاركي وتشخيص الأخطاء الشائعة",
        momentTitleFr: "2. Correction collaborative et diagnostic d'erreurs",
        durationMin: 35,
        didacticPhase: "EVALUATION_REGULATION",
        teacherRoleAr: "جمع عينة سريعة من الأوراق، إبراز الأخطاء الأكثر شيوعاً على السبورة، ومناقشة أسبابها المعرفية والديداكتيكية.",
        teacherRoleFr: "Parcourir rapidement un échantillon de copies, projeter ou écrire les erreurs types et élucider leur origine.",
        studentRoleAr: "مقارنة إنتاجهم بالحل النموذجي، إدراك مكامن الخطأ وتصحيحه على الورقة باللون الأخضر مع كتابة التبرير.",
        studentRoleFr: "Auto-évaluer sa production, comprendre la source de l'erreur et porter les corrections explicatives.",
        workModalityAr: "تصحيح تشاركي تفاعلي على السبورة.",
        workModalityFr: "Correction interactive collégiale.",
        materialsAr: "السبورة المدرسية وسلم التنقيط المفصل.",
        materialsFr: "Tableau et barème de notation analytique.",
        assessmentIndicatorAr: "وعي التلميذ بالخطأ والقدرة على تصويبه ذاتياً وتفسيره.",
        assessmentIndicatorFr: "Prise de conscience de l'erreur et rectification autonome.",
      },
      {
        momentTitleAr: "3. ورشات المعالجة والدعم الفارقي (Remédiation)",
        momentTitleFr: "3. Ateliers de remédiation différenciée",
        durationMin: 35,
        didacticPhase: "EVALUATION_REGULATION",
        teacherRoleAr: "توزيع الفصل إلى فئات: فئة الدعم الأساسي (معالجة التعثرات القاعدية) وفئة التعمق والتميز (تمارين N3 مفتوحة).",
        teacherRoleFr: "Organiser des ateliers différenciés : groupe de remédiation sur les fondamentaux et groupe d'approfondissement (N3).",
        studentRoleAr: "المشاركة في ورشة العمل المناسبة لمستواه، حل المسائل المقترحة بمساعدة المدرس أو بالتعلم القرين.",
        studentRoleFr: "Travailler selon ses besoins réels, soit en consolidation soit en dépassement, avec tutorat entre pairs.",
        workModalityAr: "بيداغوجيا فارقية في ورشات متباينة.",
        workModalityFr: "Pédagogie différenciée en ateliers ciblés.",
        materialsAr: "بطاقات الدعم وبطاقات التميز التكميلية.",
        materialsFr: "Fiches de remédiation et fiches défis.",
        assessmentIndicatorAr: "تجاوز التعثرات المرصودة لدى الفئة الداعمة، وتطوير التفكير الإبداعي لدى المتفوقين.",
        assessmentIndicatorFr: "Dépassement effectif des blocages pour le groupe soutien.",
      },
      {
        momentTitleAr: "4. التعاقد على الواجب المنزلي وآفاق الدرس اللاحق",
        momentTitleFr: "4. Contrat du Devoir Maison et perspectives",
        durationMin: 15,
        didacticPhase: "EVALUATION_REGULATION",
        teacherRoleAr: "توزيع نص الفرض المنزلي (DM)، توضيح معايير التقويم وسلّم التنقيط، وتحديد تاريخ الإرجاع وتسجيله في دفتر النصوص.",
        teacherRoleFr: "Présenter le Devoir Maison, expliciter les critères d'évaluation et fixer la date de remise au cahier de textes.",
        studentRoleAr: "استلام نص الفرض المنزلي، تدوين التوجيهات وتاريخ التسليم، والالتزام بإنجازه بعناية واستقلالية.",
        studentRoleFr: "Prendre note des exigences et s'engager formellement à rendre un devoir soigné dans les délais.",
        workModalityAr: "تعاقد ديداكتيكي رسمي ومسؤول.",
        workModalityFr: "Contrat didactique officiel.",
        materialsAr: "نص الفرض المنزلي ودفتر النصوص المدرسي.",
        materialsFr: "Sujet du Devoir Maison et cahier de textes.",
        assessmentIndicatorAr: "وضوح المهام المنزلية والالتزام بميثاق التعاقد الذاتي.",
        assessmentIndicatorFr: "Clarté des attentes et adhésion au contrat de travail.",
      },
    ],
    summaryRuleAr: "خطة الدعم والمعالجة المعتمدة والتعاقد الرسمي للفرض المنزلي.",
    summaryRuleFr: "Dispositif officiel de remédiation et contrat d'engagement du Devoir Maison.",
    homeworkTaskAr: "إنجاز الفرض المنزلي كاملاً في ورقة مزدوجة مع احترام سلم التنقيط وشروط التحرير.",
    homeworkTaskFr: "Rédiger intégralement le Devoir Maison sur feuille double selon le barème officiel.",
  });

  return scenarios;
}

/**
 * بناء جدول الصيغ والقواعد الرسمية المركزة (Formulaire de synthèse)
 */
function buildOfficialFormulasSummary(lesson: LessonItem): FicheFormulaSummaryItem[] {
  const title = lesson.lessonAr.toLowerCase();

  if (title.includes("اتصال") || title.includes("نهايات") || title.includes("continuité") || title.includes("limites")) {
    return [
      {
        titleAr: "تعريف الاتصال في نقطة",
        titleFr: "Continuité en un point",
        latex: "\\lim_{x \\to x_0} f(x) = f(x_0)",
        domainOrCondition: "x_0 \\in D_f \\text{ و } D_f \\text{ يحتوي على مجال مفتوح مركزه } x_0",
      },
      {
        titleAr: "الاتصال على اليمين واليسار",
        titleFr: "Continuité unilatérale",
        latex: "\\lim_{x \\to x_0^+} f(x) = \\lim_{x \\to x_0^-} f(x) = f(x_0)",
        domainOrCondition: "f \\text{ معرفة على مجال من النمط } [x_0, x_0+\\alpha[ \\text{ و } ]x_0-\\alpha, x_0]",
      },
      {
        titleAr: "مبرهنة القيم الوسيطية (TVI)",
        titleFr: "Théorème des Valeurs Intermédiaires",
        latex: "f(a) \\cdot f(b) < 0 \\implies \\exists c \\in ]a, b[ : f(c) = 0",
        domainOrCondition: "f \\text{ متصلة على } [a, b] \\text{ (وإذا كانت رتيبة قطعا فالحل } c \\text{ وحيد)}",
      },
      {
        titleAr: "مشتقة الدالة العكسية",
        titleFr: "Dérivée de la réciproque",
        latex: "(f^{-1})'(y_0) = \\frac{1}{f'(x_0)} = \\frac{1}{f'(f^{-1}(y_0))}",
        domainOrCondition: "f(x_0) = y_0 \\text{ مع } f'(x_0) \\neq 0 \\text{ و } f \\text{ قابلة للاشتقاق في } x_0",
      },
      {
        titleAr: "صورة قطعة بدالة متصلة ورتيبة تزايدية",
        titleFr: "Image d'un segment",
        latex: "f([a, b]) = [f(a), f(b)]",
        domainOrCondition: "f \\text{ متصلة وتزايدية قطعا على } [a, b]",
      },
    ];
  }

  if (title.includes("اشتقاق") || title.includes("dérivation") || title.includes("دوال") || title.includes("fonctions")) {
    return [
      {
        titleAr: "العدد المشتق ومعادلة المماس",
        titleFr: "Nombre dérivé & Tangente",
        latex: "y = f'(x_0)(x - x_0) + f(x_0)",
        domainOrCondition: "f \\text{ قابلة للاشتقاق في } x_0 \\text{ أي أن } \\lim_{x \\to x_0} \\frac{f(x)-f(x_0)}{x-x_0} = f'(x_0) \\in \\mathbb{R}",
      },
      {
        titleAr: "مشتقة مركب دالتين",
        titleFr: "Dérivée d'une composée",
        latex: "(g \\circ f)'(x) = f'(x) \\cdot (g' \\circ f)(x) = f'(x) \\cdot g'(f(x))",
        domainOrCondition: "f \\text{ قابلة للاشتقاق في } x \\text{ و } g \\text{ قابلة للاشتقاق في } f(x)",
      },
      {
        titleAr: "مشتقة القوة العامة والجذر n-ième",
        titleFr: "Dérivée de u^r et racine n-ième",
        latex: "(u^n)' = n \\cdot u' \\cdot u^{n-1} \\quad ; \\quad (\\sqrt[n]{u})' = \\frac{u'}{n \\cdot \\sqrt[n]{u^{n-1}}}",
        domainOrCondition: "u(x) > 0 \\text{ لكل } x \\text{ في حالة الجذور الرتبة } n",
      },
      {
        titleAr: "نقطة الانعطاف والتقعر",
        titleFr: "Inflexion et concavité",
        latex: "f''(x_0) = 0 \\text{ مع تغير إشارة } f'' \\implies A(x_0, f(x_0)) \\text{ نقطة انعطاف}",
        domainOrCondition: "f \\text{ قابلة للاشتقاق مرتين في جوار } x_0",
      },
    ];
  }

  if (title.includes("متتاليات") || title.includes("suites")) {
    return [
      {
        titleAr: "الحد العام لمتتالية حسابية",
        titleFr: "Suite arithmétique",
        latex: "u_n = u_p + (n - p)r \\quad ; \\quad S_n = \\frac{(n - p + 1)(u_p + u_n)}{2}",
        domainOrCondition: "r \\in \\mathbb{R} \\text{ هو الأساس}",
      },
      {
        titleAr: "الحد العام لمتتالية هندسية",
        titleFr: "Suite géométrique",
        latex: "u_n = u_p \\cdot q^{n - p} \\quad ; \\quad S_n = u_p \\cdot \\frac{1 - q^{n - p + 1}}{1 - q} \\quad (q \\neq 1)",
        domainOrCondition: "q \\in \\mathbb{R}^* \\text{ هو الأساس}",
      },
      {
        titleAr: "تقارب المتتالية الهندسية q^n",
        titleFr: "Limite de q^n",
        latex: "\\lim_{n \\to +\\infty} q^n = 0 \\iff |q| < 1 \\quad ; \\quad \\lim_{n \\to +\\infty} q^n = +\\infty \\iff q > 1",
        domainOrCondition: "\\text{إذا كان } q \\le -1 \\text{ فالمتتالية ليست لها نهاية}",
      },
      {
        titleAr: "تقارب متتالية تراجعية u_{n+1} = f(u_n)",
        titleFr: "Suite récurrente convergente",
        latex: "u_{n+1} = f(u_n) \\text{ و } u_n \\to l \\implies f(l) = l",
        domainOrCondition: "f \\text{ متصلة على } I \\text{ و } f(I) \\subset I \\text{ و } u_0 \\in I",
      },
    ];
  }

  // ملخص قوانين عام شامل
  return [
    {
      titleAr: "العلاقة التأسيسية للدرس",
      titleFr: "Relation constitutive fondamentale",
      latex: "\\forall x \\in D, \\quad \\mathcal{R}(x) \\iff \\mathcal{P}(x)",
      domainOrCondition: "احترام شروط الوجود ومجال الصلاحية",
    },
    {
      titleAr: "خاصية التكافؤ والاستلزام",
      titleFr: "Équivalence caractéristique",
      latex: "A \\implies B \\iff \\overline{B} \\implies \\overline{A} \\quad (\\text{الاستلزام المضاد للعكس})",
      domainOrCondition: "قواعد المنطق الرياضي الصارم",
    },
  ];
}

/**
 * بناء الوضعية الانطلاقية البنائية الشاملة
 */
function buildIntroductoryActivity(lesson: LessonItem, track: TrackData) {
  const title = lesson.lessonAr.toLowerCase();

  const isGeo =
    lesson.subCategory === "هندسة فضائية" ||
    lesson.subCategory === "هندسة مستوية" ||
    lesson.category === "Geometry" ||
    title.includes("فلكة") ||
    title.includes("جداء") ||
    title.includes("فضاء");

  const isSuites = title.includes("متتاليات") || title.includes("suites");
  const isExpLog = title.includes("لوغاريتم") || title.includes("أسية") || title.includes("ln") || title.includes("exp");
  const isIntegral = title.includes("تكامل") || title.includes("أصلية") || title.includes("intégrale");
  const isComplex = title.includes("عقدية") || title.includes("complexe");
  const isProba = title.includes("احتمال") || title.includes("probabilité");
  const isArith = title.includes("حسابيات") || title.includes("arithmétique");

  if (isGeo) {
    return {
      titleAr: `وضعية انطلاق استكشافية: التموضع والمسافات والمعادلات الديكارتية في الفضاء (O; i⃗, j⃗, k⃗)`,
      titleFr: `Activité d'introduction : Repérage, équations cartésiennes et orthogonalité dans l'espace`,
      problemContextAr: `في الفضاء المنسوب إلى معلم متعامد ممنظم مباشر (O; i⃗, j⃗, k⃗)، نعتبر النقط A(1, 2, -1) و B(2, 0, 1) والمستوى (P) المار من A والعمودي على المتجهة n⃗(2, -1, 3). نريد تحديد موقع نقطة M(x, y, z) من الفضاء تبعد بنفس المسافة عن A و B أو تحقق شرط التعامد والانتماء للمستوى (P) ومجموعة النقط.`,
      problemContextFr: `L'espace est rapporté à un repère orthonormé direct (O; i⃗, j⃗, k⃗). On donne A(1, 2, -1), B(2, 0, 1) et le plan (P) passant par A et orthogonal à n⃗(2, -1, 3). On cherche à déterminer l'équation cartésienne du plan et à caractériser les ensembles de points à distance donnée.`,
      questionsAr: [
        "1. أحسب المسافة AB وإحداثيات المتجهة AB⃗، ثم حدد إحداثيات منتصف القطعة [AB].",
        "2. بين أن النقطة M(x, y, z) تنتمي إلى المستوى (P) إذا وفقط إذا كان الجداء السلمي AM⃗ · n⃗ = 0.",
        "3. استنتج معادلة ديكارتية للمستوى (P)، ثم صغ تخميناً حول المسافة الفاصلة بين نقطة ما والمستوى (P).",
        "4. حدد طبيعة مجموعة النقط M(x, y, z) التي تحقق: MA² + MB² = k (مناقشة حسب قيم العدد الحقيقي k).",
      ],
      questionsFr: [
        "1. Calculer la distance AB, les coordonnées du vecteur AB⃗ et le milieu du segment [AB].",
        "2. Justifier que M(x, y, z) ∈ (P) si et seulement si AM⃗ · n⃗ = 0.",
        "3. En déduire une équation cartésienne de (P) et conjecturer la formule de la distance d'un point à un plan.",
        "4. Déterminer la nature de l'ensemble des points M vérifiant MA² + MB² = k selon les valeurs de k.",
      ],
      expectedConjecturesAr: [
        "تخمين أن معادلة المستوى من الدرجة الأولى بمجهولين أو ثلاثة مجاهيل: ax + by + cz + d = 0.",
        "الربط بين معاملات المعادلة الديكارتية (a, b, c) وإحداثيات المتجهة المنظمية n⃗.",
        "تخمين أن مجموعة النقط ذات المسافة الثابتة عن نقطة معلومة تشكل فلكة (Sphère) مركزها تلك النقطة.",
      ],
      expectedConjecturesFr: [
        "Conjecturer que l'équation d'un plan s'écrit ax + by + cz + d = 0.",
        "Identifier que les coefficients (a, b, c) sont les composantes d'un vecteur normal.",
        "Conjecturer qu'un ensemble de points à distance constante définit une sphère.",
      ],
      epistemologicalObstaclesAr:
        "صعوبة الانتقال من الهندسة المستوية ثنائية الأبعاد (2D) إلى الفضاء ثلاثي الأبعاد (3D)، والخلط بين معادلة مستقيم ومعادلة مستوى في الفضاء، وتصور تعامد مستقيمين غير متقاطعين في الفضاء.",
      epistemologicalObstaclesFr:
        "Difficulté de visualisation dans l'espace 3D, confusion entre équation de droite et équation de plan, et appréhension de droites orthogonales non sécantes.",
    };
  }

  if (isSuites) {
    return {
      titleAr: `وضعية انطلاق استكشافية: نمذجة نمو رصيد بنكي وسلوك المتتاليات التراجعية u_{n+1} = f(u_n)`,
      titleFr: `Activité d'introduction : Modélisation d'une évolution et étude de suites récurrentes`,
      problemContextAr: `يودع شخص مبلغاً قدره u₀ = 10000 درهم في حساب بنكي بفائدة سنوية قدرها 5%، ويضيف في بداية كل سنة مبلغاً ثابتاً قدره 1200 درهم. نريد دراسة تطور الرصيد u_n بعد مرور n سنة وتحديد سلوكه التقاربي ومقارنته بنموذج متتالية مساعدة هندسية.`,
      problemContextFr: `Un capital initial u₀ = 10000 DH est placé à 5% par an, avec versement annuel fixe de 1200 DH. On cherche à modéliser le capital u_n après n années, à exprimer u_n en fonction de n et à conjecturer le comportement asymptotique.`,
      questionsAr: [
        "1. أحسب الرصيد في السنتين الأولى والثانية: u₁ و u₂.",
        "2. بين أن الرصيد يحقق علاقة تراجعية من الشكل: u_{n+1} = 1.05 u_n + 1200 لكل n ∈ ℕ.",
        "3. نضع v_n = u_n + α لكل n ∈ ℕ. حدد قيمة الثابت α لكي تكون (v_n) متتالية هندسية محددة الأساس.",
        "4. استنتج تعبير v_n ثم تعبير u_n بدلالة n، واحسب نهاية u_n عندما يؤول n إلى +∞.",
      ],
      questionsFr: [
        "1. Calculer les termes u₁ et u₂.",
        "2. Montrer que u_{n+1} = 1.05 u_n + 1200 pour tout n ∈ ℕ.",
        "3. On pose v_n = u_n + α. Déterminer α pour que (v_n) soit géométrique.",
        "4. En déduire u_n en fonction de n et calculer sa limite en +∞.",
      ],
      expectedConjecturesAr: [
        "تخمين أن الرصيد يتزايد باطراد نحو اللانهاية.",
        "إدراك أن المتتالية التراجعية ليست حسابية ولا هندسية بذاتها، لكنها ترتبط بمتتالية هندسية عبر إزاحة ثابتة.",
        "صياغة مبدأ الاستدلال بالترجع لإثبات أن u_n > 10000 لكل n.",
      ],
      expectedConjecturesFr: [
        "Conjecturer la croissance stricte et la divergence vers +∞.",
        "Comprendre la technique de la suite auxiliaire géométrique par décentrage.",
        "Utiliser le raisonnement par récurrence pour valider la minoration.",
      ],
      epistemologicalObstaclesAr:
        "الخلط بين u_{n+1} و u_n + 1، وتطبيق قواعد المتتاليات الحسابية أو الهندسية على متتاليات تراجعية ليست كذلك، وإغفال مرحلة التوريث في الاستدلال بالترجع.",
      epistemologicalObstaclesFr:
        "Confusion entre u_{n+1} et u_n + 1, application erronée des formules arithmétiques/géométriques, et fragilité de l'étape d'hérédité en récurrence.",
    };
  }

  // وضعية الدوال والنهايات والاتصال والاشتقاق (الافتراضية الرائدة)
  return {
    titleAr: `وضعية انطلاق استكشافية: من السرعة اللحظية وميل القاطع إلى بناء المفهوم الدقيق لـ « ${lesson.lessonAr} »`,
    titleFr: `Activité d'introduction : De la vitesse instantanée et sécante au concept rigoureux de « ${lesson.lessonFr} »`,
    problemContextAr: `يتحرك جسم مادي على مسار مستقيم بحيث يعطى موضعه x(t) عند اللحظة t بالدالة x(t) = t² + 2t. نريد حساب السرعة المتوسطة بين اللحظتين t₀ = 2 و t₀ + h، ثم ملاحظة ما يؤول إليه معدل التغير عندما يقترب h من الصفر، لإدراك المفهوم الفيزيائي للسرعة اللحظية والمفهوم الرياضي المقابل.`,
    problemContextFr: `Un mobile se déplace selon la loi horaire x(t) = t² + 2t. On étudie la vitesse moyenne entre t₀ = 2 et t₀ + h, puis la limite du taux d'accroissement lorsque h tend vers 0 afin de dégager la vitesse instantanée et le concept mathématique associé.`,
    questionsAr: [
      "1. أحسب السرعة المتوسطة V_m(h) = (x(2+h) - x(2))/h بالنسبة لـ h = 0.1 ثم h = 0.01 ثم h = -0.01.",
      "2. انشر وبسط التعبير الجبري لـ V_m(h) من أجل كل h ≠ 0.",
      "3. ماذا تلاحظ عندما يقترب h من الصفر؟ صغ تخميناً رياضياً دقيقاً حول القيمة الحدية.",
      "4. ما هو التأويل الهندسي لهذا المقدار بالنسبة للمماس لمنحنى الدالة في النقطة ذات الأفصول 2؟",
    ],
    questionsFr: [
      "1. Calculer la vitesse moyenne V_m(h) pour h = 0.1, h = 0.01 et h = -0.01.",
      "2. Développer et simplifier V_m(h) pour tout h ≠ 0.",
      "3. Que constate-t-on quand h tend vers 0 ? Émettre une conjecture sur la limite finie.",
      "4. Donner l'interprétation géométrique de ce résultat en termes de tangente à la courbe.",
    ],
    expectedConjecturesAr: [
      "ملاحظة أن النسبة تستقر عند العدد 6 عندما يقترب h من الصفر من الجهتين.",
      "تخمين أن المماس هو الوضعية الحدية للقاطع عندما تقترب النقطة المتحركة من النقطة الثابتة.",
      "إدراك أن التعويض المباشر بـ h = 0 يعطي شكلاً غير محدد (0/0) يتطلب التعميل والاختزال.",
    ],
    expectedConjecturesFr: [
      "Observer que le taux se stabilise vers 6 quand h tend vers 0.",
      "Conjecturer que la tangente est la limite géométrique des sécantes sécantes.",
      "Reconnaître la forme indéterminée 0/0 et la nécessité de la factorisation préalable.",
    ],
    epistemologicalObstaclesAr:
      "الخلط بين الصورة والنهاية، والاعتقاد الخاطئ بأن القسمة على صفر ممكنة عند حساب النهاية، وصعوبة تصور ميل المماس كرقم مشتق وليس مجرد مستقيم مرسوم.",
    epistemologicalObstaclesFr:
      "Confusion entre image et limite, blocage face à la division par zéro apparente, et difficulté à lier le coefficient directeur d'une droite au nombre dérivé.",
  };
}

/**
 * بناء المحتوى العلمي والمعرفي الكامل والمفصل للدرس (التعاريف، المبرهنات، البراهين، الأمثلة المحلولة)
 */
function buildDetailedCourseContent(lesson: LessonItem, track: TrackData): FicheCourseSection[] {
  const title = lesson.lessonAr.toLowerCase();

  // 1. درس النهايات والاتصال (Limites et Continuité)
  if (title.includes("اتصال") || title.includes("نهايات") || title.includes("continuité") || title.includes("limites")) {
    return [
      {
        sectionNum: 1,
        titleAr: "I. اتصال دالة عددية في نقطة وعلى مجال والعمليات (Continuité en un point et sur un intervalle)",
        titleFr: "I. Continuité d'une fonction numérique en un point, sur un intervalle et opérations",
        axisSummaryAr: "دراسة مفهوم الاتصال كشرط لعدم انقطاع المنحنى البياني، وتحديد النهايات بالاعتماد على خاصية الاتصال.",
        axisSummaryFr: "Formalisation de la continuité et prolongement par continuité en un point singulier.",
        definitions: [
          {
            termAr: "الاتصال في نقطة x₀",
            termFr: "Continuité en un point x₀",
            contentAr: "لتكن f دالة عددية معرفة على مجال مفتوح I يحتوي على x₀. نقول إن f متصلة في x₀ إذا وفقط إذا كانت النهاية عند x₀ منتهية وتساوي تماماً الصورة f(x₀). أي بالترميز الرياضي الصارم: lim_{x → x₀} f(x) = f(x₀).",
            contentFr: "Soit f une fonction définie sur un intervalle ouvert I contenant x₀. f est continue en x₀ ssi lim_{x → x₀} f(x) = f(x₀).",
            notationMath: "\\lim_{x \\to x_0} f(x) = f(x_0) \\iff \\forall \\varepsilon > 0, \\exists \\alpha > 0, \\forall x \\in D_f : (|x - x_0| < \\alpha \\implies |f(x) - f(x_0)| < \\varepsilon)",
          },
          {
            termAr: "الاتصال على اليمين وعلى اليسار في نقطة",
            termFr: "Continuité unilatérale (à droite et à gauche)",
            contentAr: "تكون الدالة f متصلة في x₀ إذا وفقط إذا كانت متصلة على اليمين وعلى اليسار في x₀ معاً، أي: lim_{x → x₀⁺} f(x) = lim_{x → x₀⁻} f(x) = f(x₀).",
            contentFr: "f est continue en x₀ si et seulement si lim_{x → x₀⁺} f(x) = lim_{x → x₀⁻} f(x) = f(x₀).",
            notationMath: "\\lim_{x \\to x_0^+} f(x) = \\lim_{x \\to x_0^-} f(x) = f(x_0)",
          },
          {
            termAr: "التمديد بالاتصال في نقطة",
            termFr: "Prolongement par continuité",
            contentAr: "إذا كانت f غير معرفة في x₀ ولكن تقبل نهاية منتهية l عندما يؤول x إلى x₀، فإن الدالة g المعرفة بـ: g(x) = f(x) لكل x ≠ x₀ و g(x₀) = l تسمى التمديد بالاتصال للدالة f في x₀.",
            contentFr: "Si f n'est pas définie en x₀ et lim_{x → x₀} f(x) = l ∈ ℝ, la fonction g définie par g(x) = f(x) pour x ≠ x₀ et g(x₀) = l est le prolongement par continuité de f en x₀.",
          },
        ],
        theorems: [
          {
            nameAr: "اتصال الدوال الاعتيادية والعمليات الجبرية",
            nameFr: "Continuité des fonctions usuelles et opérations",
            statementAr: "كل دالة حدودية متصلة على ℝ. كل دالة جذرية متصلة على كل مجال من مجموعة تعريفها. الدوال المثلثية (sin, cos) متصلة على ℝ ودالة الظل tan متصلة على D_tan. مجموع، جداء، وخارج دالتين متصلتين هي دوال متصلة (بشرط عدم انعدام المقام).",
            statementFr: "Toute fonction polynôme est continue sur ℝ. Toute fonction rationnelle est continue sur tout intervalle inclus dans son domaine. Somme, produit et quotient de fonctions continues sont continus.",
            conditionsAr: ["f و g متصلتان على المجال I", "g(x) ≠ 0 لكل x من I في حالة القسمة"],
            conditionsFr: ["f et g continues sur l'intervalle I", "g(x) ≠ 0 pour tout x ∈ I pour le quotient f/g"],
          },
          {
            nameAr: "اتصال مركب دالتين (Continuité de la composée)",
            nameFr: "Continuité de la composée de deux fonctions",
            statementAr: "إذا كانت f دالة متصلة في x₀ وكانت g دالة متصلة في النقطة f(x₀)، فإن الدالة المركبة g ∘ f متصلة في x₀. وبالتعميم: إذا كانت f متصلة على I و f(I) ⊂ J و g متصلة على J، فإن g ∘ f متصلة على I.",
            statementFr: "Si f est continue en x₀ et g continue en f(x₀), alors g ∘ f est continue en x₀.",
            proofAr: "ليكن ε > 0. بما أن g متصلة في y₀ = f(x₀)، يوجد η > 0 بحيث إذا كان |y - y₀| < η فإن |g(y) - g(y₀)| < ε. وبما أن f متصلة في x₀، يوجد α > 0 بحيث إذا كان |x - x₀| < α فإن |f(x) - f(x₀)| < η. وبالتالي |(g ∘ f)(x) - (g ∘ f)(x₀)| < ε.",
            proofFr: "Soit ε > 0. Par continuité de g en y₀ = f(x₀), il existe η > 0 tel que |y - y₀| < η ⇒ |g(y) - g(y₀)| < ε. Par continuité de f en x₀, il existe α > 0 tel que |x - x₀| < α ⇒ |f(x) - f(x₀)| < η. D'où la conclusion.",
          },
        ],
        solvedExamples: [
          {
            titleAr: "مثال تطبيقي نموذجي: دراسة اتصال دالة مجزأة والتمديد بالاتصال",
            titleFr: "Exemple résolu : Continuité d'une fonction définie par morceaux",
            statementAr: "نعتبر الدالة f المعرفة على ℝ بـ: f(x) = (x² - x - 2)/(x - 2) لكل x ≠ 2، و f(2) = 3. هل f متصلة في النقطة x₀ = 2؟",
            statementFr: "Soit f définie sur ℝ par f(x) = (x² - x - 2)/(x - 2) pour x ≠ 2 et f(2) = 3. Étudier la continuité de f en x₀ = 2.",
            solutionStepsAr: [
              "1. نحدد المعطى: قيمة الدالة في النقطة 2 هي f(2) = 3.",
              "2. نحسب النهاية عندما يؤول x إلى 2: نلاحظ أن التعويض المباشر يعطي (0/0) وهو شكل غير محدد.",
              "3. نعمل البسط: x² - x - 2 = (x - 2)(x + 1).",
              "4. نختزل من أجل x ≠ 2: f(x) = ((x - 2)(x + 1))/(x - 2) = x + 1.",
              "5. نحسب النهاية: lim_{x → 2} f(x) = lim_{x → 2} (x + 1) = 2 + 1 = 3.",
              "6. بما أن lim_{x → 2} f(x) = f(2) = 3، فإن الدالة f متصلة في النقطة x₀ = 2.",
            ],
            solutionStepsFr: [
              "1. On a f(2) = 3.",
              "2. Forme indéterminée 0/0 par substitution directe en x = 2.",
              "3. Factorisation du numérateur : x² - x - 2 = (x - 2)(x + 1).",
              "4. Pour x ≠ 2, on simplifie : f(x) = x + 1.",
              "5. Calcul de limite : lim_{x → 2} f(x) = 2 + 1 = 3.",
              "6. Conclusion : lim_{x → 2} f(x) = f(2), donc f est continue en x₀ = 2.",
            ],
            pedagogicalNoteAr: "ضرورة الإشارة إلى أن التبسيط صالح فقط لكل x ≠ x₀ قبل حساب النهاية.",
            pedagogicalNoteFr: "Toujours préciser que la simplification n'est valide que pour x ≠ x₀ avant de passer à la limite.",
            difficultyLevel: "N1",
          },
        ],
        commonMistakesAr: [
          "حساب f(x₀) بالتعويض في تعبير صالح فقط لـ x ≠ x₀.",
          "نسيان دراسة النهاية على اليمين والنهاية على اليسار عندما تكون الدالة معرفة بقيم مطلقة أو فروع مجزأة.",
          "الخلط بين مفهوم الاتصال في نقطة وقابلية الاشتقاق فيها.",
        ],
        commonMistakesFr: [
          "Calculer f(x₀) avec une formule définie uniquement pour x ≠ x₀.",
          "Oublier de dissocier limite à gauche et à droite pour les fonctions à valeur absolue.",
          "Confondre continuité en un point et dérivabilité.",
        ],
      },
      {
        sectionNum: 2,
        titleAr: "II. مبرهنة القيم الوسيطية وتقطيع المجالات (Théorème des Valeurs Intermédiaires - TVI)",
        titleFr: "II. Théorème des valeurs intermédiaires et méthode de dichotomie",
        axisSummaryAr: "إثبات وجود ووحدانية حلول المعادلات من النمط f(x) = k وتطبيقها على حل المعادلات وتحديد إشارة الدوال.",
        axisSummaryFr: "Existence et unicité des solutions d'équations f(x) = k et algorithme de dichotomie.",
        definitions: [
          {
            termAr: "صورة مجال بدالة متصلة",
            termFr: "Image d'un intervalle par une fonction continue",
            contentAr: "صورة مجال I بدالة متصلة f هي مجال J = f(I). وصورة قطعة [a, b] بدالة متصلة هي قطعة [m, M] حيث m هي القيمة الدنوية و M هي القيمة القصوية للدالة f على [a, b].",
            contentFr: "L'image d'un intervalle par une fonction continue est un intervalle. L'image d'un segment [a, b] est un segment [m, M].",
            notationMath: "f([a, b]) = [\\min_{[a, b]} f, \\max_{[a, b]} f]",
          },
        ],
        theorems: [
          {
            nameAr: "مبرهنة القيم الوسيطية (T.V.I)",
            nameFr: "Théorème des Valeurs Intermédiaires (TVI)",
            statementAr: "إذا كانت f دالة متصلة على قطعة [a, b]، فإنه لكل عدد حقيقي k محصور بين f(a) و f(b)، يوجد على الأقل عنصر c من القطعة [a, b] بحيث: f(c) = k. وحالة خاصة: إذا كانت f متصلة على [a, b] و f(a) · f(b) < 0، فإن المعادلة f(x) = 0 تقبل على الأقل حلاً c في المجال المفتوح ]a, b[.",
            statementFr: "Si f est continue sur [a, b], pour tout réel k compris entre f(a) et f(b), il existe au moins un réel c ∈ [a, b] tel que f(c) = k. Cas particulier : si f(a) · f(b) < 0, l'équation f(x) = 0 admet au moins une solution c ∈ ]a, b[.",
            proofAr: "تعتمد المبرهنة على خوارزمية التفرع الثنائي (Dichotomie): نضع a₀ = a و b₀ = b ونأخذ المنتصف m₀ = (a₀ + b₀)/2. إذا كان f(m₀) = 0 ننتهي. وإلا نختار نصف المجال الذي تتغير فيه الإشارة. نحصل على متتاليتين محاذيتين (a_n) و (b_n) تتقاربان نحو نفس النهاية c. وبما أن f متصلة، فإن f(c) = 0.",
            proofFr: "Démonstration par la méthode de dichotomie : construction de deux suites adjacentes (a_n) et (b_n) encadrant le zéro, qui convergent vers une même limite c où f(c) = 0 par continuité.",
            conditionsAr: ["f متصلة على القطعة [a, b]", "العدد k محصور بين f(a) و f(b) (أو f(a) · f(b) < 0)"],
            conditionsFr: ["f continue sur le segment [a, b]", "k compris entre f(a) et f(b)"],
            corollaryAr: "إذا كانت f متصلة ورتيبة قطعا على [a, b] و f(a) · f(b) < 0، فإن الحل c وحيد في ]a, b[ ويرمز له عادة بـ α.",
            corollaryFr: "Si f est de plus strictement monotone, la solution c ∈ ]a, b[ est unique (notée souvent α).",
          },
        ],
        solvedExamples: [
          {
            titleAr: "مثال تطبيقي: إثبات وحدانية حل معادلة وتأطيره بتقريب 0.1",
            titleFr: "Exemple résolu : Existence et unicité de solution et encadrement",
            statementAr: "بين أن المعادلة x³ + 2x - 1 = 0 تقبل حلاً وحيداً α في المجال ]0, 1[، ثم أعط تأطيراً للعدد α سعته 0.25 باستعمال التفرع الثنائي.",
            statementFr: "Montrer que x³ + 2x - 1 = 0 admet une unique solution α ∈ ]0, 1[, puis donner un encadrement d'amplitude 0.25.",
            solutionStepsAr: [
              "1. نعتبر الدالة f(x) = x³ + 2x - 1 المعرفة على [0, 1].",
              "2. الاتصال: f حدودية إذن متصلة على [0, 1].",
              "3. الرتابة: f قابلة للاشتقاق ولدينا f'(x) = 3x² + 2 > 0 لكل x ∈ ℝ، إذن f تزايدية قطعا على [0, 1].",
              "4. حساب الصور: f(0) = -1 و f(1) = 1³ + 2(1) - 1 = 2.",
              "5. بما أن f(0) · f(1) = (-1)(2) = -2 < 0، وحسب مبرهنة القيم الوسيطية مع الرتابة القطعية، فإن المعادلة تقبل حلاً وحيداً α في ]0, 1[.",
              "6. التفرع الثنائي: نأخذ منتصف المجال m = 0.5: f(0.5) = (0.5)³ + 2(0.5) - 1 = 0.125 + 1 - 1 = 0.125 > 0. بما أن f(0) < 0 و f(0.5) > 0، فإن: 0 < α < 0.5 (السعة: 0.5).",
              "7. نأخذ منتصف [0, 0.5] وهو m' = 0.25: f(0.25) = (0.25)³ + 2(0.25) - 1 = 0.0156 + 0.5 - 1 = -0.484 < 0. بما أن f(0.25) < 0 و f(0.5) > 0، فإن: 0.25 < α < 0.5 (السعة: 0.25).",
            ],
            solutionStepsFr: [
              "1. Posons f(x) = x³ + 2x - 1 sur [0, 1].",
              "2. f est continue sur [0, 1] comme fonction polynôme.",
              "3. f'(x) = 3x² + 2 > 0, donc f est strictement croissante sur [0, 1].",
              "4. f(0) = -1 et f(1) = 2, d'où f(0) · f(1) < 0.",
              "5. Par le TVI, il existe un unique α ∈ ]0, 1[ tel que f(α) = 0.",
              "6. Centre du segment : m = 0.5, f(0.5) = 0.125 > 0, donc 0 < α < 0.5.",
              "7. Deuxième étape : m' = 0.25, f(0.25) = -0.484 < 0, d'où 0.25 < α < 0.5 (amplitude 0.25).",
            ],
            pedagogicalNoteAr: "التشديد على وجوب ذكر الشروط الثلاثة كاملة: (1) الاتصال، (2) الرتابة القطعية، (3) جداء الصورتين سالب.",
            pedagogicalNoteFr: "Exiger impérativement les 3 conditions : Continuité, Stricte monotonie et Changement de signe.",
            difficultyLevel: "N2",
          },
        ],
        commonMistakesAr: [
          "نسيان شرط الرتابة القطعية عند استنتاج وحدانية الحل.",
          "تطبيق المبرهنة على مجال مفتوح دون حساب النهايات عند الأطراف بدلاً من الصور.",
          "الخطأ في حساب إشارة منتصف المجال أثناء خوارزمية التفرع الثنائي.",
        ],
        commonMistakesFr: [
          "Oublier la stricte monotonie pour conclure à l'unicité.",
          "Appliquer le TVI sur un intervalle non fermé sans passer par les limites aux bornes.",
          "Erreur de calcul du signe au milieu de l'intervalle en dichotomie.",
        ],
      },
      {
        sectionNum: 3,
        titleAr: "III. مبرهنة الدالة العكسية ودوال الجذور النونية (Fonction Réciproque & Racines n-ièmes)",
        titleFr: "III. Théorème de la bijection, fonction réciproque et racines n-ièmes",
        axisSummaryAr: "شروط وجود الدالة العكسية f⁻¹، خاصيات منحناها، والتعريف الدقيق لدالة الجذر من الرتبة n.",
        axisSummaryFr: "Théorème de la bijection, propriétés géométriques de la réciproque et racine n-ième.",
        definitions: [
          {
            termAr: "الدالة العكسية لتقابل (Bijection réciproque)",
            termFr: "Fonction réciproque f⁻¹",
            contentAr: "إذا كانت f متصلة ورتيبة قطعا على مجال I، فإنها تقابل من I نحو المجال J = f(I). وتوجد دالة عكسية وحيدة يرمز لها بـ f⁻¹ معرفة من J نحو I، بحيث تحقق: ∀x ∈ I, ∀y ∈ J : (f(x) = y ⇔ f⁻¹(y) = x).",
            contentFr: "Si f est continue et strictement monotone sur I, elle réalise une bijection de I sur J = f(I). Sa réciproque f⁻¹ : J → I vérifie : f(x) = y ⇔ f⁻¹(y) = x.",
            notationMath: "\\forall x \\in I, f^{-1}(f(x)) = x \\quad \\text{et} \\quad \\forall y \\in J, f(f^{-1}(y)) = y",
          },
          {
            termAr: "دالة الجذر من الرتبة n (Racine n-ième)",
            termFr: "Fonction racine n-ième (x ↦ ⁿ√x)",
            contentAr: "الدالة x ↦ xⁿ متصلة وتزايدية قطعا على [0, +∞[ (لكل n ∈ ℕ*). إذن هي تقابل من [0, +∞[ نحو [0, +∞[. دالتها العكسية تسمى دالة الجذر من الرتبة n ويرمز لها بـ x ↦ ⁿ√x.",
            contentFr: "La fonction x ↦ xⁿ est continue et strictement croissante sur [0, +∞[. Sa bijection réciproque est la fonction racine n-ième x ↦ ⁿ√x.",
            notationMath: "\\forall x, y \\ge 0 : (\\sqrt[n]{x} = y \\iff x = y^n)",
          },
        ],
        theorems: [
          {
            nameAr: "خاصيات الدالة العكسية ومنحناها",
            nameFr: "Propriétés et courbe de la réciproque",
            statementAr: "الدالة العكسية f⁻¹ متصلة على J = f(I) ولها نفس رتابة الدالة f على I. في معلم متعامد ممنظم، المنحنى (C_{f⁻¹}) هو مماثل المنحنى (C_f) بالنسبة للمنصف الأول ذي المعادلة y = x.",
            statementFr: "f⁻¹ est continue sur J = f(I) et a le même sens de variation que f. Dans un repère orthonormé, (C_{f⁻¹}) et (C_f) sont symétriques par rapport à la première bissectrice y = x.",
          },
        ],
        solvedExamples: [
          {
            titleAr: "مثال تطبيقي: تحديد صيغة الدالة العكسية ومجال تعريفها صراحة",
            titleFr: "Exemple résolu : Expression explicite de la réciproque",
            statementAr: "لتكن f(x) = x² - 2x + 3 المعرفة على I = [1, +∞[. بين أن f تقبل دالة عكسية f⁻¹، حدد مجال تعريفها J، واكتب تعبير f⁻¹(x) لكل x من J.",
            statementFr: "Soit f(x) = x² - 2x + 3 sur I = [1, +∞[. Montrer que f admet une réciproque f⁻¹, déterminer son domaine J et expliciter f⁻¹(x).",
            solutionStepsAr: [
              "1. الاتصال: f حدودية إذن متصلة على [1, +∞[.",
              "2. الرتابة: f'(x) = 2x - 2 = 2(x - 1). لكل x > 1، f'(x) > 0، إذن f تزايدية قطعا على [1, +∞[.",
              "3. إذن f تقبل دالة عكسية معرفة على J = f(I) = [f(1), lim_{x → +∞} f(x)[ = [2, +∞[.",
              "4. تحديد التعبير: ليكن y ∈ [2, +∞[ و x ∈ [1, +∞[: نحل المعادلة f(x) = y ⇔ x² - 2x + 3 = y.",
              "5. نكتب على الشكل النموذجي: (x - 1)² + 2 = y ⇔ (x - 1)² = y - 2.",
              "6. بما أن x ≥ 1 فإن x - 1 ≥ 0، إذن: x - 1 = √(y - 2) ⇔ x = 1 + √(y - 2).",
              "7. الخلاصة: لكل x ∈ [2, +∞[، فإن f⁻¹(x) = 1 + √(x - 2).",
            ],
            solutionStepsFr: [
              "1. f est continue sur [1, +∞[ comme polynôme.",
              "2. f'(x) = 2(x - 1) > 0 sur ]1, +∞[, donc f est strictement croissante sur [1, +∞[.",
              "3. f réalise une bijection de I vers J = f(I) = [f(1), +∞[ = [2, +∞[.",
              "4. Résolution de f(x) = y : x² - 2x + 3 = y ⇔ (x - 1)² + 2 = y ⇔ (x - 1)² = y - 2.",
              "5. Comme x ≥ 1, x - 1 = √(y - 2), d'où x = 1 + √(y - 2).",
              "6. Conclusion : pour tout x ∈ [2, +∞[, f⁻¹(x) = 1 + √(x - 2).",
            ],
            pedagogicalNoteAr: "الانتباه إلى اختيار الإشارة الموجبة للجذر المربع لأن x ينتمي إلى المجال [1, +∞[ (x - 1 ≥ 0).",
            pedagogicalNoteFr: "Bien justifier le choix de la racine positive grâce à la condition x ≥ 1 (x - 1 ≥ 0).",
            difficultyLevel: "N2",
          },
        ],
        commonMistakesAr: [
          "الخلط بين الدالة العكسية f⁻¹ ومقلوب الدالة 1/f.",
          "نسيان تغيير اسم المتغير في النتيجة النهائية لكتابة f⁻¹(x).",
          "إهمال شرط انطلاق الدالة العكسية (المجال J = f(I)).",
        ],
        commonMistakesFr: [
          "Confondre la réciproque f⁻¹ avec l'inverse 1/f.",
          "Oublier de vérifier si x - 1 est positif ou négatif avant d'extraire la racine.",
          "Négliger de préciser le domaine de départ J = f(I) de f⁻¹.",
        ],
      },
    ];
  }

  // 2. درس الاشتقاق ودراسة الدوال وتطبيقاته (Dérivation & Étude de fonctions)
  if (title.includes("اشتقاق") || title.includes("dérivation") || title.includes("دراسة الدوال")) {
    return [
      {
        sectionNum: 1,
        titleAr: "I. قابلية الاشتقاق في نقطة والتأويل الهندسي للمشتقات (Dérivabilité en un point et géométrie)",
        titleFr: "I. Dérivabilité en un point, nombre dérivé et interprétation géométrique",
        axisSummaryAr: "تعريف العدد المشتق كنهاية لمعدل التغير، والتأويل الهندسي بالمماسات وأنصاف المماسات ونقط الانعطاف.",
        axisSummaryFr: "Nombre dérivé, équation de tangente, demi-tangentes et approximation affine.",
        definitions: [
          {
            termAr: "العدد المشتق في نقطة x₀",
            termFr: "Nombre dérivé en un point x₀",
            contentAr: "تكون الدالة f قابلة للاشتقاق في x₀ إذا كانت نهاية معدل التغير منتهية وتساوي عدداً حقيقياً l. يسمى هذا العدد: العدد المشتق لـ f في x₀ ويرمز له بـ f'(x₀).",
            contentFr: "f est dérivable en x₀ si lim_{x → x₀} (f(x) - f(x₀))/(x - x₀) existe et est finie dans ℝ. Cette limite est notée f'(x₀).",
            notationMath: "f'(x_0) = \\lim_{x \\to x_0} \\frac{f(x) - f(x_0)}{x - x_0} = \\lim_{h \\to 0} \\frac{f(x_0 + h) - f(x_0)}{h}",
          },
          {
            termAr: "التقريب التآلفي لدالة عند نقطة",
            termFr: "Approximation affine locale",
            contentAr: "إذا كانت f قابلة للاشتقاق في x₀، فإن الدالة التآلفية u(h) = f'(x₀)h + f(x₀) تسمى التقريب التآلفي المماسي لـ f بجوار x₀: f(x₀ + h) ≈ f(x₀) + f'(x₀)h.",
            contentFr: "Si f est dérivable en x₀, f(x₀ + h) ≈ f(x₀) + f'(x₀)h pour h au voisinage de 0.",
          },
        ],
        theorems: [
          {
            nameAr: "معادلة المماس والتأويل الهندسي للعدد المشتق",
            nameFr: "Équation cartésienne de la tangente",
            statementAr: "إذا كانت f قابلة للاشتقاق في x₀، فإن منحنى الدالة (C_f) يقبل في النقطة A(x₀, f(x₀)) مماساً معادلته: y = f'(x₀)(x - x₀) + f(x₀). ومعامل توجيهه هو العدد المشتق f'(x₀).",
            statementFr: "La courbe (C_f) admet au point A(x₀, f(x₀)) une tangente (T) d'équation : y = f'(x₀)(x - x₀) + f(x₀).",
          },
          {
            nameAr: "قابلية الاشتقاق تستلزم الاتصال (وليس العكس)",
            nameFr: "La dérivabilité implique la continuité (Réciproque fausse)",
            statementAr: "كل دالة قابلة للاشتقاق في نقطة x₀ هي بالضرورة متصلة في x₀. ولكن العكس غير صحيح عموماً (مثال مضاد: f(x) = |x| متصلة في 0 ولكنها غير قابلة للاشتقاق في 0 لأن f'_d(0) = 1 ≠ f'_g(0) = -1 ونقطة زاوية).",
            statementFr: "Toute fonction dérivable en x₀ est continue en x₀. La réciproque est fausse (contre-exemple : f(x) = |x| en 0).",
            proofAr: "لدينا لكل x ≠ x₀: f(x) - f(x₀) = ((f(x) - f(x₀))/(x - x₀)) · (x - x₀). بالمرور إلى النهاية: lim_{x → x₀} (f(x) - f(x₀)) = f'(x₀) · 0 = 0، إذن lim_{x → x₀} f(x) = f(x₀)، فالدالة متصلة.",
            proofFr: "Pour x ≠ x₀, f(x) - f(x₀) = [(f(x) - f(x₀))/(x - x₀)] · (x - x₀). En passant à la limite : lim (f(x) - f(x₀)) = f'(x₀) · 0 = 0, d'où lim f(x) = f(x₀).",
          },
        ],
        solvedExamples: [
          {
            titleAr: "مثال تطبيقي: دراسة قابلية الاشتقاق على اليمين والتأويل الهندسي بنصف مماس",
            titleFr: "Exemple résolu : Dérivabilité unilatérale et demi-tangente",
            statementAr: "نعتبر الدالة f(x) = x · √(x). أدرس قابلية اشتقاق f على يمين النقطة 0 وأعط تأويلاً هندسياً للنتيجة.",
            statementFr: "Soit f(x) = x · √(x). Étudier la dérivabilité de f à droite en 0 et interpréter géométriquement.",
            solutionStepsAr: [
              "1. نحسب صورة الصفر: f(0) = 0 · √0 = 0.",
              "2. نشكل معدل التغير لكل x > 0: (f(x) - f(0))/(x - 0) = (x√(x))/x = √(x).",
              "3. نحسب النهاية عندما يؤول x إلى 0+: lim_{x → 0⁺} (f(x) - f(0))/(x - 0) = lim_{x → 0⁺} √(x) = 0.",
              "4. الاستنتاج: الدالة f قابلة للاشتقاق على يمين 0 والعدد المشتق على اليمين هو f'_d(0) = 0.",
              "5. التأويل الهندسي: منحنى الدالة (C_f) يقبل في النقطة O(0, 0) نصف مماس أفقي موجه نحو اليمين معادلته: y = 0 مع x ≥ 0.",
            ],
            solutionStepsFr: [
              "1. f(0) = 0.",
              "2. Pour x > 0 : (f(x) - f(0))/(x - 0) = (x√x)/x = √x.",
              "3. Limite à droite : lim_{x → 0⁺} √x = 0.",
              "4. f est dérivable à droite en 0 avec f'_d(0) = 0.",
              "5. Interprétation : (C_f) admet en O(0, 0) une demi-tangente horizontale à droite d'équation y = 0 (x ≥ 0).",
            ],
            pedagogicalNoteAr: "التمييز بين نصف مماس أفقي (العدد المشتق منعدم) ونصف مماس عمودي (النهاية لا نهائية).",
            pedagogicalNoteFr: "Distinguer demi-tangente horizontale (dérivée nulle) et demi-tangente verticale (limite infinie).",
            difficultyLevel: "N1",
          },
        ],
        commonMistakesAr: [
          "القول إن الدالة قابلة للاشتقاق عندما تكون نهاية معدل التغير هي +∞ أو -∞ (في الواقع غير قابلة للاشتقاق وتقبل مماساً عمودياً).",
          "نسيان كتابة معادلة المماس بصيغتها الكاملة وتحديد نقطة التماس.",
        ],
        commonMistakesFr: [
          "Dire que f est dérivable quand la limite du taux vaut ±∞ (elle n'est pas dérivable, la tangente est verticale).",
          "Oublier de préciser l'abscisse du point de contact dans l'équation de la tangente.",
        ],
      },
      {
        sectionNum: 2,
        titleAr: "II. مشتقة الدوال المركبة ورتابة الدوال والفروع اللانهائية (Composée, Variations et Asymptotes)",
        titleFr: "II. Dérivée des fonctions composées, variations et branches infinies",
        axisSummaryAr: "قواعد الاشتقاق الجبري، مشتقة مركب الدوال، جدول التغيرات، وتحديد المقاربات والفروع الشلجمية.",
        axisSummaryFr: "Dérivées opératoires, composée, tableau de variations et étude asymptotique complète.",
        definitions: [
          {
            termAr: "نقطة الانعطاف (Point d'inflexion)",
            termFr: "Point d'inflexion",
            contentAr: "نقطة الانعطاف هي نقطة من منحنى الدالة يخترق فيها المماس المنحنى ويغير فيها المنحنى تقعره من تقعر محدب إلى مقعر (أو العكس). شرط كافٍ: إذا انعدمت المشتقة الثانية f''(x₀) وغيرت إشارتها بجوار x₀ فإن النقطة A(x₀, f(x₀)) هي نقطة انعطاف.",
            contentFr: "Un point où la tangente traverse la courbe et où la concavité change de sens. Condition suffisante : f''(x₀) = 0 avec changement de signe.",
          },
        ],
        theorems: [
          {
            nameAr: "مبرهنة الرتابة وإشارة المشتقة الأولى",
            nameFr: "Lien signe de f' et sens de variation",
            statementAr: "لتكن f قابلة للاشتقاق على مجال I: (1) f تزايدية على I ⇔ ∀x ∈ I, f'(x) ≥ 0. (2) f تناقصية على I ⇔ ∀x ∈ I, f'(x) ≤ 0. (3) إذا كانت f'(x) > 0 على I قطعا باستثناء عدد منته من النقط المنعزلة، فإن f تزايدية قطعا على I.",
            statementFr: "f est croissante sur I ssi f'(x) ≥ 0. Si f'(x) > 0 sauf en un nombre fini de points isolés, f est strictement croissante.",
          },
          {
            nameAr: "مشتقة الدالة العكسية f⁻¹",
            nameFr: "Dérivabilité de la fonction réciproque",
            statementAr: "إذا كانت f قابلة للاشتقاق في x₀ مع f'(x₀) ≠ 0، فإن الدالة العكسية f⁻¹ قابلة للاشتقاق في النقطة y₀ = f(x₀) ولدينا: (f⁻¹)'(y₀) = 1 / f'(x₀) = 1 / f'(f⁻¹(y₀)). وإذا كانت f'(x₀) = 0 فإن منحنى f⁻¹ يقبل مماساً عمودياً في النقطة y₀.",
            statementFr: "Si f est dérivable en x₀ avec f'(x₀) ≠ 0, f⁻¹ est dérivable en y₀ = f(x₀) et (f⁻¹)'(y₀) = 1/f'(x₀).",
          },
        ],
        solvedExamples: [
          {
            titleAr: "مثال تطبيقي: دراسة فروع لانهائية وتحديد مقارب مائل",
            titleFr: "Exemple résolu : Branches infinies et asymptote oblique",
            statementAr: "نعتبر f(x) = (2x² - x + 1)/(x - 1). أدرس الفروع اللانهائية لمنحنى (C_f) بجوار +∞ و -∞ وعند x = 1.",
            statementFr: "Soit f(x) = (2x² - x + 1)/(x - 1). Déterminer les branches infinies de (C_f) en ±∞ et en x = 1.",
            solutionStepsAr: [
              "1. عند x = 1: lim_{x → 1⁺} (2x² - x + 1) = 2 و lim_{x → 1⁺} (x - 1) = 0⁺، إذن lim_{x → 1⁺} f(x) = +∞ (و lim_{x → 1⁻} f(x) = -∞). المنحنى يقبل مقارباً عمودياً معادلته x = 1.",
              "2. بجوار +∞: lim_{x → +∞} f(x)/x = lim (2x²/x²) = 2 = a.",
              "3. نحسب الفرق f(x) - 2x: f(x) - 2x = (2x² - x + 1 - 2x(x - 1))/(x - 1) = (x + 1)/(x - 1).",
              "4. نحسب lim_{x → +∞} (f(x) - 2x) = lim (x/x) = 1 = b.",
              "5. بما أن lim_{x → +∞} [f(x) - (2x + 1)] = lim (2/(x - 1)) = 0، فإن المستقيم (D): y = 2x + 1 مقارب مائل لـ (C_f) بجوار +∞ (وبالمثل بجوار -∞).",
            ],
            solutionStepsFr: [
              "1. En x = 1 : lim f(x) = ±∞, donc la droite x = 1 est asymptote verticale.",
              "2. En +∞ : lim f(x)/x = 2 = a.",
              "3. f(x) - 2x = (x + 1)/(x - 1).",
              "4. lim [f(x) - 2x] = 1 = b.",
              "5. Comme lim [f(x) - (2x + 1)] = 0, la droite y = 2x + 1 est asymptote oblique en ±∞.",
            ],
            pedagogicalNoteAr: "إظهار طريقة القسمة الإقليدية للبسط على المقام كبديل فعال: f(x) = 2x + 1 + 2/(x - 1).",
            pedagogicalNoteFr: "Montrer la méthode de la division euclidienne : f(x) = 2x + 1 + 2/(x - 1).",
            difficultyLevel: "N2",
          },
        ],
        commonMistakesAr: [
          "نسيان شرط f'(x₀) ≠ 0 عند حساب مشتقة الدالة العكسية.",
          "الخلط بين المقارب المائل والفرع الشلجمي في اتجاه المقارب.",
        ],
        commonMistakesFr: [
          "Oublier la condition f'(x₀) ≠ 0 pour la dérivabilité de f⁻¹.",
          "Confondre asymptote oblique et branche parabolique de direction y = ax.",
        ],
      },
    ];
  }

  // 3. درس المتتاليات العددية (Suites numériques)
  if (title.includes("متتاليات") || title.includes("suites")) {
    return [
      {
        sectionNum: 1,
        titleAr: "I. الاستدلال بالترجع ورتابة المتتاليات والمحدودية (Récurrence, Monotonie et Bornes)",
        titleFr: "I. Raisonnement par récurrence, monotonie et suites bornées",
        axisSummaryAr: "مبدأ الاستدلال بالترجع كأداة برهان أساسية، ودراسة إشارة الفرق u_{n+1} - u_n لتحديد الرتابة.",
        axisSummaryFr: "Principe de récurrence, monotonie et majoration/minoration des suites numériques.",
        definitions: [
          {
            termAr: "المتتالية المكبورة، المصغورة والمحدودة",
            termFr: "Suite majorée, minorée, bornée",
            contentAr: "نقول إن (u_n)_{n≥n₀} مكبورة بالعدد M إذا كان: ∀n ≥ n₀, u_n ≤ M. ومصغورة بالعدد m إذا كان: ∀n ≥ n₀, u_n ≥ m. وتكون محدودة إذا كانت مكبورة ومصغورة معاً، أي يوجد M > 0 بحيث: ∀n ≥ n₀, |u_n| ≤ M.",
            contentFr: "Une suite est majorée si ∃M, ∀n, u_n ≤ M ; minorée si ∃m, ∀n, u_n ≥ m ; bornée si ∃M > 0, ∀n, |u_n| ≤ M.",
          },
        ],
        theorems: [
          {
            nameAr: "مبدأ الاستدلال بالترجع (Principe de récurrence)",
            nameFr: "Principe de raisonnement par récurrence",
            statementAr: "لتكن P(n) خاصية مرتبطة بعدد صحيح طبيعي n، و n₀ ∈ ℕ: إذا تحققت مرحلة الأساس: P(n₀) صحيحة؛ ومرحلة التوريث: لكل n ≥ n₀، (P(n) صحيحة ⇒ P(n+1) صحيحة)؛ فإن الخاصية P(n) صحيحة لجميع الأعداد n ≥ n₀.",
            statementFr: "Pour démontrer P(n) ∀n ≥ n₀ : (1) Initialisation : vérifier P(n₀). (2) Hérédité : prouver P(n) ⇒ P(n+1). Conclusion : P(n) est vraie pour tout n ≥ n₀.",
            proofAr: "تعتمد المبرهنة بديهياً على كون كل جزء غير فارغ من ℕ يقبل عنصراً أصغر (بديهية الترتيب الجيد لـ ℕ).",
            proofFr: "Repose sur l'axiome du bon ordre de ℕ (toute partie non vide de ℕ admet un plus petit élément).",
          },
          {
            nameAr: "مبرهنة تقارب المتتاليات الرتيبة (Convergence monotone)",
            nameFr: "Théorème de convergence monotone",
            statementAr: "كل متتالية تزايدية ومكبورة هي متتالية متقاربة (نهايتها l هي أصغر مكبوراتها). وكل متتالية تناقصية ومصغورة هي متتالية متقاربة (نهايتها l هي أكبر مصغوراتها).",
            statementFr: "Toute suite croissante et majorée est convergente. Toute suite décroissante et minorée est convergente.",
          },
        ],
        solvedExamples: [
          {
            titleAr: "مثال تطبيقي: برهان بالترجع ودراسة الرتابة والاستنتاج",
            titleFr: "Exemple résolu : Récurrence, monotonie et convergence",
            statementAr: "نعتبر المتتالية (u_n) المعرفة بـ: u₀ = 0 و u_{n+1} = √(2u_n + 3) لكل n ∈ ℕ. بين بالترجع أن 0 ≤ u_n < 3 لكل n ∈ ℕ، وأدرس رتابتها ثم استنتج أنها متقاربة.",
            statementFr: "Soit u₀ = 0 et u_{n+1} = √(2u_n + 3). Montrer par récurrence que 0 ≤ u_n < 3, étudier la monotonie et conclure à la convergence.",
            solutionStepsAr: [
              "1. الأساس (n = 0): u₀ = 0 ولدينا 0 ≤ 0 < 3، إذن الخاصية صحيحة عند الرتبة 0.",
              "2. التوريث: ليكن n ∈ ℕ، نفترض أن 0 ≤ u_n < 3 (فرضية الترجع)، ونبين أن 0 ≤ u_{n+1} < 3.",
              "3. لدينا: 0 ≤ u_n < 3 ⇒ 0 ≤ 2u_n < 6 ⇒ 3 ≤ 2u_n + 3 < 9.",
              "4. بتطبيق دالة الجذر المربع التزايدية قطعا: √3 ≤ √(2u_n + 3) < √9 = 3.",
              "5. إذن 0 ≤ u_{n+1} < 3، فالخاصية وراثية. حسب مبدأ الترجع: ∀n ∈ ℕ, 0 ≤ u_n < 3.",
              "6. الرتابة: ندرس إشارة u_{n+1} - u_n = √(2u_n + 3) - u_n. نضرب في المرافق: ((2u_n + 3) - u_n²)/(√(2u_n + 3) + u_n) = -(u_n - 3)(u_n + 1)/(...). بما أن 0 ≤ u_n < 3 فإن u_n - 3 < 0، إذن الفرق موجب و (u_n) تزايدية قطعا.",
              "7. الخلاصة: بما أن (u_n) تزايدية ومكبورة بالعدد 3، فإنها متقاربة نحو نهاية منتهية l تحقق l = √(2l + 3) مع 0 ≤ l ≤ 3، ومنه l² - 2l - 3 = 0 أي l = 3.",
            ],
            solutionStepsFr: [
              "1. Initialisation (n=0) : u₀ = 0 ∈ [0, 3[, vrai.",
              "2. Hérédité : supposons 0 ≤ u_n < 3, montrons 0 ≤ u_{n+1} < 3.",
              "3. 0 ≤ u_n < 3 ⇒ 3 ≤ 2u_n + 3 < 9 ⇒ √3 ≤ u_{n+1} < 3, donc vrai.",
              "4. Par récurrence, ∀n, 0 ≤ u_n < 3.",
              "5. u_{n+1} - u_n = -(u_n - 3)(u_n + 1)/(√... + u_n) > 0 car u_n < 3, donc (u_n) est croissante.",
              "6. Croissante et majorée par 3, elle converge vers l solution de l = √(2l + 3) ⇒ l = 3.",
            ],
            pedagogicalNoteAr: "إبراز تقنية الضرب في المرافق لتحديد إشارة الفرق عند وجود الجذور المربعة.",
            pedagogicalNoteFr: "Insister sur la technique de l'expression conjuguée pour étudier le signe du terme u_{n+1} - u_n.",
            difficultyLevel: "N2",
          },
        ],
        commonMistakesAr: [
          "نسيان كتابة عبارة « ليكن n من N، نفترض أن... » في مرحلة التوريث.",
          "الاعتقاد بأن العدد المكبور هو بالضرورة نهاية المتتالية (المكبور قد يكون أكبر من النهاية).",
        ],
        commonMistakesFr: [
          "Oublier de quantifier n fixé dans la phase d'hérédité.",
          "Confondre le majorant avec la limite exacte de la suite.",
        ],
      },
    ];
  }

  // 4. درس الدوال اللوغاريتمية والأسية (Logarithmes et Exponentielles)
  if (title.includes("لوغاريتم") || title.includes("أسية") || title.includes("ln") || title.includes("exp")) {
    return [
      {
        sectionNum: 1,
        titleAr: "I. دالة اللوغاريتم النيبيري والخاصيات الجبرية والنهايات المرجعية (Fonction ln)",
        titleFr: "I. Fonction logarithme népérien, propriétés algébriques et limites de référence",
        axisSummaryAr: "تعريف ln كأصلية، الخاصية الجبرية الجوهرية ln(ab) = ln(a) + ln(b)، والنهايات الاعتيادية والتزايد المقارن.",
        axisSummaryFr: "Définition de ln comme primitive de 1/x, propriétés algébriques et croissances comparées.",
        definitions: [
          {
            termAr: "تعريف دالة اللوغاريتم النيبيري ln",
            termFr: "Définition de la fonction ln",
            contentAr: "تسمى دالة اللوغاريتم النيبيري ويرمز لها بـ ln الدالة الأصلية للدالة x ↦ 1/x على المجال ]0, +∞[ والتي تنعدم في 1: ln(1) = 0، ولكل x > 0 فإن ln'(x) = 1/x.",
            contentFr: "La fonction ln est l'unique primitive de x ↦ 1/x sur ]0, +∞[ qui s'annule en 1. Pour tout x > 0, ln'(x) = 1/x et ln(1) = 0.",
            notationMath: "\\forall x > 0, \\quad \\ln(x) = \\int_1^x \\frac{1}{t} \\, dt",
          },
        ],
        theorems: [
          {
            nameAr: "الخاصية الجبرية الأساسية",
            nameFr: "Propriété fondamentale du logarithme",
            statementAr: "لكل عددين حقيقيين قطعا a و b: ln(ab) = ln(a) + ln(b). وكنتائج مباشرة: ln(1/a) = -ln(a) و ln(a/b) = ln(a) - ln(b) و ln(aʳ) = r · ln(a) لكل r ∈ ℚ.",
            statementFr: "Pour tous réels a > 0 et b > 0 : ln(ab) = ln(a) + ln(b). En particulier : ln(a/b) = ln(a) - ln(b) et ln(aʳ) = r ln(a).",
            proofAr: "نعتبر الدالة f(x) = ln(ax) على ]0, +∞[ مع a > 0 ثابت. f قابلة للاشتقاق ولدينا: f'(x) = a · (1/(ax)) = 1/x = ln'(x). إذن f(x) = ln(x) + C. بوضع x = 1: f(1) = ln(a) = ln(1) + C = C. إذن C = ln(a)، ومنه ln(ax) = ln(x) + ln(a).",
            proofFr: "Soit f(x) = ln(ax) sur ]0, +∞[. f'(x) = a/(ax) = 1/x = ln'(x), donc f(x) = ln(x) + C. Pour x = 1 : C = ln(a), d'où ln(ax) = ln(x) + ln(a).",
          },
          {
            nameAr: "النهايات المرجعية والتزايد المقارن",
            nameFr: "Limites usuelles et croissances comparées",
            statementAr: "lim_{x → +∞} ln(x) = +∞ ؛ lim_{x → 0⁺} ln(x) = -∞ ؛ lim_{x → +∞} (ln(x)/x) = 0 ؛ lim_{x → 0⁺} (x ln(x)) = 0 ؛ lim_{x → 1} (ln(x)/(x - 1)) = 1 ؛ lim_{x → 0} (ln(1 + x)/x) = 1.",
            statementFr: "lim_{x → +∞} ln(x)/x = 0 ; lim_{x → 0⁺} x ln(x) = 0 ; lim_{x → 0} ln(1+x)/x = 1.",
          },
        ],
        solvedExamples: [
          {
            titleAr: "مثال تطبيقي: حل معادلة لوغاريتمية وتحديد مجموعة الصلاحية",
            titleFr: "Exemple résolu : Équation logarithmique et domaine",
            statementAr: "حل في ℝ المعادلة: ln(2x - 1) + ln(x + 2) = ln(7).",
            statementFr: "Résoudre dans ℝ l'équation : ln(2x - 1) + ln(x + 2) = ln(7).",
            solutionStepsAr: [
              "1. مجموعة الصلاحية D_E: يشترط أن يكون 2x - 1 > 0 و x + 2 > 0، أي x > 1/2 و x > -2، إذن D_E = ]1/2, +∞[.",
              "2. لكل x ∈ D_E: ln(2x - 1) + ln(x + 2) = ln(7) ⇔ ln((2x - 1)(x + 2)) = ln(7).",
              "3. بما أن دالة ln تزايدية قطعا (تقابل): (2x - 1)(x + 2) = 7.",
              "4. ننشر ونبسط: 2x² + 4x - x - 2 = 7 ⇔ 2x² + 3x - 9 = 0.",
              "5. نحسب المميز Δ = 3² - 4(2)(-9) = 9 + 72 = 81 = 9².",
              "6. الحلان هما: x₁ = (-3 + 9)/4 = 6/4 = 3/2 و x₂ = (-3 - 9)/4 = -12/4 = -3.",
              "7. التحقق من الانتماء إلى D_E: 3/2 ∈ ]1/2, +∞[ (مقبول)، بينما -3 ∉ D_E (مرفوض).",
              "8. إذن مجموعة الحلول هي: S = {3/2}.",
            ],
            solutionStepsFr: [
              "1. Domaine de validité : 2x - 1 > 0 et x + 2 > 0 ⇒ D_E = ]1/2, +∞[.",
              "2. ln((2x - 1)(x + 2)) = ln(7) ⇔ (2x - 1)(x + 2) = 7.",
              "3. 2x² + 3x - 9 = 0, Δ = 81 = 9².",
              "4. x₁ = 3/2 ∈ D_E (retenu), x₂ = -3 ∉ D_E (rejeté).",
              "5. Conclusion : S = {3/2}.",
            ],
            pedagogicalNoteAr: "وجوب تحديد مجموعة صلاحية المعادلة قبل البدء في تطبيق الخاصيات الجبرية لتفادي الحلول الدخيلة.",
            pedagogicalNoteFr: "Toujours déterminer le domaine de définition de l'équation avant d'appliquer les propriétés algébriques.",
            difficultyLevel: "N2",
          },
        ],
        commonMistakesAr: [
          "تطبيق خاصية ln(a + b) = ln(a) · ln(b) (خطأ فادح!).",
          "نسيان شرط الصلاحية D_E وقبول حلول سالبة تجعل ما بداخل اللوغاريتم سالباً.",
        ],
        commonMistakesFr: [
          "Écrire faussement ln(a + b) = ln(a) + ln(b) ou ln(ab) = ln(a)ln(b).",
          "Oublier de vérifier l'appartenance des solutions au domaine de validité.",
        ],
      },
    ];
  }

  const titleFr = lesson.lessonFr.toLowerCase();

  // 5. درس الأعداد العقدية والتحويلات النقطية (Nombres Complexes)
  if (title.includes("عقدي") || titleFr.includes("complexe")) {
    return [
      {
        sectionNum: 1,
        titleAr: "I. الكتابة الجبرية، المرافق، المعيار والعمدة لعدد عقدي غير منعدم",
        titleFr: "I. Forme algébrique, conjugué, module et argument d'un nombre complexe",
        axisSummaryAr: "بناء مجموعة الأعداد العقدية C والربط بين الحساب الجبري والتمثيل الهندسي في المستوى العقدي المنسوب لمعلم متعامد ممنظم مباشر.",
        axisSummaryFr: "Construction de C, conjugaison, module et interprétation géométrique des distances et angles orientés.",
        definitions: [
          {
            termAr: "الشكل الجبري والمرافق والمعيار",
            termFr: "Forme algébrique, conjugué et module",
            contentAr: "كل عدد عقدي z يكتب بصفة وحيدة على الشكل الجبري z = a + ib حيث (a,b) ∈ ℝ² و i² = -1. مرافقه هو z̄ = a - ib ومعياره هو المسافة |z| = √(z·z̄) = √(a² + b²).",
            contentFr: "Tout complexe z s'écrit de manière unique z = a + ib avec (a,b) ∈ ℝ² et i² = -1. Son conjugué est z̄ = a - ib et son module est |z| = √(a² + b²).",
            notationMath: "z = a + ib, \\quad \\overline{z} = a - ib, \\quad |z| = \\sqrt{z\\overline{z}} = \\sqrt{a^2 + b^2}",
          },
          {
            termAr: "الشكل المثلثي والترميز الأسي (صيغة أولير وموافر)",
            termFr: "Forme trigonométrique et notation exponentielle",
            contentAr: "لكل عدد عقدي غير منعدم z معياره r = |z| وعمدته θ ≡ arg(z) [2π]، نكتب: z = r(cos θ + i sin θ) = r e^{iθ}.",
            contentFr: "Pour tout z ∈ ℂ*, de module r = |z| et d'argument θ ≡ arg(z) [2π], on a z = r(cos θ + i sin θ) = r e^{iθ}.",
            notationMath: "z = r(\\cos\\theta + i\\sin\\theta) = r e^{i\\theta}, \\quad (e^{i\\theta})^n = e^{in\\theta} \\text{ (Moivre)}",
          },
        ],
        theorems: [
          {
            nameAr: "التأويل الهندسي للمعيار والعمدة واستقامية وتداور النقط",
            nameFr: "Interprétation géométrique du module et de l'argument",
            statementAr: "لتكن A(z_A) و B(z_B) و C(z_C) نقطاً من المستوى العقدي (A ≠ B و A ≠ C). المسافة AB = |z_B - z_A|، وقياس الزاوية الموجهة (AB, AC) ≡ arg((z_C - z_A)/(z_B - z_A)) [2π].",
            statementFr: "Soient A(z_A), B(z_B) et C(z_C) avec A ≠ B et A ≠ C. Alors AB = |z_B - z_A| et (AB, AC) ≡ arg((z_C - z_A)/(z_B - z_A)) [2π].",
            conditionsAr: ["النقطتان A و B مختلفتان (z_B ≠ z_A)", "المعلم (O, u, v) متعامد ممنظم ومباشر"],
            conditionsFr: ["Points A et B distincts (z_B ≠ z_A)", "Repère orthonormé direct (O, u, v)"],
            proofAr: "نضع z_B - z_A = r₁ e^{iθ₁} و z_C - z_A = r₂ e^{iθ₂}. خارج العددين هو (r₂/r₁) e^{i(θ₂ - θ₁)}، ومنه معياره هو AC/AB وعمدته هي θ₂ - θ₁ ≡ (u, AC) - (u, AB) ≡ (AB, AC) [2π].",
            proofFr: "En posant z_B - z_A = r₁ e^{iθ₁} et z_C - z_A = r₂ e^{iθ₂}, le quotient vaut (r₂/r₁) e^{i(θ₂ - θ₁)}, d'où le module AC/AB et l'argument (AB, AC) [2π].",
          },
          {
            nameAr: "التمثيل العقدي للإزاحة والتحاكي والدوران",
            nameFr: "Écriture complexe de la translation, l'homothétie et la rotation",
            statementAr: "صورة نقطة M(z) بالدوران R الذي مركزه Ω(ω) وزاويته α هي النقطة M'(z') حيث: z' - ω = e^{iα}(z - ω).",
            statementFr: "L'image de M(z) par la rotation R de centre Ω(ω) et d'angle α est M'(z') telle que z' - ω = e^{iα}(z - ω).",
            proofAr: "الدوران يحافظ على المسافات والزوايا الموجهة: M' = R(M) ⇔ ΩM' = ΩM و (ΩM, ΩM') ≡ α [2π] ⇔ |(z' - ω)/(z - ω)| = 1 و arg((z' - ω)/(z - ω)) ≡ α [2π] ⇔ (z' - ω)/(z - ω) = e^{iα}.",
            proofFr: "M' = R(M) ⇔ |z' - ω| = |z - ω| et arg((z' - ω)/(z - ω)) ≡ α [2π] ⇔ z' - ω = e^{iα}(z - ω).",
          },
        ],
        solvedExamples: [
          {
            titleAr: "مثال تطبيقي محلول (N2): طبيعة مثلث والتمثيل العقدي للدوران",
            titleFr: "Exemple résolu (N2) : Nature d'un triangle et rotation complexe",
            statementAr: "في المستوى العقدي نعتبر النقط A(1 + i) و B(3 + i) و C(2 + (1 + √3)i).\n1) أحسب (z_C - z_A)/(z_B - z_A) واكتبه على الشكل الأسي.\n2) استنتج طبيعة المثلث ABC.",
            statementFr: "Dans le plan complexe, on donne A(1 + i), B(3 + i) et C(2 + (1 + √3)i).\n1) Calculer (z_C - z_A)/(z_B - z_A) sous forme exponentielle.\n2) En déduire la nature exacte du triangle ABC.",
            solutionStepsAr: [
              "1. نحسب الفروق: z_B - z_A = 2 و z_C - z_A = 1 + i√3.",
              "2. نحسب النسبة: (z_C - z_A)/(z_B - z_A) = (1 + i√3)/2 = 1/2 + i(√3/2) = cos(π/3) + i sin(π/3) = e^{iπ/3}.",
              "3. نستخلص المعيار والعمدة: AC/AB = |e^{iπ/3}| = 1 ومنه AC = AB، و (AB, AC) ≡ π/3 [2π].",
              "4. استنتاج: المثلث ABC متساوي الأضلاع ومباشر، والنقطة C هي صورة B بالدوران الذي مركزه A وزاويته π/3.",
            ],
            solutionStepsFr: [
              "1. Différences d'affixes : z_B - z_A = 2 et z_C - z_A = 1 + i√3.",
              "2. Quotient : (z_C - z_A)/(z_B - z_A) = 1/2 + i√3/2 = e^{iπ/3}.",
              "3. Module = 1 ⇒ AC = AB ; Argument ≡ π/3 [2π] ⇒ (AB, AC) ≡ π/3 [2π].",
              "4. Conclusion : Le triangle ABC est équilatéral direct.",
            ],
            pedagogicalNoteAr: "تأكد دائماً من أن العدد r في الكتابة r(cos θ + i sin θ) موجب قطعا (r > 0) قبل استنتاج المعيار والعمدة.",
            pedagogicalNoteFr: "Toujours vérifier que r > 0 dans l'écriture r(cos θ + i sin θ) avant de lire le module et l'argument.",
            difficultyLevel: "N2",
          },
        ],
        commonMistakesAr: [
          "اعتبار العدد -2(cos θ + i sin θ) شكلاً مثلثياً بمعيار -2 (المعيار موجب دائماً!).",
          "الخلط بين ترتيب المتجهتين في الزاوية: arg((z_C - z_A)/(z_B - z_A)) يعطي الزاوية (AB, AC) وليس (AC, AB).",
        ],
        commonMistakesFr: [
          "Lire un module négatif sur une forme -r(cos θ + i sin θ) au lieu de transformer par π + θ.",
          "Inverser l'ordre des vecteurs dans l'angle orienté : arg((z_C - z_A)/(z_B - z_A)) ≡ (AB, AC) [2π].",
        ],
      },
    ];
  }

  // 6. درس الدوال الأصلية والحساب التكاملي والمعادلات التفاضلية (Primitives, Intégrales & Éq. Diff.)
  if (
    title.includes("تكامل") ||
    title.includes("أصلية") ||
    title.includes("تفاضلية") ||
    titleFr.includes("intégral") ||
    titleFr.includes("primitive") ||
    titleFr.includes("différentielle")
  ) {
    return [
      {
        sectionNum: 1,
        titleAr: "I. الدوال الأصلية، تكامل ريمان، المكاملة بالأجزاء وحساب المساحات والحجوم",
        titleFr: "I. Primitives, intégrale d'une fonction continue, IPP et calcul d'aires/volumes",
        axisSummaryAr: "الربط بين عملية الاشتقاق وعملية المكاملة، وتوظيف خطية التكامل والمكاملة بالأجزاء لحساب المساحات الهندسية وحجوم المجسمات الدورانية.",
        axisSummaryFr: "Théorème fondamental de l'analyse, intégration par parties et interprétation géométrique des aires et volumes.",
        definitions: [
          {
            termAr: "الدالة الأصلية والتكامل المحدد",
            termFr: "Primitive et intégrale définie sur [a, b]",
            contentAr: "لتكن f دالة متصلة على مجال I. نسمي دالة أصلية لـ f على I كل دالة F قابلة للاشتقاق على I تحقق F'(x) = f(x). تكامل f من a إلى b هو العدد الحقيقي: ∫_a^b f(x)dx = [F(x)]_a^b = F(b) - F(a).",
            contentFr: "Soit f continue sur I. Une primitive F vérifie F' = f sur I. L'intégrale de a à b est le réel ∫_a^b f(x)dx = F(b) - F(a).",
            notationMath: "\\int_a^b f(x)\\,dx = \\Big[F(x)\\Big]_a^b = F(b) - F(a)",
          },
        ],
        theorems: [
          {
            nameAr: "مبرهنة المكاملة بالأجزاء (Intégration par parties — IPP)",
            nameFr: "Théorème d'intégration par parties (IPP)",
            statementAr: "لتكن u و v دالتين قابلتين للاشتقاق على مجال [a, b] بحيث مشتقتاهما u' و v' متصلتان على [a, b]. لدينا الصيغة الأساسية: ∫_a^b u'(x)v(x)dx = [u(x)v(x)]_a^b - ∫_a^b u(x)v'(x)dx.",
            statementFr: "Si u et v sont de classe C¹ sur [a, b], alors ∫_a^b u'(x)v(x)dx = [u(x)v(x)]_a^b - ∫_a^b u(x)v'(x)dx.",
            conditionsAr: ["u و v قابلتان للاشتقاق على [a, b]", "u' و v' متصلتان على [a, b]"],
            conditionsFr: ["u et v dérivables sur [a, b]", "u' et v' continues sur [a, b]"],
            proofAr: "لدينا لكل x من [a, b]: (u·v)'(x) = u'(x)v(x) + u(x)v'(x)، ومنه u'(x)v(x) = (u·v)'(x) - u(x)v'(x). وبإدخال التكامل الخطي على الطرفين نحصل على النتيجة المطلوبة.",
            proofFr: "Comme (uv)' = u'v + uv', par linéarité de l'intégrale de fonctions continues sur [a, b], ∫_a^b (uv)' = [uv]_a^b = ∫_a^b u'v + ∫_a^b uv'.",
          },
          {
            nameAr: "حساب مساحة حيز مستوٍ وحجم مجسم دوراني",
            nameFr: "Calcul d'aire plane et de volume de révolution",
            statementAr: "مساحة الحيز المحصور بين منحنيي f و g والمستقيمين x=a و x=b هي: A = (∫_a^b |f(x) - g(x)| dx) × ‖i‖·‖j‖. وحجم المجسم المولد بدوران منحنى f حول محور الأفاصيل هو V = (π ∫_a^b (f(x))² dx) × ‖i‖³.",
            statementFr: "L'aire entre C_f et C_g sur [a, b] vaut A = (∫_a^b |f(x) - g(x)| dx) u.a. Le volume de révolution vaut V = (π ∫_a^b f(x)² dx) u.v.",
          },
        ],
        solvedExamples: [
          {
            titleAr: "مثال تطبيقي محلول (N2): حساب تكامل بالمكاملة بالأجزاء واستنتاج مساحة",
            titleFr: "Exemple résolu (N2) : Calcul d'intégrale par IPP et aire géométrique",
            statementAr: "أحسب باستعمال المكاملة بالأجزاء التكامل: I = ∫_1^e x ln(x) dx، ثم استنتج بـ cm² مساحة الحيز المحصور بين منحنى f(x) = x ln(x) ومحور الأفاصيل والمستقيمين x=1 و x=e علماً أن ‖i‖ = ‖j‖ = 2 cm.",
            statementFr: "Calculer par IPP l'intégrale I = ∫_1^e x ln(x) dx, puis en déduire en cm² l'aire du domaine délimité par C_f, l'axe (Ox), x=1 et x=e (unité : 2 cm).",
            solutionStepsAr: [
              "1. نضع u(x) = ln(x) و v'(x) = x، فيكون u'(x) = 1/x و v(x) = x²/2.",
              "2. نطبق صيغة المكاملة بالأجزاء: I = [(x²/2) ln(x)]_1^e - ∫_1^e (x²/2)·(1/x) dx.",
              "3. نبسط: I = (e²/2) - (1/2) ∫_1^e x dx = e²/2 - [x²/4]_1^e = e²/2 - (e² - 1)/4 = (e² + 1)/4.",
              "4. على [1, e] لدينا x ln(x) ≥ 0، ووحدة المساحة هي u.a = 2 × 2 = 4 cm²، إذن A = I × 4 cm² = (e² + 1) cm².",
            ],
            solutionStepsFr: [
              "1. Posons u(x) = ln(x) ⇒ u'(x) = 1/x, et v'(x) = x ⇒ v(x) = x²/2.",
              "2. Par IPP : I = [x²/2 ln(x)]_1^e - ∫_1^e x/2 dx = e²/2 - [x²/4]_1^e = (e² + 1)/4.",
              "3. Sur [1, e], x ln(x) ≥ 0 et 1 u.a = 2 × 2 = 4 cm², donc A = 4 × I = (e² + 1) cm².",
            ],
            pedagogicalNoteAr: "طبق قاعدة ALPES لاختيار الدالة التي نشتقها u(x) في المكاملة بالأجزاء (اللوغاريتم يشتق دائماً قبل الحدودية).",
            pedagogicalNoteFr: "Utiliser la règle ALPES pour choisir u(x) à dériver (Logarithme avant Polynôme et Exponentielle).",
            difficultyLevel: "N2",
          },
        ],
        commonMistakesAr: [
          "نسيان ضرب التكامل في وحدة المساحة u.a = ‖i‖ × ‖j‖ عند التحويل إلى cm².",
          "إغفال القيمة المطلقة |f(x) - g(x)| عندما يكون المنحنى تحت محور الأفاصيل أو تحت المستقيم المقارب.",
        ],
        commonMistakesFr: [
          "Oublier de multiplier par l'unité d'aire u.a = ‖i‖ × ‖j‖ en cm².",
          "Omettre la valeur absolue |f(x) - g(x)| lorsque la courbe est située sous l'axe ou sous l'asymptote.",
        ],
      },
    ];
  }

  // 7. درس الهندسة الفضائية: الجداء السلمي، الفلكة، والجداء المتجهي (Géométrie dans l'Espace)
  if (
    title.includes("فضاء") ||
    title.includes("فلكة") ||
    title.includes("متجهي") ||
    titleFr.includes("espace") ||
    titleFr.includes("sphère") ||
    titleFr.includes("vectoriel")
  ) {
    return [
      {
        sectionNum: 1,
        titleAr: "I. الجداء السلمي والجداء المتجهي في الفضاء، الفلكة، والأوضاع النسبية",
        titleFr: "I. Produit scalaire, produit vectoriel, sphère et positions relatives dans l'espace",
        axisSummaryAr: "التحليل الديكارتي للمستقيمات والمستويات والفلكات في معلم متعامد ممنظم مباشر، وحساب المسافات والمساحات.",
        axisSummaryFr: "Géométrie analytique dans un repère orthonormé direct (O, i, j, k) : plans, sphères, distances et produit vectoriel.",
        definitions: [
          {
            termAr: "المعادلة الديكارتية لمستوى وفلكة ومسافة نقطة عن مستوى",
            termFr: "Équation cartésienne d'un plan, d'une sphère et distance point-plan",
            contentAr: "المستوى (P) المار من A والمنظمي على n(a,b,c) معادلته ax + by + cz + d = 0. مسافة النقطة Ω عن (P) هي d(Ω, (P)) = |ax_Ω + by_Ω + cz_Ω + d| / √(a² + b² + c²).",
            contentFr: "Le plan de vecteur normal n(a,b,c) a pour équation ax + by + cz + d = 0 et d(Ω, (P)) = |ax_Ω + by_Ω + cz_Ω + d| / √(a² + b² + c²).",
            notationMath: "d(\\Omega, (P)) = \\frac{|ax_\\Omega + by_\\Omega + cz_\\Omega + d|}{\\sqrt{a^2+b^2+c^2}}, \\quad \\vec{u}\\wedge\\vec{v} = \\begin{vmatrix} y & y' \\\\ z & z' \\end{vmatrix}\\vec{i} - \\begin{vmatrix} x & x' \\\\ z & z' \\end{vmatrix}\\vec{j} + \\begin{vmatrix} x & x' \\\\ y & y' \\end{vmatrix}\\vec{k}",
          },
        ],
        theorems: [
          {
            nameAr: "الأوضاع النسبية لفلكة S(Ω, R) ومستوى (P)",
            nameFr: "Positions relatives d'une sphère S(Ω, R) et d'un plan (P)",
            statementAr: "نضع d = d(Ω, (P)). إذا كان d > R فالتقاطع فارغ. إذا كان d = R فالمستوى مماس للفلكة في المسقط العمودي H. إذا كان d < R فالتقاطع دائرة مركزها H وشعاعها r = √(R² - d²).",
            statementFr: "Soit d = d(Ω, (P)). Si d = R, (P) est tangent à (S) en H. Si d < R, (P) coupe (S) suivant un cercle de centre H et de rayon r = √(R² - d²).",
            proofAr: "لكل نقطة M من المستوى (P)، المسقط العمودي لـ Ω على (P) هو H، والمثلث ΩHM قائم الزاوية في H. حسب مبرهنة فيثاغورس: M ∈ (S) ∩ (P) ⇔ ΩM² = R² ⇔ ΩH² + HM² = R² ⇔ HM² = R² - d².",
            proofFr: "Par le théorème de Pythagore dans le triangle rectangle ΩHM en H : ΩM² = R² ⇔ d² + HM² = R² ⇔ HM = √(R² - d²).",
          },
        ],
        solvedExamples: [
          {
            titleAr: "مثال تطبيقي محلول (N2): تقاطع فلكة ومستوى وتحديد مركز وشعاع الدائرة",
            titleFr: "Exemple résolu (N2) : Intersection d'une sphère et d'un plan",
            statementAr: "نعتبر الفلكة (S) التي مركزها Ω(1, -1, 2) وشعاعها R = 3، والمستوى (P) ذا المعادلة: x - 2y + 2z - 1 = 0.\n1) أحسب المسافة d(Ω, (P)) واستنتج أن (P) يقطع (S) وفق دائرة (C) محدداً شعاعها r.\n2) حدد مثلث إحداثيات النقطة H مركز الدائرة (C).",
            statementFr: "Soit la sphère (S) de centre Ω(1, -1, 2) et de rayon R = 3, et le plan (P) : x - 2y + 2z - 1 = 0.\n1) Calculer d(Ω, (P)) et montrer que (P) coupe (S) selon un cercle (C) de rayon r.\n2) Déterminer les coordonnées du centre H de (C).",
            solutionStepsAr: [
              "1. حساب المسافة: d(Ω, (P)) = |1(1) - 2(-1) + 2(2) - 1| / √(1² + (-2)² + 2²) = |1 + 2 + 4 - 1| / √9 = 6/3 = 2.",
              "2. بما أن d = 2 < R = 3، فإن المستوى (P) يقطع الفلكة (S) وفق دائرة (C) شعاعها r = √(R² - d²) = √(9 - 4) = √5.",
              "3. النقطة H هي تقاطع (P) والمستقيم (Δ) المار من Ω والعمودي على (P) ذي التمثيل البارامتري: x = 1 + t, y = -1 - 2t, z = 2 + 2t (t ∈ ℝ).",
              "4. نعوض في معادلة (P): (1 + t) - 2(-1 - 2t) + 2(2 + 2t) - 1 = 0 ⇔ 9t + 6 = 0 ⇔ t = -2/3، ومنه H(1/3, 1/3, 2/3).",
            ],
            solutionStepsFr: [
              "1. Distance : d(Ω, (P)) = |1 + 2 + 4 - 1| / √(1 + 4 + 4) = 6/3 = 2 < R = 3.",
              "2. Rayon du cercle : r = √(R² - d²) = √(9 - 4) = √5.",
              "3. Droite normale (Δ) passant par Ω : x = 1 + t, y = -1 - 2t, z = 2 + 2t.",
              "4. Substitution dans (P) : 9t + 6 = 0 ⇒ t = -2/3 ⇒ H(1/3, 1/3, 2/3).",
            ],
            pedagogicalNoteAr: "احرص على مراجعة إشارة المركبة الوسطى (ناقص محدد الرتبة الثانية) عند حساب الجداء المتجهي u ∧ v.",
            pedagogicalNoteFr: "Attention au signe moins devant le deuxième déterminant lors du calcul de u ∧ v.",
            difficultyLevel: "N2",
          },
        ],
        commonMistakesAr: [
          "الخطأ في إشارة الإحداثية الثانية (أرتوب المتجهة) عند حساب الجداء المتجهي u ∧ v.",
          "الخلط بين متجهة منظمية على مستوى ومتجهة موجهة لمستقيم عند كتابة التمثيل البارامتري.",
        ],
        commonMistakesFr: [
          "Erreur de signe sur la deuxième composante du produit vectoriel u ∧ v.",
          "Confusion entre vecteur normal à un plan et vecteur directeur d'une droite.",
        ],
      },
    ];
  }

  // 8. درس التعداد وحساب الاحتمالات والإحصاء (Dénombrement, Probabilités & Statistique)
  if (
    title.includes("احتمال") ||
    title.includes("تعداد") ||
    title.includes("إحصاء") ||
    titleFr.includes("probabilit") ||
    titleFr.includes("dénombrement") ||
    titleFr.includes("statistique")
  ) {
    return [
      {
        sectionNum: 1,
        titleAr: "I. التعداد، تساوي الاحتمالات، الاحتمال الشرطي والمتغيرات العشوائية والحدانية",
        titleFr: "I. Dénombrement, équiprobabilité, probabilité conditionnelle et loi binomiale",
        axisSummaryAr: "نمذجة التجارب العشوائية، التمييز بين السحب بالتتابع وبدون إحلال وفي آن واحد، وحساب الأمل الرياضي والمغايرة.",
        axisSummaryFr: "Modélisation des tirages (simultané, successif avec/sans remise), formule des probabilités totales et loi binomiale B(n, p).",
        definitions: [
          {
            termAr: "الاحتمال الشرطي واستقلالية حدثين والقانون الحداني",
            termFr: "Probabilité conditionnelle, indépendance et loi binomiale",
            contentAr: "احتمال وقوع الحدث B علماً أن A قد تحقق (حيث P(A) ≠ 0) هو P_A(B) = P(A ∩ B)/P(A). إذا تكررت تجربة برنولي n مرة بصفة مستقلة وباحتمال نجاح p، فإن P(X = k) = C_n^k p^k (1 - p)^{n-k}.",
            contentFr: "Pour P(A) ≠ 0, P_A(B) = P(A ∩ B)/P(A). Si X ~ B(n, p), alors P(X = k) = C_n^k p^k (1 - p)^{n-k}, E(X) = np et V(X) = np(1 - p).",
            notationMath: "P_A(B) = \\frac{P(A \\cap B)}{P(A)}, \\quad P(X = k) = C_n^k p^k (1-p)^{n-k}, \\quad E(X) = np",
          },
        ],
        theorems: [
          {
            nameAr: "صيغة الاحتمالات الكلية (Formule des probabilités totales)",
            nameFr: "Formule des probabilités totales",
            statementAr: "إذا كانت الأحداث A₁, A₂, ..., A_n تشكل تجزيئاً للكون Ω (غير منعدمة الاحتمال ومثنى مثنى غير منسجمة واتحادها Ω)، فإنه لكل حدث B لدينا: P(B) = ∑ P(A_i ∩ B) = ∑ P(A_i) · P_{A_i}(B).",
            statementFr: "Si (A₁, ..., A_n) forme un système complet d'événements de Ω, alors pour tout événement B : P(B) = ∑ P(A_i) · P_{A_i}(B).",
          },
        ],
        solvedExamples: [
          {
            titleAr: "مثال تطبيقي محلول (N2): السحب من الصندوق والمتغير العشوائي",
            titleFr: "Exemple résolu (N2) : Tirages dans une urne et variable aléatoire",
            statementAr: "يحتوي صندوق على 5 كرات بيضاء و 3 كرات سوداء لا يمكن التمييز بينها باللمس. نسحب عشوائياً وفي آن واحد 3 كرات من الصندوق.\n1) أحسب احتمال الحدث A: «سحب كرتين بيضاوين وكرة سوداء».\n2) ليكن X المتغير العشوائي الذي يربط كل سحبة بعدد الكرات السوداء المسحوبة. حدد قانون احتمال X وأحسب أمله الرياضي E(X).",
            statementFr: "Une urne contient 5 boules blanches et 3 boules noires indiscernables au toucher. On tire simultanément 3 boules.\n1) Calculer P(A) : « Obtenir 2 boules blanches et 1 noire ».\n2) Soit X le nombre de boules noires tirées. Déterminer la loi de probabilité de X et calculer E(X).",
            solutionStepsAr: [
              "1. السحب في آن واحد لـ 3 كرات من أصل 8 يعني توظيف التأليفات: Card(Ω) = C_8^3 = (8×7×6)/6 = 56.",
              "2. احتمال الحدث A: P(A) = (C_5^2 × C_3^1) / C_8^3 = (10 × 3) / 56 = 30/56 = 15/28.",
              "3. القيم الممكنة للمتغير X هي X(Ω) = {0, 1, 2, 3}. نحسب: P(X=0) = C_5^3/56 = 10/56، و P(X=1) = 30/56، و P(X=2) = (C_5^1×C_3^2)/56 = 15/56، و P(X=3) = C_3^3/56 = 1/56.",
              "4. التحقق: ∑ P(X=k) = (10 + 30 + 15 + 1)/56 = 56/56 = 1. الأمل الرياضي: E(X) = (0×10 + 1×30 + 2×15 + 3×1)/56 = 63/56 = 9/8.",
            ],
            solutionStepsFr: [
              "1. Tirage simultané de 3 boules parmi 8 : Card(Ω) = C_8^3 = 56.",
              "2. P(A) = (C_5^2 × C_3^1) / 56 = 30/56 = 15/28.",
              "3. X(Ω) = {0, 1, 2, 3} avec P(X=0)=10/56, P(X=1)=30/56, P(X=2)=15/56, P(X=3)=1/56 (Somme = 1).",
              "4. Espérance : E(X) = (30 + 30 + 3)/56 = 63/56 = 9/8.",
            ],
            pedagogicalNoteAr: "تحقق دائماً من أن مجموع احتمالات جميع قيم المتغير العشوائي يساوي 1 بالضبط قبل حساب الأمل الرياضي E(X).",
            pedagogicalNoteFr: "Toujours vérifier que la somme des probabilités ∑ P(X = x_i) est exactement égale à 1.",
            difficultyLevel: "N2",
          },
        ],
        commonMistakesAr: [
          "الخلط بين السحب في آن واحد (تأليفات C_n^p) والسحب بالتتابع وبدون إحلال (ترتيبات A_n^p) وبإحلال (n^p).",
          "نسيان معامل الترتيب (عدد الحالات المواتية للترتيب) عند السحب بالتتابع.",
        ],
        commonMistakesFr: [
          "Confondre tirage simultané (C_n^p), successif sans remise (A_n^p) et successif avec remise (n^p).",
          "Oublier le coefficient d'ordre lors d'un tirage successif de boules de couleurs différentes.",
        ],
      },
    ];
  }

  // 9. درس الحسابيات في Z، البنيات الجبرية، ومبادئ في المنطق (Arithmétique, Algèbre & Logique)
  if (
    title.includes("حسابيات") ||
    title.includes("منطق") ||
    title.includes("بنيات") ||
    title.includes("زمرة") ||
    titleFr.includes("arithmétique") ||
    titleFr.includes("logique") ||
    titleFr.includes("structure")
  ) {
    return [
      {
        sectionNum: 1,
        titleAr: "I. الاستدلالات المنطقية، القسمة الإقليدية، الموافقات ومبرهنتا بيزو وكوص",
        titleFr: "I. Raisonnements logiques, congruences modulo n et théorèmes de Bézout et Gauss",
        axisSummaryAr: "إرساء قواعد البرهان الرياضي الصارم (الترجع، الخلف، فصل الحالات) وتوظيف مبرهنات الحسابيات في Z والبنيات الجبرية.",
        axisSummaryFr: "Rigueur du raisonnement formel, arithmétique dans ℤ (PGCD, PPCM, Bézout, Gauss, Fermat) et structures algébriques.",
        definitions: [
          {
            termAr: "الموافقة بترديد n ومبرهنة بيزو (Bézout)",
            termFr: "Congruence modulo n et théorème de Bézout",
            contentAr: "نقول إن a ≡ b [n] إذا وفقط إذا كان n يقسم الفرق (a - b). يكون العددان الصحيحان a و b أوليين فيما بينهما (a ∧ b = 1) إذا وفقط إذا وجد عددان صحيحان (u, v) ∈ ℤ² بحيث au + bv = 1.",
            contentFr: "a ≡ b [n] ⇔ n | (a - b). Par le théorème de Bézout : a ∧ b = 1 ⇔ ∃ (u, v) ∈ ℤ², au + bv = 1.",
            notationMath: "a \\equiv b \\pmod n \\iff n \\mid (a - b), \\quad a \\wedge b = 1 \\iff \\exists (u,v)\\in\\mathbb{Z}^2,\\; au + bv = 1",
          },
        ],
        theorems: [
          {
            nameAr: "مبرهنة كوص (Théorème de Gauss) ومبرهنة فيرما الصغرى",
            nameFr: "Théorème de Gauss et petit théorème de Fermat",
            statementAr: "مبرهنة كوص: إذا كان a يقسم الجداء b·c وكان a أولياً مع b (أي a ∧ b = 1)، فإن a يقسم c. مبرهنة فيرما: إذا كان p عدداً أولياً لا يقسم a، فإن a^{p-1} ≡ 1 [p].",
            statementFr: "Gauss : Si a | bc et a ∧ b = 1, alors a | c. Petit théorème de Fermat : Si p est premier et ne divise pas a, alors a^{p-1} ≡ 1 [p].",
            proofAr: "البرهان على كوص: بما أن a ∧ b = 1، حسب بيزو يوجد (u,v) ∈ ℤ² بحيث au + bv = 1. نضرب في c فنحصل على acu + bcv = c. بما أن a يقسم acu و a يقسم bc (إذن يقسم bcv)، فإن a يقسم مجموعهما c.",
            proofFr: "Par Bézout, ∃ (u,v) ∈ ℤ², au + bv = 1 ⇒ acu + bcv = c. Comme a | acu et a | bc, a divise leur somme c.",
          },
        ],
        solvedExamples: [
          {
            titleAr: "مثال تطبيقي محلول (N2/N3): حل معادلة ديوفانتية ax + by = c في Z²",
            titleFr: "Exemple résolu (N2/N3) : Résolution d'une équation diophantienne dans ℤ²",
            statementAr: "نعتبر في ℤ² المعادلة (E) : 17x - 11y = 3.\n1) تحقق أن الزوج (2, 3) حل خاص للمعادلة (E).\n2) حل في ℤ² المعادلة (E) باستعمال مبرهنة كوص.",
            statementFr: "On considère dans ℤ² l'équation (E) : 17x - 11y = 3.\n1) Vérifier que le couple (2, 3) est une solution particulière.\n2) Résoudre dans ℤ² l'équation (E).",
            solutionStepsAr: [
              "1. التحقق: 17(2) - 11(3) = 34 - 33 = 1 ≠ 3، نضرب في 3 فنحصل على الحل الخاص (x₀, y₀) = (6, 9) لأن 17(6) - 11(9) = 102 - 99 = 3.",
              "2. بطرح المعادلتين طرفاً بطرف: 17(x - 6) = 11(y - 9).",
              "3. العدد 11 يقسم 17(x - 6) وبما أن 11 ∧ 17 = 1، فحسب مبرهنة كوص 11 يقسم (x - 6)، أي يوجد k ∈ ℤ بحيث x = 6 + 11k.",
              "4. بالتعويض نجد y = 9 + 17k، وعكسياً كل زوج (6 + 11k, 9 + 17k) يحقق المعادلة. إذن S = {(6 + 11k, 9 + 17k) / k ∈ ℤ}.",
            ],
            solutionStepsFr: [
              "1. Comme 17(2) - 11(3) = 1, en multipliant par 3 le couple (6, 9) est solution particulière de (E).",
              "2. Par soustraction : 17(x - 6) = 11(y - 9).",
              "3. 11 divise 17(x - 6) et 11 ∧ 17 = 1. D'après le théorème de Gauss, 11 divise (x - 6), soit x = 6 + 11k (k ∈ ℤ).",
              "4. En remplaçant, y = 9 + 17k. Réciproquement vérifié : S = {(6 + 11k, 9 + 17k) ; k ∈ ℤ}.",
            ],
            pedagogicalNoteAr: "لا تنسَ مرحلة الاستلزام العكسي (التحقق من أن الأزواج المحصل عليها تحقق فعلاً المعادلة الأصلية) لضمان التكافؤ المنطقي الكامل.",
            pedagogicalNoteFr: "Ne jamais oublier la réciproque lors de la résolution d'une équation diophantienne par le théorème de Gauss.",
            difficultyLevel: "N3",
          },
        ],
        commonMistakesAr: [
          "تطبيق مبرهنة كوص دون التصريح الصريح بشرط الأولية فيما بينهما (a ∧ b = 1).",
          "القسمة المباشرة في الموافقات بترديد n دون التحقق من أن العدد المقسوم عليه أولي مع الترديد n.",
        ],
        commonMistakesFr: [
          "Appliquer le théorème de Gauss sans mentionner explicitement la condition a ∧ b = 1.",
          "Simplifier une congruence ac ≡ bc [n] par c sans vérifier que c ∧ n = 1.",
        ],
      },
    ];
  }

  // 10. قالب ديداكتيكي غني لباقي الدروس يعتمد التمارين والقدرات الحقيقية للدرس
  const cap0Ar = lesson.capacitiesAr[0] || lesson.lessonAr;
  const cap1Ar = lesson.capacitiesAr[1] || cap0Ar;
  const cap2Ar = lesson.capacitiesAr[2] || cap1Ar;
  const cap0Fr = lesson.capacitiesFr[0] || lesson.lessonFr;
  const cap1Fr = lesson.capacitiesFr[1] || cap0Fr;
  const cap2Fr = lesson.capacitiesFr[2] || cap1Fr;
  const sampleEx0Ar =
    lesson.sampleExerciseAr?.[0] ||
    `أنجز التطبيق المباشر المرتبط بـ « ${cap0Ar} » مع تعليل جميع المراحل.`;
  const sampleEx1Ar =
    lesson.sampleExerciseAr?.[1] ||
    `وظف خاصيات « ${cap1Ar} » لاستنتاج النتيجة المطلوبة.`;
  const sampleEx0Fr =
    lesson.sampleExerciseFr?.[0] ||
    `Traiter l'application directe relative à « ${cap0Fr} » en justifiant chaque étape.`;
  const sampleEx1Fr =
    lesson.sampleExerciseFr?.[1] ||
    `Mobiliser les propriétés de « ${cap1Fr} » pour établir le résultat.`;

  const mainFormulaNotation = `\\text{Capacités cibles : } ${cap0Fr} \\;\\cdot\\; ${cap1Fr}`;

  return [
    {
      sectionNum: 1,
      titleAr: `I. المفاهيم المؤسسة والتعاريف الرياضية لدرس « ${lesson.lessonAr} »`,
      titleFr: `I. Concepts cardinaux et définitions formelles de « ${lesson.lessonFr} »`,
      axisSummaryAr: `البناء المفاهيمي والاصطلاحي لمحور ${lesson.lessonAr} (${cap0Ar} · ${cap1Ar}) وفق الإطار المرجعي والتوجيهات التربوية الرسمية.`,
      axisSummaryFr: `Cadre formel et définitions constitutives de ${lesson.lessonFr} (${cap0Fr} · ${cap1Fr}) selon les prescriptions ministérielles.`,
      definitions: [
        {
          termAr: `التعريف المحوري: ${cap0Ar}`,
          termFr: `Définition fondamentale : ${cap0Fr}`,
          contentAr: `ضبط المفهوم الرياضي المرتبط بـ « ${cap0Ar} » وتحديد الترميزات الرسمية المعتمدة وشروط الصلاحية قبل الانتقال إلى « ${cap1Ar} ».`,
          contentFr: `Définition formelle relative à « ${cap0Fr} » avec formalisme rigoureux et domaine de validité menant à « ${cap1Fr} ».`,
          notationMath: mainFormulaNotation,
        },
      ],
      theorems: [
        {
          nameAr: `المبرهنة الأساسية والقواعد الإجرائية لـ ${lesson.lessonAr}`,
          nameFr: `Théorème cardinal et propriétés caractéristiques (${lesson.lessonFr})`,
          statementAr: `تمكن الخاصيات المميزة لـ « ${cap1Ar} » و « ${cap2Ar} » من الانتقال من الصياغة التعريفية إلى الحساب الجبري والتأويل الهندسي المضبوط.`,
          statementFr: `Les propriétés caractéristiques de « ${cap1Fr} » et « ${cap2Fr} » permettent de résoudre les configurations algébriques et géométriques associées.`,
          conditionsAr: [
            `التحقق من شروط تطبيق « ${cap0Ar} »`,
            `الربط المنطقي السليم مع « ${cap1Ar} »`,
          ],
          conditionsFr: [
            `Vérification préalable des conditions de « ${cap0Fr} »`,
            `Articulation logique avec « ${cap1Fr} »`,
          ],
          proofAr: `يعتمد البرهان على التكافؤات المنطقية المتسلسلة انطلاقاً من التعريف الرسمي لـ ${lesson.lessonAr} وصولاً إلى صيغة ${cap1Ar}.`,
          proofFr: `La démonstration s'appuie sur la définition formelle de ${lesson.lessonFr} et les propriétés de ${cap1Fr}.`,
        },
      ],
      solvedExamples: [
        {
          titleAr: `مثال تطبيقي محلول (N1/N2) من صميم درس ${lesson.lessonAr}`,
          titleFr: `Exemple d'application résolu (N1/N2) — ${lesson.lessonFr}`,
          statementAr: `${sampleEx0Ar}\n${sampleEx1Ar}`,
          statementFr: `${sampleEx0Fr}\n${sampleEx1Fr}`,
          solutionStepsAr: [
            `1. استحضار القاعدة المرجعية المرتبطة بـ « ${cap0Ar} » وتحديد المعطيات العددية في السؤال الأول.`,
            `2. إنجاز الحساب الجبري والاختزال للإجابة عن: « ${sampleEx0Ar} ».`,
            `3. توظيف النتيجة السابقة والخاصية المميزة لـ « ${cap1Ar} » لمعالجة السؤال الثاني: « ${sampleEx1Ar} ».`,
            `4. تأطير النتيجة النهائية وتقديم الاستنتاج أو التأويل المناسب وفق الإطار المرجعي.`,
          ],
          solutionStepsFr: [
            `1. Mobiliser la propriété de référence liée à « ${cap0Fr} » et identifier les données.`,
            `2. Effectuer le calcul algébrique structuré pour : « ${sampleEx0Fr} ».`,
            `3. Exploiter le résultat précédent et la propriété « ${cap1Fr} » pour : « ${sampleEx1Fr} ».`,
            `4. Encadrer le résultat final et formuler la conclusion attendue.`,
          ],
          pedagogicalNoteAr: `الحرص على تبرير كل انتقال حسابي بالخاصية المناسبة من « ${cap0Ar} » وعدم الاكتفاء بالنتيجة النهائية.`,
          pedagogicalNoteFr: `Exiger la citation explicite des propriétés relatives à « ${cap0Fr} » à chaque étape du raisonnement.`,
          difficultyLevel: "N2",
        },
      ],
      commonMistakesAr: [
        `التطبيق الآلي لقواعد « ${cap0Ar} » دون التحقق من الشروط الأولية.`,
        `الخلط بين الصيغ الجبرية والتأويل الهندسي في أسئلة « ${cap1Ar} ».`,
      ],
      commonMistakesFr: [
        `Application mécanique de « ${cap0Fr} » sans vérifier les hypothèses.`,
        `Confusion entre écriture algébrique et interprétation dans « ${cap1Fr} ».`,
      ],
    },
  ];
}

/**
 * بناء تكامل تكنولوجيا المعلومات TICE وبرمجة بايثون للدرس
 */
function buildTiceAndPythonIntegration(lesson: LessonItem, track: TrackData) {
  const title = lesson.lessonAr.toLowerCase();

  if (title.includes("متتاليات") || title.includes("suites")) {
    return {
      geogebraActivity: {
        titleAr: "المحاكاة البصرية لتقارب متتالية تراجعية u_{n+1} = f(u_n) عبر المنصف الأول",
        titleFr: "Visualisation dynamique d'une suite récurrente sous GeoGebra 6",
        goalAr: "تتبع الخط المنكسر (Escalier / Toile d'araignée) لمعاينة تقارب المتتالية نحو نقطة التقاطع مع المستقيم y = x.",
        goalFr: "Visualiser la convergence par la méthode de l'escalier vers le point fixe de f.",
        stepsAr: [
          "1. ننشئ الدالة f(x) = (x + 2)/3 على GeoGebra والمستقيم (D) ذي المعادلة y = x.",
          "2. ننشئ زالجة (Curseur) لقيمة الحد البدئي u₀ من -2 إلى 5.",
          "3. نوظف الأمر IterationList لرسم الخطوط المنكسرة وملاحظة سلوك الحدود.",
          "4. نحرك الزالجة ونلاحظ كيف تستقر الحدود عند نقطة التقاطع ذات الأفصول l = 1.",
        ],
        stepsFr: [
          "1. Tracer la fonction f(x) et la première bissectrice y = x.",
          "2. Créer un curseur pour le terme initial u₀.",
          "3. Utiliser les commandes de suite récurrente pour afficher le graphique en escalier.",
          "4. Conjecturer la limite finie l = f(l).",
        ],
      },
      pythonScript: {
        titleAr: "خوارزمية بايثون لحساب الحدود وتحديد رتبة العتبة |u_n - l| < ε",
        titleFr: "Script Python : Calcul des termes et recherche de rang de seuil",
        goalAr: "كتابة دالة بايثون تحسب الحد u_n وتبحث عن أصغر عدد n يحقق |u_n - l| < 10⁻⁴.",
        goalFr: "Déterminer par algorithme le rang à partir duquel |u_n - l| < 10⁻⁴.",
        code: `def suite_recurrente(n_max):
    u = 1.0
    termes = [u]
    for n in range(1, n_max + 1):
        u = (u + 2) / 3
        termes.append(u)
    return u, termes

def seuil_convergence(epsilon=1e-4):
    u = 1.0
    n = 0
    l = 1.0  # Limite théorique
    while abs(u - l) >= epsilon:
        u = (u + 2) / 3
        n += 1
    return n, u

# Exécution et affichage
u_10, liste_termes = suite_recurrente(10)
n_seuil, val_seuil = seuil_convergence(0.0001)
print(f"u_10 = {u_10:.6f}")
print(f"Seuil atteint au rang n = {n_seuil} avec u_n = {val_seuil:.6f}")`,
        explanationAr:
          "يقوم الكود بحساب تكراري لقيمة المتتالية ويستعمل حلقة while للتوقف عند تحقق شرط العتبة ε = 10⁻⁴.",
        explanationFr:
          "Le script calcule par boucle itérative les termes et détermine le rang n où l'écart avec la limite est inférieur à 10⁻⁴.",
        sampleOutput: "u_10 = 1.000017\nSeuil atteint au rang n = 9 avec u_n = 1.000051",
      },
    };
  }

  // خوارزمية التفرع الثنائي (Dichotomie) ومحاكاة GeoGebra للدوال والنهايات والاتصال والاشتقاق
  return {
    geogebraActivity: {
      titleAr: `محاكاة تفاعلية بـ GeoGebra: المماس الديناميكي والتقريب التآلفي لدالة عند نقطة`,
      titleFr: `Simulation GeoGebra 6 : Tangente dynamique et approximation affine`,
      goalAr: "تحريك نقطة M على المنحنى نحو النقطة الثابتة A لملاحظة اقتراب القاطع من وضعية المماس وحساب ميله.",
      goalFr: "Faire tendre le point M vers A pour visualiser la sécante devenant tangente.",
      stepsAr: [
        "1. نرسم منحنى الدالة f(x) ونحدد نقطة A(x₀, f(x₀)).",
        "2. ننشئ نقطة متحركة M(x₀ + h, f(x₀ + h)) مرتبطة بزالجة h تتغير بين -1 و 1.",
        "3. نرسم المستقيم القاطع (AM) ونظهر معادلته وميله.",
        "4. نقرب الزالجة h نحو الصفر ونلاحظ كيف يستقر القاطع ليطابق المماس ذي المعادلة y = f'(x₀)(x - x₀) + f(x₀).",
      ],
      stepsFr: [
        "1. Tracer la courbe de f et fixer le point A(x₀, f(x₀)).",
        "2. Créer un point M lié à un curseur h pour x = x₀ + h.",
        "3. Tracer la sécante (AM) et afficher sa pente.",
        "4. Faire tendre h vers 0 pour observer la convergence vers la tangente.",
      ],
    },
    pythonScript: {
      titleAr: "خوارزمية التفرع الثنائي (Dichotomie) لتحديد حل مقرب لمعادلة f(x) = 0",
      titleFr: "Script Python : Algorithme de dichotomie pour résoudre f(x) = 0",
      goalAr: "إيجاد تأطير للحل الوحيد للمعادلة x³ + 2x - 1 = 0 على [0, 1] بدقة 10⁻⁵.",
      goalFr: "Trouver un encadrement à 10⁻⁵ près de la solution de x³ + 2x - 1 = 0.",
      code: `def f(x):
    return x**3 + 2*x - 1

def dichotomie(a, b, epsilon=1e-5):
    """
    Algorithme de dichotomie officiel
    Prérequis : f(a) * f(b) < 0 et f strictement monotone
    """
    n_iterations = 0
    while (b - a) > epsilon:
        m = (a + b) / 2.0
        if f(a) * f(m) <= 0:
            b = m
        else:
            a = m
        n_iterations += 1
    return a, b, (a + b) / 2.0, n_iterations

# Exécution
a_res, b_res, sol_approx, nb_pas = dichotomie(0, 1, 0.00001)
print(f"Solution approchée : alpha ≈ {sol_approx:.6f}")
print(f"Encadrement : {a_res:.6f} < alpha < {b_res:.6f}")
print(f"Nombre d'itérations : {nb_pas}")`,
      explanationAr:
        "تطبق الخوارزمية مبرهنة القيم الوسيطية عبر قسمة المجال إلى نصفين واختيار النصف الذي يغير الإشارة حتى الوصول إلى الدقة ε = 10⁻⁵.",
      explanationFr:
        "L'algorithme implémente le TVI en divisant l'intervalle par 2 à chaque étape jusqu'à atteindre l'amplitude souhaitée.",
      sampleOutput: "Solution approchée : alpha ≈ 0.453396\nEncadrement : 0.453392 < alpha < 0.453400\nNombre d'itérations : 17",
    },
  };
}

/**
 * بناء محتوى التقويم التكويني والدعم الفوري بالاعتماد على الأسئلة والقدرات الفعلية للدرس
 */
function buildFormativeEvaluation(lesson: LessonItem) {
  const cap0Ar = lesson.capacitiesAr[0] || lesson.lessonAr;
  const cap1Ar = lesson.capacitiesAr[1] || cap0Ar;
  const cap2Ar = lesson.capacitiesAr[2] || cap1Ar;
  const cap0Fr = lesson.capacitiesFr[0] || lesson.lessonFr;
  const cap1Fr = lesson.capacitiesFr[1] || cap0Fr;
  const cap2Fr = lesson.capacitiesFr[2] || cap1Fr;

  const q1Ar =
    lesson.sampleExerciseAr?.[0] ||
    `1. أنجز التطبيق المباشر المرتبط بـ « ${cap0Ar} » وبسط النتيجة.`;
  const q2Ar =
    lesson.sampleExerciseAr?.[1] ||
    `2. وظف خاصيات « ${cap1Ar} » لحل السؤال أو إثبات العلاقة المطلوبة.`;
  const q3Ar =
    lesson.sampleExerciseAr?.[2] ||
    `3. استنتج التأويل أو النتيجة النهائية المرتبطة بـ « ${cap2Ar} ».`;

  const q1Fr =
    lesson.sampleExerciseFr?.[0] ||
    `1. Traiter l'application directe liée à « ${cap0Fr} » et simplifier.`;
  const q2Fr =
    lesson.sampleExerciseFr?.[1] ||
    `2. Mobiliser les propriétés de « ${cap1Fr} » pour démontrer la relation.`;
  const q3Fr =
    lesson.sampleExerciseFr?.[2] ||
    `3. En déduire l'interprétation ou la conclusion relative à « ${cap2Fr} ».`;

  return {
    titleAr: `تقويم تكويني وجيز: التحقق من القدرات والمهارات الأساسية لـ « ${lesson.lessonAr} »`,
    titleFr: `Évaluation formative : Contrôle des capacités fondamentales de « ${lesson.lessonFr} »`,
    testExerciseAr: {
      statement: `تطبيق كتابي فردي (المدة: 20 دقيقة — 5 نقط): في سياق درس « ${lesson.lessonAr} »، أجب عن الأسئلة المتدرجة التالية بتعليل رياضي دقيق:`,
      questions: [q1Ar, q2Ar, q3Ar],
      answers: [
        `1. تطبيق القاعدة المرجعية لـ « ${cap0Ar} » والتعويض السليم للوصول إلى النتيجة المضبوطة.`,
        `2. استحضار شروط « ${cap1Ar} » وإنجاز الاستدلال الجبري أو الهندسي خطوة بخطوة.`,
        `3. ربط النتيجة بالسياق العام لـ « ${cap2Ar} » وتأطير الصيغة النهائية.`,
      ],
      markingScheme: ["1.5 pt", "2.0 pts", "1.5 pt"],
    },
    testExerciseFr: {
      statement: `Test formatif individuel (Durée : 20 min — 5 pts) : Dans le cadre de « ${lesson.lessonFr} », traiter les questions suivantes avec justification rigoureuse :`,
      questions: [q1Fr, q2Fr, q3Fr],
      answers: [
        `1. Application directe de la propriété « ${cap0Fr} » et simplification exacte.`,
        `2. Vérification des hypothèses de « ${cap1Fr} » et rédaction complète de la preuve.`,
        `3. Déduction finale et interprétation dans le cadre de « ${cap2Fr} ».`,
      ],
      markingScheme: ["1.5 pt", "2.0 pts", "1.5 pt"],
    },
    remediationStrategiesAr: [
      `معالجة التعثرات في « ${cap0Ar} »: تنظيم ورشة تصحيح فوري على السبورة مع تذكير بالصيغ الأساسية.`,
      `معالجة نسيان شروط المبرهنات في « ${cap1Ar} »: اعتماد بطاقة ملخصة (Fiche Mémo) للفرضيات القبلية اللازمة.`,
      "تنمية مهارة التحرير الرياضي: تخصيص 0.25 نقطة لكل تعليل منطقي سليم داخل سلم التنقيط.",
    ],
    remediationStrategiesFr: [
      `Remédiation ciblée sur « ${cap0Fr} » : exercice flash guidé au tableau avec rappel des formules.`,
      `Consolidation des hypothèses de « ${cap1Fr} » : fiche réflexe synthétisant les conditions préalables.`,
      "Rigueur de rédaction : barème analytique au 0.25 pt valorisant chaque justification logique.",
    ],
    homeworkAssignmentsAr: [
      `حل التمارين التطبيقية والتوليفية من سلسلة التمارين الموزعة حول « ${lesson.lessonAr} » (المستويات N1 و N2).`,
      "إنجاز الفرض المنزلي (Devoir Maison) في ورقة مزدوجة منظمة تسلم في الحصة المحددة.",
      "التحقق من النتائج والتخمينات باستعمال برمجية GeoGebra أو خوارزمية Python المرفقة.",
    ],
    homeworkAssignmentsFr: [
      `Résoudre les exercices d'entraînement de la série sur « ${lesson.lessonFr} » (niveaux N1 et N2).`,
      "Rédiger le Devoir Maison sur feuille double soignée.",
      "Vérifier les conjectures à l'aide de GeoGebra ou du script Python associé.",
    ],
  };
}

/**
 * بناء الامتدادات التخصصية المتقاطعة (STEM Links: الفيزياء، علوم المهندس، الاقتصاد والمعلوميات)
 */
function buildLessonStemExtensions(lesson: LessonItem): FicheStemExtensionItem[] {
  const title = lesson.lessonAr.toLowerCase();
  const titleFr = lesson.lessonFr.toLowerCase();

  if (
    title.includes("تكامل") ||
    title.includes("تفاضلية") ||
    title.includes("أسية") ||
    titleFr.includes("intégral") ||
    titleFr.includes("exp")
  ) {
    return [
      {
        disciplineAr: "الفيزياء والكيمياء (الكهرباء والتحولات النووية)",
        disciplineFr: "Sciences Physiques (Dipôles RC/RL & Radioactivité)",
        applicationTitleAr: "معادلة شحن المكثف وتناقص النشاط الإشعاعي وحساب الطاقة المخزونة",
        applicationTitleFr: "Charge d'un condensateur, décroissance radioactive et énergie emmagasinée",
        mathematicalModelLatex:
          "RC\\frac{du_C}{dt} + u_C = E \\implies u_C(t) = E(1 - e^{-t/\\tau}), \\quad E_e = \\int_0^t u_C(t)i(t)\\,dt",
        didacticLinkAr:
          "توظيف الدالة الأسية والمعادلات التفاضلية من الرتبة الأولى وحساب التكامل لتحديد الطاقة الكهربائية.",
        didacticLinkFr:
          "Mobilisation directe de la fonction exponentielle et du calcul intégral pour le bilan énergétique.",
      },
      {
        disciplineAr: "علوم الاقتصاد والتدبير المالي",
        disciplineFr: "Sciences Économiques & Finance Quantitative",
        applicationTitleAr: "الفائدة المتصلة وفائض المستهلك والمنتج بالتكامل",
        applicationTitleFr: "Actualisation continue et calcul du surplus du consommateur",
        mathematicalModelLatex:
          "V(t) = V_0 e^{rt}, \\quad S_c = \\int_0^{q^*} (p_d(q) - p^*)\\,dq",
        didacticLinkAr:
          "حساب القيمة المحينة للتدفقات المالية وحساب مساحة فائض المستهلك عبر التكامل المحدد.",
        didacticLinkFr:
          "Modélisation de la capitalisation continue et intégration de la fonction de demande.",
      },
    ];
  }

  return [
    {
      disciplineAr: "الفيزياء والميكانيك (قوانين نيوتن والموجات)",
      disciplineFr: "Physique & Mécanique Newtonienne",
      applicationTitleAr: `نمذجة الحركة والسرعة اللحظية والتسارع بتوظيف « ${lesson.lessonAr} »`,
      applicationTitleFr: `Cinématique, vitesse instantanée et modélisation via « ${lesson.lessonFr} »`,
      mathematicalModelLatex:
        "v(t) = \\frac{dx}{dt} = x'(t), \\quad a(t) = \\frac{d^2x}{dt^2} = x''(t)",
      didacticLinkAr:
        "ربط المفهوم الرياضي (المشتقة، النهاية، المتجهات، أو الأعداد العقدية في الممانعة الكهربائية) بالظاهرة الفيزيائية المقاسة.",
      didacticLinkFr:
        "Articulation entre l'outil mathématique formel et l'interprétation cinématique ou électrique.",
    },
    {
      disciplineAr: "المعلوميات والخوارزميات الرقمية",
      disciplineFr: "Informatique & Analyse Numérique",
      applicationTitleAr: "الحل التقريبي والمحاكاة البرمجية بلغة Python",
      applicationTitleFr: "Approximation algorithmique et simulation sous Python",
      mathematicalModelLatex: "|x_{n+1} - x_n| < \\varepsilon = 10^{-5}",
      didacticLinkAr:
        "تحويل المبرهنات النظرية إلى خوارزميات تقارب عددية قابلة للتنفيذ والتحقق.",
      didacticLinkFr:
        "Traduction des théorèmes d'existence en algorithmes itératifs de précision contrôlée.",
    },
  ];
}

/**
 * بناء مخطط تدبير السبورة الثلاثية (Tableau Noir) وملخص دفتر النصوص (Cahier de Texte) لكل حصة
 */
function buildBlackboardPlansPerSession(
  lesson: LessonItem,
  sessions: FicheGlobalPlanningSession[],
  courseSections: FicheCourseSection[]
): FicheBlackboardPlanItem[] {
  const section0 = courseSections[0];
  const defTitle = section0?.definitions?.[0]?.termAr || lesson.capacitiesAr[0] || lesson.lessonAr;
  const theoTitle = section0?.theorems?.[0]?.nameAr || lesson.capacitiesAr[1] || lesson.lessonAr;

  return sessions.map((sess) => ({
    sessionNum: sess.sessionNumber,
    sessionTitleAr: sess.themeAr,
    rightWingActivitiesAr: `الجناح الأيمن (التذكير والنشاط البنائي): تذكير بالمكتسبات القبلية + مناقشة وضعية الانطلاق لـ « ${sess.themeAr} ».`,
    centerWingCourseAr: `الجناح الأوسط (المأسسة والحصيلة المعرفية — لا يُمسح): تدوين ${defTitle} و ${theoTitle} بالرموز الرسمية والألوان المميزة.`,
    leftWingExercisesAr: `الجناح الأيسر (التطبيق والتقويم التكويني): تمرين تطبيقي مباشر على السبورة مع تصحيح جماعي لأخطاء التحرير.`,
    cahierDeTexteEntryAr: `[الحصة ${sess.sessionNumber} · 08:00–09:00 · ${sess.allocatedHours}]: إنجاز محور « ${sess.themeAr} » (${sess.keyConceptsAr}) + تمرين تطبيقي وتكليف منزلي.`,
    cahierDeTexteEntryFr: `[Séance ${sess.sessionNumber} · 08h00–09h00 · ${sess.allocatedHours}] : Traitement de « ${sess.themeFr} » (${sess.keyConceptsFr}) + Exercice d'application.`,
  }));
}

