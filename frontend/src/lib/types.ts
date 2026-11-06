export const DIMENSIONS = [
  "technology",
  "creativity",
  "engineering",
  "business",
  "communication",
  "analytical",
] as const;

export type Dimension = (typeof DIMENSIONS)[number];

export type InterestProfile = Record<Dimension, number>;

export const DIMENSION_META: Record<
  Dimension,
  { label: string; short: string; blurb: string; color: string }
> = {
  technology: {
    label: "Technology & Innovation",
    short: "Technology",
    blurb: "Software, AI, computing and digital products",
    color: "#FF6B35",
  },
  creativity: {
    label: "Creative Expression",
    short: "Creativity",
    blurb: "Design, animation, media and visual thinking",
    color: "#7C6BF5",
  },
  engineering: {
    label: "Engineering & Making",
    short: "Engineering",
    blurb: "Machines, electronics, robotics and prototypes",
    color: "#1F9D8B",
  },
  business: {
    label: "Business & Enterprise",
    short: "Business",
    blurb: "Finance, strategy, marketing and entrepreneurship",
    color: "#E0A400",
  },
  communication: {
    label: "People & Communication",
    short: "Communication",
    blurb: "Society, language, media and human behaviour",
    color: "#3C7DF2",
  },
  analytical: {
    label: "Analytical Thinking",
    short: "Analytical",
    blurb: "Mathematics, statistics, logic and data",
    color: "#C94B7C",
  },
};

export const STREAMS = ["PCMB", "PCMC", "PCM", "Commerce", "Arts/Humanities"] as const;
export type Stream = (typeof STREAMS)[number];

export type PUYear = "1st PU" | "2nd PU";

/**
 * Bands rather than an exact percentage. A PU student often does not have a final
 * figure yet (1st PU especially), a band is far less anxiety-inducing to enter,
 * and a gate this coarse cannot pretend to a precision it does not have.
 * Ordered lowest to highest — `marksBandRank` depends on that order.
 */
export const MARKS_BANDS = [
  "Below 60%",
  "60 – 69%",
  "70 – 79%",
  "80 – 89%",
  "90% & above",
  "Not sure yet",
] as const;
export type MarksBand = (typeof MARKS_BANDS)[number];

/**
 * Asked immediately after the name, before stream. It is a self-declared
 * starting point, NOT a filter: it seeds the conversation and is surfaced on
 * results, but the interest profile still comes only from the answers.
 */
export const INTEREST_AREAS = [
  "Computing & Software",
  "Engineering & Electronics",
  "Business & Commerce",
  "Design & Creative",
  "Data & Analytics",
  "People & Communication",
  "Still deciding",
] as const;
export type InterestArea = (typeof INTEREST_AREAS)[number];

export type Student = {
  name: string;
  /** Self-declared starting point, captured right after the name. */
  areaOfInterest: InterestArea | "";
  stream: Stream | "";
  puYear: PUYear | "";
  /** Approximate current marks. "" until onboarding captures it. */
  marksBand: MarksBand | "";
  language: string;
  batchCode?: string;
};

export type QuestionOption = {
  id: string;
  label: string;
  detail: string;
  icon: OptionIcon;
  weights: Partial<InterestProfile>;
  feedback: string;
  /** Course slugs this aspiration points at (used on Q10 only). */
  preference?: string[];
};

export type OptionIcon =
  | "code"
  | "palette"
  | "wrench"
  | "rocket"
  | "users"
  | "sigma"
  | "compass"
  | "blocks"
  | "chart"
  | "pen"
  | "cpu"
  | "briefcase";

export type Question = {
  id: string;
  number: number;
  kicker: string;
  title: string;
  description: string;
  measures: string;
  options: QuestionOption[];
};

export type CourseCategory =
  | "Technology & Computing"
  | "Engineering & Innovation"
  | "Business & Commerce"
  | "Creative & Design"
  | "Humanities & Communication"
  | "Science & Mathematics";

export type Course = {
  slug: string;
  name: string;
  short: string;
  category: CourseCategory;
  tagline: string;
  degree: string;
  duration: string;
  interests: Partial<InterestProfile>;
  streams: Stream[];
  eligibilityNotes: string;
  skills: string[];
  careers: string[];
  careerSlugs: string[];
  related: string[];
  entranceExams: string[];
  whyItFits: string;
  accent: string;
  /** Which campus actually offers it. The catalogue is these two colleges. */
  college: "NCET" | "NCMS";
  /**
   * The marks band a course is *usually* open at. Guidance only — it flags a
   * course as a stretch, never hides it, exactly like stream eligibility.
   * Omit for courses with no meaningful cut-off.
   */
  typicalCutoff?: MarksBand;
};

/**
 * Stage 2 of the quest: stream-specific questions that DO have a right answer.
 *
 * Deliberately separate from `Question` (stage 1). Stage 1 profiles interests
 * and has no correct answer; mixing the two shapes would invite scoring one
 * with the other. Nothing here feeds the interest profile or the course
 * ranking — see `development-rules.md`.
 */
export type StreamQuestionOption = {
  id: string;
  label: string;
  /** Rendered large in the option tile; part of the reward loop. */
  emoji: string;
};

export type StreamQuestion = {
  id: string;
  stream: Stream;
  /**
   * The PU subject this question comes from. Each stream contributes exactly
   * three subjects with five questions each, so the round is 15 and every
   * subject is represented equally. Biology is deliberately absent — the
   * catalogue has no biology track, so testing it would be dishonest.
   */
  subject: string;
  /** Short uppercase label above the question, e.g. "LAB LOGIC". */
  kicker: string;
  title: string;
  /** One line of grounding so the question is answerable, not trivia recall. */
  prompt: string;
  options: StreamQuestionOption[];
  correctId: string;
  /** Shown after answering, whether right or wrong. Teaches, never scolds. */
  explanation: string;
};

/** What stage 2 produced. Never used to rank or gate a course. */
export type StreamQuizResult = {
  answers: Record<string, string>;
  correctCount: number;
  total: number;
};

export type Career = {
  slug: string;
  title: string;
  core: Dimension;
  blurb: string;
  dayInLife: string;
  skills: string[];
  courseSlugs: string[];
  growthNote: string;
};

export type MatchLabel = "Strong Match" | "Explore Further" | "Alternative Path";

export type CourseMatch = {
  course: Course;
  interestScore: number;
  aspirationBonus: number;
  finalScore: number;
  label: MatchLabel;
  /** Stream subject requirements. The hard gate. */
  eligible: boolean;
  /**
   * Marks gate, kept SEPARATE from `eligible` so the two reasons a course is a
   * stretch never get conflated in the UI — and so neither touches the score.
   * `true` when the student's band meets the course's typical cut-off, or when
   * either side is unknown (we do not penalise "Not sure yet").
   */
  marksFit: boolean;
  /** Human sentence for why marks flag it, or "" when marksFit is true. */
  marksNote: string;
  explanation: string;
  dimensionReasons: { dimension: Dimension; strength: number; courseNeed: number }[];
};

export type Archetype = {
  key: string;
  title: string;
  tagline: string;
  description: string;
  learningStyle: string;
  careerPersonality: string;
  strengths: string[];
  gradient: string;
  icon: OptionIcon;
};

export type AssessmentResult = {
  id: string;
  createdAt: string;
  student: Student;
  xp: number;
  profile: InterestProfile;
  answers: Record<string, string>;
  completedCount: number;
  archetype: Archetype;
  learningStyle: string;
  badges: string[];
  topDimensions: Dimension[];
  matches: CourseMatch[];
  topCareers: Career[];
  perspective: string;
  goal: string;
  /** Present only once stage 2 has been played. Optional so old saved results load. */
  streamQuiz?: StreamQuizResult;
  batchCode?: string;
};

export type Submission = {
  id: string;
  name: string;
  stream: Stream | "";
  puYear: PUYear | "";
  batchCode: string;
  createdAt: string;
  profile: InterestProfile;
  archetype: string;
  topDimension: Dimension;
  topCourseSlug: string;
  xp: number;
  undecided: boolean;
  sample?: boolean;
  eligibleCourses: string[];
  interestedCareers: string[];
};

export type Batch = {
  id: string;
  name: string;
  code: string;
  institution: string;
  createdAt: string;
  capacity: number;
  sample?: boolean;
};

export type AdminData = {
  batches: Batch[];
  submissions: Submission[];
  seeded: boolean;
};
