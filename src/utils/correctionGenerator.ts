import {
  ConfiguredSerieExercise,
  getQuestionBaremesAndLevels,
  LessonItem,
  SerieExerciseBlock,
} from "../data/curriculum";
import {
  decomposeQuestionIntoSubQuestions,
  SubQuestionDecompositionMode,
} from "./dsSupervisedExamEnhancements";

export interface QuestionSolution {
  questionNumber: string;
  questionText: string;
  solutionTextAr: string;
  solutionTextFr: string;
  bareme: string; // e.g. "0.75 pt"
  baremeBreakdownAr: string[];
  baremeBreakdownFr: string[];
  pedagogicalNoteAr?: string;
  pedagogicalNoteFr?: string;
}

export interface ExerciseCorrection {
  exerciseIndex: number;
  exerciseTitleAr: string;
  exerciseTitleFr: string;
  totalPoints: string;
  weight: number;
  solutions: QuestionSolution[];
  generalAdviceAr: string;
  generalAdviceFr: string;
}

/**
 * يولد نموذج التصحيح المفصل وسلم التنقيط البيداغوجي وفق معايير الأطر المرجعية المغربية ومواقع الرياضيات (AlloSchool, Moutamadris)
 */
export function generateExerciseCorrection(
  lesson: LessonItem,
  exerciseIndex: number,
  model: "A" | "B" | "C" | "D" | string = "A",
  questionsAr: string[] = [],
  questionsFr: string[] = []
): ExerciseCorrection {
  const safeLesson: LessonItem = (typeof lesson === "object" && lesson !== null)
    ? lesson
    : {
        lessonAr: typeof lesson === "string" ? lesson : "الدرس",
        lessonFr: typeof lesson === "string" ? lesson : "Leçon",
        weight: 25,
        hours: "10h",
        capacitiesAr: [],
        capacitiesFr: []
      };
  const titleFr = (safeLesson.lessonFr || "").toLowerCase();
  const titleAr = safeLesson.lessonAr || "";
  const weight = safeLesson.weight || 25;
  const totalPoints = ((weight * 20) / 100).toFixed(1);
  const capsAr = safeLesson.capacitiesAr || [];
  const capsFr = safeLesson.capacitiesFr || [];

  const solutions: QuestionSolution[] = [];

  const activeCustomSolAr =
    model === "B" && safeLesson.sampleSolutionModelB_Ar && safeLesson.sampleSolutionModelB_Ar.length > 0
      ? safeLesson.sampleSolutionModelB_Ar
      : safeLesson.sampleSolutionAr;
  const activeCustomSolFr =
    model === "B" && safeLesson.sampleSolutionModelB_Fr && safeLesson.sampleSolutionModelB_Fr.length > 0
      ? safeLesson.sampleSolutionModelB_Fr
      : safeLesson.sampleSolutionFr;

  if (
    (activeCustomSolAr && activeCustomSolAr.length > 0) ||
    (activeCustomSolFr && activeCustomSolFr.length > 0)
  ) {
    const count = Math.max(
      questionsAr.length,
      questionsFr.length,
      activeCustomSolAr?.length || 0,
      activeCustomSolFr?.length || 0
    );
    const totalPtsNum = (weight * 20) / 100;
    const defaultPerQ = Math.max(0.25, Math.round((totalPtsNum / Math.max(1, count)) * 4) / 4);

    for (let i = 0; i < count; i++) {
      const qPts =
        lesson.customQuestionBaremes && lesson.customQuestionBaremes[i] !== undefined
          ? lesson.customQuestionBaremes[i]
          : defaultPerQ;
      const sAr =
        activeCustomSolAr?.[i] ||
        activeCustomSolFr?.[i] ||
        `تطبيق الخاصية المبرمجة في درس « ${titleAr} » واستنتاج النتيجة المطلوبة بدقة.`;
      const sFr =
        activeCustomSolFr?.[i] ||
        activeCustomSolAr?.[i] ||
        `Application rigoureuse du théorème du chapitre « ${lesson.lessonFr} » et conclusion.`;

      solutions.push({
        questionNumber: `${i + 1}`,
        questionText: questionsFr[i] || questionsAr[i] || `Question ${i + 1}`,
        solutionTextAr: sAr,
        solutionTextFr: sFr,
        bareme: `${Number(qPts).toFixed(2).replace(/\.00$/, ".0").replace(/(\.\d)0$/, "$1")} pt`,
        baremeBreakdownAr: [
          `${(qPts * 0.35).toFixed(2)} ن : صياغة القاعدة أو الخاصية الرياضية المناسبة`,
          `${(qPts * 0.4).toFixed(2)} ن : سلامة المراحل الحسابية والاستدلال المنطقي`,
          `${(qPts * 0.25).toFixed(2)} ن : تأطير النتيجة النهائية ومطابقتها للمطلوب`,
        ],
        baremeBreakdownFr: [
          `${(qPts * 0.35).toFixed(2)} pt : Énoncé de la propriété ou méthode adéquate`,
          `${(qPts * 0.4).toFixed(2)} pt : Exactitude des calculs et enchaînement logique`,
          `${(qPts * 0.25).toFixed(2)} pt : Formulation et encadrement du résultat final`,
        ],
        pedagogicalNoteAr: lesson.isImportedSimulation
          ? "محاكاة فرض مستورد: تقبل كل طريقة مكافئة تؤدي إلى نفس النتيجة مع احترام تدرج سلم التنقيط."
          : undefined,
        pedagogicalNoteFr: lesson.isImportedSimulation
          ? "Simulation DS importé : Toute méthode équivalente rigoureuse reçoit la totalité des points."
          : undefined,
      });
    }

    return {
      exerciseIndex,
      exerciseTitleAr: titleAr,
      exerciseTitleFr: lesson.lessonFr,
      totalPoints,
      weight,
      solutions,
      generalAdviceAr:
        "عناصر إجابة وسلم تنقيط مفصل مستخرج ومُحاكى وفق بنية الفرض المحروس المستورد والأطر المرجعية الوطنية (142-08).",
      generalAdviceFr:
        "Corrigé type et barème détaillé générés par simulation conforme à la structure du Devoir Surveillé importé.",
    };
  }

  if (titleFr.includes("arithm") || titleAr.includes("حسابيات")) {
    const isModelA = model === "A";
    solutions.push({
      questionNumber: "1",
      questionText: questionsFr[0] || questionsAr[0] || "Étude de parité",
      solutionTextAr: isModelA
        ? `دراسة زوجية $A = n^2 + 3n + 4$ :
نكتب $A = n(n + 3) + 4$.
- الحالة الأولى: إذا كان $n$ زوجياً ($n = 2k$)، فإن $n(n+3) = 2k(2k+3) = 2K$ عدد زوجي.
- الحالة الثانية: إذا كان $n$ فردياً ($n = 2k+1$)، فإن $n+3 = 2k+4 = 2(k+2)$ عدد زوجي، وبالتالي $n(n+3)$ عدد زوجي.
في كلتا الحالتين، $n(n+3)$ زوجي، وبما أن 4 زوجي، فإن $A$ مجموع عددين زوجيين، إذن $A$ زوجي قطعا لكل $n \\in \\mathbb{N}$.`
        : `دراسة زوجية $A = n^2 + 5n + 6$ :
نلاحظ أن $A = (n+2)(n+3)$.
بما أن $(n+2)$ و $(n+3)$ عددان صحيحان طبيعيان متتاليان، فإن جداءهما دائماً عدد زوجي (أحدهما بالضرورة مضاعف لـ 2).
إذن $A$ زوجي قطعا لكل $n \\in \\mathbb{N}$.`,
      solutionTextFr: isModelA
        ? `Étude de la parité de $A = n^2 + 3n + 4$ :
On factorise partiellement : $A = n(n + 3) + 4$.
- 1er cas : Si $n$ est pair ($n = 2k$), alors $n(n+3)$ est pair comme multiple de 2.
- 2ème cas : Si $n$ est impair ($n = 2k+1$), alors $n+3 = 2k+4 = 2(k+2)$ est pair, donc $n(n+3)$ est pair.
Conclusion : Le produit de deux entiers de parités différentes ou de même parité donne $n(n+3)$ pair. Comme 4 est pair, la somme $A$ est strictement paire pour tout $n \\in \\mathbb{N}$.`
        : `Étude de la parité de $A = n^2 + 5n + 6$ :
On remarque la factorisation $A = (n+2)(n+3)$.
Comme $(n+2)$ et $(n+3)$ sont deux entiers consécutifs, leur produit est obligatoirement pair.
Par conséquent, $A$ est un nombre pair pour tout entier naturel $n$.`,
      bareme: "1.00 pt",
      baremeBreakdownAr: [
        "0.25 ن : صياغة التفكيك أو فصل الحالات",
        "0.50 ن : تبرير زوجية الجداء $n(n+3)$ أو الجداء المتتالي",
        "0.25 ن : الاستنتاج النهائي بأن $A$ زوجي",
      ],
      baremeBreakdownFr: [
        "0.25 pt : Écriture de la factorisation ou disjonction des cas",
        "0.50 pt : Justification rigoureuse de la parité du produit",
        "0.25 pt : Conclusion conforme pour tout $n \\in \\mathbb{N}$",
      ],
      pedagogicalNoteAr: "ملاحظة للأستاذ: تقبل أي طريقة صحيحة مثل كتابة $A = n(n+1) + 2n + 4$.",
      pedagogicalNoteFr: "Remarque correcteur : Valider toute méthode exacte (ex: produit d'entiers consécutifs).",
    });

    solutions.push({
      questionNumber: "2",
      questionText: questionsFr[1] || questionsAr[1] || "Décomposition PGCD et PPCM",
      solutionTextAr: isModelA
        ? `تفكيك العددين $a = 540$ و $b = 378$ :
- $540 = 54 \\times 10 = 2 \\times 3^3 \\times 2 \\times 5 = 2^2 \\times 3^3 \\times 5$
- $378 = 2 \\times 189 = 2 \\times 3^3 \\times 7$
حساب القاسم المشترك الأكبر $PGCD(a,b)$ :
نأخذ العوامل الأولية المشتركة ذات الأصغر أس : $PGCD(540, 378) = 2^1 \\times 3^3 = 2 \\times 27 = 54$.
حساب المضاعف المشترك الأصغر $PPCM(a,b)$ :
نأخذ العوامل الأولية المشتركة وغير المشتركة ذات الأكبر أس :
$PPCM(540, 378) = 2^2 \\times 3^3 \\times 5 \\times 7 = 4 \\times 27 \\times 35 = 3780$.
(التحقق: $PGCD \\times PPCM = 54 \\times 3780 = 204120 = 540 \\times 378$).`
        : `تفكيك العددين $a = 720$ و $b = 504$ :
- $720 = 2^4 \\times 3^2 \\times 5$
- $504 = 2^3 \\times 3^2 \\times 7$
حساب $PGCD(a,b) = 2^3 \\times 3^2 = 8 \\times 9 = 72$.
حساب $PPCM(a,b) = 2^4 \\times 3^2 \\times 5 \\times 7 = 16 \\times 9 \\times 35 = 5040$.`,
      solutionTextFr: isModelA
        ? `Décomposition en facteurs premiers :
- $a = 540 = 2^2 \\times 3^3 \\times 5$
- $b = 378 = 2 \\times 3^3 \\times 7$
Calcul du PGCD : facteurs premiers communs avec le plus petit exposant :
$\\text{PGCD}(540, 378) = 2^1 \\times 3^3 = 54$.
Calcul du PPCM : facteurs communs et non communs avec le plus grand exposant :
$\\text{PPCM}(540, 378) = 2^2 \\times 3^3 \\times 5 \\times 7 = 3780$.`
        : `Décomposition en facteurs premiers :
- $a = 720 = 2^4 \\times 3^2 \\times 5$
- $b = 504 = 2^3 \\times 3^2 \\times 7$
$\\text{PGCD}(720, 504) = 2^3 \\times 3^2 = 72$.
$\\text{PPCM}(720, 504) = 2^4 \\times 3^2 \\times 5 \\times 7 = 5040$.`,
      bareme: "1.25 pt",
      baremeBreakdownAr: [
        "0.50 ن : التفكيك السليم للعددين إلى جداء عوامل أولية",
        "0.375 ن : تحديد قيمة PGCD مع القاعدة",
        "0.375 ن : تحديد قيمة PPCM مع القاعدة",
      ],
      baremeBreakdownFr: [
        "0.50 pt : Décompositions exactes en puissances de premiers",
        "0.375 pt : Détermination et calcul du PGCD",
        "0.375 pt : Détermination et calcul du PPCM",
      ],
    });

    solutions.push({
      questionNumber: "3",
      questionText: questionsFr[2] || questionsAr[2] || "Divisibilité (n+11) | (2n+30)",
      solutionTextAr: isModelA
        ? `تحديد قيم $n \\in \\mathbb{N}$ بحيث $(n+11)$ يقسم $(2n+30)$ :
لدينا $(n+11)$ يقسم $(2n+30)$، وبما أن $(n+11)$ يقسم دائماً $2(n+11) = 2n+22$.
إذن $(n+11)$ يقسم الفرق : $(2n+30) - (2n+22) = 8$.
وبالتالي $(n+11)$ ينتمي لمجموعة قواسم 8 الموجبة : $\\mathcal{D}_8 = \\{1, 2, 4, 8\\}$.
بما أن $n \\in \\mathbb{N}$ فإن $n + 11 \\ge 11$.
وحيث أن أكبر قاسم للعدد 8 هو 8 وأصغر من 11، فإنه لا يوجد أي عدد صحيح طبيعي $n$ يحقق هذا الشرط.
مجموعة الحلول : $S = \\emptyset$.`
        : `تحديد قيم $n \\in \\mathbb{N}$ بحيث $(n+9)$ يقسم $(2n+26)$ :
لدينا $(n+9)$ يقسم $(2n+26) - 2(n+9) = 2n+26 - (2n+18) = 8$.
إذن $(n+9) \\in \\{1, 2, 4, 8\\}$.
بما أن $n \\ge 0 \\Rightarrow n+9 \\ge 9 > 8$. إذن لا يوجد حل في $\\mathbb{N}$ ($S = \\emptyset$).`,
      solutionTextFr: isModelA
        ? `Condition de divisibilité :
On a $(n+11) \\mid (2n+30)$ et de manière évidente $(n+11) \\mid 2(n+11) = 2n+22$.
Par combinaison linéaire, $(n+11)$ divise leur différence : $(2n+30) - (2n+22) = 8$.
Donc $(n+11) \\in \\text{Div}(8) = \\{1, 2, 4, 8\\}$.
Or, comme $n \\in \\mathbb{N}$, on a $n \\ge 0 \\implies n + 11 \\ge 11$.
Comme aucun diviseur de 8 n'est supérieur ou égal à 11, il n'existe aucun entier naturel $n$ solution.
Conclusion : $\\mathcal{S} = \\emptyset$.`
        : `Condition $(n+9) \\mid (2n+26)$ :
$(n+9) \\mid (2n+26 - 2(n+9)) = 8$.
Or $n \\ge 0 \\implies n+9 \\ge 9 > 8$. L'ensemble des solutions dans $\\mathbb{N}$ est vide : $\\mathcal{S} = \\emptyset$.`,
      bareme: "1.25 pt",
      baremeBreakdownAr: [
        "0.50 ن : استعمال التوافق أو خاصية الفرق للتخلص من المجهول n",
        "0.50 ن : حصر قواسم العدد 8 ومقارنتها مع $n+11$",
        "0.25 ن : استنتاج مجموعة الحلول بدقة",
      ],
      baremeBreakdownFr: [
        "0.50 pt : Élimination de l'inconnue $n$ par combinaison linéaire",
        "0.50 pt : Détermination des diviseurs et encadrement",
        "0.25 pt : Déduction rigoureuse de l'ensemble vide",
      ],
    });

    solutions.push({
      questionNumber: "4",
      questionText: questionsFr[3] || questionsAr[3] || "Résolution dans ℕ² de x² - y² = 28",
      solutionTextAr: `حل المعادلة $x^2 - y^2 = 28$ في $\\mathbb{N}^2$ :
نعمل الطرف الأيسر باستعمال المتطابقة الهامة : $(x - y)(x + y) = 28$.
بما أن $x, y \\in \\mathbb{N}$ و $x^2 - y^2 = 28 > 0$، فإن $x > y$، ومنه $(x - y) \\in \\mathbb{N}^*$ و $(x + y) \\in \\mathbb{N}^*$ مع $x - y < x + y$.
علاوة على ذلك، مجموعهما $(x - y) + (x + y) = 2x$ عدد زوجي، إذن العددان $(x - y)$ و $(x + y)$ لهما نفس الزوجية.
قواسم العدد 28 هي : $28 = 1 \\times 28 = 2 \\times 14 = 4 \\times 7$.
الجداء الوحيد لعاملين لهما نفس الزوجية مع $d_1 < d_2$ هو $2 \\times 14$.
إذن نحصل على النظمة : $\\begin{cases} x - y = 2 \\\\ x + y = 14 \\end{cases} \\iff \\begin{cases} 2x = 16 \\\\ y = x - 2 \\end{cases} \\iff \\begin{cases} x = 8 \\\\ y = 6 \\end{cases}$.
مجموعة الحلول في $\\mathbb{N}^2$ هي : $\\mathcal{S} = \\{(8, 6)\\}$.`,
      solutionTextFr: `Résolution dans $\\mathbb{N}^2$ de l'équation $x^2 - y^2 = 28$ :
On factorise grâce à l'identité remarquable : $(x - y)(x + y) = 28$.
Comme $x, y \\in \\mathbb{N}$ et $x^2 - y^2 = 28 > 0$, on a $x > y$, donc $x - y$ et $x + y$ sont deux diviseurs positifs de 28 tels que $x - y < x + y$.
De plus, $(x + y) + (x - y) = 2x$ est pair, donc $(x - y)$ et $(x + y)$ ont la même parité.
Les décompositions de 28 en produit de deux entiers sont $1 \\times 28$, $2 \\times 14$ et $4 \\times 7$.
Le seul couple de diviseurs de même parité est $(2, 14)$.
On résout le système : $\\begin{cases} x - y = 2 \\\\ x + y = 14 \\end{cases} \\iff \\begin{cases} 2x = 16 \\\\ y = x - 2 \\end{cases} \\iff \\begin{cases} x = 8 \\\\ y = 6 \\end{cases}$.
Conclusion : $\\mathcal{S} = \\{(8, 6)\\}$ (vérification : $8^2 - 6^2 = 64 - 36 = 28$).`,
      bareme: "2.00 pt",
      baremeBreakdownAr: [
        "0.50 ن : تعميل التعبير $(x - y)(x + y) = 28$ ومقارنة العاملين",
        "0.75 ن : توظيف شرط نفس الزوجية لفرز قواسم العدد 28",
        "0.75 ن : حل النظمة واستنتاج الزوج الوحيد $(8, 6)$",
      ],
      baremeBreakdownFr: [
        "0.50 pt : Factorisation $(x - y)(x + y) = 28$ et ordre des facteurs",
        "0.75 pt : Argument de même parité pour sélectionner le couple $(2, 14)$",
        "0.75 pt : Résolution du système et conclusion $\\mathcal{S} = \\{(8, 6)\\}$",
      ],
      pedagogicalNoteAr: "توجيه للمصحح: يمنح نصف النقطة للتلميذ الذي درس جميع الحالات الثلاث لقواسم 28 واستبعد الحالتين غير الصحيحتين.",
      pedagogicalNoteFr: "Remarque correcteur : Accorder la totalité des points si l'élève teste les 3 systèmes et élimine ceux qui ne donnent pas d'entiers naturels.",
    });
  } else if (titleFr.includes("suite") || titleAr.includes("متتاليات")) {
    const a = model === "A" ? "3" : "4";
    const b = model === "A" ? "2" : "3";
    const u0 = model === "A" ? "1" : "2";

    solutions.push({
      questionNumber: "1",
      questionText: `Démonstration par récurrence : $u_n > 0$ et monotonie`,
      solutionTextAr: `1. البرهان بالترجع أن $u_n > 0$ لكل $n \\in \\mathbb{N}$ :
- من أجل $n = 0$ : لدينا $u_0 = ${u0} > 0$، إذن الخاصية محققة من أجل $n = 0$.
- نفترض أن $u_n > 0$ من أجل عدد صحيح طبيعي $n$ ثابت، ولنبين أن $u_{n+1} > 0$ :
  لدينا $u_{n+1} = \\frac{${a}u_n + ${b}}{u_n + 2}$.
  بما أن $u_n > 0$ (حسب فرضية الترجع)، فإن البسط $${a}u_n + ${b} > 0$ والمقام $u_n + 2 > 0$.
  ومنه خارج عددين موجبين قطعا موجب قطعا، إذن $u_{n+1} > 0$.
- الخلاصة: حسب مبدأ الاستدلال بالترجع، فإن $u_n > 0$ لكل $n \\in \\mathbb{N}$.

2. دراسة رتابة $(u_n)$ :
نحسب الفرق $u_{n+1} - u_n = \\frac{${a}u_n + ${b}}{u_n + 2} - u_n = \\frac{-u_n^2 + (${a}-2)u_n + ${b}}{u_n + 2}$.
إشارة البسط تؤكد أن المتتالية رتيبة ومحدودة، وبالتالي متقاربة.`,
      solutionTextFr: `1. Démonstration par récurrence que $u_n > 0$ pour tout $n \\in \\mathbb{N}$ :
- Initialisation ($n = 0$) : $u_0 = ${u0} > 0$, la proposition est vraie au rang 0.
- Hérédité : Supposons que $u_n > 0$ pour un certain $n \\in \\mathbb{N}$. Montrons que $u_{n+1} > 0$.
  On a $u_{n+1} = \\frac{${a}u_n + ${b}}{u_n + 2}$. Par hypothèse de récurrence, $u_n > 0$, donc $${a}u_n + ${b} > 0$ et $u_n + 2 > 0$.
  Le quotient de deux réels strictement positifs est strictement positif, d'où $u_{n+1} > 0$.
- Conclusion : D'après le principe de récurrence, $\\forall n \\in \\mathbb{N},\\; u_n > 0$.

2. Monotonie et convergence :
Calcul de $u_{n+1} - u_n = \\frac{-u_n^2 + (${Number(a) - 2})u_n + ${b}}{u_n + 2}$.
La suite est monotone et bornée, donc convergente d'après le théorème de convergence monotone.`,
      bareme: "1.50 pt",
      baremeBreakdownAr: [
        "0.25 ن : مرحلة التحقق من الرتبة الأولى (n=0)",
        "0.50 ن : فرضية الترجع وتأطير بسط ومقام $u_{n+1}$",
        "0.25 ن : الاستنتاج وخلاصة الترجع",
        "0.50 ن : حساب الفرق $u_{n+1} - u_n$ واستنتاج التقارب",
      ],
      baremeBreakdownFr: [
        "0.25 pt : Initialisation au rang 0",
        "0.50 pt : Hypothèse de récurrence et signe du quotient",
        "0.25 pt : Conclusion rigoureuse de la récurrence",
        "0.50 pt : Calcul de la différence et convergence",
      ],
      pedagogicalNoteAr: "معيار التصحيح: اشتراط صياغة المراحل الثلاث للترجع كاملة لمنح النقطة كاملة.",
      pedagogicalNoteFr: "Critère de notation : Les 3 étapes de la récurrence doivent être explicitement rédigées.",
    });

    solutions.push({
      questionNumber: "2",
      questionText: `Suite géométrique auxiliaire $(v_n)$ et calcul de limite`,
      solutionTextAr: `نضع $v_n = \\frac{u_n - ${b}}{u_n + 1}$.
1. نبين أن $(v_n)$ متتالية هندسية :
نحسب $v_{n+1} = \\frac{u_{n+1} - ${b}}{u_{n+1} + 1} = \\frac{\\frac{${a}u_n + ${b}}{u_n + 2} - ${b}}{\\frac{${a}u_n + ${b}}{u_n + 2} + 1}$.
نوحد المقامات في البسط والمقام ونختزل بـ $(u_n + 2)$ :
$v_{n+1} = q \\times v_n$.
نستنتج أن $(v_n)$ متتالية هندسية أساسها $q$ وحدها الأول $v_0 = \\frac{u_0 - ${b}}{u_0 + 1}$.
2. تعبير $v_n$ ثم $u_n$ بدلالة $n$ :
$v_n = v_0 \\times q^n$.
بما أن $|q| < 1$، فإن $\\lim_{n \\to +\\infty} q^n = 0$.
نستنتج أن $\\lim_{n \\to +\\infty} u_n = ${b}$.`,
      solutionTextFr: `On pose $v_n = \\frac{u_n - ${b}}{u_n + 1}$.
1. Preuve que $(v_n)$ est géométrique :
$v_{n+1} = \\frac{u_{n+1} - ${b}}{u_{n+1} + 1}$. En remplaçant $u_{n+1}$ par son expression et en réduisant au même dénominateur :
On factorise pour obtenir $v_{n+1} = q \\cdot v_n$.
Donc $(v_n)$ est une suite géométrique de raison $q$ et de premier terme $v_0$.
2. Expression explicite et limite :
$v_n = v_0 \\cdot q^n$. Comme $|q| < 1$, on a $\\lim q^n = 0$.
En inversant la relation pour exprimer $u_n = \\frac{v_n + ${b}}{1 - v_n}$, on conclut que $\\lim_{n \\to +\\infty} u_n = ${b}$.`,
      bareme: "1.50 pt",
      baremeBreakdownAr: [
        "0.50 ن : توحيد المقامات وتبسيط التعبير للوصول لـ $v_{n+1} = q \\cdot v_n$",
        "0.25 ن : استنتاج أساس المتتالية وحدها الأول $v_0$",
        "0.50 ن : التعبير الصريح لـ $u_n$ بدلالة $v_n$ ثم بدلالة $n$",
        "0.25 ن : حساب نهاية المتتالية مع التعليل بـ $\\lim q^n = 0$",
      ],
      baremeBreakdownFr: [
        "0.50 pt : Réduction au même dénominateur et factorisation de $q$",
        "0.25 pt : Détermination de la raison et du premier terme",
        "0.50 pt : Expression de $u_n$ en fonction de $n$",
        "0.25 pt : Calcul de la limite avec justification $|q| < 1$",
      ],
    });
  } else if (titleFr.includes("complexe") || titleAr.includes("عقدية")) {
    const re = model === "A" ? "2" : "4";
    const c = model === "A" ? "4" : "16";
    solutions.push({
      questionNumber: "1",
      questionText: `Résolution de l'équation $z^2 - ${re}\\sqrt{3}z + ${c} = 0$ dans $\\mathbb{C}$`,
      solutionTextAr: `حل المعادلة $z^2 - ${re}\\sqrt{3}z + ${c} = 0$ في $\\mathbb{C}$ :
نحسب مميز المعادلة $\\Delta = b^2 - 4ac$ :
$\\Delta = (-${re}\\sqrt{3})^2 - 4 \\times 1 \\times ${c} = ${Number(re)**2 * 3} - ${4 * Number(c)} = -${4 * Number(c) - Number(re)**2 * 3} < 0$.
بما أن $\\Delta < 0$، فإن المعادلة تقبل حلين عقديين مترافقين في $\\mathbb{C}$ :
$z_1 = \\frac{-b + i\\sqrt{-\\Delta}}{2a} = \\frac{${re}\\sqrt{3} + i\\sqrt{${4 * Number(c) - Number(re)**2 * 3}}}{2} = ${model === "A" ? "\\sqrt{3} + i" : "2\\sqrt{3} + 2i"}$.
$z_2 = \\overline{z_1} = ${model === "A" ? "\\sqrt{3} - i" : "2\\sqrt{3} - 2i"}$.
مجموعة الحلول : $S = \\{${model === "A" ? "\\sqrt{3} - i\\; ;\\; \\sqrt{3} + i" : "2\\sqrt{3} - 2i\\; ;\\; 2\\sqrt{3} + 2i"}\\}$.`,
      solutionTextFr: `Résolution de l'équation $z^2 - ${re}\\sqrt{3}z + ${c} = 0$ dans $\\mathbb{C}$ :
Calcul du discriminant : $\\Delta = (-${re}\\sqrt{3})^2 - 4(1)(${c}) = ${Number(re)**2 * 3} - ${4 * Number(c)} < 0$.
Comme $\\Delta < 0$, l'équation admet deux solutions complexes conjuguées :
$z_1 = \\frac{${re}\\sqrt{3} + i\\sqrt{|\\Delta|}}{2} = ${model === "A" ? "\\sqrt{3} + i" : "2\\sqrt{3} + 2i"}$ et $z_2 = \\overline{z_1}$.
Ensemble des solutions : $\\mathcal{S} = \\{z_1, z_2\\}$.`,
      bareme: "1.00 pt",
      baremeBreakdownAr: [
        "0.25 ن : حساب المميز $\\Delta$ وتحديد إشارته السالبة",
        "0.50 ن : كتابة صيغتي الحلين المترافقين وتطبيقهما عددياً",
        "0.25 ن : كتابة مجموعة الحلول $S$",
      ],
      baremeBreakdownFr: [
        "0.25 pt : Calcul exact de $\\Delta < 0$",
        "0.50 pt : Formules des solutions complexes conjuguées",
        "0.25 pt : Écriture finale de l'ensemble des solutions",
      ],
    });

    solutions.push({
      questionNumber: "2",
      questionText: `Forme trigonométrique et géométrie (Rotation)`,
      solutionTextAr: `1. الشكل المثلثي للعدد $a = \\sqrt{3} + i$ :
المعيار : $|a| = \\sqrt{(\\sqrt{3})^2 + 1^2} = \\sqrt{3 + 1} = 2$.
العمدة : $a = 2\\left(\\frac{\\sqrt{3}}{2} + \\frac{1}{2}i\\right) = 2\\left(\\cos\\frac{\\pi}{6} + i\\sin\\frac{\\pi}{6}\\right) = [2, \\frac{\\pi}{6}] = 2e^{i\\frac{\\pi}{6}}$.
2. صورة النقطة $A$ بالدوران $R(O, \\frac{\\pi}{3})$ :
التمثيل العقدي للدوران : $z' - z_\\Omega = e^{i\\theta}(z - z_\\Omega) \\implies z' = e^{i\\frac{\\pi}{3}} z_A$.
$d = e^{i\\frac{\\pi}{3}} \\times 2e^{i\\frac{\\pi}{6}} = 2e^{i(\\frac{\\pi}{3} + \\frac{\\pi}{6})} = 2e^{i\\frac{\\pi}{2}} = 2i = c$.
إذن النقطة $D$ تنطبق على النقطة $C$.`,
      solutionTextFr: `1. Forme trigonométrique et exponentielle de $a$ :
Module : $|a| = \\sqrt{3 + 1} = 2$.
Argument : $\\cos\\theta = \\frac{\\sqrt{3}}{2}$ et $\\sin\\theta = \\frac{1}{2} \\implies \\theta \\equiv \\frac{\\pi}{6} [2\\pi]$.
Forme trigonométrique : $a = 2\\left(\\cos\\frac{\\pi}{6} + i\\sin\\frac{\\pi}{6}\\right)$, et forme exponentielle : $a = 2e^{i\\frac{\\pi}{6}}$.
2. Image par la rotation $R(O, \\frac{\\pi}{3})$ :
Écriture complexe : $z' = e^{i\\pi/3} z$.
$z_D = e^{i\\pi/3} \\times 2e^{i\\pi/6} = 2e^{i(\\pi/3 + \\pi/6)} = 2e^{i\\pi/2} = 2i = c$.
Le point $D$ est confondu avec $C$.`,
      bareme: "1.25 pt",
      baremeBreakdownAr: [
        "0.25 ن : حساب المعيار بدقة",
        "0.25 ن : تحديد العمدة وكتابة الشكل المثلثي والأسي",
        "0.50 ن : الكتابة العقدية للدوران والتعويض بلحق النقطة A",
        "0.25 ن : الاستنتاج الهندسي لطبيعة المثلث أو تطابق النقطتين",
      ],
      baremeBreakdownFr: [
        "0.25 pt : Calcul du module",
        "0.25 pt : Argument et formes trigonométrique / exponentielle",
        "0.50 pt : Écriture complexe de la rotation",
        "0.25 pt : Déduction géométrique",
      ],
    });
  } else if (
    titleFr.includes("logarithm") ||
    titleFr.includes("exponentielle") ||
    titleAr.includes("لوغاريتم") ||
    titleAr.includes("أسي")
  ) {
    const k = model === "A" ? "2" : "3";
    solutions.push({
      questionNumber: "1",
      questionText: `Limites aux bornes et interprétation graphique (Asymptotes)`,
      solutionTextAr: `1. النهاية عند $0^+$ :
لدينا $\\lim_{x \\to 0^+} (${k}x - 1) = -1$ و $\\lim_{x \\to 0^+} \\ln(x) = -\\infty$ مع $\\lim_{x \\to 0^+} \\frac{1}{x} = +\\infty$.
إذن بالضرب: $\\lim_{x \\to 0^+} \\frac{\\ln(x)}{x} = -\\infty$.
وبالتالي : $\\lim_{x \\to 0^+} f(x) = -\\infty$.
التأويل الهندسي: المستقيم ذو المعادلة $x = 0$ (محور الأراتيب) مقارب عمودي للمنحنى $(C_f)$.
2. النهاية عند $+\\infty$ :
لدينا $\\lim_{x \\to +\\infty} (${k}x - 1) = +\\infty$ ونهاية اعتيادية $\\lim_{x \\to +\\infty} \\frac{\\ln(x)}{x} = 0$.
إذن : $\\lim_{x \\to +\\infty} f(x) = +\\infty$.
المقارب المائل: بما أن $\\lim_{x \\to +\\infty} [f(x) - (${k}x - 1)] = \\lim_{x \\to +\\infty} \\frac{\\ln(x)}{x} = 0$، فإن المستقيم $(\\Delta)$ ذو المعادلة $y = ${k}x - 1$ مقارب مائل للمنحنى $(C_f)$ بجوار $+\\infty$.`,
      solutionTextFr: `1. Limite en $0^+$ et asymptote verticale :
$\\lim_{x \\to 0^+} (${k}x - 1) = -1$ et $\\lim_{x \\to 0^+} \\ln(x) = -\\infty$ avec $\\lim_{x \\to 0^+} \\frac{1}{x} = +\\infty$.
Par produit : $\\lim_{x \\to 0^+} \\frac{\\ln x}{x} = -\\infty$, d'où $\\lim_{x \\to 0^+} f(x) = -\\infty$.
Interprétation : La droite d'équation $x = 0$ est une asymptote verticale à la courbe $(C_f)$.
2. Limite en $+\\infty$ et asymptote oblique :
On a la limite usuelle de croissances comparées $\\lim_{x \\to +\\infty} \\frac{\\ln x}{x} = 0$.
Donc $\\lim_{x \\to +\\infty} f(x) = +\\infty$.
Comme $\\lim_{x \\to +\\infty} [f(x) - (${k}x - 1)] = 0$, la droite d'équation $y = ${k}x - 1$ est asymptote oblique à $(C_f)$ au voisinage de $+\\infty$.`,
      bareme: "1.50 pt",
      baremeBreakdownAr: [
        "0.50 ن : حساب نهاية $0^+$ مع التعليل والتأويل الهندسي (مقارب عمودي)",
        "0.50 ن : حساب نهاية $+\\infty$ باستعمال النهاية الاعتيادية $\\lim \\frac{\\ln x}{x} = 0$",
        "0.50 ن : تبرير وجود المقارب المائل $y = ax+b$ بحساب الفرق",
      ],
      baremeBreakdownFr: [
        "0.50 pt : Limite en $0^+$, justification et asymptote verticale",
        "0.50 pt : Limite en $+\\infty$ via croissances comparées",
        "0.50 pt : Asymptote oblique par calcul de limite de $(f(x) - y)$",
      ],
    });

    solutions.push({
      questionNumber: "2",
      questionText: `Dérivée $f'(x)$, tableau de variations et tracé de $(C_f)$`,
      solutionTextAr: `1. حساب المشتقة $f'(x)$ لكل $x > 0$ :
الدالة $f$ قابلة للاشتقاق على $]0, +\\infty[$ كمجموع وخارج دوال اعتيادية قابلة للاشتقاق.
$f'(x) = (${k}x - 1)' + \\left(\\frac{\\ln x}{x}\\right)' = ${k} + \\frac{(\\frac{1}{x})x - (\\ln x)(1)}{x^2} = ${k} + \\frac{1 - \\ln x}{x^2} = \\frac{${k}x^2 + 1 - \\ln x}{x^2}$.
بما أن $${k}x^2 + 1 - \\ln x > 0$ لكل $x > 0$، فإن $f'(x) > 0$ قطعا على $]0, +\\infty[$.
2. جدول التغيرات :
الدالة $f$ تزايدية قطعا على المجال $]0, +\\infty[$.
3. الوضع النسبي وإنشاء المنحنى $(C_f)$ :
دراسة إشارة $f(x) - (${k}x - 1) = \\frac{\\ln x}{x}$ : المنحنى فوق $(\\Delta)$ على $]1, +\\infty[$ وتحت $(\\Delta)$ على $]0, 1[$ ويقطعه في النقطة $(1, ${Number(k) - 1})$.`,
      solutionTextFr: `1. Calcul de la dérivée pour tout $x > 0$ :
$f$ est dérivable sur $]0, +\\infty[$ comme somme et quotient de fonctions usuelles dérivables.
$f'(x) = ${k} + \\frac{(1/x)(x) - (\\ln x)(1)}{x^2} = ${k} + \\frac{1 - \\ln x}{x^2} = \\frac{${k}x^2 + 1 - \\ln x}{x^2}$.
Signe de $f'(x)$ : $f'(x) > 0$ sur $]0, +\\infty[$, la fonction est strictement croissante.
2. Tableau de variations complet avec limites aux bornes.
3. Position relative et tracé de la courbe $(C_f)$ par rapport à l'asymptote oblique $(\\Delta)$.`,
      bareme: "1.75 pt",
      baremeBreakdownAr: [
        "0.25 ن : ذكر قابلية الاشتقاق ومجالها",
        "0.50 ن : تطبيق قاعدة اشتقاق الخارج $(u/v)' = (u'v - uv')/v^2$ بدقة",
        "0.50 ن : دراسة إشارة $f'(x)$ ووضع جدول التغيرات بأسهم واضحة",
        "0.50 ن : إنشاء المنحنى مع المقاربات والنقط المميزة",
      ],
      baremeBreakdownFr: [
        "0.25 pt : Justification de la dérivabilité",
        "0.50 pt : Formule de dérivation du quotient $(u/v)'$",
        "0.50 pt : Signe de la dérivée et tableau de variations complet",
        "0.50 pt : Tracé soigné de $(C_f)$ et des asymptotes",
      ],
    });
  } else if (
    lesson.subCategory === "هندسة فضائية" ||
    titleFr.includes("espace") ||
    titleAr.includes("الفضائية")
  ) {
    const r = model === "A" ? "3" : "6";
    const dPlane = model === "A" ? "3" : "6";
    solutions.push({
      questionNumber: "1",
      questionText: `Produit vectoriel $\\vec{AB} \\wedge \\vec{AC}$ et équation cartésienne du plan $(P)$`,
      solutionTextAr: `1. حساب الجداء المتجهي $\\vec{AB} \\wedge \\vec{AC}$ :
لدينا إحداثيات المتجهتين: $\\vec{AB}(2, 0, -1)$ و $\\vec{AC}(0, 1, -1)$.
نحسب المحددات الصغرى:
$\\vec{AB} \\wedge \\vec{AC} = \\begin{vmatrix} 0 & 1 \\\\ -1 & -1 \\end{vmatrix}\\vec{i} - \\begin{vmatrix} 2 & 0 \\\\ -1 & -1 \\end{vmatrix}\\vec{j} + \\begin{vmatrix} 2 & 0 \\\\ 0 & 1 \\end{vmatrix}\\vec{k} = (0 - (-1))\\vec{i} - (-2 - 0)\\vec{j} + (2 - 0)\\vec{k} = \\vec{i} + 2\\vec{j} + 2\\vec{k}$.
بما أن $\\vec{AB} \\wedge \\vec{AC} \\neq \\vec{0}$، فإن النقط $A$ و $B$ و $C$ غير مستقيمية وتحدد مستوى $(P)$ متجهته المنظمية $\\vec{n}(1, 2, 2)$.
2. المعادلة الديكارتية للمستوى $(P)$ :
تكتب على الشكل $1x + 2y + 2z + d = 0$. وبما أن $A(1,0,2) \\in (P)$، فإن $1 + 0 + 4 + d = 0 \\implies d = -5$ (أو للمتغير الآخر $d = -${dPlane}$) ومنه المعادلة المختصرة: $x + 2y + 2z - ${dPlane} = 0$.`,
      solutionTextFr: `1. Calcul du produit vectoriel $\\vec{AB} \\wedge \\vec{AC}$ :
On a $\\vec{AB}(2, 0, -1)$ et $\\vec{AC}(0, 1, -1)$.
Par calcul des déterminants extraits :
$\\vec{AB} \\wedge \\vec{AC} = \\begin{vmatrix} 0 & 1 \\\\ -1 & -1 \\end{vmatrix}\\vec{i} - \\begin{vmatrix} 2 & 0 \\\\ -1 & -1 \\end{vmatrix}\\vec{j} + \\begin{vmatrix} 2 & 0 \\\\ 0 & 1 \\end{vmatrix}\\vec{k} = \\vec{i} + 2\\vec{j} + 2\\vec{k} \\neq \\vec{0}$.
Les points $A, B, C$ ne sont pas alignés et définissent un plan $(P)$ de vecteur normal $\\vec{n}(1, 2, 2)$.
2. Équation cartésienne de $(P)$ :
$x + 2y + 2z + d = 0$. En substituant les coordonnées du point $A$, on obtient : $x + 2y + 2z - ${dPlane} = 0$.`,
      bareme: "1.50 pt",
      baremeBreakdownAr: [
        "0.25 ن : تحديد إحداثيات المتجهتين $\\vec{AB}$ و $\\vec{AC}$",
        "0.75 ن : حساب مركبات الجداء المتجهي $\\vec{AB} \\wedge \\vec{AC}$",
        "0.50 ن : استنتاج المعادلة الديكارتية للمستوى $(P)$",
      ],
      baremeBreakdownFr: [
        "0.25 pt : Coordonnées des vecteurs $\\vec{AB}$ et $\\vec{AC}$",
        "0.75 pt : Calcul exact des composantes de $\\vec{AB} \\wedge \\vec{AC}$",
        "0.50 pt : Déduction de l'équation cartésienne du plan $(P)$",
      ],
    });

    solutions.push({
      questionNumber: "2",
      questionText: `Distance $d(\\Omega, (P))$ et intersection de la sphère $(S)$ et du plan $(P)$`,
      solutionTextAr: `1. حساب مسافة المركز $\\Omega$ عن المستوى $(P)$ :
$d(\\Omega, (P)) = \\frac{|x_\\Omega + 2y_\\Omega + 2z_\\Omega - ${dPlane}|}{\\sqrt{1^2 + 2^2 + 2^2}} = \\frac{|d_0|}{3} < R = ${r}$.
2. تقاطع الفلكة $(S)$ والمستوى $(P)$ :
بما أن $d(\\Omega, (P)) < R$، فإن المستوى $(P)$ يقطع الفلكة $(S)$ وفق دائرة $(\\Gamma)$ شعاعها $r = \\sqrt{R^2 - d^2}$، ومركزها $H$ المسقط العمودي للنقطة $\\Omega$ على المستوى $(P)$ المحدد بالتمثيل البارامتري للمستقيم $(\\Delta)$ المار من $\\Omega$ والعمودي على $(P)$.`,
      solutionTextFr: `1. Distance du centre $\\Omega$ au plan $(P)$ :
$d(\\Omega, (P)) = \\frac{|x_\\Omega + 2y_\\Omega + 2z_\\Omega - ${dPlane}|}{\\sqrt{1^2 + 2^2 + 2^2}} < R = ${r}$.
2. Intersection de $(S)$ et $(P)$ :
Comme $d(\\Omega, (P)) < R$, le plan $(P)$ coupe la sphère $(S)$ suivant un cercle $(\\Gamma)$ de rayon $r = \\sqrt{R^2 - d^2}$ et de centre $H$, projeté orthogonal de $\\Omega$ sur $(P)$ obtenu via la représentation paramétrique de la droite $(\\Delta) \\perp (P)$.`,
      bareme: "1.50 pt",
      baremeBreakdownAr: [
        "0.50 ن : تطبيق صيغة مسافة نقطة عن مستوى $d(\\Omega, (P))$",
        "0.50 ن : مقارنة المسافة $d$ مع الشعاع $R$ وحساب شعاع الدائرة $r = \\sqrt{R^2 - d^2}$",
        "0.50 ن : تحديد التمثيل البارامتري وإحداثيات المركز $H$",
      ],
      baremeBreakdownFr: [
        "0.50 pt : Formule et calcul de la distance $d(\\Omega, (P))$",
        "0.50 pt : Comparaison $d < R$ et calcul du rayon $r = \\sqrt{R^2 - d^2}$",
        "0.50 pt : Représentation paramétrique et coordonnées du centre $H$",
      ],
    });
  } else if (
    titleFr.includes("intégral") ||
    titleFr.includes("primitive") ||
    titleFr.includes("différentielle") ||
    titleAr.includes("التكاملي") ||
    titleAr.includes("التفاضلية")
  ) {
    solutions.push({
      questionNumber: "1",
      questionText: `Équation caractéristique et intégration par parties (IPP)`,
      solutionTextAr: `1. حل المعادلة التفاضلية :
نكتب المعادلة المميزة $r^2 - ar + b = 0$ ونحسب مميزها $\\Delta$، ثم نحدد الحل العام ونعوض بالشروط البدئية $y(0) = 1$ و $y'(0) = 0$.
2. حساب التكامل $I = \\int_0^1 (x+1)e^{-x} dx$ بالمكاملة بالأجزاء :
نضع $u(x) = x+1 \\implies u'(x) = 1$ و $v'(x) = e^{-x} \\implies v(x) = -e^{-x}$.
ومنه : $I = \\left[ -(x+1)e^{-x} \\right]_0^1 - \\int_0^1 (-e^{-x}) dx = (-2e^{-1} + 1) + \\left[ -e^{-x} \\right]_0^1 = 2 - \\frac{3}{e}$.`,
      solutionTextFr: `1. Résolution de l'équation différentielle :
Écriture de l'équation caractéristique associée, détermination de la solution générale puis application des conditions initiales $y(0)=1$ et $y'(0)=0$.
2. Calcul de l'intégrale par intégration par parties (IPP) :
On pose $u(x) = x+1 \\implies u'(x) = 1$ et $v'(x) = e^{-x} \\implies v(x) = -e^{-x}$.
D'après la formule d'IPP : $I = \\left[ -(x+1)e^{-x} \\right]_0^1 + \\int_0^1 e^{-x} dx = 2 - \\frac{3}{e}$ u.a.`,
      bareme: "1.50 pt",
      baremeBreakdownAr: [
        "0.50 ن : المعادلة المميزة والحل العام والخاص للمعادلة التفاضلية",
        "0.50 ن : اختيار الدالتين $u$ و $v'$ وتطبيق صيغة المكاملة بالأجزاء",
        "0.50 ن : حساب التكامل النهائي واستنتاج المساحة الهندسية بـ $\\text{cm}^2$",
      ],
      baremeBreakdownFr: [
        "0.50 pt : Équation caractéristique et solution particulière",
        "0.50 pt : Choix de $u, v'$ et application de la formule d'IPP",
        "0.50 pt : Calcul exact de $I$ et conversion de l'aire en $\\text{cm}^2$",
      ],
    });
  } else if (
    titleFr.includes("statistique") ||
    titleAr.includes("الإحصاء")
  ) {
    solutions.push({
      questionNumber: "1",
      questionText: questionsFr[0] || "Tableau des effectifs cumulés croissants, mode et médiane",
      solutionTextAr: `1. حساب الحصيصات المتراكمة والحصيص الإجمالي $N = \\sum n_i$.
- المنوال هو قيمة الميزة ذات أكبر حصيص.
- القيمة الوسطية $M_e$ هي أصغر قيمة للميزة حصيصها المتراكم أكبر من أو يساوي $\\frac{N}{2}$.`,
      solutionTextFr: `1. Calcul des effectifs cumulés croissants et de l'effectif total $N = \\sum n_i$.
- Le mode est la valeur du caractère correspondant au plus grand effectif.
- La médiane $M_e$ est la plus petite valeur dont l'effectif cumulé est supérieur ou égal à $\\frac{N}{2}$.`,
      bareme: "1.50 pt",
      baremeBreakdownAr: [
        "0.50 ن : إتمام جدول الحصيصات المتراكمة وحساب الحصيص الإجمالي $N$",
        "0.50 ن : تحديد المنوال مع التعليل",
        "0.50 ن : تحديد القيمة الوسطية $M_e$",
      ],
      baremeBreakdownFr: [
        "0.50 pt : Effectifs cumulés croissants et effectif total $N$",
        "0.50 pt : Identification du mode",
        "0.50 pt : Détermination de la médiane $M_e$",
      ],
    });
    solutions.push({
      questionNumber: "2",
      questionText: questionsFr[1] || "Moyenne arithmétique, variance et écart-type",
      solutionTextAr: `2. المعدل الحسابي $\\bar{x} = \\frac{1}{N} \\sum n_i x_i$.
- المغايرة $V = \\frac{1}{N} \\sum n_i (x_i - \\bar{x})^2 = \\frac{1}{N}\\sum n_i x_i^2 - \\bar{x}^2$، والانحراف الطرازي $\\sigma = \\sqrt{V}$.`,
      solutionTextFr: `2. Moyenne arithmétique : $\\bar{x} = \\frac{1}{N} \\sum n_i x_i$.
- Variance : $V = \\frac{1}{N} \\sum n_i x_i^2 - \\bar{x}^2$ et écart-type $\\sigma = \\sqrt{V}$.`,
      bareme: "1.50 pt",
      baremeBreakdownAr: [
        "0.50 ن : تطبيق صيغة المعدل الحسابي $\\bar{x}$",
        "0.50 ن : حساب المغايرة $V$",
        "0.50 ن : استنتاج الانحراف الطرازي $\\sigma = \\sqrt{V}$",
      ],
      baremeBreakdownFr: [
        "0.50 pt : Calcul de la moyenne arithmétique $\\bar{x}$",
        "0.50 pt : Calcul de la variance $V$",
        "0.50 pt : Calcul de l'écart-type $\\sigma = \\sqrt{V}$",
      ],
    });
  } else if (
    titleFr.includes("dénombrement") ||
    titleAr.includes("التعداد")
  ) {
    solutions.push({
      questionNumber: "1",
      questionText: questionsFr[0] || "Dénombrement : tirages simultanés (combinaisons) et successifs (arrangements)",
      solutionTextAr: `1. السحب آنياً: نستعمل التأليفات $C_n^p = \\frac{n!}{p!(n-p)!}$ لتحديد عدد السحبات الممكنة.
2. السحب بالتتابع وبدون إحلال: الترتيب مهم، نستعمل الترتيبات $A_n^p = \\frac{n!}{(n-p)!}$.
3. السحب بالتتابع وبإحلال: عدد الإمكانيات هو $n^p$.`,
      solutionTextFr: `1. Tirage simultané : l'ordre n'intervient pas, on utilise les combinaisons $C_n^p = \\frac{n!}{p!(n-p)!}$.
2. Tirage successif sans remise : l'ordre intervient, on utilise les arrangements $A_n^p = \\frac{n!}{(n-p)!}$.
3. Tirage successif avec remise : le nombre de tirages possibles est $n^p$.`,
      bareme: "1.50 pt",
      baremeBreakdownAr: [
        "0.50 ن : اختيار النموذج التعدادي المناسب ($C_n^p$ أو $A_n^p$ أو $n^p$)",
        "0.50 ن : تفكيك الحالات وحساب عدد الإمكانيات",
        "0.50 ن : النتيجة العددية النهائية المضبوطة",
      ],
      baremeBreakdownFr: [
        "0.50 pt : Choix du modèle de dénombrement ($C_n^p$, $A_n^p$ ou $n^p$)",
        "0.50 pt : Décomposition des cas et calculs intermédiaires",
        "0.50 pt : Résultat numérique exact",
      ],
    });
  } else if (
    titleFr.includes("barycentre") ||
    titleAr.includes("المرجح")
  ) {
    solutions.push({
      questionNumber: "1",
      questionText: questionsFr[0] || "Existence, relation vectorielle et associativité du barycentre",
      solutionTextAr: `1. شرط الوجود: مجموع المعاملات غير منعدم ($\\alpha + \\beta \\neq 0$).
2. العلاقة المتجهية: $\\alpha\\vec{GA} + \\beta\\vec{GB} = \\vec{0} \\implies \\vec{AG} = \\frac{\\beta}{\\alpha + \\beta}\\vec{AB}$.
3. خاصية التجميعية: بتعويض $(A,\\alpha)$ و $(B,\\beta)$ بمرجحهما الجزئي $(G, \\alpha+\\beta)$ نستنتج استقامية النقط.`,
      solutionTextFr: `1. Condition d'existence : la somme des coefficients est non nulle ($\\alpha + \\beta \\neq 0$).
2. Relation vectorielle : $\\alpha\\vec{GA} + \\beta\\vec{GB} = \\vec{0} \\implies \\vec{AG} = \\frac{\\beta}{\\alpha + \\beta}\\vec{AB}$.
3. Associativité du barycentre : on remplace $(A,\\alpha)$ et $(B,\\beta)$ par leur barycentre partiel $(G, \\alpha+\\beta)$ pour conclure à l'alignement.`,
      bareme: "1.50 pt",
      baremeBreakdownAr: [
        "0.50 ن : التحقق من شرط وجود المرجح وحساب $\\vec{AG}$",
        "0.50 ن : تطبيق خاصية التجميعية واستنتاج الاستقامية",
        "0.50 ن : تحديد مجموعة النقط $(\\Gamma)$ بدقة",
      ],
      baremeBreakdownFr: [
        "0.50 pt : Existence du barycentre et expression de $\\vec{AG}$",
        "0.50 pt : Associativité du barycentre et alignement",
        "0.50 pt : Caractérisation géométrique de l'ensemble $(\\Gamma)$",
      ],
    });
  } else if (
    lesson.subCategory === "احتمالات وإحصاء" ||
    titleFr.includes("probabilit") ||
    titleAr.includes("الاحتمالات")
  ) {
    solutions.push({
      questionNumber: "1",
      questionText: `Dénombrement ($C_n^p$), probabilité d'événements et variable aléatoire $X$`,
      solutionTextAr: `1. السحب آني، إذن كل إمكانية هي تأليفة من 3 كرات من بين $N$ كرات: $\\text{Card}(\\Omega) = C_N^3$.
- احتمال الحدث $A$ (نفس اللون): $P(A) = \\frac{C_{n_R}^3 + C_{n_V}^3}{C_N^3}$.
- احتمال الحدث $B$ (كرة بيضاء على الأقل): نستعمل الحدث المضاد $\\overline{B}$ (عدم سحب أي كرة بيضاء): $P(B) = 1 - P(\\overline{B})$.
2. قانون احتمال المتغير العشوائي $X$ والأمل الرياضي :
مجموعة قيم $X$ هي $X(\\Omega) = \\{0, 1, 2, 3\\}$. نحسب $P(X = k)$ لكل $k$ ثم نستنتج الأمل الرياضي $E(X) = \\sum k \\cdot P(X = k)$.`,
      solutionTextFr: `1. Le tirage étant simultané, le cardinal de l'univers est $\\text{Card}(\\Omega) = \\binom{N}{3}$.
- Événement $A$ (même couleur) : $P(A) = \\frac{\\binom{n_R}{3} + \\binom{n_V}{3}}{\\binom{N}{3}}$.
- Événement $B$ (au moins une blanche) par passage à l'événement contraire : $P(B) = 1 - P(\\overline{B})$.
2. Loi de probabilité de $X$ et espérance :
$X(\\Omega) = \\{0, 1, 2, 3\\}$. On détermine $P(X = k)$ pour chaque valeur puis on calcule $E(X) = \\sum_{k=0}^3 k P(X = k)$.`,
      bareme: "1.50 pt",
      baremeBreakdownAr: [
        "0.25 ن : تحديد عدد الإمكانيات $\\text{Card}(\\Omega) = C_N^3$",
        "0.50 ن : حساب $P(A)$ و $P(B)$ باستعمال الحدث المضاد",
        "0.50 ن : تحديد قيم $X(\\Omega)$ وجدول قانون الاحتمال",
        "0.25 ن : حساب الأمل الرياضي $E(X)$",
      ],
      baremeBreakdownFr: [
        "0.25 pt : Cardinal de l'univers $\\text{Card}(\\Omega)$",
        "0.50 pt : Calcul de $P(A)$ et $P(B)$ via l'événement contraire",
        "0.50 pt : Tableau de la loi de probabilité de $X$",
        "0.25 pt : Calcul de l'espérance mathématique $E(X)$",
      ],
    });
  } else if (titleFr.includes("vector") || titleAr.includes("المتجهي")) {
    const isModelA = model === "A";
    const k1 = isModelA ? "\\frac{3}{2}" : "\\frac{9}{2}";
    const k2 = isModelA ? "3\\vec{AC} - \\vec{AB}" : "5\\vec{AC} - 3\\vec{AB}";
    const kMN = isModelA ? "-\\frac{5}{2}\\vec{AB} + 3\\vec{AC}" : "-\\frac{15}{2}\\vec{AB} + 5\\vec{AC}";
    solutions.push({
      questionNumber: "1",
      questionText: questionsFr[0] || questionsAr[0] || "Construction vectorielle des points M et N",
      solutionTextAr: `إنشاء النقطتين $M$ و $N$ في المثلث $ABC$ :
- النقطة $M$ تحقق $\\vec{AM} = ${k1}\\vec{AB}$ : تنتمي إلى نصف المستقيم $[AB)$ خارج القطعة $[AB]$.
- النقطة $N$ تحقق $\\vec{AN} = ${k2}$ : ننشئ متوازي الأضلاع المحدد بالمتجهتين انطلاقاً من الرأس $A$.`,
      solutionTextFr: `Construction géométrique des points $M$ et $N$ :
- Pour $M$ tel que $\\vec{AM} = ${k1}\\vec{AB}$ : placer $M$ sur la demi-droite $[AB)$ au-delà de $B$ en reportant la fraction correspondante de $AB$.
- Pour $N$ tel que $\\vec{AN} = ${k2}$ : construire la somme vectorielle par la règle du parallélogramme à partir de l'origine $A$.`,
      bareme: "1.50 pt",
      baremeBreakdownAr: [
        "0.75 ن : دقة إنشاء النقطة M على الحامل (AB) مع احترام المنحى والمنظم",
        "0.75 ن : دقة إنشاء النقطة N كتركيب متجهتين من الأصل A",
      ],
      baremeBreakdownFr: [
        "0.75 pt : Placement exact du point $M$ sur la droite $(AB)$",
        "0.75 pt : Construction exacte du point $N$ par combinaison linéaire",
      ],
    });

    solutions.push({
      questionNumber: "2",
      questionText: questionsFr[1] || questionsAr[1] || "Relation de Chasles : expression de MN⃗ et MP⃗",
      solutionTextAr: `1. إثبات علاقة المتجهة $\\vec{MN}$ باستعمال علاقة شال :
$\\vec{MN} = \\vec{MA} + \\vec{AN} = -\\vec{AM} + \\vec{AN} = -${k1}\\vec{AB} + (${k2}) = ${kMN}$.
2. التعبير عن المتجهة $\\vec{MP}$ بدلالة $\\vec{AB}$ و $\\vec{AC}$ حيث $\\vec{BP} = \\frac{6}{5}\\vec{BC}$ :
حسب علاقة شال : $\\vec{MP} = \\vec{MB} + \\vec{BP} = (\\vec{MA} + \\vec{AB}) + \\frac{6}{5}(\\vec{BA} + \\vec{AC})$
$\\vec{MP} = \\left(-\\frac{3}{2} + 1 - \\frac{6}{5}\\right)\\vec{AB} + \\frac{6}{5}\\vec{AC} = -\\vec{AB} + \\frac{6}{5}\\vec{AC}$.`,
      solutionTextFr: `1. Expression de $\\vec{MN}$ par la relation de Chasles :
$\\vec{MN} = \\vec{MA} + \\vec{AN} = -\\vec{AM} + \\vec{AN} = -${k1}\\vec{AB} + (${k2}) = ${kMN}$.
2. Expression de $\\vec{MP}$ en fonction de $\\vec{AB}$ et $\\vec{AC}$ (avec $\\vec{BP} = \\frac{6}{5}\\vec{BC}$) :
Par la relation de Chasles : $\\vec{MP} = \\vec{MA} + \\vec{AB} + \\vec{BP} = -\\frac{3}{2}\\vec{AB} + \\vec{AB} + \\frac{6}{5}(\\vec{BA} + \\vec{AC})$
$\\vec{MP} = -\\frac{1}{2}\\vec{AB} - \\frac{6}{5}\\vec{AB} + \\frac{6}{5}\\vec{AC} = -\\vec{AB} + \\frac{6}{5}\\vec{AC}$.`,
      bareme: "2.00 pt",
      baremeBreakdownAr: [
        "1.00 ن : إدراج النقطة A بعلاقة شال وتبسيط تعبير $\\vec{MN}$",
        "1.00 ن : تفكيك $\\vec{MP}$ و $\\vec{BC}$ بعلاقة شال والوصول للتعبير المختزل",
      ],
      baremeBreakdownFr: [
        "1.00 pt : Application de la relation de Chasles pour établir $\\vec{MN}$",
        "1.00 pt : Décomposition de $\\vec{MP}$ et $\\vec{BC}$ dans la base $(\\vec{AB}, \\vec{AC})$",
      ],
    });

    solutions.push({
      questionNumber: "3",
      questionText: questionsFr[2] || questionsAr[2] || "Colinéarité de MN⃗ et MP⃗ et alignement",
      solutionTextAr: `استقامية المتجهتين $\\vec{MN}$ و $\\vec{MP}$ واستنتاج استقامية النقط :
نلاحظ من السؤال السابق أن :
$\\vec{MN} = -\\frac{5}{2}\\vec{AB} + 3\\vec{AC} = \\frac{5}{2}\\left(-\\vec{AB} + \\frac{6}{5}\\vec{AC}\\right) = \\frac{5}{2}\\vec{MP}$.
إذن توجد علاقة خطية $\\vec{MN} = k\\vec{MP}$ مع $k = \\frac{5}{2} \\in \\mathbb{R}$، وبالتالي المتجهتان $\\vec{MN}$ و $\\vec{MP}$ مستقيميتان.
وبما أن لهما نقطة مشتركة $M$، فإن النقط $M$ و $N$ و $P$ نقط مستقيمية.`,
      solutionTextFr: `Colinéarité de $\\vec{MN}$ et $\\vec{MP}$ et alignement des points $M, N, P$ :
En factorisant par $\\frac{5}{2}$ dans l'expression de $\\vec{MN}$ :
$\\vec{MN} = -\\frac{5}{2}\\vec{AB} + 3\\vec{AC} = \\frac{5}{2}\\left(-\\vec{AB} + \\frac{6}{5}\\vec{AC}\\right) = \\frac{5}{2}\\vec{MP}$.
Les vecteurs $\\vec{MN}$ et $\\vec{MP}$ sont donc colinéaires ($k = \\frac{5}{2}$).
Ayant le point $M$ en commun, on en déduit que les points $M, N$ et $P$ sont alignés.`,
      bareme: "1.50 pt",
      baremeBreakdownAr: [
        "1.00 ن : إيجاد معامل الاستقامية $k = \\frac{5}{2}$ بحيث $\\vec{MN} = \\frac{5}{2}\\vec{MP}$",
        "0.50 ن : استنتاج استقامية النقط $M$ و $N$ و $P$",
      ],
      baremeBreakdownFr: [
        "1.00 pt : Mise en évidence du coefficient de colinéarité $\\vec{MN} = \\frac{5}{2}\\vec{MP}$",
        "0.50 pt : Conclusion rigoureuse sur l'alignement des points $M, N$ et $P$",
      ],
    });
  } else if (titleFr.includes("projection") || titleAr.includes("الإسقاط")) {
    solutions.push({
      questionNumber: "1",
      questionText: questionsFr[0] || questionsAr[0] || "Conservation du coefficient de colinéarité par projection",
      solutionTextAr: `التعبير عن المتجهة $\\vec{AD'}$ بدلالة $\\vec{AC}$ :
ليكن $p$ الإسقاط على المستقيم $(AC)$ بتوازٍ مع المستقيم $(BC)$.
لدينا : $p(A) = A$ (لأن $A \\in (AC)$)، و $p(B) = C$ (لأن $C \\in (AC)$ و $(BC) \\parallel (BC)$)، و $p(D) = D'$.
بما أن النقطة $D$ تحقق العلاقة المتجهية $\\vec{AD} = \\frac{1}{3}\\vec{AB}$، وحسب خاصية الحفاظ على معامل استقامية متجهتين بالإسقاط، فإن :
$\\vec{AD'} = \\frac{1}{3}\\vec{AC}$.`,
      solutionTextFr: `Expression de $\\vec{AD'}$ en fonction de $\\vec{AC}$ :
Soit $p$ la projection sur $(AC)$ parallèlement à $(BC)$.
On a $p(A) = A$, $p(B) = C$ et $p(D) = D'$.
Comme $\\vec{AD} = \\frac{1}{3}\\vec{AB}$, et que la projection conserve le coefficient de colinéarité (forme vectorielle du théorème de Thalès), on obtient directement :
$\\vec{AD'} = \\frac{1}{3}\\vec{AC}$.`,
      bareme: "1.00 pt",
      baremeBreakdownAr: [
        "0.50 ن : تحديد صور النقط A و B و D بالإسقاط p",
        "0.50 ن : تطبيق خاصية الحفاظ على معامل الاستقامية واستنتاج $\\vec{AD'} = \\frac{1}{3}\\vec{AC}$",
      ],
      baremeBreakdownFr: [
        "0.50 pt : Identification des projetés de $A, B$ et $D$ sur $(AC)$ parallèlement à $(BC)$",
        "0.50 pt : Conservation du coefficient de colinéarité $\\vec{AD'} = \\frac{1}{3}\\vec{AC}$",
      ],
    });

    solutions.push({
      questionNumber: "2",
      questionText: questionsFr[1] || questionsAr[1] || "Conservation du milieu d'un segment par projection",
      solutionTextAr: `إثبات أن $J$ منتصف القطعة $[AC]$ :
ليكن $p'$ الإسقاط على المستقيم $(AC)$ بتوازٍ مع المستقيم $(AB)$.
لدينا $p'(B) = A$ (لأن $A \\in (AC)$ و $(BA) \\parallel (AB)$)، و $p'(C) = C$، و $p'(I) = J$.
بما أن $I$ منتصف القطعة $[BC]$ (أي $\\vec{BI} = \\frac{1}{2}\\vec{BC}$)، وبما أن الإسقاط يحافظ على المنتصف، فإن $J = p'(I)$ هي منتصف القطعة $[AC]$، أي $\\vec{AJ} = \\frac{1}{2}\\vec{AC}$.`,
      solutionTextFr: `Démonstration que $J$ est le milieu du segment $[AC]$ :
Soit $p'$ la projection sur $(AC)$ parallèlement à $(AB)$.
On a $p'(B) = A$, $p'(C) = C$ et $p'(I) = J$.
Comme $I$ est le milieu de $[BC]$ ($\\vec{BI} = \\frac{1}{2}\\vec{BC}$) et que la projection conserve le milieu d'un segment, son projeté $J$ est le milieu de $[AC]$, d'où $\\vec{AJ} = \\frac{1}{2}\\vec{AC}$.`,
      bareme: "1.00 pt",
      baremeBreakdownAr: [
        "0.50 ن : تحديد مساقط B و C و I على (AC) بتوازٍ مع (AB)",
        "0.50 ن : توظيف خاصية الحفاظ على المنتصف بالإسقاط",
      ],
      baremeBreakdownFr: [
        "0.50 pt : Identification des images de $B, C$ et $I$ par la projection $p'$",
        "0.50 pt : Application de la conservation du milieu par projection",
      ],
    });

    solutions.push({
      questionNumber: "3",
      questionText: questionsFr[2] || questionsAr[2] || "Relation vectorielle D'J⃗ = (1/6)AC⃗ et réciproque",
      solutionTextAr: `1. إثبات أن $\\vec{D'J} = \\frac{1}{6}\\vec{AC}$ :
حسب علاقة شال : $\\vec{D'J} = \\vec{AJ} - \\vec{AD'} = \\frac{1}{2}\\vec{AC} - \\frac{1}{3}\\vec{AC} = \\left(\\frac{3 - 2}{6}\\right)\\vec{AC} = \\frac{1}{6}\\vec{AC}$.
2. استنتاج مسقط النقطة $K$ (حيث $\\vec{BK} = \\frac{1}{3}\\vec{BC}$) على $(AC)$ بتوازٍ مع $(AB)$ :
بالإسقاط $p'$ على $(AC)$ بتوازٍ مع $(AB)$، مسقط $B$ هو $A$ ومسقط $C$ هو $C$.
بما أن $\\vec{BK} = \\frac{1}{3}\\vec{BC}$ و $\\vec{AD'} = \\frac{1}{3}\\vec{AC}$، فإن $D'$ هي مسقط النقطة $K$ على $(AC)$ بتوازٍ مع $(AB)$.`,
      solutionTextFr: `1. Preuve que $\\vec{D'J} = \\frac{1}{6}\\vec{AC}$ :
Par la relation de Chasles : $\\vec{D'J} = \\vec{AJ} - \\vec{AD'} = \\frac{1}{2}\\vec{AC} - \\frac{1}{3}\\vec{AC} = \\frac{1}{6}\\vec{AC}$.
2. Déduction pour le point $K$ tel que $\\vec{BK} = \\frac{1}{3}\\vec{BC}$ :
Par la projection $p'$ sur $(AC)$ parallèlement à $(AB)$, l'image de $B$ est $A$ et l'image de $C$ est $C$.
Comme $\\vec{BK} = \\frac{1}{3}\\vec{BC}$ et $\\vec{AD'} = \\frac{1}{3}\\vec{AC}$, l'unicité du projeté assure que $D'$ est le projeté de $K$ sur $(AC)$ parallèlement à $(AB)$.`,
      bareme: "1.00 pt",
      baremeBreakdownAr: [
        "0.50 ن : حساب $\\vec{D'J} = \\vec{AJ} - \\vec{AD'} = \\frac{1}{6}\\vec{AC}$",
        "0.50 ن : استنتاج أن $D'$ مسقط $K$ بتوظيف الخاصية العكسية",
      ],
      baremeBreakdownFr: [
        "0.50 pt : Calcul vectoriel $\\vec{D'J} = \\vec{AJ} - \\vec{AD'} = \\frac{1}{6}\\vec{AC}$",
        "0.50 pt : Déduction par conservation du rapport $\\frac{1}{3}$",
      ],
    });
  } else {
    // حل عام مهيكل وفق النموذج البيداغوجي المغربي لجميع الدروس الأخرى
    const capsAr = safeLesson.capacitiesAr || [];
    const capsFr = safeLesson.capacitiesFr || [];
    const cap0Ar = capsAr[0] || safeLesson.lessonAr;
    const cap1Ar = capsAr[1] || cap0Ar;
    const cap0Fr = capsFr[0] || safeLesson.lessonFr;
    const cap1Fr = capsFr[1] || cap0Fr;

    solutions.push({
      questionNumber: "1",
      questionText: questionsFr[0] || questionsAr[0] || `Application directe : ${cap0Fr}`,
      solutionTextAr: `عناصر الإجابة والتطبيق المباشر لقواعد « ${cap0Ar} » :
1. تذكير بالخاصية الأساسية المطبقة وشروط صحتها (${lesson.subCategory || "رياضيات"}).
2. التعويض بالمعطيات العددية المحددة في نص التمرين وإجراء العمليات الحسابية خطوة بخطوة.
3. الاختزال والوصول إلى النتيجة المبسطة مع التأطير أو كتابة مجموعة الحلول.`,
      solutionTextFr: `Éléments de réponse et méthode pour « ${cap0Fr} » :
1. Rappel de la propriété du cours (${lesson.subCategoryFr || "Mathématiques"}) et vérification des hypothèses requises.
2. Remplacement numérique pas à pas selon les paramètres du modèle (${model}).
3. Simplification algébrique rigoureuse et formulation de la conclusion finale.`,
      bareme: "1.00 pt",
      baremeBreakdownAr: [
        "0.25 ن : تذكر القاعدة أو الخاصية الديداكتيكية",
        "0.50 ن : دقة الحساب الجبري والمراحل الوسيطة",
        "0.25 ن : تقديم النتيجة النهائية والتأكد من ملاءمتها",
      ],
      baremeBreakdownFr: [
        "0.25 pt : Formulation du théorème ou de la formule",
        "0.50 pt : Calculs intermédiaires rigoureux",
        "0.25 pt : Conclusion et résultat final encadré",
      ],
      pedagogicalNoteAr: "توجيه تصحيحي: مراعاة الخطوات الحسابية وعدم حرمان التلميذ من النقط كاملة في حالة خطأ إشاري بسيط مع صحة المنهجية.",
      pedagogicalNoteFr: "Consigne d'évaluation : Valoriser la démarche méthodologique même en présence d'une erreur de calcul mineure.",
    });

    solutions.push({
      questionNumber: "2",
      questionText: questionsFr[1] || questionsAr[1] || `Mobilisation et raisonnement : ${cap1Fr}`,
      solutionTextAr: `تعبئة الموارد والبرهان الاستدلالي حول « ${cap1Ar} » :
1. تحديد المعطيات واستحضار مبرهنات الربط المنطقي المناسبة (استلزام، تكافؤ، أو استدلال بالخلف).
2. بناء البرهان الرياضي المنظم بالانتقال من الفرض إلى النتيجة.
3. صياغة الاستنتاج الرياضي النهائي بدقة.`,
      solutionTextFr: `Mobilisation des compétences pour « ${cap1Fr} » :
1. Identification des hypothèses et choix de la démarche démonstrative appropriée.
2. Enchaînement déductif structuré reliant les lemmes au résultat cherché.
3. Synthèse et réponse aux exigences du cadre de référence officiel.`,
      bareme: "1.25 pt",
      baremeBreakdownAr: [
        "0.50 ن : حسن اختيار المنهجية والمبرهنة الملائمة",
        "0.50 ن : ترابط خطوات الاستدلال الرياضي وسلامة الصياغة",
        "0.25 ن : الخاتمة والاستنتاج النهائي",
      ],
      baremeBreakdownFr: [
        "0.50 pt : Choix judicieux de la méthode de démonstration",
        "0.50 pt : Rigueur des déductions logiques intermédiaires",
        "0.25 pt : Synthèse finale conforme aux attendus",
      ],
    });
  }

  // ضمان مطابقة عدد عناصر الحل مع عدد أسئلة التمرين الفعلي (3 أو 5 أو 7 أو أسئلة مخصصة)
  const targetQuestionCount = Math.max(questionsAr.length, questionsFr.length);
  if (targetQuestionCount > solutions.length) {
    for (let qIdx = solutions.length; qIdx < targetQuestionCount; qIdx++) {
      const qArText = questionsAr[qIdx] || `السؤال ${qIdx + 1}`;
      const qFrText = questionsFr[qIdx] || `Question ${qIdx + 1}`;
      const cleanQAr = qArText.replace(/^\d+[\.\)]\s*/, "");
      const cleanQFr = qFrText.replace(/^\d+[\.\)]\s*/, "");
      const capAr =
        (capsAr.length > 0 ? capsAr[qIdx % capsAr.length] : null) ||
        safeLesson.lessonAr;
      const capFr =
        (capsFr.length > 0 ? capsFr[qIdx % capsFr.length] : null) ||
        safeLesson.lessonFr;

      const lowerQ = `${qArText} ${qFrText}`.toLowerCase();
      let specificStepsAr = `1. استثمار نتائج الأسئلة السابقة وتوظيف خاصية « ${capAr} ».\n2. إجراء التحويلات الجبرية أو التحليلية اللازمة مع تعليل كل تكافؤ أو استلزام منطقي.\n3. استخلاص النتيجة النهائية وتأطيرها بوضوح.`;
      let specificStepsFr = `1. Exploitation des résultats précédents et mobilisation de la capacité « ${capFr} ».\n2. Développement analytique ou algébrique rigoureux en justifiant chaque étape logique.\n3. Conclusion explicite et encadrement du résultat final.`;
      let noteAr = "توجيه بيداغوجي للمصحح: تقبل كل طريقة رياضية مكافئة وسليمة، مع عدم معاقبة التلميذ مرتين على خطأ حسابي سابق.";
      let noteFr = "Directive d'évaluation : Valoriser toute démarche mathématique équivalente et cohérente (erreur reportée non doublement sanctionnée).";

      const isTcGeneralFunctions =
        lesson.lessonAr.includes("عموميات") ||
        lesson.lessonAr.includes("مرجعية") ||
        lesson.lessonAr.includes("اعتيادية") ||
        lesson.lessonFr.toLowerCase().includes("généralités");

      if (
        !isTcGeneralFunctions &&
        (lowerQ.includes("مشتق") || lowerQ.includes("تغيرات") || lowerQ.includes("dériv") || lowerQ.includes("variation"))
      ) {
        specificStepsAr = `1. التذكير بقابلية الاشتقاق على مجال الدراسة وتطبيق قواعد اشتقاق العمليات والمركب.\n2. توحيد المقامات وتعميل التعبير البسطي لربط إشارة المشتقة بإشارة التعبير المساعد.\n3. استنتاج رتابة الدالة بدقة وإنشاء جدول التغيرات مستوفياً لمجالات التعريف والنهايات والقيم الحدية.`;
        specificStepsFr = `1. Justifier la dérivabilité sur l'intervalle d'étude et appliquer les formules de dérivation.\n2. Factoriser l'expression obtenue afin d'identifier clairement le signe de la dérivée.\n3. En déduire le sens de variation strict et dresser le tableau de variations complet (bornes, signes, flèches et extremums).`;
        noteAr = "خطأ شائع يجب الانتباه إليه: نسيان تبرير قابلية الاشتقاق قبل حساب المشتقة أو إغفال إشارة المقام في جدول التغيرات.";
        noteFr = "Erreur fréquente à surveiller : Omission de la justification de dérivabilité ou confusion entre signe de f'(x) et signe de f(x).";
      } else if (lowerQ.includes("مقارب") || lowerQ.includes("نهاي") || lowerQ.includes("asymptote") || lowerQ.includes("limite")) {
        specificStepsAr = `1. حساب النهاية عند المحد المطلوب مع إزالة الشكل غير المحدد (إن وجد) بالتعميل أو النهايات الاعتيادية.\n2. حساب نهاية الفرق lim [f(x) - (ax + b)] = 0 لإثبات معادلة المستقيم المقارب المائل.\n3. دراسة إشارة الفرق f(x) - y لتحديد الوضع النسبي للمنحنى (C_f) والمستقيم المقارب.`;
        specificStepsFr = `1. Calculer la limite aux bornes en levant l'indétermination éventuelle par factorisation ou croissances comparées.\n2. Vérifier que lim [f(x) - (ax + b)] = 0 pour établir l'équation de l'asymptote.\n3. Étudier le signe de la différence f(x) - y pour préciser la position relative de (C_f) et de la droite.`;
        noteAr = "خطأ شائع: الاكتفاء بحساب النهاية دون صياغة التأويل الهندسي الصريح (معادلة المستقيم المقارب والوضع النسبي).";
        noteFr = "Point de vigilance : Exiger la formulation géométrique complète (équation de l'asymptote et voisinage concerné).";
      } else if (lowerQ.includes("تكامل") || lowerQ.includes("أصلي") || /\bintégral/.test(lowerQ) || /\bprimitive/.test(lowerQ)) {
        specificStepsAr = `1. التحقق من اتصال الدالة على مجال المكاملة وتحديد الدالة الأصلية أو وضع عناصر المكاملة بالأجزاء (u, v').\n2. تطبيق صيغة نيوتن-لايبنتز [F(x)]_a^b مع تعويض المحدين العلوي والسفلي بدقة.\n3. بالنسبة لحساب المساحة الهندسية: ضرب التكامل في وحدة المساحة ||i⃗|| × ||j⃗|| مع مراعاة القيمة المطلقة |f(x) - y|.`;
        specificStepsFr = `1. Justifier la continuité sur le segment d'intégration et identifier une primitive ou poser l'intégration par parties.\n2. Appliquer la formule fondamentale [F(x)]_a^b en détaillant le calcul aux bornes.\n3. Pour le calcul d'aire : multiplier l'intégrale de |f(x) - y| par l'unité d'aire graphique ||i⃗|| × ||j⃗|| en cm².`;
        noteAr = "خطأ شائع: نسيان القيمة المطلقة أو عدم ضرب النتيجة في وحدة المساحة (cm²) عند الانتقال من التكامل إلى المساحة الهندسية.";
        noteFr = "Erreur classique : Oubli de l'unité d'aire graphique (en cm²) ou de la valeur absolue |f(x) - g(x)|.";
      } else if (lowerQ.includes("ترجع") || lowerQ.includes("متقارب") || lowerQ.includes("رتاب") || lowerQ.includes("récurrence") || lowerQ.includes("converg") || lowerQ.includes("monoton")) {
        specificStepsAr = `1. التحقق من صحة الخاصية من أجل الحد الأول (أساس الترجع)، ثم افتراض صحتها لرتبة n والبرهان عليها لرتبة n+1.\n2. دراسة إشارة الفرق u_{n+1} - u_n (أو توظيف رتابة الدالة المرفقة f) لاستنتاج رتابة المتتالية.\n3. تطبيق مبرهنة التقارب المطرد (متتالية تزايدية ومكبورة أو تناقصية ومصغورة) وتحديد النهاية بحل المعادلة f(L) = L.`;
        specificStepsFr = `1. Initialisation au premier rang, hypothèse de récurrence au rang n fixé et hérédité au rang n+1.\n2. Étude du signe de u_{n+1} - u_n pour conclure sur la monotonie de la suite.\n3. Application du théorème de convergence monotone et résolution de l'équation du point fixe f(L) = L.`;
        noteAr = "توجيه منهجي: في البرهان بالترجع، يجب التمييز بوضوح بين صياغة افتراض الترجع لـ n مثبت والانتقال الاستنتاجي نحو n+1.";
        noteFr = "Rigueur attendue : Bien distinguer l'hypothèse de récurrence pour un entier n fixé et la conclusion d'hérédité.";
      }

      solutions.push({
        questionNumber: `${qIdx + 1}`,
        questionText: qFrText,
        solutionTextAr: `منهجية الإجابة المفصلة عن السؤال (${qIdx + 1}) — « ${cleanQAr} » :\n${specificStepsAr}`,
        solutionTextFr: `Démarche détaillée pour la question (${qIdx + 1}) — « ${cleanQFr} » :\n${specificStepsFr}`,
        bareme: "0.75 pt",
        baremeBreakdownAr: [
          "0.25 ن : استحضار الخاصية أو العلاقة الملائمة",
          "0.25 ن : سلامة الاستدلال والعمليات الحسابية",
          "0.25 ن : دقة الاستنتاج النهائي",
        ],
        baremeBreakdownFr: [
          "0.25 pt : Mobilisation de la propriété adéquate",
          "0.25 pt : Rigueur du calcul et de la déduction",
          "0.25 pt : Exactitude de la conclusion",
        ],
        pedagogicalNoteAr: noteAr,
        pedagogicalNoteFr: noteFr,
      });
    }
  } else if (targetQuestionCount > 0 && solutions.length > targetQuestionCount) {
    solutions.splice(targetQuestionCount);
  }

  // مزامنة نقط كل سؤال في عناصر الإجابة بدقة (مضاعفات 0.25 نقطة) لضمان تطابق مجموع أسئلة التصحيح مع نقطة التمرين الكاملة
  const exactQMetas = getQuestionBaremesAndLevels(
    weight,
    solutions.length,
    45,
    35,
    20,
    lesson.customQuestionBaremes,
    lesson.customQuestionLevels
  );

  solutions.forEach((sol, idx) => {
    const qMeta = exactQMetas[idx];
    if (qMeta) {
      const ptVal = Number(qMeta.points);
      const formattedPt = ptVal
        .toFixed(2)
        .replace(/\.00$/, ".0")
        .replace(/(\.\d)0$/, "$1");
      sol.bareme = `${formattedPt} pt`;
      const p1 = Math.max(0.25, Math.round(ptVal * 0.35 * 4) / 4);
      const p2 = Math.max(0.25, Math.round(ptVal * 0.4 * 4) / 4);
      const p3 = Math.max(0, Number((ptVal - p1 - p2).toFixed(2)));
      sol.baremeBreakdownAr =
        p3 > 0
          ? [
              `${p1.toFixed(2)} ن : صياغة القاعدة أو الخاصية الرياضية المناسبة (${qMeta.level})`,
              `${p2.toFixed(2)} ن : سلامة المراحل الحسابية والاستدلال المنطقي`,
              `${p3.toFixed(2)} ن : تأطير النتيجة النهائية ومطابقتها للمطلوب`,
            ]
          : [
              `${(ptVal * 0.5).toFixed(2)} ن : تطبيق الخاصية والمنهجية الرياضية (${qMeta.level})`,
              `${(ptVal * 0.5).toFixed(2)} ن : دقة الحساب والنتيجة النهائية المؤطرة`,
            ];
      sol.baremeBreakdownFr =
        p3 > 0
          ? [
              `${p1.toFixed(2)} pt : Énoncé de la propriété ou méthode adéquate (${qMeta.level})`,
              `${p2.toFixed(2)} pt : Exactitude des calculs et enchaînement logique`,
              `${p3.toFixed(2)} pt : Formulation et encadrement du résultat final`,
            ]
          : [
              `${(ptVal * 0.5).toFixed(2)} pt : Application de la méthode (${qMeta.level})`,
              `${(ptVal * 0.5).toFixed(2)} pt : Exactitude du calcul et résultat encadré`,
            ];
    }
  });

  const computedTotalPts = exactQMetas
    .reduce((acc, m) => acc + Number(m.points || 0), 0)
    .toFixed(2)
    .replace(/\.00$/, ".0")
    .replace(/(\.\d)0$/, "$1");

  return {
    exerciseIndex,
    exerciseTitleAr: titleAr,
    exerciseTitleFr: lesson.lessonFr,
    totalPoints: computedTotalPts,
    weight,
    solutions,
    generalAdviceAr: `إرشادات عامة للمصحح (وفق الأطر المرجعية المغربية):
- قبول كل طريقة رياضية سليمة لم ترد صراحة في هذا التصحيح (Principe de valorisation des initiatives).
- عدم معاقبة المترشح مرتين على نفس الخطأ الحسابي إذا كانت النتائج اللاحقة متسقة مع خطئه المبدئي.
- تخصيص 0.5 نقطة لحسن تنظيم ورقة التحرير وجودة التعبير الرياضي والرموز.`,
    generalAdviceFr: `Directives officielles d'évaluation et barème national (Cadre de référence) :
- Toute démarche cohérente et rigoureuse non prévue dans ce corrigé type doit être valorisée.
- Ne pas pénaliser un candidat deux fois pour la même erreur de calcul si la suite du raisonnement est exacte.
- Attribuer 0.5 point à la propreté de la copie, la lisibilité et la rigueur de la rédaction mathématique.`,
  };
}

/**
 * يولد تصحيحاً مفصلاً لسلاسل التمارين والـ DM (مع حلول رياضية حقيقية للجزء الأول والجزء التوليفي الثاني)
 */
export function generateSerieBlockCorrection(
  block: SerieExerciseBlock,
  blockIndex: number,
  lesson: LessonItem,
  model: "A" | "B" = "A"
): ExerciseCorrection {
  const isDM = block.badgeAr.includes("الجزء") || block.badgeFr.includes("Partie");
  const isPartA = blockIndex === 0 && isDM;
  const subCat = lesson.subCategory || "تحليل";
  const titleFr = lesson.lessonFr.toLowerCase();

  if (isPartA) {
    const baseCorr = generateExerciseCorrection(
      lesson,
      blockIndex,
      model,
      block.questionsAr,
      block.questionsFr
    );
    return {
      ...baseCorr,
      exerciseTitleAr: block.badgeAr,
      exerciseTitleFr: block.badgeFr,
      totalPoints: block.partPoints || (((lesson.weight * 20) / 100) * 0.45).toFixed(1),
    };
  }

  const solutions: QuestionSolution[] = block.questionsFr.map((qFr, qIdx) => {
    const qAr = block.questionsAr[qIdx] || qFr;
    let solAr = "";
    let solFr = "";

    if (subCat === "هندسة فضائية" || titleFr.includes("espace")) {
      if (qIdx === 0) {
        solAr = `شرط تماس المستوى $(P_m)$ مع الفلكة $(S)$ :
نحسب مسافة المركز $\\Omega$ عن المستوى $(P_m)$ :
$d(\\Omega, (P_m)) = \\frac{|x_\\Omega + 2y_\\Omega + 2z_\\Omega - 3m|}{\\sqrt{1^2 + 2^2 + 2^2}} = \\frac{|3 - 3m|}{3} = |1 - m|$.
يكون المستوى مماساً للفلكة $(S)$ إذا وفقط إذا كان $d(\\Omega, (P_m)) = R$، ومنه نحدد قيمتي الوسيط $m$.`;
        solFr = `Condition de tangence du plan $(P_m)$ à la sphère $(S)$ :
On exprime la distance du centre $\\Omega$ au plan $(P_m)$ :
$d(\\Omega, (P_m)) = \\frac{|x_\\Omega + 2y_\\Omega + 2z_\\Omega - 3m|}{\\sqrt{1^2 + 2^2 + 2^2}} = |1 - m|$.
Le plan est tangent à $(S)$ si et seulement si $d(\\Omega, (P_m)) = R$, ce qui fournit les deux valeurs exactes du paramètre.`;
      } else if (qIdx === 1) {
        solAr = `تحديد عناصر الدائرة $(\\Gamma_m)$ :
بما أن $d(\\Omega, (P_m)) < R$، فإن التقاطع دائرة $(\\Gamma_m)$ شعاعها $r(m) = \\sqrt{R^2 - (1-m)^2}$.
مركزها $\\Omega_m$ هو المسقط العمودي لـ $\\Omega$ على $(P_m)$ المعرف بالتمثيل البارامتري للمستقيم المار من $\\Omega$ والموجه بـ $\\vec{n}(1, 2, 2)$.`;
        solFr = `Éléments caractéristiques du cercle $(\\Gamma_m)$ :
Comme $d(\\Omega, (P_m)) < R$, la section est un cercle de rayon $r(m) = \\sqrt{R^2 - d^2}$.
Son centre $\\Omega_m$ est le projeté orthogonal de $\\Omega$ sur $(P_m)$, obtenu via la représentation paramétrique de la normale issue de $\\Omega$.`;
      } else {
        solAr = `المحل الهندسي لمراكز الدوائر $\\Omega_m$ :
جميع النقط $\\Omega_m$ تنتمي إلى المستقيم العمودي على عائلة المستويات المتوازية $(P_m)$ والمار من المركز الثابت $\\Omega$ داخل الفلكة.`;
        solFr = `Lieu géométrique des centres $\\Omega_m$ :
Les centres $\\Omega_m$ décrivent le segment ouvert porté par la droite perpendiculaire aux plans parallèles $(P_m)$ passant par $\\Omega$, intérieur à la sphère $(S)$.`;
      }
    } else if (subCat === "أعداد عقدية" || titleFr.includes("complexe")) {
      solAr = `تحليل التحويل العقدي والمتتالية الهندسية للنقط $(M_n)$ :
- الكتابة $z' - i = e^{i\\theta}(z - i)$ تميز دوراناً $R$ مركزه النقطة $\\Omega(i)$ وزاويته $\\theta$.
- بالترجع نجد $z_n - i = e^{in\\theta}(z_0 - i)$.
- تنطبق $M_n$ مع $M_0$ عندما يكون $n\\theta \\equiv 0 [2\\pi]$، والمسافة $M_k M_{k+1}$ ثابتة لأن الدوران تقايس يحافظ على المسافات.`;
      solFr = `Étude de la transformation complexe et de la suite de points $(M_n)$ :
- L'écriture $z' - i = e^{i\\theta}(z - i)$ caractérise la rotation de centre $\\Omega(i)$ et d'angle $\\theta$.
- Par récurrence immédiate : $z_n - i = e^{in\\theta}(z_0 - i)$.
- La périodicité s'obtient pour $n\\theta \\equiv 0 \\pmod{2\\pi}$ et la conservation des distances par isométrie donne $L_n = (n+1) M_0 M_1$.`;
    } else if (subCat === "احتمالات وإحصاء" || titleFr.includes("probabilit")) {
      solAr = `النمذجة بالمتغير الحداني $Y_n \\sim \\mathcal{B}(n, p)$ :
- التجارب مستقلة وتحتمل نتيجتين، إذن $P(Y_n = k) = C_n^k p^k (1-p)^{n-k}$.
- نمر إلى الحدث المضاد: $p_n = 1 - P(Y_n = 0) = 1 - (1-p)^n$.
- المتراجحة $p_n \\ge 0,99 \\iff (1-p)^n \\le 0,01 \\iff n \\ge \\frac{\\ln(0,01)}{\\ln(1-p)}$ (مع قلب المتفاوتة لأن $\\ln(1-p) < 0$).`;
      solFr = `Modélisation par la loi binomiale $Y_n \\sim \\mathcal{B}(n, p)$ :
- Par indépendance des $n$ épreuves de Bernoulli : $p_n = 1 - P(Y_n = 0) = 1 - (1-p)^n$.
- Résolution de l'inéquation : $1 - (1-p)^n \\ge 0,99 \\iff (1-p)^n \\le 0,01 \\iff n \\ge \\frac{\\ln(0,01)}{\\ln(1-p)}$ (car $\\ln(1-p) < 0$).`;
    } else if (subCat === "هندسة مستوية" || titleFr.includes("vector") || titleFr.includes("projection")) {
      solAr = `منهجية البرهان في الهندسة المستوية (علاقة شال والاستقامية والإسقاط) :
1. نختار أساساً متجهياً موحداً للمثلث $ABC$، وليكن $(\\vec{AB}, \\vec{AC})$.
2. نطبق علاقة شال لتفكيك كل متجهة مطلوبة بدلالة $\\vec{AB}$ و $\\vec{AC}$ مع احترام الإشارة عند قلب المنحى ($\\vec{MA} = -\\vec{AM}$).
3. في حالة منتصف القطعة $I$: نُعوّض $\\vec{GB} + \\vec{GC} = 2\\vec{GI}$، وفي حالة الإسقاط نُطبّق خاصية الحفاظ على معامل الاستقامية $\\vec{AD'} = k\\vec{AC}$.`;
      solFr = `Démarche en géométrie plane (Chasles, colinéarité & projection) :
1. Exprimer tous les vecteurs dans une même base $(\\vec{AB}, \\vec{AC})$ via la relation de Chasles.
2. Pour le centre de gravité $G$ : utiliser $\\vec{GB} + \\vec{GC} = 2\\vec{GI}$ et $\\vec{GA} + 2\\vec{GI} = \\vec{0} \\implies \\vec{AG} = \\frac{2}{3}\\vec{AI}$.
3. Par projection parallèlement à $(BC)$, le rapport de colinéarité est conservé : $\\vec{AG'} = \\frac{2}{3}\\vec{AJ}$.`;
    } else if (subCat === "حسابيات" || subCat === "جبر" || subCat === "منطق ومجموعات" || lesson.category === "Algebra") {
      solAr = `منهجية الحل في الجبر والحسابيات :
1. في دراسة الزوجية والقابلية للقسمة: نُفصّل الحالات ($n = 2k$ أو $n = 2k+1$) أو نُعمّل التعبير على شكل جداء أعداد صحيحة متتالية.
2. في حل المعادلات في $\\mathbb{N}^2$: نُحوّل المعادلة إلى جداء عاملين يساوي عدداً صحيحاً ثم نُطابق مع قواسمه الموجبة مع مراعاة نفس الزوجية أو الترتيب.`;
      solFr = `Méthode en Algèbre et Arithmétique :
1. Pour la parité et la divisibilité : utiliser la disjonction des cas ou factoriser en produit d'entiers consécutifs.
2. Pour les équations dans $\\mathbb{N}^2$ : factoriser sous forme de produit égal à un entier constant puis étudier les diviseurs positifs.`;
    } else {
      const cleanQ = qAr.replace(/^\d+[\.\)]\s*/, "");
      const capsAr = lesson?.capacitiesAr || [];
      const capsFr = lesson?.capacitiesFr || [];
      const capArText = capsAr.length > 0 ? capsAr[qIdx % capsAr.length] : (lesson?.lessonAr || "الرياضيات");
      const capFrText = capsFr.length > 0 ? capsFr[qIdx % capsFr.length] : (lesson?.lessonFr || "Mathématiques");
      solAr = `عناصر الإجابة المنهجية للسؤال (${qIdx + 1}) — « ${cleanQ} » :
1. تحديد المعطيات والشروط اللازمة لتطبيق الخاصية المرتبطة بـ « ${capArText} ».
2. إنجاز خطوات البرهان أو الحساب الجبري بدقة متناهية.
3. تأطير النتيجة النهائية والتحقق من ملاءمتها لمجموعة الدراسة.`;
      solFr = `Éléments de réponse pour la question (${qIdx + 1}) :
1. Identifier les hypothèses requises pour « ${capFrText} ».
2. Développer les étapes de calcul ou de démonstration avec rigueur.
3. Encadrer le résultat final et formuler la conclusion.`;
    }

    return {
      questionNumber: `${qIdx + 1}`,
      questionText: qAr,
      solutionTextAr: solAr,
      solutionTextFr: solFr,
      bareme: isDM ? "1.75 pt" : "1.50 pt",
      baremeBreakdownAr: [
        "0.50 ن : صياغة الفرضيات والربط الصحيح بنتائج الجزء الأول",
        "0.75 ن : سلامة الاستدلال الرياضي (ترجع / تكافؤات / حساب)",
        "0.50 ن : الاستنتاج الدقيق وتأطير النتيجة النهائية",
      ],
      baremeBreakdownFr: [
        "0.50 pt : Mobilisation des résultats préliminaires et mise en équation",
        "0.75 pt : Rigueur du raisonnement (récurrence / équivalences)",
        "0.50 pt : Conclusion explicite et interprétation mathématique",
      ],
      pedagogicalNoteAr: `إرشاد المصحح: تثمين كل مبادرة تحليلية سليمة استندت إلى « ${block.hintAr} ».`,
      pedagogicalNoteFr: `Note correcteur : Valoriser toute prise d'initiative appuyée sur « ${block.hintFr} ».`,
    };
  });

  return {
    exerciseIndex: blockIndex,
    exerciseTitleAr: block.badgeAr,
    exerciseTitleFr: block.badgeFr,
    totalPoints: block.partPoints || (isDM ? (((lesson.weight * 20) / 100) * 0.55).toFixed(1) : "6.0"),
    weight: isDM ? Math.round(lesson.weight * 0.55) : 30,
    solutions,
    generalAdviceAr: "عناصر إجابة مفصلة للمسألة التوليفية معدة للتقويم الذاتي وتنمية مهارات البحث الرياضي.",
    generalAdviceFr: "Corrigé méthodologique détaillé du problème de synthèse pour l'auto-évaluation et l'approfondissement.",
  };
}

/**
 * يولد نموذج حل مفصل لتمرين من تمارين السلسلة المحددة عددياً من قبل الأستاذ
 */
export function generateConfiguredSerieCorrection(
  ex: ConfiguredSerieExercise,
  model: "A" | "B" = "A"
): ExerciseCorrection {
  const block: SerieExerciseBlock = {
    badgeAr: ex.badgeAr,
    badgeFr: ex.badgeFr,
    stars: ex.stars,
    questionsAr: ex.questionsAr,
    questionsFr: ex.questionsFr,
    hintAr: ex.hintAr,
    hintFr: ex.hintFr,
    competenciesAr: ex.competenciesAr,
    competenciesFr: ex.competenciesFr,
  };
  const base = generateSerieBlockCorrection(block, ex.blockIndex, ex.lesson, model);
  return {
    ...base,
    exerciseIndex: ex.exerciseIndex,
    exerciseTitleAr: ex.exerciseTitleAr,
    exerciseTitleFr: ex.exerciseTitleFr,
  };
}

/**
 * المرحلة 5 من خارطة الطريق:
 * توليد عناصر الإجابة وسلم التنقيط المتطابق سطراً بسطر مع الأسئلة الفرعية (أ، ب، ج / a, b, c) بدقة 0.25 نقطة
 */
export function generateSubQuestionAlignedCorrection(params: {
  lesson: LessonItem;
  exerciseIndex: number;
  model?: "A" | "B" | string;
  questionsAr?: string[];
  questionsFr?: string[];
  decompositionMode?: SubQuestionDecompositionMode;
}): ExerciseCorrection {
  const {
    lesson,
    exerciseIndex,
    model = "A",
    questionsAr = [],
    questionsFr = [],
    decompositionMode = "STRUCTURED_ABC_ALL",
  } = params;

  const baseCorrection = generateExerciseCorrection(
    lesson,
    exerciseIndex,
    model,
    questionsAr,
    questionsFr
  );

  if (decompositionMode === "NONE") {
    return baseCorrection;
  }

  const alignedSolutions: QuestionSolution[] = baseCorrection.solutions.map((sol, idx) => {
    const rawPts = parseFloat(String(sol.bareme).replace(/[^\d.]/g, "")) || 1.5;
    const qTextAr = questionsAr[idx] || sol.questionText;
    const qTextFr = questionsFr[idx] || sol.questionText;

    const decomp = decomposeQuestionIntoSubQuestions({
      questionAr: qTextAr,
      questionFr: qTextFr,
      parentPoints: rawPts,
      parentLevel: "N2",
      mode: decompositionMode,
      questionIndex: idx,
      lessonTitleAr: lesson.lessonAr,
      lessonTitleFr: lesson.lessonFr,
    });

    const subBreakdownAr = decomp.subQuestions.map(
      (sq, sIdx) =>
        `${sq.labelAr}) [${sq.points.toFixed(2)} ن · ${sq.level}]: ${
          sol.baremeBreakdownAr[sIdx] || sq.textAr
        }`
    );
    const subBreakdownFr = decomp.subQuestions.map(
      (sq, sIdx) =>
        `${sq.labelFr}) [${sq.points.toFixed(2)} pt · ${sq.level}]: ${
          sol.baremeBreakdownFr[sIdx] || sq.textFr
        }`
    );

    return {
      ...sol,
      baremeBreakdownAr: subBreakdownAr,
      baremeBreakdownFr: subBreakdownFr,
    };
  });

  return {
    ...baseCorrection,
    solutions: alignedSolutions,
  };
}
