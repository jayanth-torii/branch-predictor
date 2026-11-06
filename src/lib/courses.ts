import type { Course, Stream } from "./types";

/**
 * The catalogue is the real undergraduate offering of two campuses:
 *
 *  - NCET  - Nagarjuna College of Engineering and Technology (autonomous under
 *            VTU, NAAC A+). B.E. programmes plus a BCA.
 *  - NCMS  - Nagarjuna College of Management Studies (affiliated to Bengaluru
 *            North University). B.Com, BBA, BCA and a B.Sc.
 *
 * Nothing here is invented. Every programme below appears in that college's own
 * website content. Deliberately absent:
 *  - Postgraduate programmes (MBA, MCA, M.Com, M.Tech Structural) - this tool is
 *    for PU students choosing a first degree.
 *  - Service departments (Physics, Chemistry, Mathematics, Kannada, Hindi,
 *    English, Social Science and Foreign Languages) - they teach into other
 *    programmes, they do not admit their own UG batch.
 *  - Any biology track. Neither campus offers one, so PCMB students are pointed
 *    at the computing, engineering, commerce and science options that are
 *    genuinely open to them rather than at a course that does not exist.
 *
 * No fees, cut-off marks, placement rates, salary figures or rankings appear in
 * this file. Where a college's own material is silent, the line here is
 * deliberately conservative and tells the student to confirm with the college.
 */

const SCIENCE: Stream[] = ["PCMB", "PCMC", "PCM"];
const ALL_STREAMS: Stream[] = ["PCMB", "PCMC", "PCM", "Commerce", "Arts/Humanities"];
/** Maths-bearing streams: the BCA subject rule below is satisfied by all of these. */
const SCIENCE_AND_COMMERCE: Stream[] = [...SCIENCE, "Commerce"];

/**
 * NCET's own published UG criteria, shared by every B.E. programme. Physics and
 * Mathematics are the compulsory pair, which is why PCMB, PCMC and PCM all
 * qualify - the fourth subject only has to be one of the listed optionals.
 */
const BE_ELIGIBILITY =
  "NCET's published rule: a pass in 2nd PU / 12th with English, and a minimum of 45 percent in aggregate in Physics and Mathematics as compulsory subjects, with Chemistry, Biology, Biotechnology, Computer Science or Electronics as the optional subject (40 percent for SC/ST/OBC). PCMB, PCMC and PCM all satisfy this. Admission is through KCET or COMEDK; management-quota seats look for roughly 50 percent in PU. Confirm the current year's criteria with the college.";

/**
 * NCET's stated BCA rule. It is a subject rule rather than a stream rule, which
 * is why Commerce students with Business Mathematics or Statistics are included.
 */
const NCET_BCA_ELIGIBILITY =
  "NCET's published rule: a pass in 2nd PU / 12th with at least 45 percent (40 percent for SC/ST/OBC), having studied Mathematics, Statistics, Computer Science or Business Mathematics as one of the subjects. That covers all three science combinations and Commerce students who took Business Mathematics or Statistics. If your combination did not include one of those subjects, check with the college before applying.";

/**
 * NCMS does not publish subject-wise eligibility in its own site content, so
 * nothing specific is claimed here. Karnataka UG admission runs through UUCMS.
 */
const NCMS_GENERAL_ELIGIBILITY =
  "NCMS admits on the strength of the 2nd PU / 12th result under Bengaluru North University norms, with candidate registration through the Karnataka UUCMS portal. The college does not publish a subject-wise minimum for this programme, so ask the admissions office what it expects for your combination and category.";

const NCMS_COMPUTING_ELIGIBILITY =
  "NCMS admits on the strength of the 2nd PU / 12th result under Bengaluru North University norms, with candidate registration through the Karnataka UUCMS portal. The college does not publish a subject-wise minimum, though computing programmes commonly expect Mathematics, Statistics, Computer Science or Business Mathematics at PU - confirm your combination with the admissions office.";

export const COURSES: Course[] = [
  {
    slug: "btech-cse",
    name: "B.E. Computer Science and Engineering",
    short: "Computer Science & Engineering",
    category: "Technology & Computing",
    tagline: "The broad computing degree the rest of NCET's tech branches grew out of.",
    degree: "Bachelor of Engineering (Computer Science and Engineering)",
    duration: "4 years",
    interests: { technology: 0.97, analytical: 0.88, engineering: 0.62, creativity: 0.35, business: 0.25 },
    streams: SCIENCE,
    eligibilityNotes: BE_ELIGIBILITY,
    skills: [
      "Problem solving in C",
      "Data structures and algorithms",
      "Operating systems and computer networks",
      "Web and Android application development",
      "Data mining and machine learning",
      "Computer security and IoT computing",
    ],
    careers: ["Software Engineer", "Backend Developer", "Systems Engineer", "Product Engineer"],
    careerSlugs: ["software-developer", "product-manager", "ai-ml-engineer"],
    related: ["btech-ise", "btech-ai-ml", "bca"],
    entranceExams: ["KCET", "COMEDK UGET", "JEE Main (accepted for management-quota seats)"],
    whyItFits:
      "NCET's largest department - a sanctioned intake of 240, NBA accreditation for the programme and the widest spread of electives. Pick it if you want computing broadly rather than one specialisation decided in 2nd PU.",
    accent: "#FF6B35",
    college: "NCET",
  },
  {
    slug: "btech-ai-ml",
    name: "B.E. CSE (Artificial Intelligence and Machine Learning)",
    short: "AI & Machine Learning",
    category: "Technology & Computing",
    tagline: "Build systems that learn patterns instead of being told the rules.",
    degree: "Bachelor of Engineering (Computer Science and Engineering - AI and ML)",
    duration: "4 years",
    interests: { technology: 0.95, analytical: 0.95, engineering: 0.58, creativity: 0.35, business: 0.25 },
    streams: SCIENCE,
    eligibilityNotes: BE_ELIGIBILITY,
    skills: [
      "Machine learning model building",
      "Pattern recognition",
      "Natural language processing",
      "Computer vision",
      "Business intelligence",
      "Programming and data handling",
    ],
    careers: ["ML Engineer", "AI Associate", "Data Scientist", "Computer Vision Engineer"],
    careerSlugs: ["ai-ml-engineer", "data-scientist", "software-developer"],
    related: ["btech-cse", "btech-data-science", "bsc-physics-maths-cs"],
    entranceExams: ["KCET", "COMEDK UGET", "JEE Main (accepted for management-quota seats)"],
    whyItFits:
      "Built on the same CSE core but specialised from early on - NCET describes graduates heading into robotics, natural language processing, computer vision, cyber security, business intelligence and manufacturing. Intake is 180. Choose it if the mathematics is the attraction, not the obstacle.",
    accent: "#FF6B35",
    college: "NCET",
  },
  {
    slug: "btech-data-science",
    name: "B.E. CSE (Data Science)",
    short: "Data Science",
    category: "Technology & Computing",
    tagline: "Turn large, messy data into something an organisation can act on.",
    degree: "Bachelor of Engineering (Computer Science and Engineering - Data Science)",
    duration: "4 years",
    interests: { analytical: 0.95, technology: 0.88, engineering: 0.5, business: 0.45, communication: 0.35 },
    streams: SCIENCE,
    eligibilityNotes: BE_ELIGIBILITY,
    skills: [
      "Statistics",
      "Data cleaning and aggregation",
      "Data visualisation",
      "Knowledge extraction from large datasets",
      "Programming for analysis",
    ],
    careers: ["Data Analyst", "Data Scientist", "Business Intelligence Analyst", "Analytics Associate"],
    careerSlugs: ["data-scientist", "business-analyst", "ai-ml-engineer"],
    related: ["btech-ai-ml", "btech-cse", "bsc-physics-maths-cs"],
    entranceExams: ["KCET", "COMEDK UGET", "JEE Main (accepted for management-quota seats)"],
    whyItFits:
      "A small branch - intake 60 - that sits deliberately between statistics and software. NCET frames it as preparing data for analysis and extracting usable knowledge, so expect as much interpretation as coding.",
    accent: "#FF6B35",
    college: "NCET",
  },
  {
    slug: "btech-cybersecurity",
    name: "B.E. CSE (IoT and Cyber Security including Blockchain Technologies)",
    short: "IoT & Cyber Security",
    category: "Technology & Computing",
    tagline: "Learn how systems are attacked, and how they are defended.",
    degree:
      "Bachelor of Engineering (Computer Science and Engineering - IoT and Cyber Security including Blockchain Technologies)",
    duration: "4 years",
    interests: { technology: 0.95, analytical: 0.85, engineering: 0.65, business: 0.3, communication: 0.3 },
    streams: SCIENCE,
    eligibilityNotes: BE_ELIGIBILITY,
    skills: [
      "Network security",
      "Cryptography",
      "Ethical hacking",
      "Digital forensics",
      "Blockchain and smart contracts",
      "Cyber law basics",
    ],
    careers: ["Security Analyst", "SOC Analyst", "Penetration Tester", "Blockchain Developer"],
    careerSlugs: ["cybersecurity-specialist", "software-developer", "electronics-engineer"],
    related: ["btech-cse", "btech-ise", "btech-ece"],
    entranceExams: ["KCET", "COMEDK UGET", "JEE Main (accepted for management-quota seats)"],
    whyItFits:
      "The one NCET branch built around protecting systems rather than only building them - network security, cryptography, ethical hacking, digital forensics and cyber law, plus blockchain, distributed ledgers and smart contracts. Suits patient, adversarial thinkers.",
    accent: "#FF6B35",
    college: "NCET",
  },
  {
    slug: "btech-ise",
    name: "B.E. Information Science and Engineering",
    short: "Information Science",
    category: "Technology & Computing",
    tagline: "Computing seen through how information is stored, moved and used.",
    degree: "Bachelor of Engineering (Information Science and Engineering)",
    duration: "4 years",
    interests: { technology: 0.92, analytical: 0.8, engineering: 0.55, business: 0.35, communication: 0.35 },
    streams: SCIENCE,
    eligibilityNotes: BE_ELIGIBILITY,
    skills: [
      "Programming fundamentals",
      "Information storage and retrieval",
      "Database systems",
      "Data analysis",
      "Software engineering practice",
    ],
    careers: ["Software Engineer", "Database Administrator", "IT Analyst", "Application Support Engineer"],
    careerSlugs: ["software-developer", "business-analyst", "cybersecurity-specialist"],
    related: ["btech-cse", "bca", "btech-data-science"],
    entranceExams: ["KCET", "COMEDK UGET", "JEE Main (accepted for management-quota seats)"],
    whyItFits:
      "NCET describes ISE as interdisciplinary - computer science alongside communications, management and law - with placement training from the fifth semester onwards. Intake is 60, so it is a smaller cohort than CSE.",
    accent: "#FF6B35",
    college: "NCET",
  },
  {
    slug: "btech-ece",
    name: "B.E. Electronics and Communication Engineering",
    short: "Electronics & Communication",
    category: "Engineering & Innovation",
    tagline: "The chips, signals and devices everything else runs on top of.",
    degree: "Bachelor of Engineering (Electronics and Communication Engineering)",
    duration: "4 years",
    interests: { engineering: 0.92, technology: 0.85, analytical: 0.82, creativity: 0.35, communication: 0.3 },
    streams: SCIENCE,
    eligibilityNotes: BE_ELIGIBILITY,
    skills: [
      "Digital electronics",
      "Signal processing",
      "VLSI design",
      "Communication systems",
      "Embedded systems and robotics",
    ],
    careers: ["Electronics Engineer", "Embedded Systems Engineer", "VLSI Engineer", "Telecom Engineer"],
    careerSlugs: ["electronics-engineer", "robotics-engineer", "software-developer"],
    related: ["btech-cybersecurity", "btech-cse", "bsc-physics-maths-cs"],
    entranceExams: ["KCET", "COMEDK UGET", "JEE Main (accepted for management-quota seats)"],
    whyItFits:
      "Established in 2001, NBA accredited, intake 120, with a Drone Technology Centre of Excellence run with IIT Goa and an e-Yantra robotics lab with IIT Bombay. Pick it if you want to work on hardware and the software that drives it.",
    accent: "#1F9D8B",
    college: "NCET",
  },
  {
    slug: "btech-civil",
    name: "B.E. Civil Engineering",
    short: "Civil Engineering",
    category: "Engineering & Innovation",
    tagline: "Infrastructure you can stand on, measured and signed off.",
    degree: "Bachelor of Engineering (Civil Engineering)",
    duration: "4 years",
    interests: { engineering: 0.95, analytical: 0.75, technology: 0.45, business: 0.4, communication: 0.35 },
    streams: SCIENCE,
    eligibilityNotes: BE_ELIGIBILITY,
    skills: [
      "Structural analysis",
      "Surveying",
      "Materials and concrete testing",
      "Construction management",
      "Computer aided drafting",
    ],
    careers: ["Site Engineer", "Structural Engineer", "Project Engineer", "Materials Testing Engineer"],
    careerSlugs: ["civil-engineer", "mechanical-engineer"],
    related: ["btech-ece", "btech-cse", "bsc-physics-maths-cs"],
    entranceExams: ["KCET", "COMEDK UGET", "JEE Main (accepted for management-quota seats)"],
    whyItFits:
      "Running since 2004, NBA accredited, intake 60, with departmental testing and consultancy work and student chapters of ICI, ACCE(I) and IGBC. Choose it if you want physical, visible outcomes and real site constraints.",
    accent: "#1F9D8B",
    college: "NCET",
  },
  {
    slug: "bca",
    name: "BCA (NCET)",
    short: "Computer Applications",
    category: "Technology & Computing",
    tagline: "A three-year route into software without the engineering entrance race.",
    degree: "Bachelor of Computer Applications",
    duration: "3 years",
    interests: { technology: 0.92, analytical: 0.72, creativity: 0.45, business: 0.3, communication: 0.3 },
    streams: SCIENCE_AND_COMMERCE,
    eligibilityNotes: NCET_BCA_ELIGIBILITY,
    skills: [
      "Programming and software development",
      "Analytical and logical problem solving",
      "Modern development tools",
      "Project work and internships",
      "Technical communication",
    ],
    careers: ["Software Developer", "Web Developer", "Application Support Analyst", "IT Entrepreneur"],
    careerSlugs: ["software-developer", "product-manager", "business-analyst"],
    related: ["bca-ncms", "btech-ise", "btech-cse"],
    entranceExams: ["No entrance test listed - admission on 2nd PU marks"],
    whyItFits:
      "Intake 120, three years, affiliated to VTU. NCET positions it as application-first and industry-facing rather than theory-heavy, and it is one of the courses here a Commerce student can walk straight into.",
    accent: "#FF6B35",
    college: "NCET",
  },
  {
    slug: "bca-ncms",
    name: "BCA (NCMS)",
    short: "Computer Applications",
    category: "Technology & Computing",
    tagline: "Hands-on application development on a management campus.",
    degree: "Bachelor of Computer Applications",
    duration: "3 years",
    interests: { technology: 0.9, analytical: 0.7, creativity: 0.5, business: 0.4, communication: 0.35 },
    streams: SCIENCE_AND_COMMERCE,
    eligibilityNotes: NCMS_COMPUTING_ELIGIBILITY,
    skills: [
      "Programming fundamentals",
      "Web development with the MERN stack",
      "Python and Flask",
      "Databases",
      "Internship and industry project work",
    ],
    careers: ["Software Developer", "Web Developer", "QA Associate", "IT Support Analyst"],
    careerSlugs: ["software-developer", "business-analyst", "entrepreneur"],
    related: ["bca", "bba", "bsc-physics-maths-cs"],
    entranceExams: [
      "UUCMS candidate registration (Karnataka)",
      "No entrance test listed - admission on 2nd PU marks",
    ],
    whyItFits:
      "Running since 2018 under Bengaluru North University. The department's add-on programmes are unusually concrete - MERN stack web development in both the first and second year, plus Flask - so you build deployable things early.",
    accent: "#FF6B35",
    college: "NCMS",
  },
  {
    slug: "bcom",
    name: "B.Com",
    short: "Commerce",
    category: "Business & Commerce",
    tagline: "Accounting, taxation and the numbers every organisation runs on.",
    degree: "Bachelor of Commerce",
    duration: "3 years",
    interests: { business: 0.95, analytical: 0.7, communication: 0.45, technology: 0.35, creativity: 0.2 },
    streams: ALL_STREAMS,
    eligibilityNotes: NCMS_GENERAL_ELIGIBILITY,
    skills: [
      "Financial accounting",
      "Taxation fundamentals",
      "Business law and ethics",
      "Advanced Excel",
      "Power BI and Tableau basics",
    ],
    careers: ["Accountant", "Audit Assistant", "Tax Associate", "Banking Associate"],
    careerSlugs: ["financial-analyst", "business-analyst", "entrepreneur"],
    related: ["bba", "bca-ncms", "bsc-physics-maths-cs"],
    entranceExams: [
      "UUCMS candidate registration (Karnataka)",
      "No entrance test listed - admission on 2nd PU marks",
    ],
    whyItFits:
      "NCMS runs B.Com with electives in Accounting and Taxation, Finance, Marketing and Human Resources, so you specialise inside the degree. It is also the usual base alongside CA, CS or CMA - and it is open to every PU stream.",
    accent: "#E0A400",
    college: "NCMS",
  },
  {
    slug: "bba",
    name: "BBA",
    short: "Business Administration",
    category: "Business & Commerce",
    tagline: "How organisations are actually run - and how you would run one.",
    degree: "Bachelor of Business Administration",
    duration: "3 years",
    interests: { business: 0.95, communication: 0.8, analytical: 0.6, creativity: 0.45, technology: 0.35 },
    streams: ALL_STREAMS,
    eligibilityNotes: NCMS_GENERAL_ELIGIBILITY,
    skills: [
      "Management fundamentals",
      "Marketing",
      "Human resource basics",
      "Business communication",
      "Digital marketing",
      "Python and Microsoft Office essentials",
    ],
    careers: ["Management Trainee", "Marketing Executive", "HR Associate", "Founder"],
    careerSlugs: ["entrepreneur", "marketing-manager", "business-analyst", "product-manager"],
    related: ["bcom", "bca-ncms", "bsc-physics-maths-cs"],
    entranceExams: [
      "UUCMS candidate registration (Karnataka)",
      "No entrance test listed - admission on 2nd PU marks",
    ],
    whyItFits:
      "The NCMS commerce and management department states entrepreneurship and leadership as programme outcomes, and backs that with industry sessions, internships and a campus-to-corporate aptitude track. Open to every PU stream, PCMB included.",
    accent: "#E0A400",
    college: "NCMS",
  },
  {
    slug: "bsc-physics-maths-cs",
    name: "B.Sc. Physics, Mathematics and Computer Science",
    short: "Physics, Maths & Computer Science",
    category: "Science & Mathematics",
    tagline: "Keep physics, mathematics and computing together for three more years.",
    degree: "Bachelor of Science (Physics, Mathematics and Computer Science)",
    duration: "3 years",
    interests: { analytical: 0.95, technology: 0.72, engineering: 0.5, creativity: 0.25, communication: 0.2 },
    streams: SCIENCE,
    eligibilityNotes:
      "The combination is Physics, Mathematics and Computer Science, so a PU science combination carrying Physics and Mathematics is the natural fit. NCMS does not publish a subject-wise minimum in its own material; admission is on the 2nd PU result under Bengaluru North University norms with UUCMS registration. Confirm the requirement for your combination with the college.",
    skills: [
      "Mathematical modelling",
      "Physics laboratory work",
      "Python programming",
      "Computational simulation",
      "Statistical interpretation of data",
    ],
    careers: ["Research Assistant", "Data Analyst", "Laboratory Analyst", "Teacher (after PG or B.Ed.)"],
    careerSlugs: ["data-scientist", "academic-researcher", "software-developer"],
    related: ["bca-ncms", "btech-data-science", "btech-cse"],
    entranceExams: [
      "UUCMS candidate registration (Karnataka)",
      "No entrance test listed - admission on 2nd PU marks",
    ],
    whyItFits:
      "The only non-professional science degree across the two campuses. NCMS runs it as one interdisciplinary programme - modelling, simulation and experiments together - with Python taught from the first year. Good if you want to keep a master's or research route open.",
    accent: "#C94B7C",
    college: "NCMS",
  },
];

export const COURSE_BY_SLUG: Record<string, Course> = Object.fromEntries(
  COURSES.map((course) => [course.slug, course]),
);

export const COURSE_CATEGORIES = Array.from(new Set(COURSES.map((c) => c.category)));

export const COURSE_INDEX = Object.fromEntries(COURSES.map((c) => [c.slug, c]));

export function getCourse(slug: string): Course | undefined {
  return COURSE_BY_SLUG[slug];
}

export function isEligible(course: Course, stream: string | undefined): boolean {
  if (!stream) return true;
  return course.streams.includes(stream as Stream);
}
