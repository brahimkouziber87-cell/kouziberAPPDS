import React, { useState, useMemo, useEffect } from "react";
import {
  Compass,
  Box,
  CircleDot,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  Eye,
  Layers,
  Sliders,
  Search,
  ExternalLink,
  QrCode,
  X,
  FilePlus2,
  Check,
  Maximize2,
  Grid,
  MoveHorizontal,
} from "lucide-react";
import {
  GeoGebraResource,
  InsertedFigure,
  LessonItem,
  GEOGEBRA_PRESET_LIBRARY,
} from "../data/curriculum";

export type GeoGebraCategoryFilter =
  | "ALL"
  | "ESPACE_3D"
  | "PLAN_SCALAIRE"
  | "COMPLEXES"
  | "TRIGONOMETRIE"
  | "ANALYSE_COURBES"
  | "CUSTOM";

export interface GeoGebraTemplateItem {
  id: string;
  category: Exclude<GeoGebraCategoryFilter, "ALL">;
  titleAr: string;
  titleFr: string;
  lessonMatchFr: string;
  descriptionAr: string;
  materialId: string;
  interactiveUrl: string;
  is3D?: boolean;
  svgTemplateKind:
    | "SPHERE_PLANE_3D"
    | "VECTOR_CROSS_3D"
    | "TETRAHEDRON_3D"
    | "CIRCLE_TANGENT_2D"
    | "COMPLEX_ROTATION_2D"
    | "TRIGO_UNIT_CIRCLE"
    | "FUNCTION_TANGENT_ASYMPTOTE"
    | "PARABOLA_DIRECTRIX";
  defaultCaptionAr: string;
  defaultCaptionFr: string;
  mathAnnotationLatex: string;
  isUserCreated?: boolean;
}

interface GeoGebraTemplatesLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeLessons: LessonItem[];
  insertedFigures: InsertedFigure[];
  geoGebraResourcesMap: Record<string, GeoGebraResource>;
  onInsertFigureToExam: (figure: InsertedFigure) => void;
  onDeleteFigureFromExam: (figureId: string) => void;
  onUpdateGeoGebraResource: (lessonKey: string, resource: GeoGebraResource) => void;
  isMission?: boolean;
  onNotify?: (type: "success" | "error" | "info", msg: string) => void;
}

const STORAGE_KEY_CUSTOM_GGB_TEMPLATES = "math_pedagogy_custom_ggb_templates_v1";

const BUILTIN_GEOGEBRA_TEMPLATES: GeoGebraTemplateItem[] = [
  {
    id: "ggb_tpl_sphere_plane_3d",
    category: "ESPACE_3D",
    titleAr: "تقاطع فلكة (S) ومستوى (P) في الفضاء المنسوب لمعلم متعامد ممنظم",
    titleFr: "Intersection d'une Sphère (S) et d'un Plan (P) dans l'espace 3D",
    lessonMatchFr: "Géométrie dans l'espace (Produit scalaire et vectoriel)",
    descriptionAr:
      "يوضح مركز الفلكة Ω(a,b,c)، المسقط العمودي H على المستوى (P)، ودائرة التقاطع (Γ) ذات الشعاع r = √(R² - d²).",
    materialId: "r8k9vxpc",
    interactiveUrl: "https://www.geogebra.org/m/r8k9vxpc",
    is3D: true,
    svgTemplateKind: "SPHERE_PLANE_3D",
    defaultCaptionAr:
      "الشكل 1: تقاطع الفلكة (S) والمستوى (P) وفق الدائرة (Γ) التي مركزها H",
    defaultCaptionFr:
      "Fig 1 : Section de la sphère (S) par le plan (P) suivant le cercle (Γ) de centre H",
    mathAnnotationLatex: "d(\\Omega, (P)) = \\frac{|ax_\\Omega+by_\\Omega+cz_\\Omega+d|}{\\sqrt{a^2+b^2+c^2}} < R",
  },
  {
    id: "ggb_tpl_vector_cross_3d",
    category: "ESPACE_3D",
    titleAr: "الجداء المتجهي u⃗ ∧ v⃗ والمنظمي على المستوى (ABC)",
    titleFr: "Produit Vectoriel AB⃗ ∧ AC⃗ et Vecteur Normal au Plan (ABC)",
    lessonMatchFr: "Géométrie dans l'espace (Produit scalaire et vectoriel)",
    descriptionAr:
      "يمثل المعلم المتعامد الممنظم المباشر (O,i⃗,j⃗,k⃗) ومتجهة الجداء المتجهي العمودية على المستوى ومساحة متوازي الأضلاع.",
    materialId: "r8k9vxpc",
    interactiveUrl: "https://www.geogebra.org/3d",
    is3D: true,
    svgTemplateKind: "VECTOR_CROSS_3D",
    defaultCaptionAr:
      "الشكل 2: المتجهة المنظمية n⃗ = AB⃗ ∧ AC⃗ على المستوى (ABC) في الفضاء",
    defaultCaptionFr:
      "Fig 2 : Vecteur normal n⃗ = AB⃗ ∧ AC⃗ orthogonal au plan (ABC)",
    mathAnnotationLatex: "\\vec{n} = \\overrightarrow{AB} \\wedge \\overrightarrow{AC} \\perp (ABC)",
  },
  {
    id: "ggb_tpl_tetrahedron_3d",
    category: "ESPACE_3D",
    titleAr: "رباعي الأوجه ABCD والمقطع المستوي الموازي للقاعدة",
    titleFr: "Tétraèdre ABCD, Droites Orthogonales et Section Plane",
    lessonMatchFr: "Géométrie dans l'espace",
    descriptionAr:
      "مناسب لتمارين الهندسة الفضائية للجذع المشترك والأولى والثانية بكالوريا (حساب الحجم والمسافة وتقاطع المستقيمات).",
    materialId: "t3tr4h3d",
    interactiveUrl: "https://www.geogebra.org/3d",
    is3D: true,
    svgTemplateKind: "TETRAHEDRON_3D",
    defaultCaptionAr:
      "الشكل 3: رباعي الأوجه المنتظم ABCD ومسقط الارتفاع [AH]",
    defaultCaptionFr:
      "Fig 3 : Tétraèdre ABCD et projection orthogonale H sur la base (BCD)",
    mathAnnotationLatex: "V_{ABCD} = \\frac{1}{6} |(\\overrightarrow{AB} \\wedge \\overrightarrow{AC}) \\cdot \\overrightarrow{AD}|",
  },
  {
    id: "ggb_tpl_circle_tangent_2d",
    category: "PLAN_SCALAIRE",
    titleAr: "الدائرة (C) والمستقيم المماس (Δ) ومجموعة النقط MA⃗·MB⃗ = 0",
    titleFr: "Cercle (C), Droite Tangente (Δ) et Produit Scalaire dans le Plan",
    lessonMatchFr: "Produit scalaire dans le plan",
    descriptionAr:
      "شكل هندسي مستوٍ دقيق يظهر مركز الدائرة Ω، نقطة التماس A، تعامد الشعاع مع المماس، والدائرة المحيطة بالمثلث القائم.",
    materialId: "q7v4wxyz",
    interactiveUrl: "https://www.geogebra.org/m/q7v4wxyz",
    svgTemplateKind: "CIRCLE_TANGENT_2D",
    defaultCaptionAr:
      "الشكل 4: الدائرة (C) ذات القطر [AB] والمماس (Δ) في النقطة A",
    defaultCaptionFr:
      "Fig 4 : Cercle (C) de diamètre [AB] et tangente orthogonale (Δ) en A",
    mathAnnotationLatex: "M(x,y) \\in (\\mathcal{C}) \\iff \\overrightarrow{MA} \\cdot \\overrightarrow{MB} = 0",
  },
  {
    id: "ggb_tpl_complex_rotation_2d",
    category: "COMPLEXES",
    titleAr: "المستوى العقدي (O,u⃗,v⃗): الدوران والتحاكي والمثلث المتساوي الأضلاع",
    titleFr: "Plan Complexe (O,u⃗,v⃗) : Rotation d'angle π/3 et Triangle Équilatéral",
    lessonMatchFr: "Nombres complexes",
    descriptionAr:
      "يمثل النقط A(z_A) و B(z_B) و C(z_C) في المستوى العقدي مع قوس زاوية الدوران θ = π/3 ومعيار العدد العقدي.",
    materialId: "c4mpx92k",
    interactiveUrl: "https://www.geogebra.org/m/c4mpx92k",
    svgTemplateKind: "COMPLEX_ROTATION_2D",
    defaultCaptionAr:
      "الشكل 5: التمثيل العقدي للنقط A و B و C وصورة B بالدوران R(A, π/3)",
    defaultCaptionFr:
      "Fig 5 : Plan complexe et image par la rotation R de centre A et d'angle π/3",
    mathAnnotationLatex: "z' - z_A = e^{i\\frac{\\pi}{3}}(z - z_A) \\implies ABC \\text{ équilatéral}",
  },
  {
    id: "ggb_tpl_trigo_unit_circle",
    category: "TRIGONOMETRIE",
    titleAr: "الدائرة المثلثية والأفاصيل المنحنية وحل المعادلات المثلثية",
    titleFr: "Cercle Trigonométrique, Abscisses Curvilignes et Équations",
    lessonMatchFr: "Calcul trigonométrique",
    descriptionAr:
      "الدائرة المثلثية الموجهة مع الزوايا الاعتيادية (π/6, π/4, π/3) وتمثيل cos(x) و sin(x) و tan(x) مبيانياً.",
    materialId: "tr9g2025",
    interactiveUrl: "https://www.geogebra.org/m/tr9g2025",
    svgTemplateKind: "TRIGO_UNIT_CIRCLE",
    defaultCaptionAr:
      "الشكل 6: الدائرة المثلثية وتمثيل الحلول على المجال [-π, π]",
    defaultCaptionFr:
      "Fig 6 : Cercle trigonométrique orienté et lecture des solutions sur [-π, π]",
    mathAnnotationLatex: "\\cos^2(x) + \\sin^2(x) = 1 \\quad ; \\quad M(\\cos x, \\sin x)",
  },
  {
    id: "ggb_tpl_function_curve_tangent",
    category: "ANALYSE_COURBES",
    titleAr: "المنحنى (Cf) والمقارب المائل (Δ) والمماس في نقطة الانعطاف",
    titleFr: "Courbe (Cf), Asymptote Oblique (Δ), Tangente et Point d'Inflexion",
    lessonMatchFr: "Étude des fonctions",
    descriptionAr:
      "تمثيل مبياني شامل لدالة عددية يوضح الوضع النسبي مع المستقيم المقارب y = x - 1 والمماس الأفقي والمائل.",
    materialId: "fn8crv24",
    interactiveUrl: "https://www.geogebra.org/calculator",
    svgTemplateKind: "FUNCTION_TANGENT_ASYMPTOTE",
    defaultCaptionAr:
      "الشكل 7: المنحنى (Cf) والمستقيم المقارب المائل (Δ) والمماس (T)",
    defaultCaptionFr:
      "Fig 7 : Courbe représentative (Cf), asymptote oblique (Δ) et tangente (T)",
    mathAnnotationLatex: "\\lim_{x\\to +\\infty} [f(x) - (ax+b)] = 0",
  },
  {
    id: "ggb_tpl_parabola_conic",
    category: "ANALYSE_COURBES",
    titleAr: "القطع المكافئ والهذلول والمماسات المشتركة في معلم متعامد",
    titleFr: "Parabole, Hyperbole et Position Relative de Deux Courbes",
    lessonMatchFr: "Généralités sur les fonctions",
    descriptionAr:
      "يبرز نقط تقاطع منحنيين (Cf) و (Cg) وحيز التكامل المحصور بينهما لتلاميذ البكالوريا.",
    materialId: "prb2025x",
    interactiveUrl: "https://www.geogebra.org/calculator",
    svgTemplateKind: "PARABOLA_DIRECTRIX",
    defaultCaptionAr:
      "الشكل 8: الوضع النسبي للمنحنيين (Cf) و (Cg) والحيز المستوي المحصور بينهما",
    defaultCaptionFr:
      "Fig 8 : Position relative de (Cf) et (Cg) et calcul d'aire intégrale",
    mathAnnotationLatex: "\\mathcal{A} = \\int_a^b |f(x) - g(x)|\\,dx \\times \\|\\vec{i}\\|\\|\\vec{j}\\|",
  },
];

/**
 * مولد المعاينات الشعاعية الدقيقة (High-DPI Vector SVG DataURL Generator)
 * ينشئ رسماً هندسياً أكاديمياً جاهزاً للإدراج المباشر في التمارين والطباعة
 */
export function generateGeoGebraTemplateSvgDataUrl(
  kind: GeoGebraTemplateItem["svgTemplateKind"],
  options: {
    showGrid: boolean;
    colorScheme: "ACADEMIC_BLUE" | "MONO_BLACK" | "EMERALD_TEAL";
    scaleParam?: number;
  }
): string {
  const isMono = options.colorScheme === "MONO_BLACK";
  const isEmerald = options.colorScheme === "EMERALD_TEAL";

  const primaryStroke = isMono
    ? "#0f172a"
    : isEmerald
    ? "#047857"
    : "#1d4ed8";
  const secondaryStroke = isMono
    ? "#334155"
    : isEmerald
    ? "#0d9488"
    : "#dc2626";
  const accentFill = isMono
    ? "rgba(15,23,42,0.08)"
    : isEmerald
    ? "rgba(16,185,129,0.14)"
    : "rgba(59,130,246,0.14)";
  const gridStroke = options.showGrid ? "#e2e8f0" : "transparent";

  let innerSvg = "";

  switch (kind) {
    case "SPHERE_PLANE_3D":
      innerSvg = `
        <!-- محاور الفضاء 3D -->
        <line x1="210" y1="160" x2="210" y2="25" stroke="#475569" stroke-width="1.8" marker-end="url(#arrow)" />
        <line x1="210" y1="160" x2="375" y2="160" stroke="#475569" stroke-width="1.8" marker-end="url(#arrow)" />
        <line x1="210" y1="160" x2="105" y2="235" stroke="#475569" stroke-width="1.8" marker-end="url(#arrow)" />
        <text x="218" y="34" font-family="serif" font-size="13" font-weight="bold" fill="#0f172a">z</text>
        <text x="365" y="152" font-family="serif" font-size="13" font-weight="bold" fill="#0f172a">y</text>
        <text x="95" y="228" font-family="serif" font-size="13" font-weight="bold" fill="#0f172a">x</text>

        <!-- المستوى القاطع (P) -->
        <polygon points="95,115 295,85 355,155 155,185" fill="${accentFill}" stroke="${secondaryStroke}" stroke-width="1.8" />
        <text x="315" y="105" font-family="serif" font-size="13" font-weight="bold" fill="${secondaryStroke}">(P)</text>

        <!-- الفلكة (S) -->
        <circle cx="220" cy="145" r="74" fill="none" stroke="${primaryStroke}" stroke-width="2.4" />
        <ellipse cx="220" cy="145" rx="74" ry="22" fill="none" stroke="${primaryStroke}" stroke-width="1.2" stroke-dasharray="5,4" />

        <!-- دائرة التقاطع (Γ) -->
        <ellipse cx="220" cy="122" rx="62" ry="18" fill="rgba(220,38,38,0.12)" stroke="${secondaryStroke}" stroke-width="2.2" />
        
        <!-- المركز Ω والمسقط H والشعاع R -->
        <circle cx="220" cy="145" r="3.5" fill="#0f172a" />
        <text x="228" y="152" font-family="serif" font-size="13" font-weight="bold" fill="#0f172a">Ω</text>
        <circle cx="220" cy="122" r="3.5" fill="${secondaryStroke}" />
        <text x="202" y="116" font-family="serif" font-size="12" font-weight="bold" fill="${secondaryStroke}">H</text>
        <line x1="220" y1="145" x2="220" y2="122" stroke="#0f172a" stroke-width="1.8" />
        <line x1="220" y1="122" x2="282" y2="122" stroke="${secondaryStroke}" stroke-width="1.8" />
        <line x1="220" y1="145" x2="282" y2="122" stroke="${primaryStroke}" stroke-width="1.8" stroke-dasharray="3,3" />
        <text x="248" y="117" font-family="serif" font-size="11" font-weight="bold" fill="${secondaryStroke}">r</text>
        <text x="256" y="142" font-family="serif" font-size="11" font-weight="bold" fill="${primaryStroke}">R</text>
      `;
      break;

    case "VECTOR_CROSS_3D":
      innerSvg = `
        <!-- المستوى (ABC) -->
        <polygon points="85,195 255,215 345,135 175,115" fill="${accentFill}" stroke="#64748b" stroke-width="1.5" />
        <!-- المتجهتان AB و AC -->
        <line x1="165" y1="175" x2="285" y2="188" stroke="${primaryStroke}" stroke-width="2.6" marker-end="url(#arrow)" />
        <line x1="165" y1="175" x2="235" y2="132" stroke="#0d9488" stroke-width="2.6" marker-end="url(#arrow)" />
        <!-- الجداء المتجهي العمودي -->
        <line x1="165" y1="175" x2="165" y2="48" stroke="${secondaryStroke}" stroke-width="3" marker-end="url(#arrow)" />
        <!-- رمز الزاوية القائمة -->
        <polyline points="165,160 180,162 180,177" fill="none" stroke="${secondaryStroke}" stroke-width="1.5" />
        <circle cx="165" cy="175" r="4" fill="#0f172a" />
        <text x="148" y="188" font-family="serif" font-size="14" font-weight="bold" fill="#0f172a">A</text>
        <text x="292" y="194" font-family="serif" font-size="14" font-weight="bold" fill="${primaryStroke}">B (u⃗)</text>
        <text x="242" y="128" font-family="serif" font-size="14" font-weight="bold" fill="#0d9488">C (v⃗)</text>
        <text x="175" y="58" font-family="serif" font-size="14" font-weight="bold" fill="${secondaryStroke}">n⃗ = AB⃗ ∧ AC⃗</text>
      `;
      break;

    case "TETRAHEDRON_3D":
      innerSvg = `
        <polygon points="210,35 105,195 245,225 325,165" fill="${accentFill}" stroke="${primaryStroke}" stroke-width="2.2" />
        <line x1="210" y1="35" x2="245" y2="225" stroke="${primaryStroke}" stroke-width="2.2" />
        <line x1="105" y1="195" x2="325" y2="165" stroke="${primaryStroke}" stroke-width="1.5" stroke-dasharray="5,5" />
        <!-- الارتفاع AH -->
        <line x1="210" y1="35" x2="218" y2="188" stroke="${secondaryStroke}" stroke-width="2" stroke-dasharray="4,3" />
        <circle cx="218" cy="188" r="3.5" fill="${secondaryStroke}" />
        <text x="205" y="26" font-family="serif" font-size="14" font-weight="bold" fill="#0f172a">A</text>
        <text x="86" y="202" font-family="serif" font-size="14" font-weight="bold" fill="#0f172a">B</text>
        <text x="248" y="242" font-family="serif" font-size="14" font-weight="bold" fill="#0f172a">C</text>
        <text x="334" y="170" font-family="serif" font-size="14" font-weight="bold" fill="#0f172a">D</text>
        <text x="225" y="185" font-family="serif" font-size="13" font-weight="bold" fill="${secondaryStroke}">H</text>
      `;
      break;

    case "CIRCLE_TANGENT_2D":
      innerSvg = `
        <!-- المحوران -->
        <line x1="40" y1="145" x2="380" y2="145" stroke="#64748b" stroke-width="1.5" marker-end="url(#arrow)" />
        <line x1="160" y1="245" x2="160" y2="20" stroke="#64748b" stroke-width="1.5" marker-end="url(#arrow)" />
        <!-- الدائرة (C) -->
        <circle cx="215" cy="125" r="72" fill="${accentFill}" stroke="${primaryStroke}" stroke-width="2.5" />
        <!-- القطر AB والمثلث القائم AMB -->
        <line x1="143" y1="125" x2="287" y2="125" stroke="#0f172a" stroke-width="1.8" />
        <polygon points="143,125 287,125 251,63" fill="none" stroke="#0d9488" stroke-width="1.8" />
        <!-- المماس (Δ) في النقطة B -->
        <line x1="287" y1="30" x2="287" y2="225" stroke="${secondaryStroke}" stroke-width="2.2" />
        <circle cx="215" cy="125" r="3.5" fill="#0f172a" />
        <text x="210" y="142" font-family="serif" font-size="13" font-weight="bold" fill="#0f172a">Ω</text>
        <text x="126" y="122" font-family="serif" font-size="13" font-weight="bold" fill="#0f172a">A</text>
        <text x="294" y="122" font-family="serif" font-size="13" font-weight="bold" fill="#0f172a">B</text>
        <text x="252" y="55" font-family="serif" font-size="13" font-weight="bold" fill="#0d9488">M</text>
        <text x="296" y="48" font-family="serif" font-size="13" font-weight="bold" fill="${secondaryStroke}">(Δ)</text>
      `;
      break;

    case "COMPLEX_ROTATION_2D":
      innerSvg = `
        <line x1="50" y1="205" x2="375" y2="205" stroke="#475569" stroke-width="1.6" marker-end="url(#arrow)" />
        <line x1="115" y1="240" x2="115" y2="25" stroke="#475569" stroke-width="1.6" marker-end="url(#arrow)" />
        <text x="98" y="222" font-family="serif" font-size="13" font-weight="bold" fill="#0f172a">O</text>
        <!-- مثلث متساوي الأضلاع ABC بالدوران π/3 -->
        <polygon points="155,175 305,155 215,52" fill="${accentFill}" stroke="${primaryStroke}" stroke-width="2.4" />
        <!-- قوس زاوية الدوران -->
        <path d="M 205,168 A 52,52 0 0,0 182,130" fill="none" stroke="${secondaryStroke}" stroke-width="2" marker-end="url(#arrow)" />
        <text x="208" y="142" font-family="serif" font-size="13" font-weight="bold" fill="${secondaryStroke}">θ = π/3</text>
        <circle cx="155" cy="175" r="4" fill="#0f172a" />
        <circle cx="305" cy="155" r="4" fill="${primaryStroke}" />
        <circle cx="215" cy="52" r="4" fill="${secondaryStroke}" />
        <text x="135" y="192" font-family="serif" font-size="13" font-weight="bold" fill="#0f172a">A(z_A)</text>
        <text x="312" y="162" font-family="serif" font-size="13" font-weight="bold" fill="${primaryStroke}">B(z_B)</text>
        <text x="205" y="42" font-family="serif" font-size="13" font-weight="bold" fill="${secondaryStroke}">C = R(B)</text>
      `;
      break;

    case "TRIGO_UNIT_CIRCLE":
      innerSvg = `
        <line x1="55" y1="135" x2="365" y2="135" stroke="#475569" stroke-width="1.6" marker-end="url(#arrow)" />
        <line x1="210" y1="245" x2="210" y2="20" stroke="#475569" stroke-width="1.6" marker-end="url(#arrow)" />
        <circle cx="210" cy="135" r="85" fill="${accentFill}" stroke="${primaryStroke}" stroke-width="2.4" />
        <!-- النقطة M(cos x, sin x) -->
        <line x1="210" y1="135" x2="270" y2="75" stroke="${secondaryStroke}" stroke-width="2.2" />
        <line x1="270" y1="75" x2="270" y2="135" stroke="#0d9488" stroke-width="1.6" stroke-dasharray="4,3" />
        <line x1="270" y1="75" x2="210" y2="75" stroke="#0d9488" stroke-width="1.6" stroke-dasharray="4,3" />
        <circle cx="270" cy="75" r="4" fill="${secondaryStroke}" />
        <text x="278" y="72" font-family="serif" font-size="13" font-weight="bold" fill="${secondaryStroke}">M(x)</text>
        <text x="255" y="152" font-family="serif" font-size="12" font-weight="bold" fill="#0d9488">cos x</text>
        <text x="172" y="80" font-family="serif" font-size="12" font-weight="bold" fill="#0d9488">sin x</text>
      `;
      break;

    case "FUNCTION_TANGENT_ASYMPTOTE":
    case "PARABOLA_DIRECTRIX":
    default:
      innerSvg = `
        <line x1="35" y1="185" x2="385" y2="185" stroke="#475569" stroke-width="1.6" marker-end="url(#arrow)" />
        <line x1="115" y1="245" x2="115" y2="20" stroke="#475569" stroke-width="1.6" marker-end="url(#arrow)" />
        <!-- المقارب المائل (Δ) -->
        <line x1="55" y1="225" x2="365" y2="40" stroke="${secondaryStroke}" stroke-width="1.8" stroke-dasharray="6,4" />
        <text x="330" y="45" font-family="serif" font-size="13" font-weight="bold" fill="${secondaryStroke}">(Δ): y = ax+b</text>
        <!-- المنحنى (Cf) -->
        <path d="M 65,235 Q 135,95 205,135 T 360,48" fill="none" stroke="${primaryStroke}" stroke-width="2.8" />
        <text x="295" y="108" font-family="serif" font-size="14" font-weight="bold" fill="${primaryStroke}">(C_f)</text>
        <!-- نقطة تماس -->
        <circle cx="185" cy="128" r="4" fill="#0f172a" />
        <text x="172" y="115" font-family="serif" font-size="12" font-weight="bold" fill="#0f172a">I(x₀, f(x₀))</text>
      `;
      break;
  }

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 260" width="420" height="260">
    <defs>
      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="${gridStroke}" stroke-width="0.8"/>
      </pattern>
      <marker id="arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155" />
      </marker>
    </defs>
    <rect width="420" height="260" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
    <rect width="420" height="260" rx="12" fill="url(#grid)" />
    ${innerSvg}
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
}

export const GeoGebraTemplatesLibraryModal: React.FC<
  GeoGebraTemplatesLibraryModalProps
> = ({
  isOpen,
  onClose,
  activeLessons,
  insertedFigures,
  onInsertFigureToExam,
  onDeleteFigureFromExam,
  onUpdateGeoGebraResource,
  onNotify,
}) => {
  const [customTemplates, setCustomTemplates] = useState<GeoGebraTemplateItem[]>(
    () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_GGB_TEMPLATES);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {
        // ignore
      }
      return [];
    }
  );

  const [selectedCategory, setSelectedCategory] =
    useState<GeoGebraCategoryFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    BUILTIN_GEOGEBRA_TEMPLATES[0].id
  );

  // إعدادات تخصيص الشكل الهندسي قبل إدراجه في التمرين المخصص
  const [targetExerciseIdx, setTargetExerciseIdx] = useState<string>("ex_0");
  const [figWidthPercent, setFigWidthPercent] = useState<number>(60);
  const [figAlignment, setFigAlignment] = useState<"center" | "left" | "right">(
    "center"
  );
  const [figBorderStyle, setFigBorderStyle] = useState<
    "academic" | "subtle" | "none"
  >("academic");
  const [showGridInSvg, setShowGridInSvg] = useState<boolean>(true);
  const [colorScheme, setColorScheme] = useState<
    "ACADEMIC_BLUE" | "MONO_BLACK" | "EMERALD_TEAL"
  >("ACADEMIC_BLUE");
  const [customCaptionInput, setCustomCaptionInput] = useState<string>("");
  const [attachInteractiveQr, setAttachInteractiveQr] = useState<boolean>(true);
  const [showLiveIframe, setShowLiveIframe] = useState<boolean>(false);

  // حالة نموذج إضافة قالب GeoGebra مخصص جديد للمكتبة
  const [isCreatingTemplate, setIsCreatingTemplate] = useState<boolean>(false);
  const [newTplTitleAr, setNewTplTitleAr] = useState<string>("");
  const [newTplTitleFr, setNewTplTitleFr] = useState<string>("");
  const [newTplMaterialUrl, setNewTplMaterialUrl] = useState<string>(
    "https://www.geogebra.org/m/r8k9vxpc"
  );
  const [newTplCategory, setNewTplCategory] =
    useState<Exclude<GeoGebraCategoryFilter, "ALL">>("ESPACE_3D");
  const [newTplSvgKind, setNewTplSvgKind] =
    useState<GeoGebraTemplateItem["svgTemplateKind"]>("SPHERE_PLANE_3D");

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY_CUSTOM_GGB_TEMPLATES,
        JSON.stringify(customTemplates)
      );
    } catch {
      // ignore
    }
  }, [customTemplates]);

  const allTemplates = useMemo(
    () => [...customTemplates, ...BUILTIN_GEOGEBRA_TEMPLATES],
    [customTemplates]
  );

  const filteredTemplates = useMemo(() => {
    return allTemplates.filter((tpl) => {
      if (selectedCategory !== "ALL") {
        if (selectedCategory === "CUSTOM" && !tpl.isUserCreated) return false;
        if (selectedCategory !== "CUSTOM" && tpl.category !== selectedCategory)
          return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          tpl.titleAr.toLowerCase().includes(q) ||
          tpl.titleFr.toLowerCase().includes(q) ||
          tpl.descriptionAr.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allTemplates, selectedCategory, searchQuery]);

  const activeTemplate = useMemo(
    () =>
      allTemplates.find((t) => t.id === selectedTemplateId) ||
      filteredTemplates[0] ||
      BUILTIN_GEOGEBRA_TEMPLATES[0],
    [allTemplates, filteredTemplates, selectedTemplateId]
  );

  const activeSvgPreviewDataUrl = useMemo(() => {
    return generateGeoGebraTemplateSvgDataUrl(activeTemplate.svgTemplateKind, {
      showGrid: showGridInSvg,
      colorScheme,
    });
  }, [activeTemplate, showGridInSvg, colorScheme]);

  if (!isOpen) return null;

  const targetExerciseNumber =
    targetExerciseIdx === "global"
      ? 0
      : Number(targetExerciseIdx.replace("ex_", "")) || 0;
  const targetLesson =
    activeLessons[targetExerciseNumber] || activeLessons[0];

  const handleInsertIntoSelectedExercise = () => {
    const captionText =
      customCaptionInput.trim() || activeTemplate.defaultCaptionAr;

    const newFig: InsertedFigure = {
      id: `ggb_fig_${Date.now()}`,
      exerciseId: targetExerciseIdx,
      titleAr: activeTemplate.titleAr,
      titleFr: activeTemplate.titleFr,
      dataUrl: activeSvgPreviewDataUrl,
      widthPercent: figWidthPercent,
      alignment: figAlignment,
      caption: captionText,
      showCaption: true,
      borderStyle: figBorderStyle,
      qrUrl: attachInteractiveQr ? activeTemplate.interactiveUrl : undefined,
    };

    onInsertFigureToExam(newFig);

    // ربط نشاط GeoGebra بالدرس أيضاً عند تفعيل خيار QR التفاعلي
    if (attachInteractiveQr && targetLesson) {
      const resource: GeoGebraResource = {
        id: `res_${activeTemplate.id}_${Date.now()}`,
        lessonKey: targetLesson.lessonFr,
        titleAr: activeTemplate.titleAr,
        titleFr: activeTemplate.titleFr,
        type: "PRESET_APPLET",
        interactiveUrl: activeTemplate.interactiveUrl,
        materialId: activeTemplate.materialId,
        is3D: activeTemplate.is3D,
        figureImageUrl: activeSvgPreviewDataUrl,
        instructionsAr: activeTemplate.descriptionAr,
        instructionsFr: activeTemplate.defaultCaptionFr,
      };
      onUpdateGeoGebraResource(targetLesson.lessonFr, resource);
    }

    onNotify?.(
      "success",
      `تم إدراج الشكل الهندسي « ${activeTemplate.titleAr} » مباشرة في ${
        targetExerciseIdx === "global"
          ? "رأس الوثيقة العام"
          : `التمرين رقم ${targetExerciseNumber + 1}`
      } مع المعاينة الشعاعية!`
    );
  };

  const handleSaveCustomTemplate = () => {
    if (!newTplTitleAr.trim()) return;
    const matMatch = newTplMaterialUrl.match(/\/m\/([a-zA-Z0-9]+)/);
    const extractedId = matMatch ? matMatch[1] : "r8k9vxpc";

    const created: GeoGebraTemplateItem = {
      id: `custom_ggb_${Date.now()}`,
      category: newTplCategory,
      titleAr: newTplTitleAr.trim(),
      titleFr: newTplTitleFr.trim() || newTplTitleAr.trim(),
      lessonMatchFr: targetLesson?.lessonFr || "Géométrie",
      descriptionAr:
        "قالب هندسي مخصص محفوظ في مكتبة الأستاذ لإدراجه السريع في التمارين والفروض.",
      materialId: extractedId,
      interactiveUrl: newTplMaterialUrl.trim() || "https://www.geogebra.org/classic",
      is3D: newTplCategory === "ESPACE_3D",
      svgTemplateKind: newTplSvgKind,
      defaultCaptionAr: `شكل هندسي: ${newTplTitleAr.trim()}`,
      defaultCaptionFr: `Figure : ${newTplTitleFr.trim() || newTplTitleAr.trim()}`,
      mathAnnotationLatex: "\\mathcal{C}_{GeoGebra}",
      isUserCreated: true,
    };

    setCustomTemplates((prev) => [created, ...prev]);
    setSelectedTemplateId(created.id);
    setIsCreatingTemplate(false);
    setNewTplTitleAr("");
    setNewTplTitleFr("");
    onNotify?.("success", "تم حفظ القالب الجديد في مكتبة GeoGebra التفاعلية!");
  };

  const handleDeleteCustomTemplate = (id: string) => {
    setCustomTemplates((prev) => prev.filter((t) => t.id !== id));
    if (selectedTemplateId === id) {
      setSelectedTemplateId(BUILTIN_GEOGEBRA_TEMPLATES[0].id);
    }
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-700/90 rounded-3xl w-full max-w-7xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        {/* 1. ترويسة اللوحة */}
        <div className="px-5 py-4 bg-gradient-to-l from-cyan-950 via-slate-900 to-indigo-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-inner">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  مكتبة قوالب GeoGebra التفاعلية وإدراج الأشكال الهندسية في التمارين
                </h2>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                  {allTemplates.length} قالباً جاهزاً · Vector SVG + QR
                </span>
              </div>
              <p className="text-xs text-slate-400">
                اختر قالباً هندسياً (2D / 3D)، خصّص أبعاده وألوانه، ثم أدرجه مباشرة داخل التمرين المخصص مع معاينة مصغرة فورية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCreatingTemplate((v) => !v)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md transition"
            >
              <FilePlus2 className="w-4 h-4" />
              <span>+ إضافة قالب GeoGebra جديد للمكتبة</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. المحتوى الرئيسي (تقسيم إلى: معرض القوالب المصغر + استوديو التخصيص والمعاينة الفورية للتمرين) */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-5 studio-scroll">
          {/* نموذج إنشاء قالب جديد في المكتبة */}
          {isCreatingTemplate && (
            <div className="bg-indigo-950/60 border border-indigo-400/50 rounded-2xl p-4 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-indigo-800/60 pb-2">
                <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>إضافة قالب هندسي مخصص إلى مكتبة GeoGebra</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCreatingTemplate(false)}
                  className="text-xs text-slate-300 hover:text-white px-2 py-0.5 rounded bg-slate-800 cursor-pointer"
                >
                  إغلاق ✕
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    عنوان الشكل الهندسي (بالعربية)
                  </label>
                  <input
                    type="text"
                    value={newTplTitleAr}
                    onChange={(e) => setNewTplTitleAr(e.target.value)}
                    placeholder="مثال: تقاطع فلكة ومستقيم في الفضاء..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    العنوان بالفرنسية (اختياري)
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={newTplTitleFr}
                    onChange={(e) => setNewTplTitleFr(e.target.value)}
                    placeholder="Ex: Intersection Sphère-Droite..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    رابط نشاط GeoGebra أو المعرف
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={newTplMaterialUrl}
                    onChange={(e) => setNewTplMaterialUrl(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-cyan-300 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    النمط الهندسي للمعاينة المصغرة
                  </label>
                  <select
                    value={newTplSvgKind}
                    onChange={(e) =>
                      setNewTplSvgKind(
                        e.target.value as GeoGebraTemplateItem["svgTemplateKind"]
                      )
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-bold"
                  >
                    <option value="SPHERE_PLANE_3D">فلكة ومستوى في الفضاء 3D</option>
                    <option value="VECTOR_CROSS_3D">الجداء المتجهي ومعلم 3D</option>
                    <option value="TETRAHEDRON_3D">رباعي الأوجه في الفضاء</option>
                    <option value="CIRCLE_TANGENT_2D">دائرة ومماس (جداء سلمي)</option>
                    <option value="COMPLEX_ROTATION_2D">المستوى العقدي والدوران</option>
                    <option value="TRIGO_UNIT_CIRCLE">الدائرة المثلثية</option>
                    <option value="FUNCTION_TANGENT_ASYMPTOTE">منحنى دالة ومقارب مائل</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleSaveCustomTemplate}
                  className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>حفظ القالب في المكتبة</span>
                </button>
              </div>
            </div>
          )}

          {/* شريط التصفية والبحث في مكتبة القوالب */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/90 p-3 rounded-2xl border border-slate-800">
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: "ALL", label: "كل القوالب" },
                  { id: "ESPACE_3D", label: "الهندسة الفضائية 3D" },
                  { id: "PLAN_SCALAIRE", label: "الجداء السلمي والمستوى" },
                  { id: "COMPLEXES", label: "الأعداد العقدية" },
                  { id: "TRIGONOMETRIE", label: "الحساب المثلثي" },
                  { id: "ANALYSE_COURBES", label: "المنحنيات والمقاربات" },
                  { id: "CUSTOM", label: `قوالبي المخصصة (${customTemplates.length})` },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedCategory === cat.id
                      ? "bg-cyan-500 text-slate-950 font-black shadow-sm"
                      : "bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن شكل هندسي أو درس..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pr-8 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* الجناح الأيمن (7 أعمدة): شبكة بطاقات قوالب GeoGebra مع المعاينة المصغرة لكل قالب */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                  <Grid className="w-4 h-4 text-cyan-400" />
                  <span>
                    اختر قالباً هندسياً من المكتبة (معاينة مصغرة مباشرة)
                  </span>
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  {filteredTemplates.length} قالب متاح
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[540px] overflow-y-auto pr-1 studio-scroll">
                {filteredTemplates.map((tpl) => {
                  const isSelected = tpl.id === activeTemplate.id;
                  const thumbUrl = generateGeoGebraTemplateSvgDataUrl(
                    tpl.svgTemplateKind,
                    {
                      showGrid: showGridInSvg,
                      colorScheme,
                    }
                  );

                  return (
                    <div
                      key={tpl.id}
                      onClick={() => {
                        setSelectedTemplateId(tpl.id);
                        setCustomCaptionInput(tpl.defaultCaptionAr);
                      }}
                      className={`group rounded-2xl border p-3 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-indigo-950/50 border-cyan-400 ring-2 ring-cyan-500/30 shadow-xl"
                          : "bg-slate-950/80 border-slate-800 hover:border-slate-600"
                      }`}
                    >
                      <div>
                        {/* صورة المعاينة المصغرة للشكل الهندسي */}
                        <div className="relative rounded-xl overflow-hidden bg-white border border-slate-200 mb-2.5 h-36 flex items-center justify-center p-1">
                          <img
                            src={thumbUrl}
                            alt={tpl.titleAr}
                            className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                            <span
                              className={`text-[9px] font-mono font-black px-2 py-0.5 rounded-md shadow-xs ${
                                tpl.is3D
                                  ? "bg-indigo-900/90 text-cyan-200"
                                  : "bg-slate-900/85 text-amber-200"
                              }`}
                            >
                              {tpl.is3D ? "3D Espace" : "2D Plan"}
                            </span>
                          </div>
                          {isSelected && (
                            <div className="absolute bottom-1.5 left-1.5 bg-cyan-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow">
                              <Check className="w-3 h-3" />
                              <span>محدد</span>
                            </div>
                          )}
                        </div>

                        <h4 className="text-xs font-black text-white leading-snug mb-1">
                          {tpl.titleAr}
                        </h4>
                        <p
                          dir="ltr"
                          className="text-[10px] font-mono text-cyan-300/90 truncate text-left mb-1.5"
                        >
                          {tpl.titleFr}
                        </p>
                        <p className="text-[10.5px] text-slate-400 leading-relaxed line-clamp-2">
                          {tpl.descriptionAr}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded truncate max-w-[160px]">
                          {tpl.lessonMatchFr}
                        </span>

                        <div className="flex items-center gap-1">
                          {tpl.isUserCreated && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCustomTemplate(tpl.id);
                              }}
                              className="p-1 rounded-lg bg-rose-950/80 hover:bg-rose-800 text-rose-300 cursor-pointer"
                              title="حذف القالب المخصص"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTemplateId(tpl.id);
                              setCustomCaptionInput(tpl.defaultCaptionAr);
                              handleInsertIntoSelectedExercise();
                            }}
                            className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 text-cyan-200 hover:text-slate-950 border border-cyan-500/40 text-[10.5px] font-black flex items-center gap-1 cursor-pointer transition"
                          >
                            <Plus className="w-3 h-3" />
                            <span>إدراج سريع</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* الجناح الأيسر (5 أعمدة): لوحة التخصيص والمعاينة المصغرة للتمرين المستهدف */}
            <div className="lg:col-span-5 bg-slate-950/95 border border-indigo-500/30 rounded-2xl p-4 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs sm:text-sm font-black text-white">
                      معاينة التمرين المخصص وإعدادات الإدراج المباشر
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowLiveIframe((v) => !v)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10.5px] font-bold flex items-center gap-1 cursor-pointer border border-slate-700"
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span>
                      {showLiveIframe
                        ? "عرض الشكل المطبعي"
                        : "محاكاة GeoGebra الحية"}
                    </span>
                  </button>
                </div>

                {/* 1. اختيار التمرين المستهدف في الفرض أو السلسلة */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-2">
                  <label className="text-xs font-black text-cyan-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>حدد التمرين المخصص لإدراج الشكل الهندسي فيه:</span>
                  </label>
                  <select
                    value={targetExerciseIdx}
                    onChange={(e) => setTargetExerciseIdx(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-cyan-500"
                  >
                    {activeLessons.map((lesson, idx) => (
                      <option key={idx} value={`ex_${idx}`}>
                        التمرين {idx + 1}: {lesson.lessonAr} ({lesson.lessonFr})
                      </option>
                    ))}
                    <option value="global">
                      إدراج عام في صدر الوثيقة (Global Document Figure)
                    </option>
                  </select>
                </div>

                {/* 2. معاينة مصغرة حية للشكل داخل بطاقة التمرين (Live Exercise Mini-Preview) */}
                <div className="bg-white text-slate-900 rounded-2xl p-3.5 border-2 border-slate-300 shadow-inner space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 text-[11px]">
                    <span className="font-black text-indigo-950">
                      معاينة مصغرة داخل{" "}
                      {targetExerciseIdx === "global"
                        ? "الوثيقة"
                        : `التمرين ${targetExerciseNumber + 1} (${
                            targetLesson?.lessonAr || ""
                          })`}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">
                      العرض: {figWidthPercent}% · المحاذاة: {figAlignment}
                    </span>
                  </div>

                  {/* سطور افتراضية تحاكي نص التمرين مع الشكل الهندسي المدمج */}
                  <div className="text-[10.5px] text-slate-600 leading-relaxed">
                    نعتبر في الفضاء المنسوب إلى معلم متعامد ممنظم الشكل الهندسي
                    الممثل أسفله والخاص بدرس « {targetLesson?.lessonAr} »:
                  </div>

                  {showLiveIframe ? (
                    <div className="rounded-xl overflow-hidden border border-slate-300 h-48 bg-slate-100">
                      <iframe
                        title={activeTemplate.titleFr}
                        src={`https://www.geogebra.org/material/iframe/id/${activeTemplate.materialId}/width/600/height/360/border/888888/sfsb/true/smb/false/stb/false/stbh/false/ai/false/asb/false/sri/true/rc/false/ld/false/sdz/true/ctl/false`}
                        className="w-full h-full border-0"
                      />
                    </div>
                  ) : (
                    <div
                      className={`flex flex-col ${
                        figAlignment === "left"
                          ? "items-end"
                          : figAlignment === "right"
                          ? "items-start"
                          : "items-center"
                      } py-1`}
                    >
                      <div
                        style={{
                          width: `${Math.max(45, Math.min(95, figWidthPercent))}%`,
                        }}
                        className={`rounded-xl p-1.5 bg-white transition-all ${
                          figBorderStyle === "academic"
                            ? "border-2 border-slate-800 shadow-xs"
                            : figBorderStyle === "subtle"
                            ? "border border-slate-300"
                            : ""
                        }`}
                      >
                        <img
                          src={activeSvgPreviewDataUrl}
                          alt={activeTemplate.titleAr}
                          className="w-full h-36 object-contain mx-auto"
                        />
                        <div className="text-[10px] font-bold text-center text-slate-700 mt-1 border-t border-slate-100 pt-1">
                          {customCaptionInput.trim() ||
                            activeTemplate.defaultCaptionAr}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. ضوابط المظهر والأبعاد والشبكة */}
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      نسبة عرض الشكل في الورقة
                    </label>
                    <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                      {[40, 60, 80, 100].map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => setFigWidthPercent(w)}
                          className={`flex-1 py-1 rounded-lg font-mono text-[11px] font-bold cursor-pointer ${
                            figWidthPercent === w
                              ? "bg-cyan-500 text-slate-950 font-black"
                              : "text-slate-300 hover:bg-slate-800"
                          }`}
                        >
                          {w}%
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      نمط الألوان للطباعة
                    </label>
                    <select
                      value={colorScheme}
                      onChange={(e) =>
                        setColorScheme(
                          e.target.value as
                            | "ACADEMIC_BLUE"
                            | "MONO_BLACK"
                            | "EMERALD_TEAL"
                        )
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-bold"
                    >
                      <option value="ACADEMIC_BLUE">أكاديمي ملون (أزرق/أحمر)</option>
                      <option value="MONO_BLACK">أبيض وأسود للنسخ المطبعي</option>
                      <option value="EMERALD_TEAL">زمردي هندسي</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      عنوان / مفتاح الشكل أسفل الرسم
                    </label>
                    <input
                      type="text"
                      value={customCaptionInput}
                      onChange={(e) => setCustomCaptionInput(e.target.value)}
                      placeholder={activeTemplate.defaultCaptionAr}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div className="flex flex-col justify-end gap-1.5">
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showGridInSvg}
                        onChange={(e) => setShowGridInSvg(e.target.checked)}
                        className="rounded accent-cyan-500"
                      />
                      <span>إظهار التربيعات الهندسية (Grille)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={attachInteractiveQr}
                        onChange={(e) => setAttachInteractiveQr(e.target.checked)}
                        className="rounded accent-cyan-500"
                      />
                      <span>إرفاق رمز QR للنشاط التفاعلي بالتمرين</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* زر الإدراج المباشر في التمرين المخصص */}
              <button
                type="button"
                onClick={handleInsertIntoSelectedExercise}
                className="w-full py-3 rounded-2xl bg-gradient-to-l from-cyan-500 via-teal-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/20 cursor-pointer transition"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>
                  إدراج الشكل الهندسي مباشرة في{" "}
                  {targetExerciseIdx === "global"
                    ? "الوثيقة"
                    : `التمرين رقم ${targetExerciseNumber + 1}`}
                </span>
              </button>
            </div>
          </div>

          {/* 3. شريط الأشكال الهندسية المدرجة حالياً في تمارين الوثيقة */}
          {insertedFigures.length > 0 && (
            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    الأشكال الهندسية المدرجة حالياً في التمارين ({insertedFigures.length})
                  </span>
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {insertedFigures.map((fig) => (
                  <div
                    key={fig.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-2.5"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={fig.dataUrl}
                        alt={fig.titleAr}
                        className="w-12 h-10 rounded-lg bg-white object-contain border border-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-white truncate">
                          {fig.titleAr}
                        </div>
                        <div className="text-[10px] font-mono text-cyan-300">
                          {fig.exerciseId === "global"
                            ? "عام بالوثيقة"
                            : `التمرين ${
                                Number(fig.exerciseId.replace("ex_", "")) + 1
                              }`}{" "}
                          · {fig.widthPercent}%
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteFigureFromExam(fig.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 cursor-pointer shrink-0"
                      title="حذف الشكل من التمرين"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
