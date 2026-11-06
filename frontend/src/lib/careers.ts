import type { Career } from "./types";

export const CAREERS: Career[] = [
  {
    slug: "software-developer",
    title: "Software Developer",
    core: "technology",
    blurb:
      "Designs, writes and maintains the programs behind apps, websites and internal tools. Most of the day is reading code, testing ideas and improving what already exists.",
    dayInLife:
      "Standup with the team, a focused build session, code review, and one stubborn bug that takes longer than expected.",
    skills: ["Programming", "Version control", "Debugging", "System thinking"],
    courseSlugs: ["bca", "bsc-computer-science", "btech-cse", "bsc-it"],
    growthNote:
      "Portfolios and internships matter more than marks here. Projects you can explain are the strongest signal.",
  },
  {
    slug: "ai-ml-engineer",
    title: "AI / ML Engineer",
    core: "analytical",
    blurb:
      "Trains and deploys models that classify, predict, generate or recommend. The work is part statistics, part software engineering, part careful experimentation.",
    dayInLife:
      "Clean a dataset, run experiments, compare metrics, then work with engineers to ship a model safely.",
    skills: ["Python", "Probability", "Model evaluation", "Data pipelines"],
    courseSlugs: ["btech-ai-ml", "bsc-data-science", "btech-cse", "bsc-mathematics"],
    growthNote:
      "Mathematical comfort compounds quickly. Start with strong fundamentals rather than only using pre-built tools.",
  },
  {
    slug: "cybersecurity-specialist",
    title: "Cybersecurity Specialist",
    core: "technology",
    blurb:
      "Finds weaknesses before attackers do, monitors systems, and helps organisations respond when something goes wrong.",
    dayInLife:
      "Review alerts, test a new service for vulnerabilities, document findings, and brief the team on risk.",
    skills: ["Networking", "Linux", "Threat modelling", "Clear reporting"],
    courseSlugs: ["btech-cybersecurity", "bsc-it", "bsc-computer-science"],
    growthNote:
      "Certifications and hands-on labs can carry real weight once your fundamentals are solid.",
  },
  {
    slug: "data-scientist",
    title: "Data Scientist",
    core: "analytical",
    blurb:
      "Turns raw data into decisions: framing the question, building models, and explaining what the evidence actually supports.",
    dayInLife:
      "Interrogate a dataset, build a model, then present findings to people who need to act on them.",
    skills: ["Statistics", "SQL", "Python", "Communication"],
    courseSlugs: ["btech-data-science", "btech-ai-ml", "bca", "bsc-physics-maths-cs"],
    growthNote:
      "The hardest part is usually framing the right question, not writing the code.",
  },
  {
    slug: "business-analyst",
    title: "Business Analyst",
    core: "business",
    blurb:
      "Sits between business problems and technical solutions, translating needs into requirements and measurable outcomes.",
    dayInLife:
      "Interview stakeholders, map a process, write requirements, and check whether a solution actually helped.",
    skills: ["Process mapping", "Excel & SQL", "Requirements writing", "Stakeholder management"],
    courseSlugs: ["bba-business-analytics", "bcom", "ba-economics", "bsc-statistics"],
    growthNote:
      "Domain knowledge is the moat — learn one industry properly rather than staying generic.",
  },
  {
    slug: "financial-analyst",
    title: "Financial Analyst",
    core: "business",
    blurb:
      "Builds models, evaluates investments and explains financial performance to decision-makers.",
    dayInLife:
      "Update a model, verify assumptions, compare scenarios, and prepare a clear recommendation.",
    skills: ["Financial modelling", "Accounting", "Excel", "Attention to detail"],
    courseSlugs: ["bcom-finance", "bcom", "ba-economics"],
    growthNote:
      "Accuracy and credibility matter more than speed. Professional qualifications can add strong signalling.",
  },
  {
    slug: "entrepreneur",
    title: "Founder / Entrepreneur",
    core: "business",
    blurb:
      "Finds a real problem, builds a solution, and earns the right to keep going by getting customers to pay attention.",
    dayInLife: "Talk to users, decide what not to build, fix the funnel, and manage cash.",
    skills: ["Customer discovery", "Sales", "Prioritisation", "Resilience"],
    courseSlugs: ["bba", "bcom", "bba-business-analytics", "ba-economics"],
    growthNote:
      "You do not need a degree to start, but business and finance fundamentals reduce expensive mistakes.",
  },
  {
    slug: "marketing-manager",
    title: "Marketing / Brand Manager",
    core: "communication",
    blurb:
      "Shapes how a product is understood: positioning, campaigns, content and the metrics behind them.",
    dayInLife: "Review campaign data, brief creative work, coordinate channels, and test a new message.",
    skills: ["Storytelling", "Analytics", "Campaign planning", "Copywriting"],
    courseSlugs: ["bba", "ba-mass-communication", "ba-journalism", "bsc-visual-communication"],
    growthNote:
      "Early on, build proof: a real audience, a campaign you ran, or measurable growth you drove.",
  },
  {
    slug: "ux-designer",
    title: "UI/UX Designer",
    core: "creativity",
    blurb:
      "Researches how people use a product, then designs flows and interfaces that make it easier and clearer.",
    dayInLife: "Interview users, sketch flows, prototype in Figma, then test with real people.",
    skills: ["User research", "Information architecture", "Figma", "Visual craft"],
    courseSlugs: ["bdes", "ba-psychology", "bsc-visual-communication"],
    growthNote:
      "Case studies showing your thinking beat pretty screenshots. Portfolio over pedigree.",
  },
  {
    slug: "graphic-designer",
    title: "Graphic / Brand Designer",
    core: "creativity",
    blurb:
      "Creates visual identities, layouts and campaign assets that make a brand recognisable and coherent.",
    dayInLife: "Interpret a brief, explore directions, refine type and layout, then prepare files for production.",
    skills: ["Typography", "Layout", "Adobe suite / Figma", "Client communication"],
    courseSlugs: ["bdes", "bfa", "bsc-visual-communication"],
    growthNote:
      "A distinct visual voice takes time. Study work you admire and reproduce it deliberately.",
  },
  {
    slug: "animator-motion-designer",
    title: "Animator / Motion Designer",
    core: "creativity",
    blurb:
      "Makes images move — for films, games, advertising and product interfaces.",
    dayInLife: "Block a sequence, refine timing, render, and revise after feedback.",
    skills: ["Animation principles", "Storyboarding", "3D or 2D software", "Patience"],
    courseSlugs: ["bsc-animation", "bsc-visual-communication", "bfa", "bdes"],
    growthNote:
      "Showreels decide opportunities. Finish small pieces rather than polishing one forever.",
  },
  {
    slug: "mechanical-engineer",
    title: "Mechanical Engineer",
    core: "engineering",
    blurb:
      "Designs, tests and improves physical products and systems — from components to full machines.",
    dayInLife: "Model a part, run simulations, review tolerances with the workshop, and test a prototype.",
    skills: ["CAD", "Thermodynamics", "Materials", "Problem solving"],
    courseSlugs: ["btech-mechanical", "btech-automobile", "btech-aerospace"],
    growthNote:
      "Simulation skills plus hands-on fabrication experience make you unusually useful.",
  },
  {
    slug: "robotics-engineer",
    title: "Robotics / Automation Engineer",
    core: "engineering",
    blurb:
      "Builds machines that sense and act — integrating mechanics, electronics and control software.",
    dayInLife: "Wire a prototype, tune a control loop, debug unexpected motion, and test in the real environment.",
    skills: ["Sensors", "Embedded C", "Control systems", "Mechanical design"],
    courseSlugs: ["btech-mechatronics", "btech-ece", "btech-mechanical"],
    growthNote:
      "Competitions and personal robots teach more than lectures. Document what breaks and why.",
  },
  {
    slug: "civil-engineer",
    title: "Civil / Structural Engineer",
    core: "engineering",
    blurb:
      "Designs and supervises the structures and infrastructure a society depends on.",
    dayInLife: "Check drawings, review site progress, validate loads, and coordinate with contractors.",
    skills: ["Structural analysis", "AutoCAD", "Site management", "Safety standards"],
    courseSlugs: ["btech-civil"],
    growthNote:
      "Site exposure early in your career builds judgement that software alone cannot give you.",
  },
  {
    slug: "electronics-engineer",
    title: "Electronics / Embedded Engineer",
    core: "engineering",
    blurb:
      "Designs the circuits and embedded systems inside devices, vehicles and industrial equipment.",
    dayInLife: "Debug a board, write firmware, measure a signal, and validate against the datasheet.",
    skills: ["Circuit design", "Firmware", "Signal processing", "Testing"],
    courseSlugs: ["btech-ece", "btech-electrical", "bsc-physics"],
    growthNote:
      "A home lab and a few finished hardware projects will differentiate you quickly.",
  },
  {
    slug: "psychologist",
    title: "Psychologist / Counsellor",
    core: "communication",
    blurb:
      "Works with people to understand behaviour and support mental health, learning or workplace wellbeing.",
    dayInLife: "Sessions, case notes, supervision, and careful reading of research.",
    skills: ["Active listening", "Assessment", "Ethics", "Research literacy"],
    courseSlugs: ["ba-psychology", "ba-sociology"],
    growthNote:
      "Practice in India typically requires a relevant master's and supervised training — plan for postgraduate study.",
  },
  {
    slug: "journalist",
    title: "Journalist / Reporter",
    core: "communication",
    blurb:
      "Investigates, verifies and tells stories that help the public understand what is happening.",
    dayInLife: "Chase sources, verify claims, write to deadline, and defend editorial standards.",
    skills: ["Reporting", "Interviewing", "Fact-checking", "Writing under pressure"],
    courseSlugs: ["ba-journalism", "ba-mass-communication", "ba-english", "ba-political-science"],
    growthNote:
      "Start publishing now — a body of bylines is the most credible entry ticket.",
  },
  {
    slug: "public-policy-analyst",
    title: "Public Policy Analyst",
    core: "communication",
    blurb:
      "Researches social problems and designs or evaluates interventions with governments and nonprofits.",
    dayInLife: "Read scheme data, interview implementers, model options, and write a memo.",
    skills: ["Policy analysis", "Research design", "Economics", "Clear writing"],
    courseSlugs: ["ba-public-administration", "ba-economics", "ba-sociology", "ba-political-science"],
    growthNote:
      "Internships with think tanks or government programmes matter more than the degree label.",
  },
  {
    slug: "product-manager",
    title: "Product Manager",
    core: "business",
    blurb:
      "Decides what to build and why, balancing user needs, business goals and engineering reality.",
    dayInLife: "Talk to users, prioritise a roadmap, unblock the team, and review what shipped.",
    skills: ["Discovery", "Prioritisation", "Communication", "Data literacy"],
    courseSlugs: ["bba", "btech-cse", "bdes", "bba-business-analytics"],
    growthNote:
      "Usually an experienced role. Build adjacent skills first — engineering, design, analytics or consulting.",
  },
  {
    slug: "academic-researcher",
    title: "Academic Researcher",
    core: "analytical",
    blurb:
      "Creates new knowledge through careful study, experiments or archival work, and teaches it to others.",
    dayInLife: "Read papers, design a study, analyse results, write, and revise after peer review.",
    skills: ["Literature review", "Research methods", "Academic writing", "Patience"],
    courseSlugs: ["bsc-physics-maths-cs", "btech-cse"],
    growthNote:
      "Plan for a master's and possibly a PhD. Talk to working researchers before committing.",
  },
];

export const CAREER_BY_SLUG: Record<string, Career> = Object.fromEntries(
  CAREERS.map((career) => [career.slug, career]),
);

export function getCareer(slug: string): Career | undefined {
  return CAREER_BY_SLUG[slug];
}
