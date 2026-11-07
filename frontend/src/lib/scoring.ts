import { CAREERS, CAREER_BY_SLUG } from "./careers";
import { COURSES } from "./courses";
import { QUESTIONS } from "./questions";
import {
  DIMENSIONS,
  DIMENSION_META,
  MARKS_BANDS,
  type Archetype,
  type AssessmentResult,
  type Career,
  type Course,
  type CourseMatch,
  type Dimension,
  type InterestProfile,
  type MarksBand,
  type MatchLabel,
  type Question,
  type QuestionOption,
  type Student,
} from "./types";

const CATEGORY_CORE: Record<string, Dimension> = {
  "Technology & Computing": "technology",
  "Engineering & Innovation": "engineering",
  "Business & Commerce": "business",
  "Creative & Design": "creativity",
  "Humanities & Communication": "communication",
  "Science & Mathematics": "analytical",
};

export const EMPTY_PROFILE: InterestProfile = {
  technology: 0,
  creativity: 0,
  engineering: 0,
  business: 0,
  communication: 0,
  analytical: 0,
};

const FINAL_QUESTION_MULTIPLIER = 1.6;

/**
 * The ceiling each dimension can reach, used to normalise raw weights to 0-100.
 *
 * It depends on the bank in play: once an admin edits an option's weights, the
 * maximum changes with it. Memoised by bank identity so the common case (the
 * bundled bank, same array every call) stays a single computation.
 */
const maxRawCache = new WeakMap<Question[], InterestProfile>();

function maxRawByDimension(bank: Question[]): InterestProfile {
  const cached = maxRawCache.get(bank);
  if (cached) return cached;
  const totals = { ...EMPTY_PROFILE };
  for (const question of bank) {
    const multiplier = question.number === 10 ? FINAL_QUESTION_MULTIPLIER : 1;
    const best = { ...EMPTY_PROFILE };
    for (const option of question.options) {
      for (const dimension of DIMENSIONS) {
        best[dimension] = Math.max(best[dimension], option.weights[dimension] ?? 0);
      }
    }
    for (const dimension of DIMENSIONS) {
      totals[dimension] += best[dimension] * multiplier;
    }
  }
  maxRawCache.set(bank, totals);
  return totals;
}

export function findOption(
  questionId: string,
  optionId: string,
  bank: Question[] = QUESTIONS,
): QuestionOption | undefined {
  return bank.find((q) => q.id === questionId)?.options.find((o) => o.id === optionId);
}

export function computeInterestProfile(
  answers: Record<string, string>,
  bank: Question[] = QUESTIONS,
): InterestProfile {
  const MAX_RAW = maxRawByDimension(bank);
  const raw = { ...EMPTY_PROFILE };
  for (const question of bank) {
    const option = findOption(question.id, answers[question.id] ?? "", bank);
    if (!option) continue;
    const multiplier = question.number === 10 ? FINAL_QUESTION_MULTIPLIER : 1;
    for (const dimension of DIMENSIONS) {
      raw[dimension] += (option.weights[dimension] ?? 0) * multiplier;
    }
  }

  const profile = { ...EMPTY_PROFILE };
  for (const dimension of DIMENSIONS) {
    const max = MAX_RAW[dimension] || 1;
    profile[dimension] = Math.round(Math.max(0, Math.min(100, (raw[dimension] / max) * 100)));
  }
  return profile;
}

export function sortedDimensions(profile: InterestProfile): Dimension[] {
  return [...DIMENSIONS].sort((a, b) => profile[b] - profile[a] || a.localeCompare(b));
}

const ARCHETYPES: (Archetype & { weights: Partial<InterestProfile>; core: Dimension[] })[] = [
  {
    key: "digital-innovator",
    title: "The Digital Innovator",
    tagline: "Logic, technology and a creative streak in one profile.",
    description:
      "You like making ideas real with technology — and you care about how the result feels to use, not just whether it runs. You are comfortable moving between logic and imagination.",
    learningStyle: "Project-first builder",
    careerPersonality: "Creative problem solver",
    strengths: ["Systems thinking", "Rapid learning", "Turning ideas into prototypes"],
    gradient: "linear-gradient(135deg,#FF6B35 0%,#FFB38A 100%)",
    icon: "code",
    weights: { technology: 1, analytical: 0.55, creativity: 0.35 },
    core: ["technology", "analytical", "creativity"],
  },
  {
    key: "visual-storyteller",
    title: "The Visual Storyteller",
    tagline: "You think in images, feel and detail.",
    description:
      "You notice composition, tone and the small details that make something memorable. Your strongest work happens when you are making, editing and refining something people can see or experience.",
    learningStyle: "Studio learner — learn by making and critique",
    careerPersonality: "Expressive craftsperson",
    strengths: ["Visual judgement", "Original ideas", "Empathy for the audience"],
    gradient: "linear-gradient(135deg,#7C6BF5 0%,#B8AEFF 100%)",
    icon: "palette",
    weights: { creativity: 1, communication: 0.3, technology: 0.2 },
    core: ["creativity", "communication"],
  },
  {
    key: "systems-builder",
    title: "The Systems Builder",
    tagline: "You want to know how things work — then make them work better.",
    description:
      "You learn best with your hands and your head at the same time. Mechanisms, electronics and physical systems make intuitive sense to you, and you enjoy the discipline of making something reliable.",
    learningStyle: "Hands-on tinkerer — labs over lectures",
    careerPersonality: "Practical innovator",
    strengths: ["Mechanical reasoning", "Patience with testing", "Attention to real constraints"],
    gradient: "linear-gradient(135deg,#1F9D8B 0%,#7BD9CB 100%)",
    icon: "wrench",
    weights: { engineering: 1, technology: 0.45, analytical: 0.35 },
    core: ["engineering", "technology"],
  },
  {
    key: "venture-strategist",
    title: "The Venture Strategist",
    tagline: "You are drawn to ownership, decisions and momentum.",
    description:
      "You like problems with real stakes and people counting on an outcome. Strategy, persuasion and resourcefulness come naturally — and you would rather make a decision than wait for perfect information.",
    learningStyle: "Case-and-project learner",
    careerPersonality: "Decisive organiser",
    strengths: ["Initiative", "Persuasion", "Reading people and incentives"],
    gradient: "linear-gradient(135deg,#E0A400 0%,#FFD97A 100%)",
    icon: "briefcase",
    weights: { business: 1, communication: 0.4, analytical: 0.3 },
    core: ["business", "communication"],
  },
  {
    key: "people-connector",
    title: "The People Connector",
    tagline: "Your edge is understanding people and communicating clearly.",
    description:
      "You pick up on what people mean, not just what they say. Work that involves listening, explaining, supporting or bringing a group together gives you energy rather than draining it.",
    learningStyle: "Conversational learner — discussion and fieldwork",
    careerPersonality: "Empathetic communicator",
    strengths: ["Listening", "Clear explanation", "Building trust"],
    gradient: "linear-gradient(135deg,#3C7DF2 0%,#9CC0FF 100%)",
    icon: "users",
    weights: { communication: 1, creativity: 0.3, business: 0.25 },
    core: ["communication", "business"],
  },
  {
    key: "pattern-analyst",
    title: "The Pattern Analyst",
    tagline: "You look for the structure underneath the noise.",
    description:
      "You are comfortable with abstraction and you enjoy the moment a messy problem becomes a clean rule. Mathematics, statistics and careful evidence appeal to you more than guessing.",
    learningStyle: "Research-driven learner — theory then application",
    careerPersonality: "Rigorous analyst",
    strengths: ["Logical reasoning", "Spotting patterns", "Precision"],
    gradient: "linear-gradient(135deg,#C94B7C 0%,#F3A6C2 100%)",
    icon: "sigma",
    weights: { analytical: 1, technology: 0.35, business: 0.2 },
    core: ["analytical", "technology"],
  },
  {
    key: "curious-explorer",
    title: "The Curious Explorer",
    tagline: "You are still mapping your direction — and that is allowed.",
    description:
      "Your interests are broad rather than sharply pointed, which is normal at this stage. The courses below are chosen to let you sample several fields before specialising.",
    learningStyle: "Broad sampler — explore before specialising",
    careerPersonality: "Adaptable generalist",
    strengths: ["Openness", "Varied interests", "Room to experiment"],
    gradient: "linear-gradient(135deg,#25345B 0%,#6E7FA8 100%)",
    icon: "compass",
    weights: {},
    core: ["creativity", "communication"],
  },
];

function toArchetype(
  entry: Archetype & { weights: Partial<InterestProfile>; core: Dimension[] },
): Archetype {
  const { weights, core, ...archetype } = entry;
  void weights;
  void core;
  return archetype;
}

export function pickArchetype(profile: InterestProfile, completedCount: number): Archetype {
  const values = sortedDimensions(profile).map((d) => profile[d]);
  const spread = values[0] - values[values.length - 1];

  if (completedCount <= 4 || spread <= 10 || values[0] < 35) {
    return toArchetype(ARCHETYPES[ARCHETYPES.length - 1]);
  }

  let best = ARCHETYPES[0];
  let bestScore = -Infinity;
  for (const archetype of ARCHETYPES.slice(0, -1)) {
    let score = 0;
    for (const dimension of DIMENSIONS) {
      score += profile[dimension] * (archetype.weights[dimension] ?? 0);
    }
    if (score > bestScore) {
      bestScore = score;
      best = archetype;
    }
  }
  return toArchetype(best);
}

const GOALS: Record<string, string> = {
  A: "to build software and intelligent products",
  B: "to work as a designer or digital creator",
  C: "to engineer products and technology that work in the real world",
  D: "to build and lead something of your own",
  E: "to work with people and create social impact",
  F: "to make decisions with data and evidence",
  G: "to explore a few directions before committing",
};

export function q10Goal(answers: Record<string, string>): string {
  return GOALS[answers.q10 ?? "G"] ?? GOALS.G;
}

const LEARNING_STYLES: Record<string, string> = {
  A: "Deep-focus builder — learn by building in uninterrupted blocks",
  B: "Studio learner — learn through references, making and critique",
  C: "Hands-on tinkerer — learn by wiring, testing and fixing",
  D: "Project-and-people learner — learn through cases and real conversations",
  E: "Conversational learner — learn through discussion and fieldwork",
  F: "Research-driven learner — learn through evidence, models and careful reading",
};

const ASPIRATION_CORE: Record<string, Dimension> = {
  A: "technology",
  B: "creativity",
  C: "engineering",
  D: "business",
  E: "communication",
  F: "analytical",
};

export function aspirationDimension(answers: Record<string, string>): Dimension | null {
  const optionId = answers.q10;
  if (!optionId || optionId === "G") return null;
  return ASPIRATION_CORE[optionId] ?? null;
}

function scoreCourse(
  course: Course,
  profile: InterestProfile,
  answers: Record<string, string>,
  bank: Question[] = QUESTIONS,
): { interestScore: number; aspirationBonus: number; reasons: CourseMatch["dimensionReasons"] } {
  let numerator = 0;
  let denominator = 0;
  for (const dimension of DIMENSIONS) {
    const need = course.interests[dimension] ?? 0;
    if (need <= 0) continue;
    numerator += profile[dimension] * need;
    denominator += need;
  }
  const interestScore = denominator === 0 ? 0 : numerator / denominator;

  const q10Option = findOption("q10", answers.q10 ?? "", bank);
  let aspirationBonus = 0;
  const aspiration = aspirationDimension(answers);
  if (q10Option?.preference?.includes(course.slug)) {
    aspirationBonus = 8;
  } else if (aspiration && aspiration === CATEGORY_CORE[course.category]) {
    aspirationBonus = 3;
  }

  const reasons = DIMENSIONS.map((dimension) => ({
    dimension,
    strength: profile[dimension],
    courseNeed: Math.round((course.interests[dimension] ?? 0) * 100),
  }))
    .filter((reason) => reason.courseNeed > 0)
    .sort((a, b) => b.courseNeed * b.strength - a.courseNeed * a.strength)
    .slice(0, 3);

  return { interestScore, aspirationBonus, reasons };
}

function labelFor(rank: number, score: number): MatchLabel {
  if (rank < 3 && score >= 55) return "Strong Match";
  if (rank < 7 && score >= 47) return "Explore Further";
  return "Alternative Path";
}

function buildExplanation(
  course: Course,
  profile: InterestProfile,
  reasons: CourseMatch["dimensionReasons"],
  aspirationBonus: number,
): string {
  const strongest = reasons[0];
  const second = reasons[1];
  const strengthWord =
    profile[strongest.dimension] >= 75
      ? "a strong"
      : profile[strongest.dimension] >= 55
        ? "a clear"
        : "a developing";
  const base = `You show ${strengthWord} pull toward ${DIMENSION_META[strongest.dimension].short.toLowerCase()}, and ${course.name} is built around exactly that.`;
  const secondLine = second
    ? ` It also draws on your ${DIMENSION_META[second.dimension].short.toLowerCase()} signal through ${course.skills[0].toLowerCase()} and ${course.skills[1].toLowerCase()}.`
    : ` It builds on ${course.skills[0].toLowerCase()} and ${course.skills[1].toLowerCase()}.`;
  const aspirationLine =
    aspirationBonus >= 8
      ? ` You also named this direction directly in your final answer, which is why it ranks higher.`
      : aspirationBonus > 0
        ? " It sits in the same direction as the future you described in the final question."
        : "";
  return base + secondLine + aspirationLine;
}

/**
 * Marks gate. Deliberately a separate axis from stream eligibility and from the
 * interest score — it answers "is this realistic right now?", never "does this
 * suit you?". It can only ever FLAG a course; nothing here reaches `finalScore`
 * or the match label, per development-rules.md.
 *
 * Unknown on either side is treated as a pass: a student who picked
 * "Not sure yet" must not be quietly down-ranked for honesty.
 */
function marksGate(
  course: Course,
  band: MarksBand | "",
): { marksFit: boolean; marksNote: string } {
  const required = course.typicalCutoff;
  if (!required || !band || band === "Not sure yet" || required === "Not sure yet") {
    return { marksFit: true, marksNote: "" };
  }
  const have = MARKS_BANDS.indexOf(band);
  const need = MARKS_BANDS.indexOf(required);
  if (have < 0 || need < 0 || have >= need) return { marksFit: true, marksNote: "" };
  return {
    marksFit: false,
    marksNote: `Admissions here usually open around ${required}. Your current band is ${band}, so treat this as a stretch and check the actual cut-off with each college — these vary a lot by year and category.`,
  };
}

export function matchCourses(
  profile: InterestProfile,
  answers: Record<string, string>,
  stream: string,
  marksBand: MarksBand | "" = "",
  bank: Question[] = QUESTIONS,
): CourseMatch[] {
  const scored = COURSES.map((course) => {
    const { interestScore, aspirationBonus, reasons } = scoreCourse(course, profile, answers, bank);
    return {
      course,
      interestScore: Math.round(interestScore),
      aspirationBonus,
      finalScore: Math.round(Math.max(1, Math.min(99, interestScore + aspirationBonus))),
      reasons,
      eligible: !stream || course.streams.includes(stream as never),
    };
  }).sort((a, b) => b.finalScore - a.finalScore || a.course.name.localeCompare(b.course.name));

  return scored.map((entry, index) => ({
    course: entry.course,
    interestScore: entry.interestScore,
    aspirationBonus: entry.aspirationBonus,
    finalScore: entry.finalScore,
    eligible: entry.eligible,
    ...marksGate(entry.course, marksBand),
    label: labelFor(index, entry.finalScore),
    explanation: buildExplanation(entry.course, profile, entry.reasons, entry.aspirationBonus),
    dimensionReasons: entry.reasons,
  }));
}

export function topCareersFromMatches(matches: CourseMatch[], limit = 6): Career[] {
  const eligible = matches.filter((m) => m.eligible);
  const seen = new Set<string>();
  const result: Career[] = [];
  for (const match of eligible) {
    for (const slug of match.course.careerSlugs) {
      if (seen.has(slug)) continue;
      const career = CAREER_BY_SLUG[slug];
      if (!career) continue;
      seen.add(slug);
      result.push(career);
      if (result.length >= limit) return result;
    }
  }
  if (result.length < limit) {
    for (const career of CAREERS) {
      if (seen.has(career.slug)) continue;
      result.push(career);
      if (result.length >= limit) break;
    }
  }
  return result;
}

export function computeBadges(
  profile: InterestProfile,
  answers: Record<string, string>,
  completedCount: number,
): string[] {
  const badges: string[] = [];
  const order = sortedDimensions(profile);
  if (completedCount >= 5) badges.push("Curiosity Explorer");
  if (order.slice(0, 2).includes("technology")) badges.push("Future Builder");
  if (order.slice(0, 2).includes("creativity")) badges.push("Creative Thinker");
  if (order.slice(0, 2).includes("analytical")) badges.push("Pattern Seeker");
  if (order.slice(0, 2).includes("communication")) badges.push("People Reader");
  if (order.slice(0, 2).includes("business")) badges.push("Venture Mind");
  if (order.slice(0, 2).includes("engineering")) badges.push("Systems Tinkerer");
  if (completedCount === 10) badges.push("Full Journey");
  if (answers.q10 === "G") badges.push("Open Compass");
  return badges.slice(0, 5);
}

/** Disambiguates results built within the same millisecond. See `buildResult`. */
let resultSeq = 0;

export function buildResult(
  student: Student,
  answers: Record<string, string>,
  xp: number,
  // The bank the student actually answered. Defaults to the bundled one, so
  // every existing caller is unchanged — but once questions are edited in the
  // database, a student must be scored against the weights they were shown,
  // not whatever the bundle happens to contain.
  bank: Question[] = QUESTIONS,
): AssessmentResult {
  const completedCount = bank.filter((q) => answers[q.id]).length;
  const profile = computeInterestProfile(answers, bank);
  const archetype = pickArchetype(profile, completedCount);
  const matches = matchCourses(profile, answers, student.stream, student.marksBand, bank);
  const topDimensions = sortedDimensions(profile).slice(0, 3);
  const learningStyle =
    LEARNING_STYLES[answers.q5 ?? ""] ?? "Exploratory learner — still finding the format that fits";

  return {
    // The sample seeder builds 18 submissions inside one tick, so a timestamp
    // alone produced duplicate ids and React logged duplicate-key errors for
    // every admin list. The counter makes each id unique within the session.
    id: `pt-${Date.now().toString(36)}-${(resultSeq++).toString(36)}`,
    createdAt: new Date().toISOString(),
    student,
    xp,
    profile,
    answers,
    completedCount,
    archetype,
    learningStyle,
    badges: computeBadges(profile, answers, completedCount),
    topDimensions,
    matches,
    topCareers: topCareersFromMatches(matches),
    perspective: `You lean most toward ${DIMENSION_META[topDimensions[0]].label.toLowerCase()}, with ${DIMENSION_META[topDimensions[1]].label.toLowerCase()} close behind.`,
    goal: q10Goal(answers),
    batchCode: student.batchCode,
  };
}

export function matchTone(label: MatchLabel): {
  bg: string;
  text: string;
  border: string;
} {
  switch (label) {
    case "Strong Match":
      return { bg: "bg-peach", text: "text-orange", border: "border-orange/30" };
    case "Explore Further":
      return { bg: "bg-fog", text: "text-indigo", border: "border-indigo/20" };
    default:
      return { bg: "bg-surface-2", text: "text-slate-ink", border: "border-midnight/15" };
  }
}

export function courseFitLabel(course: Course, profile: InterestProfile): string {
  const match = scoreCourse(course, profile, {}).interestScore;
  if (match >= 78) return "Aligned with your strongest interests";
  if (match >= 62) return "A solid secondary direction";
  return "Worth exploring for breadth";
}

export function getMatchForSlug(result: AssessmentResult, slug: string): CourseMatch | undefined {
  return result.matches.find((m) => m.course.slug === slug);
}

export function topCourse(result: AssessmentResult): CourseMatch | undefined {
  return result.matches.find((m) => m.eligible);
}

export function compareCourses(
  a: Course,
  b: Course,
  profile: InterestProfile | null,
  stream: string,
): {
  a: Course;
  b: Course;
  fitA: number;
  fitB: number;
  eligibleA: boolean;
  eligibleB: boolean;
  shared: string[];
  differences: string[];
} {
  const fitA = profile ? Math.round(scoreCourse(a, profile, {}).interestScore) : 0;
  const fitB = profile ? Math.round(scoreCourse(b, profile, {}).interestScore) : 0;
  const shared = a.skills.filter((skill) =>
    b.skills.some((other) => other.toLowerCase() === skill.toLowerCase()),
  );
  const differences = [
    `${a.name} runs ${a.duration} vs ${b.duration} for ${b.name}.`,
    `${a.name} sits in ${a.category}; ${b.name} sits in ${b.category}.`,
    a.eligibilityNotes,
    b.eligibilityNotes,
  ];
  return {
    a,
    b,
    fitA,
    fitB,
    eligibleA: !stream || a.streams.includes(stream as never),
    eligibleB: !stream || b.streams.includes(stream as never),
    shared,
    differences,
  };
}

/** Local, deterministic mentor. Explanations come from the catalog and the student's profile. */
export function mentorReply(question: string, result: AssessmentResult | null): string {
  const text = question.toLowerCase();

  if (!result) {
    return "Run the 10-question assessment first and I can answer using your actual interest profile. Until then I can only describe the course catalog, not what fits you.";
  }

  const mentioned = COURSES.filter(
    (course) =>
      text.includes(course.name.toLowerCase()) ||
      text.includes(course.short.toLowerCase()) ||
      text.includes(course.slug.replace(/-/g, " ")),
  );

  const asksWhy = /why|reason|explain|recommend/.test(text);
  const asksWhatIf = /what if|instead|versus| vs |compare|difference/.test(text);

  if (asksWhatIf && mentioned.length >= 2) {
    const [a, b] = mentioned;
    const fitA = result.matches.find((m) => m.course.slug === a.slug);
    const fitB = result.matches.find((m) => m.course.slug === b.slug);
    return [
      `${a.name} vs ${b.name}`,
      ``,
      `Fit: ${fitA?.label ?? "not ranked"} for ${a.name}${profileFit(result, a)}, and ${fitB?.label ?? "not ranked"} for ${b.name}${profileFit(result, b)}.`,
      ``,
      `${a.name} — ${a.duration}, ${a.category}. Focus: ${a.skills.slice(0, 3).join(", ")}. Careers: ${a.careers.slice(0, 3).join(", ")}.`,
      `${b.name} — ${b.duration}, ${b.category}. Focus: ${b.skills.slice(0, 3).join(", ")}. Careers: ${b.careers.slice(0, 3).join(", ")}.`,
      ``,
      `Eligibility: ${a.eligibilityNotes} ${b.eligibilityNotes}`,
      ``,
      `My read: choose ${(fitA?.finalScore ?? 0) >= (fitB?.finalScore ?? 0) ? a.name : b.name} if you want the tighter interest match today. Choose ${(fitA?.finalScore ?? 0) < (fitB?.finalScore ?? 0) ? a.name : b.name} if its day-to-day work and study style pull you more strongly — interest fit is a starting point, not a verdict.`,
    ].join("\n");
  }

  if (mentioned.length >= 1) {
    const course = mentioned[0];
    const match = result.matches.find((m) => m.course.slug === course.slug);
    if (/skill|learn|prepare/.test(text)) {
      return `For ${course.name}, the skills worth starting now are: ${course.skills.join(", ")}. Pick one and build something small you can show — a project beats a certificate for most of these fields.`;
    }
    if (/career|job|future|salary/.test(text)) {
      return `${course.name} commonly leads toward ${course.careers.join(", ")}. I deliberately do not quote salaries or placement guarantees — those depend on institution, portfolio and market conditions. For day-to-day detail, open the career pages linked on the course page.`;
    }
    if (/eligib|stream|subject/.test(text)) {
      return `${course.eligibilityNotes} Common entrance routes: ${course.entranceExams.join(", ")}. Current institutional rules always override catalog guidance, so verify with each university's admission page.`;
    }
    return [
      match
        ? `Why ${course.name} shows up for you: ${match.explanation}`
        : `${course.name} was not among your top matches, but it is in the catalog.`,
      ``,
      match
        ? `Its fit label is "${match.label}". I keep that deliberately non-numeric — a precise percentage would overstate how much a 10-question assessment can know.`
        : "",
      ``,
      `Study duration: ${course.duration}. Core skills: ${course.skills.join(", ")}.`,
      `Eligible streams in this catalog: ${course.streams.join(", ")}.`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (/undecided|confus|not sure|explor/.test(text)) {
    return `With ${result.student.stream || "your stream"} and a profile strongest in ${DIMENSION_META[result.topDimensions[0]].label}, a low-risk next step is to compare two adjacent directions rather than pick one: ${result.matches
      .filter((m) => m.eligible)
      .slice(0, 2)
      .map((m) => m.course.name)
      .join(" and ")}. Both accept your stream in this catalog. Then look at the first-year subjects — that is usually where the real difference shows up.`;
  }

  if (asksWhy) {
    const top = result.matches.find((m) => m.eligible);
    if (!top) return "I could not find an eligible course in the catalog for your stream. Check the eligibility filters on the courses page.";
    return `Your top eligible match is ${top.course.name}: ${top.explanation} This comes from a rule-based comparison of your six interest dimensions with each course's profile — not from a language model, so it is repeatable and explainable.`;
  }

  const top = result.matches.filter((m) => m.eligible).slice(0, 3);
  return [
    `Here is the short version of your profile: strongest in ${result.topDimensions.map((d) => DIMENSION_META[d].short).join(" › ")}, with a ${result.archetype.title.replace("The ", "").toLowerCase()} pattern.`,
    ``,
    `Your eligible top matches are ${top.map((m) => m.course.name).join(", ")}.`,
    ``,
    `Ask me things like "Why was ${top[0]?.course.name ?? "BCA"} recommended?", "What if I choose ${top[1]?.course.name ?? "BBA"} instead?", or "What skills should I start learning?"`,
  ].join("\n");
}

function profileFit(result: AssessmentResult, course: Course): string {
  const match = result.matches.find((m) => m.course.slug === course.slug);
  if (!match) return "";
  const reason = match.dimensionReasons[0];
  return reason
    ? ` (your ${DIMENSION_META[reason.dimension].short.toLowerCase()} signal is ${reason.strength}/100)`
    : "";
}
