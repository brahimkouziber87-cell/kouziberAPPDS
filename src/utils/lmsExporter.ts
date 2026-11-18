/**
 * محرك التصدير التفاعلي لأنظمة إدارة التعلم (LMS: Moodle, Google Classroom, IMS QTI)
 * يدعم تصدير الفروض والتمارين والسلالم بصيغ تفاعلية رقمية قابلة للتقييم الذاتي أو الآلي.
 */

import { LessonItem, getVariantQuestions, getQuestionBaremesAndLevels } from "../data/curriculum";

export type LmsExportFormat =
  | "MOODLE_XML"
  | "MOODLE_GIFT"
  | "GOOGLE_CLASSROOM_HTML_QUIZ"
  | "GOOGLE_CLASSROOM_RUBRIC_CSV"
  | "IMS_QTI_21";

export interface LmsExportConfig {
  examTitleAr: string;
  examTitleFr: string;
  trackCode: string;
  trackLabelAr: string;
  semester: "S1" | "S2";
  dsKey: string;
  school: string;
  prof: string;
  year: string;
  lessons: LessonItem[];
  n1?: number;
  n2?: number;
  n3?: number;
  durationMinutes?: number;
  includeQcmSection?: boolean;
  qcmQuestionCount?: number;
  includeDetailedSolutionsAsFeedback?: boolean;
  language?: "AR" | "FR" | "BILINGUAL";
}

function escapeXml(str: string): string {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function escapeCsvCell(str: string): string {
  const s = String(str || "").replace(/\r?\n/g, " ");
  if (s.includes(",") || s.includes('"') || s.includes(";")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function toMathJaxDelimiters(str: string): string {
  return String(str || "")
    .replace(/\$\$([^$]+)\$\$/g, "\\[$1\\]")
    .replace(/\$([^$]+)\$/g, "\\($1\\)");
}

function extractQcmItemsForLms(config: LmsExportConfig) {
  const qCount = Math.max(0, Math.min(8, config.qcmQuestionCount || 4));
  if (!config.includeQcmSection || qCount === 0) return [];

  const bank = [
    {
      title: "QCM_1_Limits",
      qAr: "لتكن $f$ دالة معرفة على $\\mathbb{R}$ بحيث $\\lim_{x\\to +\\infty} \\frac{f(x)}{x} = 0$. ما التأويل الهندسي للمنحنى $(\\mathcal{C}_f)$؟",
      qFr: "Soit $f$ définie sur $\\mathbb{R}$ telle que $\\lim_{x\\to +\\infty} \\frac{f(x)}{x} = 0$. Quelle est l'interprétation géométrique ?",
      options: [
        "فرع شلجمي في اتجاه محور الأفاصيل / Branche parabolique direction $(Ox)$",
        "فرع شلجمي في اتجاه محور الأراتيب / Branche parabolique direction $(Oy)$",
        "مقارب أفقي معادلته $y=0$ / Asymptote horizontale $y=0$",
        "مقارب مائل معامل توجيهه $1$ / Asymptote oblique de pente $1$",
      ],
      correctIdx: 0,
      feedbackAr: "بما أن $\\lim_{x\\to +\\infty} \\frac{f(x)}{x} = 0$ (بعد تحقق $\\lim |f(x)| = +\\infty$) فإن المنحنى يقبل فرعاً شلجمياً اتجاهه محور الأفاصيل.",
    },
    {
      title: "QCM_2_Sequences",
      qAr: "لتكن $(u_n)$ متتالية هندسية أساسها $q = \\frac{2}{3}$ وحدها الأول $u_0 = 6$. قيمة $\\lim_{n\\to +\\infty} u_n$ هي:",
      qFr: "Soit $(u_n)$ une suite géométrique de raison $q=\\frac{2}{3}$ et $u_0=6$. Que vaut $\\lim_{n\\to +\\infty} u_n$ ?",
      options: [
        "$0$",
        "$6$",
        "$+\\infty$",
        "$\\frac{2}{3}$",
      ],
      correctIdx: 0,
      feedbackAr: "بما أن $-1 < \\frac{2}{3} < 1$ فإن $\\lim_{n\\to +\\infty} q^n = 0$ ومنه نهاية المتتالية هي $0$.",
    },
    {
      title: "QCM_3_Derivative",
      qAr: "مشتقة الدالة $g(x) = \\ln(x^2 + 1)$ على $\\mathbb{R}$ هي:",
      qFr: "La dérivée de la fonction $g(x) = \\ln(x^2 + 1)$ sur $\\mathbb{R}$ est :",
      options: [
        "$\\frac{2x}{x^2+1}$",
        "$\\frac{1}{x^2+1}$",
        "$\\frac{x}{x^2+1}$",
        "$2x\\ln(x^2+1)$",
      ],
      correctIdx: 0,
      feedbackAr: "مشتقة $\\ln(u(x))$ هي $\\frac{u'(x)}{u(x)} = \\frac{2x}{x^2+1}$.",
    },
    {
      title: "QCM_4_Complex_Or_Integral",
      qAr: "قيمة التكامل $I = \\int_0^1 e^{2x}\\,dx$ تساوي:",
      qFr: "La valeur de l'intégrale $I = \\int_0^1 e^{2x}\\,dx$ est égale à :",
      options: [
        "$\\frac{e^2 - 1}{2}$",
        "$e^2 - 1$",
        "$2(e^2 - 1)$",
        "$\\frac{e^2}{2}$",
      ],
      correctIdx: 0,
      feedbackAr: "دالة أصلية لـ $e^{2x}$ هي $\\frac{1}{2}e^{2x}$، وبالتالي $I = [\\frac{1}{2}e^{2x}]_0^1 = \\frac{e^2-1}{2}$.",
    },
    {
      title: "QCM_5_Continuity_TVI",
      qAr: "إذا كانت $f$ متصلة ورتيبة قطعا على $[a,b]$ وكان $f(a)\\cdot f(b) < 0$، فإن المعادلة $f(x)=0$ تقبل في $]a,b[$:",
      qFr: "Si $f$ est continue et strictement monotone sur $[a,b]$ avec $f(a)f(b)<0$, alors $f(x)=0$ admet dans $]a,b[$ :",
      options: [
        "حلاً وحيداً / Une unique solution",
        "حلين على الأقل / Au moins deux solutions",
        "لا تقبل أي حل / Aucune solution",
        "ما لا نهاية من الحلول / Une infinité de solutions",
      ],
      correctIdx: 0,
      feedbackAr: "حسب مبرهنة القيم الوسيطية (TVI) والرتابة القطعية، يوجد حل وحيد في المجال المفتوح $]a,b[$.",
    },
    {
      title: "QCM_6_Probability",
      qAr: "نرمي نرداً متوازناً ذا 6 أوجه مرة واحدة. احتمال الحصول على عدد زوجي هو:",
      qFr: "On lance un dé équilibré à 6 faces. La probabilité d'obtenir un nombre pair est :",
      options: [
        "$\\frac{1}{2}$",
        "$\\frac{1}{3}$",
        "$\\frac{1}{6}$",
        "$\\frac{2}{3}$",
      ],
      correctIdx: 0,
      feedbackAr: "الأعداد الزوجية هي $\{2,4,6\}$ وعددها $3$ من أصل $6$ إمكانيات، أي $\\frac{3}{6}=\\frac{1}{2}$.",
    },
  ];

  return bank.slice(0, qCount);
}

/**
 * 1. تصدير Moodle XML المعياري التفاعلي (أسئلة QCM مصححة آلياً + تمارين مقالية بسلم 142-08)
 */
export function exportExamToMoodleXMLAdvanced(config: LmsExportConfig): string {
  const lessons = config.lessons || [];
  const totalWeight = Math.max(1, lessons.reduce((acc, l) => acc + (l.weight || 5), 0));
  const qcmItems = extractQcmItemsForLms(config);
  const qcmTotalPts = qcmItems.length * 1.0;
  const exercisesBudget = Math.max(4, 20 - qcmTotalPts);
  const lang = config.language || "BILINGUAL";

  const categoryHeader = `  <question type="category">
    <category>
      <text>$course$/top/MENPS_${escapeXml(config.trackCode)}/${escapeXml(config.semester)}_${escapeXml(config.dsKey)}</text>
    </category>
  </question>`;

  const qcmXml = qcmItems
    .map((q, idx) => {
      const promptHtml =
        lang === "FR"
          ? `<div dir="ltr">${toMathJaxDelimiters(escapeXml(q.qFr))}</div>`
          : lang === "AR"
          ? `<div dir="rtl">${toMathJaxDelimiters(escapeXml(q.qAr))}</div>`
          : `<div dir="rtl" style="margin-bottom:6px;"><strong>[QCM ${idx + 1}]</strong> ${toMathJaxDelimiters(escapeXml(q.qAr))}</div><div dir="ltr" style="color:#334155;">${toMathJaxDelimiters(escapeXml(q.qFr))}</div>`;

      const answersXml = q.options
        .map((opt, oIdx) => {
          const frac = oIdx === q.correctIdx ? "100" : "0";
          const fb = oIdx === q.correctIdx ? "إجابة صحيحة / Bonne réponse" : "راجع المبرهنة المعتمدة / À revoir";
          return `    <answer fraction="${frac}" format="html">
      <text><![CDATA[${toMathJaxDelimiters(escapeXml(opt))}]]></text>
      <feedback format="html"><text><![CDATA[${escapeXml(fb)}]]></text></feedback>
    </answer>`;
        })
        .join("\n");

      return `  <question type="multichoice">
    <name><text>${escapeXml(q.title)}</text></name>
    <questiontext format="html"><text><![CDATA[${promptHtml}]]></text></questiontext>
    <generalfeedback format="html"><text><![CDATA[${config.includeDetailedSolutionsAsFeedback !== false ? toMathJaxDelimiters(escapeXml(q.feedbackAr)) : ""}]]></text></generalfeedback>
    <defaultgrade>1.0000000</defaultgrade>
    <penalty>0.3333333</penalty>
    <single>true</single>
    <shuffleanswers>true</shuffleanswers>
    <answernumbering>abc</answernumbering>
${answersXml}
  </question>`;
    })
    .join("\n");

  const essayXml = lessons
    .map((lesson, exIdx) => {
      const effectivePts = Number((((lesson.weight || 5) / totalWeight) * exercisesBudget).toFixed(2));
      const variant = getVariantQuestions(lesson, "A", false, exIdx);
      const qCount = Math.max(1, variant.questionsAr.length);
      const metas = getQuestionBaremesAndLevels(
        effectivePts,
        qCount,
        config.n1 ?? 35,
        config.n2 ?? 45,
        config.n3 ?? 20,
        lesson.customQuestionBaremes,
        lesson.customQuestionLevels
      );

      return variant.questionsAr
        .map((qAr, qIdx) => {
          const qFr = variant.questionsFr[qIdx] || qAr;
          const pts = parseFloat(metas[qIdx]?.points || "1");
          const lvl = metas[qIdx]?.level || "N2";
          const htmlQ =
            lang === "FR"
              ? `<div dir="ltr"><strong>[Ex ${exIdx + 1} · Q${qIdx + 1}]</strong><br/>${toMathJaxDelimiters(escapeXml(qFr))}</div>`
              : lang === "AR"
              ? `<div dir="rtl"><strong>[التمرين ${exIdx + 1} — ${escapeXml(lesson.lessonAr)} | السؤال ${qIdx + 1}]</strong><br/>${toMathJaxDelimiters(escapeXml(qAr))}</div>`
              : `<div dir="rtl" style="margin-bottom:6px;"><strong>[التمرين ${exIdx + 1} — ${escapeXml(lesson.lessonAr)} | السؤال ${qIdx + 1}]</strong><br/>${toMathJaxDelimiters(escapeXml(qAr))}</div><div dir="ltr" style="color:#334155;"><strong>[Exercice ${exIdx + 1} — ${escapeXml(lesson.lessonFr)} | Q${qIdx + 1}]</strong><br/>${toMathJaxDelimiters(escapeXml(qFr))}</div>`;

          const solText =
            (lesson.sampleSolutionAr && lesson.sampleSolutionAr[qIdx]) ||
            `سلم التنقيط: ${pts} ن (${lvl}) · تبرير خطوات الاستدلال (60%) والنتيجة الدقيقة (40%).`;
          const fbHtml =
            config.includeDetailedSolutionsAsFeedback !== false
              ? `<div dir="rtl">${toMathJaxDelimiters(escapeXml(solText))}</div>`
              : "";

          return `  <question type="essay">
    <name><text>Ex${exIdx + 1}_Q${qIdx + 1}_${escapeXml(lesson.lessonFr.slice(0, 24))} (${lvl})</text></name>
    <questiontext format="html"><text><![CDATA[${htmlQ}]]></text></questiontext>
    <generalfeedback format="html"><text><![CDATA[${fbHtml}]]></text></generalfeedback>
    <defaultgrade>${pts.toFixed(2)}</defaultgrade>
    <penalty>0.0000000</penalty>
    <responseformat>editorfilepicker</responseformat>
    <responserequired>1</responserequired>
    <responsefieldlines>8</responsefieldlines>
    <attachments>1</attachments>
    <graderinfo format="html"><text><![CDATA[${fbHtml}]]></text></graderinfo>
  </question>`;
        })
        .join("\n");
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- LMS Interactive Exam Package (Moodle XML 4.x + MathJax + TelmidTICE) -->
<quiz>
${categoryHeader}
${qcmXml}
${essayXml}
</quiz>`;
}

/**
 * 2. تصدير Moodle GIFT Format (.gift.txt) خفيف ومثالي للاستيراد النصي الفوري
 */
export function exportExamToMoodleGIFT(config: LmsExportConfig): string {
  const lines: string[] = [
    `// Moodle GIFT Format — ${config.examTitleAr} (${config.trackCode})`,
    `// Prof: ${config.prof} | ${config.school} | ${config.year}`,
    `$CATEGORY: $course$/top/${config.trackCode}_${config.semester}_${config.dsKey}`,
    "",
  ];

  const qcmItems = extractQcmItemsForLms(config);
  qcmItems.forEach((q, idx) => {
    lines.push(`::QCM_${idx + 1}::[html]${toMathJaxDelimiters(config.language === "FR" ? q.qFr : q.qAr)} {`);
    q.options.forEach((opt, oIdx) => {
      const prefix = oIdx === q.correctIdx ? "=" : "~";
      const fb = oIdx === q.correctIdx ? `# ${q.feedbackAr}` : "";
      lines.push(`  ${prefix}${toMathJaxDelimiters(opt)} ${fb}`);
    });
    lines.push("}");
    lines.push("");
  });

  const lessons = config.lessons || [];
  const totalWeight = Math.max(1, lessons.reduce((acc, l) => acc + (l.weight || 5), 0));
  const exercisesBudget = Math.max(4, 20 - qcmItems.length);

  lessons.forEach((lesson, exIdx) => {
    const effectivePts = Number((((lesson.weight || 5) / totalWeight) * exercisesBudget).toFixed(2));
    const variant = getVariantQuestions(lesson, "A", false, exIdx);
    variant.questionsAr.forEach((qAr, qIdx) => {
      const qFr = variant.questionsFr[qIdx] || qAr;
      const body = config.language === "FR" ? qFr : `${qAr} (${effectivePts} pts)`;
      lines.push(`::Ex${exIdx + 1}_Q${qIdx + 1}_${lesson.lessonFr.slice(0, 20)}::[html]${toMathJaxDelimiters(body)} {}`);
      lines.push("");
    });
  });

  return lines.join("\n");
}

/**
 * 3. تصدير شبكة التقويم بصيغة CSV متوافقة مع استيراد Google Classroom Rubrics
 */
export function exportGoogleClassroomRubricCSV(config: LmsExportConfig): string {
  const lessons = config.lessons || [];
  const totalWeight = Math.max(1, lessons.reduce((acc, l) => acc + (l.weight || 5), 0));
  const qcmCount = config.includeQcmSection ? Math.min(8, config.qcmQuestionCount || 4) : 0;
  const exercisesBudget = Math.max(4, 20 - qcmCount);

  const rows: string[][] = [
    ["Criterion Title", "Criterion Description", "Level 4 Title", "Level 4 Points", "Level 4 Description", "Level 3 Title", "Level 3 Points", "Level 3 Description", "Level 2 Title", "Level 2 Points", "Level 2 Description", "Level 1 Title", "Level 1 Points", "Level 1 Description"],
  ];

  if (qcmCount > 0) {
    rows.push([
      "القسم 1: أسئلة الاختيار من متعدد (QCM)",
      "تقويم المعارف الأساسية وتطبيق القواعد المباشرة (N1)",
      "إتقان تام",
      String(qcmCount),
      "إجابات صحيحة لجميع أسئلة الاختيار من متعدد مع تعليل سليم.",
      "تحكم جيد",
      String(Number((qcmCount * 0.75).toFixed(2))),
      "أغلب الاختيارات صحيحة مع هفوة بسيطة.",
      "تحكم جزئي",
      String(Number((qcmCount * 0.5).toFixed(2))),
      "نصف الأسئلة صحيحة وتحتاج تعزيز المعارف.",
      "بداية التملك",
      String(Number((qcmCount * 0.25).toFixed(2))),
      "تعثرات في استحضار الخاصيات الأساسية.",
    ]);
  }

  lessons.forEach((lesson, idx) => {
    const pts = Number((((lesson.weight || 5) / totalWeight) * exercisesBudget).toFixed(2));
    const capText = (lesson.capacitiesAr || []).slice(0, 2).join("؛ ") || lesson.lessonAr;
    rows.push([
      `التمرين ${idx + 1}: ${lesson.lessonAr}`,
      capText,
      "إتقان متميز (N3)",
      String(pts),
      "تمشي رياضي متماسك، تعليل تام، وحسابات مضبوطة دون أخطاء.",
      "تحكم مرضٍ (N2)",
      String(Number((pts * 0.75).toFixed(2))),
      "الطريقة سليمة مع خطأ حسابي أو إغفال شرط بسيط.",
      "تحكم جزئي (N1)",
      String(Number((pts * 0.5).toFixed(2))),
      "انطلاقة صحيحة وتطبيق مباشر للقاعدة دون إتمام البرهان.",
      "غير متحكم فيه",
      "0",
      "إجابة غير مكتملة أو صياغة غير موفقة.",
    ]);
  });

  // Add UTF-8 BOM for seamless Google Sheets / Classroom import with Arabic text
  return "\uFEFF" + rows.map((row) => row.map(escapeCsvCell).join(",")).join("\n");
}

/**
 * 4. تصدير واجهة اختبار ويب تفاعلي مستقل (Google Classroom Assignment HTML5 Quiz)
 * يتضمن تصحيحاً فورياً لـ QCM، مؤقتاً زمنياً، عرض الصيغ الرياضية، وتقرير نقط التلميذ
 */
export function exportInteractiveClassroomQuizHTML(config: LmsExportConfig): string {
  const qcmItems = extractQcmItemsForLms(config);
  const lessons = config.lessons || [];
  const totalWeight = Math.max(1, lessons.reduce((acc, l) => acc + (l.weight || 5), 0));
  const exercisesBudget = Math.max(4, 20 - qcmItems.length);
  const durationMin = config.durationMinutes || 120;

  const qcmJson = JSON.stringify(
    qcmItems.map((q, i) => ({
      id: i,
      qAr: q.qAr,
      qFr: q.qFr,
      options: q.options,
      correctIdx: q.correctIdx,
      feedbackAr: q.feedbackAr,
    }))
  );

  const exercisesHtml = lessons
    .map((lesson, idx) => {
      const pts = Number((((lesson.weight || 5) / totalWeight) * exercisesBudget).toFixed(1));
      const variant = getVariantQuestions(lesson, "A", false, idx);
      const qListHtml = variant.questionsAr
        .map(
          (qAr, qIdx) => `
          <div class="question-block">
            <div class="q-ar">${qAr}</div>
            ${variant.questionsFr[qIdx] ? `<div class="q-fr" dir="ltr">${variant.questionsFr[qIdx]}</div>` : ""}
            <textarea class="student-work-box" placeholder="أدخل خطوات حلك أو رابط صورة ورقتك (Google Classroom Submission)..."></textarea>
          </div>`
        )
        .join("");

      return `
      <section class="card exercise-card">
        <div class="card-header">
          <h3>التمرين ${idx + 1}: ${lesson.lessonAr} <span class="fr-sub" dir="ltr">(${lesson.lessonFr})</span></h3>
          <span class="pts-badge">${pts} نقط</span>
        </div>
        ${qListHtml}
      </section>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${config.examTitleAr} — تقييم تفاعلي (LMS)</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" />
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js" onload="renderMathInElement(document.body,{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}]});"></script>
  <style>
    body { font-family: system-ui, -apple-system, 'Cairo', sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 20px; line-height: 1.6; }
    .container { max-width: 900px; margin: 0 auto; }
    .header-box { background: linear-gradient(135deg, #0f172a, #1e293b); color: #fff; padding: 20px 24px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-bottom: 20px; }
    .timer-box { background: rgba(34, 211, 238, 0.15); border: 1px solid #22d3ee; color: #67e8f9; padding: 8px 16px; border-radius: 12px; font-family: monospace; font-size: 18px; font-weight: bold; }
    .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
    .card-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 14px; }
    .pts-badge { background: #e0f2fe; color: #0369a1; font-weight: 800; padding: 4px 12px; border-radius: 8px; font-size: 13px; }
    .qcm-opt { display: block; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 10px 14px; margin: 6px 0; cursor: pointer; transition: 0.15s; }
    .qcm-opt:hover { border-color: #0284c7; background: #f0f9ff; }
    .student-work-box { width: 100%; min-height: 70px; margin-top: 8px; padding: 10px; border: 1px solid #cbd5e1; border-radius: 10px; font-family: inherit; box-sizing: border-box; }
    .btn-primary { background: #0f766e; color: #fff; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 800; font-size: 14px; cursor: pointer; }
    .btn-primary:hover { background: #0d9488; }
    .result-banner { display: none; margin-top: 16px; padding: 16px; border-radius: 12px; background: #ecfdf5; border: 1px solid #10b981; color: #065f46; font-weight: bold; }
    .fr-sub { color: #64748b; font-size: 13px; font-weight: normal; }
    .question-block { margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px dashed #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-box">
      <div>
        <div style="font-size:12px;color:#94a3b8;">${config.school} · ${config.prof} · ${config.year}</div>
        <h1 style="margin:4px 0 0;font-size:20px;">${config.examTitleAr} (${config.trackLabelAr})</h1>
      </div>
      <div class="timer-box" id="timerDisplay">${String(durationMin).padStart(2, "0")}:00</div>
    </div>

    <div class="card">
      <label style="font-weight:bold;display:block;margin-bottom:6px;">الاسم الكامل للتلميذ(ة) / القسم (Google Classroom ID):</label>
      <input id="studentName" type="text" placeholder="أدخل اسمك الكامل..." style="width:100%;padding:10px;border:1px solid #cbd5e1;border-radius:10px;box-sizing:border-box;" />
    </div>

    ${
      qcmItems.length > 0
        ? `<section class="card" id="qcmSection">
      <div class="card-header">
        <h3>الجزء التفاعلي المصحح آلياً (QCM)</h3>
        <span class="pts-badge">${qcmItems.length}.0 نقط</span>
      </div>
      <div id="qcmContainer"></div>
    </section>`
        : ""
    }

    ${exercisesHtml}

    <div style="text-align:center;margin-top:24px;">
      <button class="btn-primary" onclick="evaluateQuiz()">تصحيح الأسئلة التفاعلية وحفظ النتيجة لتسليم Classroom</button>
    </div>

    <div id="resultBanner" class="result-banner"></div>
  </div>

  <script>
    const qcmData = ${qcmJson};
    const container = document.getElementById('qcmContainer');
    if (container && qcmData.length) {
      qcmData.forEach((q, idx) => {
        const div = document.createElement('div');
        div.style.marginBottom = '16px';
        div.innerHTML = '<div style="font-weight:bold;margin-bottom:6px;">' + (idx+1) + ') ' + q.qAr + '</div>' +
          q.options.map((opt, oIdx) => '<label class="qcm-opt"><input type="radio" name="qcm_'+idx+'" value="'+oIdx+'" /> ' + opt + '</label>').join('') +
          '<div id="fb_'+idx+'" style="font-size:12px;margin-top:4px;display:none;"></div>';
        container.appendChild(div);
      });
    }

    let seconds = ${durationMin} * 60;
    setInterval(() => {
      if (seconds > 0) {
        seconds--;
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        document.getElementById('timerDisplay').textContent = String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
      }
    }, 1000);

    function evaluateQuiz() {
      let score = 0;
      qcmData.forEach((q, idx) => {
        const sel = document.querySelector('input[name="qcm_'+idx+'"]:checked');
        const fbEl = document.getElementById('fb_'+idx);
        fbEl.style.display = 'block';
        if (sel && Number(sel.value) === q.correctIdx) {
          score++;
          fbEl.style.color = '#059669';
          fbEl.textContent = '✓ صحيح (+1 نقطة): ' + q.feedbackAr;
        } else {
          fbEl.style.color = '#dc2626';
          fbEl.textContent = '✗ غير صحيح: ' + q.feedbackAr;
        }
      });
      const student = document.getElementById('studentName').value || 'تلميذ';
      const banner = document.getElementById('resultBanner');
      banner.style.display = 'block';
      banner.innerHTML = 'التلميذ(ة): ' + student + ' — النقطة الآلية لقسم QCM: ' + score + ' / ' + qcmData.length + ' (يمكن طباعة هذه الصفحة أو تسليمها في Google Classroom).';
    }
  </script>
</body>
</html>`;
}

/**
 * 5. تصدير معيار IMS QTI 2.1 XML القياسي المتوافق مع Canvas / Blackboard / Moodle
 */
export function exportExamToImsQti21XML(config: LmsExportConfig): string {
  const qcmItems = extractQcmItemsForLms(config);
  const lessons = config.lessons || [];
  const totalWeight = Math.max(1, lessons.reduce((acc, l) => acc + (l.weight || 5), 0));
  const exercisesBudget = Math.max(4, 20 - qcmItems.length);

  const itemsXml = [
    ...qcmItems.map((q, idx) => {
      const choices = q.options
        .map(
          (opt, oIdx) =>
            `        <simpleChoice identifier="OPT_${oIdx}">${escapeXml(opt)}</simpleChoice>`
        )
        .join("\n");
      return `  <assessmentItem identifier="QCM_${idx + 1}" title="${escapeXml(q.title)}" adaptive="false" timeDependent="false">
    <responseDeclaration identifier="RESPONSE" cardinality="single" baseType="identifier">
      <correctResponse><value>OPT_${q.correctIdx}</value></correctResponse>
    </responseDeclaration>
    <outcomeDeclaration identifier="SCORE" cardinality="single" baseType="float">
      <defaultValue><value>0</value></defaultValue>
    </outcomeDeclaration>
    <itemBody>
      <p>${escapeXml(q.qAr)}</p>
      <choiceInteraction responseIdentifier="RESPONSE" shuffle="true" maxChoices="1">
${choices}
      </choiceInteraction>
    </itemBody>
  </assessmentItem>`;
    }),
    ...lessons.map((lesson, exIdx) => {
      const pts = Number((((lesson.weight || 5) / totalWeight) * exercisesBudget).toFixed(2));
      const variant = getVariantQuestions(lesson, "A", false, exIdx);
      return `  <assessmentItem identifier="EX_${exIdx + 1}" title="${escapeXml(lesson.lessonFr)}" adaptive="false" timeDependent="false">
    <responseDeclaration identifier="RESPONSE" cardinality="single" baseType="string" />
    <outcomeDeclaration identifier="MAXSCORE" cardinality="single" baseType="float">
      <defaultValue><value>${pts}</value></defaultValue>
    </outcomeDeclaration>
    <itemBody>
      <p><strong>${escapeXml(lesson.lessonAr)} (${pts} pts)</strong></p>
      ${variant.questionsAr.map((q) => `<p>${escapeXml(q)}</p>`).join("\n      ")}
      <extendedTextInteraction responseIdentifier="RESPONSE" expectedLines="8"/>
    </itemBody>
  </assessmentItem>`;
    }),
  ].join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<assessmentTest xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1"
  identifier="ASSESSMENT_${escapeXml(config.trackCode)}_${escapeXml(config.dsKey)}"
  title="${escapeXml(config.examTitleAr)}">
  <testPart identifier="PART_1" navigationMode="nonlinear" submissionMode="individual">
    <assessmentSection identifier="SEC_MAIN" title="${escapeXml(config.trackLabelAr)}" visible="true">
${itemsXml}
    </assessmentSection>
  </testPart>
</assessmentTest>`;
}

/**
 * مولد موحد يرجع المحتوى والاسم والنوع MIME لأي صيغة LMS مطلوبة
 */
export function generateLmsExportArtifact(
  format: LmsExportFormat,
  config: LmsExportConfig
): {
  content: string;
  fileName: string;
  mimeType: string;
  labelAr: string;
} {
  const baseTag = `${config.trackCode}_${config.semester}_${config.dsKey}`;
  switch (format) {
    case "MOODLE_XML":
      return {
        content: exportExamToMoodleXMLAdvanced(config),
        fileName: `${baseTag}_Moodle_Quiz.xml`,
        mimeType: "application/xml;charset=utf-8",
        labelAr: "Moodle XML (أسئلة تفاعلية + تصحيح)",
      };
    case "MOODLE_GIFT":
      return {
        content: exportExamToMoodleGIFT(config),
        fileName: `${baseTag}_Moodle_GIFT.txt`,
        mimeType: "text/plain;charset=utf-8",
        labelAr: "Moodle GIFT (استيراد نصي سريع)",
      };
    case "GOOGLE_CLASSROOM_HTML_QUIZ":
      return {
        content: exportInteractiveClassroomQuizHTML(config),
        fileName: `${baseTag}_Google_Classroom_Quiz.html`,
        mimeType: "text/html;charset=utf-8",
        labelAr: "تقييم تفاعلي HTML5 (Google Classroom)",
      };
    case "GOOGLE_CLASSROOM_RUBRIC_CSV":
      return {
        content: exportGoogleClassroomRubricCSV(config),
        fileName: `${baseTag}_Google_Classroom_Rubric.csv`,
        mimeType: "text/csv;charset=utf-8",
        labelAr: "شبكة تقييم Google Classroom (.csv)",
      };
    case "IMS_QTI_21":
      return {
        content: exportExamToImsQti21XML(config),
        fileName: `${baseTag}_IMS_QTI_21.xml`,
        mimeType: "application/xml;charset=utf-8",
        labelAr: "معيار IMS QTI 2.1 (Canvas / Blackboard)",
      };
  }
}
