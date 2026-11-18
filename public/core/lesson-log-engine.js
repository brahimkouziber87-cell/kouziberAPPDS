/**
 * /public/core/lesson-log-engine.js
 * جسر التكامل البيداغوجي الثنائي الاتجاه بين:
 * 1) منظومة التتبع البيداغوجي والتدبير ودفتر النصوص (LessonLogEngine)
 * 2) منصة الهندسة البيداغوجية وإنتاج الوثائق التربوية (فروض محروسة، سلاسل تمارين، سلاسل دعم، جذاذات وملخصات)
 */

(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.LessonLogEngine = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var OFFICIAL_TRACK_COEFFICIENTS = {
    TCS: 4,
    TCT: 4,
    TCLSH: 2,
    "1BAC_SM": 9,
    "1BAC_SE": 7,
    "1BAC_STE_STM": 7,
    "1BAC_ECO": 4,
    "1BAC_LETTRES": 2,
    "2BAC_SM": 9,
    "2BAC_PC": 7,
    "2BAC_SVT_AGRO": 7,
    "2BAC_STE_STM": 7,
    "2BAC_ECO_TGC": 4,
    "2BAC_LETTRES": 2,
    "2NDE_FR": 4,
    "1ERE_SPE_FR": 6,
    TERM_SPE_FR: 16,
    TERM_EXP_FR: 9,
    TERM_COMPL_FR: 5,
  };

  /**
   * الآلية الأولى:
   * تصدير البطاقة التشخيصية للقسم نحو تطبيق إنتاج الوثائق
   * LessonLogEngine.buildCompanionAppPedagogicalBrief(input)
   */
  function buildCompanionAppPedagogicalBrief(input) {
    var safeInput = input || {};
    var trackCode = String(safeInput.trackCode || safeInput.filiereCode || "2BAC_PC").trim();
    var coefficient =
      Number(safeInput.coefficient) ||
      OFFICIAL_TRACK_COEFFICIENTS[trackCode] ||
      7;
    var semester = safeInput.semester === "S2" ? "S2" : "S1";
    var examKey = String(safeInput.examKey || safeInput.targetExamKey || "DS1").trim();

    // حساب الإحصائيات من لائحة النقط إن توفرت أو استعمال القيم الممررة مباشرة
    var rawGradesList = Array.isArray(safeInput.studentGrades)
      ? safeInput.studentGrades
      : Array.isArray(safeInput.studentScores)
      ? safeInput.studentScores
      : [];
    var grades = rawGradesList
      .map(function (g) {
        return Number(g);
      })
      .filter(function (n) {
        return !isNaN(n) && n >= 0 && n <= 20;
      });

    var totalStudents =
      grades.length > 0
        ? grades.length
        : Math.max(1, Number(safeInput.totalStudents) || 32);

    var classAverage = 11.2;
    var passCount = 0;
    var strugglingCount = 0;
    var excellenceCount = 0;

    if (grades.length > 0) {
      var sum = grades.reduce(function (acc, val) {
        return acc + val;
      }, 0);
      classAverage = Number((sum / grades.length).toFixed(2));
      passCount = grades.filter(function (g) {
        return g >= 10;
      }).length;
      strugglingCount = grades.filter(function (g) {
        return g < 8;
      }).length;
      excellenceCount = grades.filter(function (g) {
        return g >= 16;
      }).length;
    } else {
      classAverage =
        safeInput.classAverage !== undefined
          ? Number(Number(safeInput.classAverage).toFixed(2))
          : 11.2;
      strugglingCount =
        safeInput.strugglingCount !== undefined
          ? Math.max(0, Math.round(Number(safeInput.strugglingCount)))
          : classAverage < 10
          ? Math.round(totalStudents * 0.42)
          : Math.round(totalStudents * 0.18);
      var passRateInput =
        safeInput.passRatePercent !== undefined
          ? Number(safeInput.passRatePercent)
          : classAverage >= 12
          ? 75
          : classAverage >= 10
          ? 58
          : 36;
      passCount = Math.round((passRateInput / 100) * totalStudents);
      excellenceCount =
        safeInput.excellenceCount !== undefined
          ? Number(safeInput.excellenceCount)
          : classAverage >= 13
          ? Math.round(totalStudents * 0.2)
          : Math.round(totalStudents * 0.08);
    }

    var passRatePercent = Number(((passCount / totalStudents) * 100).toFixed(1));
    var strugglingRatio = Number((strugglingCount / totalStudents).toFixed(2));

    // قائمة الدروس والمحاور المنجزة فعلياً في دفتر النصوص
    var sourceLessonsList = Array.isArray(safeInput.completedLessons)
      ? safeInput.completedLessons
      : Array.isArray(safeInput.lessons)
      ? safeInput.lessons
      : [];
    var completedLessons = sourceLessonsList.map(function (item, idx) {
      if (typeof item === "string") {
        return {
          order: idx + 1,
          lessonAr: item,
          lessonFr: item,
          axisAr: "تحليل / جبر",
          completedHours: 8,
          completionRatePercent: 100,
        };
      }
      return {
        order: item.order || idx + 1,
        lessonAr: item.lessonAr || item.titleAr || "درس منجز",
        lessonFr: item.lessonFr || item.titleFr || item.lessonAr || "Chapitre réalisé",
        axisAr: item.axisAr || item.category || "المحور البيداغوجي المنجز",
        completedHours: Number(item.completedHours || item.hoursCompleted || item.hours) || 8,
        completionRatePercent:
          item.completionRatePercent !== undefined
            ? Number(item.completionRatePercent)
            : 100,
      };
    });

    // التوصية الآلية بنوع الوثيقة المطلوب إنتاجها في التطبيق الثاني
    var recommendedDocumentCode = "DS_142_08";
    var recommendedSubType = "SERIE_TD";
    var recommendationCategory = "SUPERVISED_EXAM_OR_SYNTHESIS";
    var recommendationTitleAr =
      "إنتاج فرض محروس معياري (142-08) أو سلسلة تمارين توليفية";
    var recommendationRationaleAr = "";
    var recommendedSkillDistribution = { n1: 30, n2: 50, n3: 20 };

    if (classAverage < 10 || passRatePercent < 50 || strugglingRatio >= 0.3) {
      recommendedDocumentCode = "DM_SERIE";
      recommendedSubType = "SERIE_TD";
      recommendationCategory = "REMEDIATION_AND_SUPPORT_SERIES";
      recommendationTitleAr =
        "سلسلة دعم ومعالجة مركزة لتجاوز التعثرات المرصودة قبل الفرض الموالي";
      recommendationRationaleAr =
        "نظراً لكون معدل القسم (" +
        classAverage +
        "/20) ونسبة الاستيفاء (" +
        passRatePercent +
        "%) وعدد المتعثرين أقل من 8 (" +
        strugglingCount +
        " تلميذاً)، يوصي المحرك بإنتاج سلسلة دعم ومعالجة مركزة تركز على القدرات الأساسية (N1/N2) مرفقة بتذكير القواعد وإرشادات الحل.";
      recommendedSkillDistribution = { n1: 50, n2: 40, n3: 10 };
    } else if (classAverage >= 12.5 && passRatePercent >= 70) {
      recommendedDocumentCode = "DS_142_08";
      recommendedSubType = "SERIE_TD";
      recommendationCategory = "SYNTHESIS_SERIES_OR_DS";
      recommendationTitleAr =
        "فرض محروس توليفي أو سلسلة تمارين التعمق والمسائل التوليفية (N2/N3)";
      recommendationRationaleAr =
        "سجل القسم مؤشرات تحصيل متميزة (المعدل " +
        classAverage +
        "/20 ونسبة الاستيفاء " +
        passRatePercent +
        "%)؛ يوصى بإنتاج فرض محروس بمكون توليفي أو سلسلة تمارين توليفية لتعزيز مهارات الاستدلال والتميّز.";
      recommendedSkillDistribution = { n1: 20, n2: 50, n3: 30 };
    } else {
      recommendedDocumentCode = "DS_142_08";
      recommendedSubType = "DEVOIR_MAISON";
      recommendationCategory = "STANDARD_DS_AND_PREP_DM";
      recommendationTitleAr =
        "فرض محروس رسمي (مذكرة 142-08) مسبوق بفرض منزلي تحضيري للمحاور المنجزة";
      recommendationRationaleAr =
        "تحصيل القسم متوازن (المعدل " +
        classAverage +
        "/20 ونسبة الاستيفاء " +
        passRatePercent +
        "%) مع استكمال الدروس المقررة في دفتر النصوص؛ يوصى ببرمجة الفرض المحروس بتوزيع معياري متوازن (30% N1 · 50% N2 · 20% N3).";
      recommendedSkillDistribution = { n1: 30, n2: 50, n3: 20 };
    }

    return {
      schema: "lesson-log-companion-brief-v1",
      generatedAt: new Date().toISOString(),
      sourceApp: "PedagogicalTrackingAndManagementApp",
      targetApp: "KouziberDocumentProductionStudio",
      classIdentity: {
        className: safeInput.className || trackCode + "-G1",
        trackCode: trackCode,
        trackLabelAr: safeInput.trackLabelAr || trackCode,
        trackLabelFr: safeInput.trackLabelFr || trackCode,
        coefficient: coefficient,
        semester: semester,
        targetExamKey: examKey,
        school: safeInput.school || "",
        professor: safeInput.professor || "",
        academicYear: safeInput.academicYear || "2025/2026",
      },
      cahierDeTexteProgress: {
        totalCompletedLessons: completedLessons.length,
        totalCompletedHours: completedLessons.reduce(function (acc, l) {
          return acc + (Number(l.completedHours) || 0);
        }, 0),
        completedLessons: completedLessons,
      },
      classDiagnosticMetrics: {
        totalStudents: totalStudents,
        classAverage: classAverage,
        passCountGte10: passCount,
        passRatePercent: passRatePercent,
        strugglingCountLt8: strugglingCount,
        strugglingRatioPercent: Number((strugglingRatio * 100).toFixed(1)),
        excellenceCountGte16: excellenceCount,
      },
      automatedPedagogicalRecommendation: {
        recommendationCategory: recommendationCategory,
        recommendedModuleInStudio: recommendedDocumentCode,
        recommendedDmSubType: recommendedSubType,
        recommendationTitleAr: recommendationTitleAr,
        recommendationRationaleAr: recommendationRationaleAr,
        recommendedSkillDistribution: recommendedSkillDistribution,
        enableSubQuestionDecomposition: true,
        enableStepByStepHints: classAverage < 11.5,
      },
    };
  }

  /**
   * الآلية الثانية:
   * استيراد وتطبيع بيانات الوثائق المنتجة في تطبيق إنتاج الوثائق
   * لإدراجها تلقائياً في المكتبة التربوية الرقمية ودفتر النصوص
   * LessonLogEngine.normalizeImportedCompanionDocument(rawDoc)
   */
  function normalizeImportedCompanionDocument(rawDoc) {
    if (!rawDoc || typeof rawDoc !== "object") {
      throw new Error("ملف الوثيقة المستوردة غير صالح أو فارغ.");
    }

    var trackCode = String(
      rawDoc.trackCode ||
        (rawDoc.classIdentity && rawDoc.classIdentity.trackCode) ||
        "2BAC_PC"
    ).trim();
    var coefficient =
      Number(rawDoc.coefficient) ||
      OFFICIAL_TRACK_COEFFICIENTS[trackCode] ||
      7;
    var semester = rawDoc.semester === "S2" ? "S2" : "S1";
    var rawType = String(rawDoc.documentType || rawDoc.activeModule || "DS_142_08");
    var subType = String(rawDoc.subType || rawDoc.dmSubType || "");

    var normalizedDocKind = "DEVOIR_SURVEILLE";
    var normalizedKindLabelAr = "فرض محروس رسمي (مذكرة 142-08)";
    var defaultAllocatedHours = 2;

    if (rawType === "DM_SERIE" && (subType === "SERIE_TD" || subType === "SERIE_EXERCICES")) {
      if (rawDoc.isRemediationSeries || (rawDoc.skillDistribution && rawDoc.skillDistribution.n1 >= 45)) {
        normalizedDocKind = "SERIE_SOUTIEN_REMEDIATION";
        normalizedKindLabelAr = "سلسلة دعم ومعالجة مركزة";
        defaultAllocatedHours = 2;
      } else {
        normalizedDocKind = "SERIE_EXERCICES_TD";
        normalizedKindLabelAr = "سلسلة تمارين تطبيقية وتوليفية";
        defaultAllocatedHours = 3;
      }
    } else if (rawType === "DM_SERIE" && subType === "DEVOIR_MAISON") {
      normalizedDocKind = "DEVOIR_MAISON";
      normalizedKindLabelAr = "فرض منزلي بحثي أو تحضيري";
      defaultAllocatedHours = 1;
    } else if (rawType === "FICHE_OP2007") {
      normalizedDocKind = "FICHE_COURS_PEDAGOGIQUE";
      normalizedKindLabelAr = "جذاذة درس بيداغوجية كاملة (OP 2007)";
      defaultAllocatedHours = Number(rawDoc.allocatedHours) || 10;
    } else if (rawType === "DIAGNOSTIC") {
      normalizedDocKind = "EVALUATION_DIAGNOSTIQUE";
      normalizedKindLabelAr = "رائز تقويم تشخيصي للمستلزمات";
      defaultAllocatedHours = 1;
    } else if (rawType === "REPARTITION_CERTIF") {
      normalizedDocKind = "REPARTITION_SEMESTRIELLE";
      normalizedKindLabelAr = "توزيع دوري للمقرر وخطة الإشهاد";
      defaultAllocatedHours = 2;
    } else if (rawType === "STANDALONE_SUMMARY" || rawDoc.summaryId) {
      normalizedDocKind = "RESUME_COURS_SYNTHESE";
      normalizedKindLabelAr = "ملخص درس مركز وخريطة ذهنية";
      defaultAllocatedHours = 1;
    } else if (rawType === "COMPLETE_UNIT_DOSSIER" || rawDoc.dossierId) {
      normalizedDocKind = "DOSSIER_PEDAGOGIQUE_COMPLET";
      normalizedKindLabelAr = "حقيبة بيداغوجية متكاملة للوحدة (5 في 1)";
      defaultAllocatedHours = 12;
    }

    var rawLessons = Array.isArray(rawDoc.lessons) ? rawDoc.lessons : [];
    var primaryAxisAr =
      rawDoc.targetAxisAr ||
      (rawLessons[0] && (rawLessons[0].category || rawLessons[0].subCategory || rawLessons[0].lessonAr)) ||
      "التحليل والجبر";
    var primaryAxisFr =
      rawDoc.targetAxisFr ||
      (rawLessons[0] && (rawLessons[0].lessonFr || rawLessons[0].category)) ||
      "Analyse & Algèbre";

    var totalAllocatedHours =
      Number(rawDoc.allocatedHours) ||
      rawLessons.reduce(function (acc, l) {
        return acc + (parseInt(l.hours, 10) || 0);
      }, 0) ||
      defaultAllocatedHours;

    var lessonTitlesAr = rawLessons.map(function (l) {
      return l.lessonAr || l.titleAr || "درس";
    });
    var lessonTitlesFr = rawLessons.map(function (l) {
      return l.lessonFr || l.titleFr || "Chapitre";
    });

    var documentTitleAr =
      rawDoc.titleAr ||
      normalizedKindLabelAr +
        " — " +
        (rawDoc.trackLabelAr || trackCode) +
        " (" +
        semester +
        (rawDoc.examKey ? " · " + rawDoc.examKey : "") +
        ")";

    var nowIso = new Date().toISOString();
    var docId =
      rawDoc.documentId ||
      "DOC-BRIDGE-" +
        trackCode +
        "-" +
        semester +
        "-" +
        normalizedDocKind +
        "-" +
        Date.now().toString(36).toUpperCase();

    return {
      isValid: true,
      normalizedSchema: "lesson-log-imported-document-v1",
      importedAt: nowIso,
      documentId: docId,
      // 1. الإدراج التلقائي في المكتبة التربوية الرقمية
      digitalLibraryEntry: {
        id: docId,
        kind: normalizedDocKind,
        kindLabelAr: normalizedKindLabelAr,
        titleAr: documentTitleAr,
        titleFr: rawDoc.titleFr || normalizedDocKind + " — " + trackCode,
        trackCode: trackCode,
        trackLabelAr: rawDoc.trackLabelAr || trackCode,
        coefficient: coefficient,
        semester: semester,
        examKey: rawDoc.examKey || "DS1",
        targetAxisAr: primaryAxisAr,
        targetAxisFr: primaryAxisFr,
        allocatedHours: totalAllocatedHours,
        totalPoints: Number(rawDoc.totalPoints) || 20,
        totalQuestions: Number(rawDoc.totalQuestions) || rawLessons.length * 3,
        totalSubQuestions: Number(rawDoc.totalSubQuestions) || 0,
        skillDistribution: rawDoc.skillDistribution || { n1: 30, n2: 50, n3: 20 },
        coveredLessons: rawLessons.map(function (l) {
          return {
            lessonAr: l.lessonAr,
            lessonFr: l.lessonFr,
            category: l.category || primaryAxisAr,
            weight: Number(l.weight) || 25,
            capacitiesAr: Array.isArray(l.capacitiesAr) ? l.capacitiesAr : [],
          };
        }),
      },
      // 2. الإدراج التلقائي في سجل دفتر النصوص (Cahier de Texte)
      cahierDeTexteLogEntry: {
        entryId: "CDT-" + docId,
        dateIso: nowIso.slice(0, 10),
        trackCode: trackCode,
        semester: semester,
        axisAr: primaryAxisAr,
        axisFr: primaryAxisFr,
        allocatedHours: defaultAllocatedHours + "h",
        sessionActivityTypeAr: normalizedKindLabelAr,
        summaryAr:
          "إنجاز واستغلال « " +
          documentTitleAr +
          " » حول المحاور: " +
          (lessonTitlesAr.join("، ") || primaryAxisAr) +
          " (الغلاف الزمني: " +
          defaultAllocatedHours +
          " س · المعامل: " +
          coefficient +
          ").",
        summaryFr:
          "Réalisation de « " +
          normalizedDocKind +
          " » portant sur : " +
          (lessonTitlesFr.join(", ") || primaryAxisFr) +
          " (Volume horaire : " +
          defaultAllocatedHours +
          "h · Coeff : " +
          coefficient +
          ").",
        targetedCapacitiesAr: rawLessons.reduce(function (acc, l) {
          if (Array.isArray(l.capacitiesAr)) {
            return acc.concat(l.capacitiesAr.slice(0, 2));
          }
          return acc;
        }, []),
      },
    };
  }

  /**
   * الآلية الثالثة:
   * قناة التزامن الحي المباشر بين التبويبات والتطبيقين (BroadcastChannel Bridge v2)
   */
  function createLiveCompanionChannel(onMessageCallback) {
    var channelName = "menps_pedagogical_companion_channel_v1";
    var bc =
      typeof BroadcastChannel !== "undefined"
        ? new BroadcastChannel(channelName)
        : null;

    if (bc && typeof onMessageCallback === "function") {
      bc.onmessage = function (ev) {
        if (ev && ev.data) {
          onMessageCallback(ev.data);
        }
      };
    }

    return {
      channelName: channelName,
      isSupported: Boolean(bc),
      broadcastPedagogicalBrief: function (briefInputOrObject) {
        var brief =
          briefInputOrObject && briefInputOrObject.schema === "lesson-log-companion-brief-v1"
            ? briefInputOrObject
            : buildCompanionAppPedagogicalBrief(briefInputOrObject);
        if (bc) {
          bc.postMessage({ type: "COMPANION_PEDAGOGICAL_BRIEF", payload: brief });
        }
        return brief;
      },
      broadcastProducedDocument: function (rawDoc) {
        var normalized = normalizeImportedCompanionDocument(rawDoc);
        if (bc) {
          bc.postMessage({ type: "COMPANION_PRODUCED_DOCUMENT", payload: normalized });
        }
        return normalized;
      },
      close: function () {
        if (bc) bc.close();
      },
    };
  }

  return {
    version: "2.0.0",
    OFFICIAL_TRACK_COEFFICIENTS: OFFICIAL_TRACK_COEFFICIENTS,
    buildCompanionAppPedagogicalBrief: buildCompanionAppPedagogicalBrief,
    normalizeImportedCompanionDocument: normalizeImportedCompanionDocument,
    createLiveCompanionChannel: createLiveCompanionChannel,
  };
});
