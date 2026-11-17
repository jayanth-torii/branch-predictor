"use client";

import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import { batchStats, courseDemand, interestDistribution } from "@/lib/batches";
import { CAREER_BY_SLUG } from "@/lib/careers";
import { COURSE_BY_SLUG } from "@/lib/courses";
import {
  DIMENSIONS,
  DIMENSION_META,
  type AssessmentResult,
  type Batch,
  type Submission,
} from "@/lib/types";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 40;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const MIDNIGHT: [number, number, number] = [16, 27, 61];
const ORANGE: [number, number, number] = [255, 107, 53];
const INK: [number, number, number] = [89, 101, 127];
const ARCTIC: [number, number, number] = [248, 249, 252];
const FOG: [number, number, number] = [233, 237, 247];
const WHITE: [number, number, number] = [255, 255, 255];

type TableDoc = jsPDF & { lastAutoTable?: { finalY?: number } };

/** jsPDF's built-in Helvetica only covers WinAnsi; normalise typographic characters. */
function clean(value: string): string {
  return value
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/[\u2192\u00B7\u2022]/g, "-")
    .replace(/[^\x20-\x7E\n]/g, "");
}

function safeFilename(value: string): string {
  return (
    clean(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "branch-predictor-report"
  );
}

function drawFooter(doc: jsPDF, note: string): void {
  const total = doc.getNumberOfPages();
  for (let page = 1; page <= total; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(...FOG);
    doc.setLineWidth(0.6);
    doc.line(MARGIN, PAGE_HEIGHT - 46, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 46);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...INK);
    doc.text(clean(note), MARGIN, PAGE_HEIGHT - 31);
    doc.text(`Page ${page} of ${total}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 31, {
      align: "right",
    });
  }
}

function drawHeader(doc: jsPDF, label: string, title: string, subtitle: string): void {
  doc.setFillColor(...MIDNIGHT);
  doc.rect(0, 0, PAGE_WIDTH, 108, "F");
  doc.setFillColor(...ORANGE);
  doc.circle(54, 38, 8, "F");
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.7);
  doc.ellipse(54, 38, 14, 5, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...WHITE);
  doc.text("BRANCH PREDICTOR", 76, 36);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(185, 196, 220);
  doc.text("Career discovery for PU students", 76, 47);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...ORANGE);
  doc.text(label.toUpperCase(), PAGE_WIDTH - MARGIN, 33, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(185, 196, 220);
  doc.text(`Generated ${new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}`, PAGE_WIDTH - MARGIN, 44, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...WHITE);
  const titleLines = doc.splitTextToSize(clean(title), CONTENT_WIDTH - 60);
  doc.text(titleLines.slice(0, 2), 54, 76);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(185, 196, 220);
  doc.text(clean(subtitle), 54, 96);
}

function drawContinuationHeader(doc: jsPDF, label: string): void {
  doc.setFillColor(...MIDNIGHT);
  doc.rect(0, 0, PAGE_WIDTH, 38, "F");
  doc.setFillColor(...ORANGE);
  doc.circle(48, 19, 4.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...WHITE);
  doc.text(`BRANCH PREDICTOR  ·  ${label.toUpperCase()}`, MARGIN + 18, 22);
}

function heading(doc: jsPDF, y: number, kicker: string, title: string): number {
  if (y > PAGE_HEIGHT - 120) {
    doc.addPage();
    y = 66;
  }
  doc.setFillColor(...ORANGE);
  doc.rect(MARGIN, y - 7, 3, 14, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(...INK);
  doc.text(kicker.toUpperCase(), MARGIN + 10, y - 1);
  doc.setFontSize(12);
  doc.setTextColor(...MIDNIGHT);
  doc.text(clean(title), MARGIN + 10, y + 12);
  return y + 24;
}

function paragraph(doc: jsPDF, y: number, text: string, size = 8.5, color = INK): number {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(size);
  doc.setTextColor(...color);
  const lines = doc.splitTextToSize(clean(text), CONTENT_WIDTH);
  if (y + lines.length * (size + 3) > PAGE_HEIGHT - 70) {
    doc.addPage();
    y = 66;
  }
  doc.text(lines, MARGIN, y);
  return y + lines.length * (size + 3);
}

function drawKpis(doc: jsPDF, y: number, items: { label: string; value: string }[]): number {
  const gap = 8;
  const boxWidth = (CONTENT_WIDTH - gap * (items.length - 1)) / items.length;
  items.forEach((item, index) => {
    const x = MARGIN + index * (boxWidth + gap);
    doc.setFillColor(...ARCTIC);
    doc.setDrawColor(...FOG);
    doc.setLineWidth(0.6);
    doc.roundedRect(x, y, boxWidth, 58, 6, 6, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.setTextColor(...INK);
    doc.text(item.label.toUpperCase(), x + 10, y + 18);
    doc.setTextColor(...MIDNIGHT);
    /* Step the size down until the value MEASURES as fitting, rather than
       guessing from character count. "Communication" is thirteen characters
       and broke across two lines at the old fixed 15pt. */
    const value = clean(item.value);
    const room = boxWidth - 20;
    let size = 15;
    doc.setFontSize(size);
    while (size > 8 && doc.getTextWidth(value) > room) {
      size -= 0.5;
      doc.setFontSize(size);
    }
    doc.text(value, x + 10, y + 42, { maxWidth: room });
  });
  return y + 58;
}

function drawTable(
  doc: jsPDF,
  y: number,
  header: string[],
  body: string[][],
  label: string,
  columnStyles?: Record<number, { cellWidth?: number; halign?: "left" | "right" | "center" }>,
): number {
  if (y > PAGE_HEIGHT - 100) {
    doc.addPage();
    y = 60;
  }
  autoTable(doc, {
    startY: y,
    head: [header],
    body: body.length ? body : [header.map(() => "-")],
    theme: "grid",
    margin: { top: 52, left: MARGIN, right: MARGIN, bottom: 62 },
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 5.5,
      textColor: [45, 52, 74],
      lineColor: FOG,
      lineWidth: 0.5,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: MIDNIGHT,
      textColor: WHITE,
      fontSize: 7,
      fontStyle: "bold",
      cellPadding: 6,
    },
    alternateRowStyles: { fillColor: ARCTIC },
    columnStyles,
    didDrawPage: () => {
      if (doc.getCurrentPageInfo().pageNumber > 1) {
        drawContinuationHeader(doc, label);
      }
    },
  });
  const finalY = (doc as TableDoc).lastAutoTable?.finalY ?? y + 40;
  return finalY + 20;
}

function smallNote(doc: jsPDF, y: number, text: string): number {
  if (y > PAGE_HEIGHT - 100) {
    doc.addPage();
    y = 66;
  }
  doc.setFillColor(255, 248, 240);
  const lines = doc.splitTextToSize(clean(text), CONTENT_WIDTH - 24);
  const height = 18 + lines.length * 10;
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, height, 5, 5, "F");
  doc.setFillColor(...ORANGE);
  doc.rect(MARGIN, y, 3, height, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(90, 70, 30);
  doc.text(lines, MARGIN + 12, y + 13);
  return y + height + 16;
}

export async function downloadBatchReportPdf(
  batch: Batch,
  allSubmissions: Submission[],
): Promise<void> {
  const submissions = allSubmissions.filter((submission) => submission.batchCode === batch.code);
  const stats = batchStats(batch, allSubmissions);
  const distribution = interestDistribution(submissions)
    .slice()
    .sort((a, b) => b.count - a.count);
  const demand = courseDemand(submissions).slice(0, 8);
  const undecided = submissions.filter((submission) => submission.undecided);

  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  drawHeader(
    doc,
    "Batch career report",
    batch.name,
    `${batch.institution}  ·  Code ${batch.code}  ·  ${stats.completed} of ${batch.capacity} seats assessed`,
  );

  let y = 136;
  y = drawKpis(doc, y, [
    { label: "Assessed", value: `${stats.completed}/${batch.capacity}` },
    { label: "Completion", value: `${stats.completionRate}%` },
    {
      label: "Dominant interest",
      value: stats.dominant ? DIMENSION_META[stats.dominant].short : "No data",
    },
    { label: "Still exploring", value: String(stats.undecided) },
  ]);
  y += 24;

  y = heading(doc, y, "Interest distribution", "Where this batch leans");
  y = drawTable(
    doc,
    y,
    ["Interest dimension", "Students", "Share of assessed"],
    distribution.map((entry) => [
      DIMENSION_META[entry.dimension].label,
      String(entry.count),
      `${entry.percent}%`,
    ]),
    batch.name,
    { 1: { halign: "right", cellWidth: 70 }, 2: { halign: "right", cellWidth: 110 } },
  );
  y = paragraph(
    doc,
    y,
    "Each student is counted once under their strongest interest dimension. Use the full profiles before drawing strong conclusions about individuals.",
    7.5,
  );
  y += 10;

  y = heading(doc, y, "Course demand", "Top recommended programmes");
  y = drawTable(
    doc,
    y,
    ["Course", "Students ranking it first"],
    demand.map((entry) => [entry.name, String(entry.count)]),
    batch.name,
    { 1: { halign: "right", cellWidth: 130 } },
  );

  y = heading(doc, y, "Guidance queue", "Students still exploring");
  if (undecided.length > 0) {
    y = drawTable(
      doc,
      y,
      ["Student", "Stream", "Class", "Current first direction"],
      undecided.map((submission) => [
        submission.name,
        submission.stream || "Not set",
        submission.puYear || "Not set",
        COURSE_BY_SLUG[submission.eligibleCourses[0] ?? ""]?.name ?? "Still exploring",
      ]),
      batch.name,
    );
  } else {
    y = paragraph(
      doc,
      y,
      "No students in this batch selected \u201Csurprise me\u201D or skipped questions. Keep the option visible: exploring is a valid answer.",
    );
    y += 10;
  }

  y = heading(doc, y, "Roster", "All assessed students");
  y = drawTable(
    doc,
    y,
    ["Student", "Stream / class", "Profile", "Top course", "Assessed"],
    submissions
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((submission) => [
        submission.name + (submission.sample ? " (sample)" : ""),
        `${submission.stream || "Not set"} / ${submission.puYear || "Not set"}`,
        submission.archetype.replace("The ", ""),
        COURSE_BY_SLUG[submission.topCourseSlug]?.name ?? "-",
        new Date(submission.createdAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      ]),
    batch.name,
    { 3: { cellWidth: 90 } },
  );

  smallNote(
    doc,
    y,
    "Guidance only. Course recommendations are not admission guarantees. Eligibility, cut-offs, entrance exams and deadlines vary by institution and year and must be verified directly.",
  );
  drawFooter(doc, "Branch Predictor  ·  Aggregated batch report  ·  Guidance, not admission advice");
  doc.save(`branch-predictor-batch-${safeFilename(batch.code)}.pdf`);
}

export async function downloadStudentProfilePdf(submission: Submission): Promise<void> {
  const batchLabel = submission.batchCode || "No batch";
  const dimensionOrder = DIMENSIONS.slice().sort(
    (a, b) => submission.profile[b] - submission.profile[a],
  );
  const strongest = dimensionOrder[0];
  const courses = submission.eligibleCourses
    .map((slug) => COURSE_BY_SLUG[slug])
    .filter(Boolean)
    .slice(0, 8);
  const careers = submission.interestedCareers
    .map((slug) => CAREER_BY_SLUG[slug]?.title)
    .filter(Boolean);

  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  drawHeader(
    doc,
    "Student career profile",
    submission.name,
    `${submission.stream || "Stream not set"}  ·  ${submission.puYear || "Class not set"}  ·  Batch ${batchLabel}${submission.sample ? "  ·  Sample record" : ""}`,
  );

  let y = 136;
  y = drawKpis(doc, y, [
    { label: "Career profile", value: submission.archetype.replace("The ", "") },
    { label: "Strongest interest", value: DIMENSION_META[strongest].short },
    { label: "Experience", value: `${submission.xp} XP` },
    {
      label: "Assessed",
      value: new Date(submission.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      }),
    },
  ]);
  y += 24;

  if (submission.undecided) {
    y = smallNote(
      doc,
      y,
      "This student is still exploring. Treat the recommendations as conversation starters, not a conclusion about their ability or direction.",
    );
    y += 2;
  }

  y = heading(doc, y, "Interest profile", "Six dimensions, strongest first");
  y = drawTable(
    doc,
    y,
    ["Interest dimension", "Score (0-100)", "What it covers"],
    dimensionOrder.map((dimension) => [
      DIMENSION_META[dimension].label,
      String(submission.profile[dimension]),
      DIMENSION_META[dimension].blurb,
    ]),
    submission.name,
    { 1: { halign: "right", cellWidth: 90 } },
  );

  y = heading(doc, y, "Eligible course directions", "Engine-ranked, stream-aware");
  y = drawTable(
    doc,
    y,
    ["Course", "Category", "Duration", "Core skills"],
    courses.map((course) => [
      course.name,
      course.category,
      course.duration,
      course.skills.slice(0, 2).join(", "),
    ]),
    submission.name,
    { 2: { cellWidth: 64 } },
  );

  y = heading(doc, y, "Career interests", "Where this profile points");
  y = paragraph(
    doc,
    y,
    careers.length
      ? `Possible career routes linked to the student's eligible course matches: ${careers.join(", ")}. These are typical routes, not guaranteed outcomes.`
      : "No career routes were stored with this record. Review the courses above and explore the career pages with the student.",
    8.5,
  );
  y += 8;

  y = heading(doc, y, "Conversation starters", "For a short guidance conversation");
  const prompts = submission.undecided
    ? [
        "Which two directions from the list are you most curious about, and what would you like to test before deciding?",
        "What subject do you look forward to without being asked?",
        "What kind of work environment would drain you, and which one would energise you?",
      ]
    : [
        `What appealed to you about ${courses[0]?.name ?? "your top direction"} when you saw it?`,
        "Which of the core skills would you like to start building first?",
        "What would make you change your mind about this direction?",
      ];
  y = paragraph(doc, y, prompts.map((prompt, index) => `${index + 1}. ${prompt}`).join("\n"), 8.5);
  y += 8;

  smallNote(
    doc,
    y,
    "Privacy: this profile is a summary, not the student's question-level answers. Share it only with staff who need it, and keep guidance conversations non-judgemental. Recommendations are not admission guarantees.",
  );

  drawFooter(
    doc,
    "Branch Predictor  ·  Individual student profile  ·  Guidance, not admission advice",
  );
  doc.save(`branch-predictor-student-${safeFilename(submission.name)}.pdf`);
}

/**
 * The summary a STUDENT downloads from /results.
 *
 * Deliberately a separate function from `downloadStudentProfilePdf`, which is
 * written for an educator reading ABOUT a student — it carries conversation
 * starters, a "share only with staff" note and third-person phrasing. Handing
 * that to the student themselves reads like finding your own file open on
 * somebody's desk. Same chrome, same palette, different voice: this one is
 * addressed to "you" and ends with what to do next rather than what to ask.
 *
 * It takes the live `AssessmentResult` rather than a `Submission`, so it works
 * for a student who never joined a batch and therefore has no stored record.
 */
export async function downloadResultSummaryPdf(result: AssessmentResult): Promise<void> {
  const dimensionOrder = DIMENSIONS.slice().sort(
    (a, b) => result.profile[b] - result.profile[a],
  );
  const eligible = result.matches.filter((match) => match.eligible);
  const stretch = result.matches.filter((match) => !match.eligible);
  const top = eligible[0] ?? result.matches[0];
  const name = result.student.name || "Student";

  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

  drawHeader(
    doc,
    "Your course summary",
    name,
    [
      result.student.stream || "Stream not set",
      result.student.puYear || "Class not set",
      result.archetype.title,
    ].join("  ·  "),
  );

  let y = 136;
  y = drawKpis(doc, y, [
    { label: "Your profile", value: result.archetype.title.replace("The ", "") },
    { label: "Strongest interest", value: DIMENSION_META[dimensionOrder[0]].short },
    { label: "Eligible courses", value: String(eligible.length) },
    { label: "Experience", value: `${result.xp} XP` },
  ]);
  y += 24;

  y = heading(doc, y, "What this says about you", result.archetype.title);
  y = paragraph(doc, y, result.archetype.description);
  y += 6;
  y = paragraph(doc, y, result.perspective);
  y += 10;

  y = heading(doc, y, "Your interests", "Six dimensions, strongest first");
  y = paragraph(
    doc,
    y,
    "These come from the interests attached to the answers you chose. Nothing here is a mark, and there was no right answer to any question.",
    8,
  );
  y += 4;
  y = drawTable(
    doc,
    y,
    ["Interest dimension", "Score (0-100)", "What it covers"],
    dimensionOrder.map((dimension) => [
      DIMENSION_META[dimension].label,
      String(result.profile[dimension]),
      DIMENSION_META[dimension].blurb,
    ]),
    name,
    { 1: { halign: "right", cellWidth: 90 } },
  );

  y = heading(doc, y, "Courses open to you", `Ranked against your profile`);
  y = drawTable(
    doc,
    y,
    ["Course", "Fit", "Duration", "Why it came up for you"],
    eligible.slice(0, 8).map((match) => [
      match.course.name,
      match.label,
      match.course.duration,
      match.explanation,
    ]),
    name,
    { 1: { cellWidth: 62 }, 2: { cellWidth: 52 } },
  );

  /* Shown, not hidden. A course your stream does not usually meet is still
     worth knowing about — the rule is an eligibility note to verify, not a
     verdict on you, and quietly dropping these would misrepresent the
     catalogue as smaller than it is. */
  if (stretch.length > 0) {
    y = heading(doc, y, "Worth knowing about", "Usually needs other subjects");
    y = drawTable(
      doc,
      y,
      ["Course", "What to check"],
      stretch.slice(0, 5).map((match) => [match.course.name, match.course.eligibilityNotes]),
      name,
      { 0: { cellWidth: 130 } },
    );
  }

  if (result.topCareers.length > 0) {
    y = heading(doc, y, "Where these lead", "Typical routes, not promises");
    y = paragraph(
      doc,
      y,
      `Careers commonly reached from your matched courses: ${result.topCareers
        .map((career) => career.title)
        .join(", ")}. These are the usual routes people take, not outcomes anyone can guarantee.`,
    );
    y += 8;
  }

  y = heading(doc, y, "What to do next", "Three concrete steps");
  y = paragraph(
    doc,
    y,
    [
      `1. Read the full page for ${top?.course.name ?? "your top match"} — the subjects in year one tell you more than the course title does.`,
      "2. Check the eligibility note against your own PU subjects and marks, with the college directly. Rules change every year.",
      "3. Show this to someone who knows you. Where they disagree with it is the useful part of the conversation.",
    ].join("\n"),
  );
  y += 8;

  smallNote(
    doc,
    y,
    "This is guidance, not an admission decision. The ranking comes from your answers compared with each course's interest profile — it is not a prediction of how well you would do, and it cannot know about your marks, the entrance exam or the seats available this year. Verify everything with each institution before you apply.",
  );

  drawFooter(doc, "Branch Predictor  ·  Your course summary  ·  Guidance, not admission advice");
  doc.save(`branch-predictor-${safeFilename(name)}.pdf`);
}
