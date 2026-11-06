<div align="center">

<img src=".github/assets/banner.svg" width="100%" alt="Pathora AI — Discover the course that feels like you" />

<br/>

<a href="#"><img src="https://img.shields.io/badge/Next.js-16.4-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js 16.4" /></a>
<a href="#"><img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=0B1226" alt="React 19" /></a>
<a href="#"><img src="https://img.shields.io/badge/TypeScript-strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript strict" /></a>
<a href="#"><img src="https://img.shields.io/badge/Tailwind-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind v4" /></a>
<br/>
<a href="#"><img src="https://img.shields.io/badge/no_login-required-FF6B35?style=for-the-badge" alt="No login required" /></a>
<a href="#"><img src="https://img.shields.io/badge/match_%25-never_shown-101B3D?style=for-the-badge" alt="Match percentage never shown" /></a>
<a href="#"><img src="https://img.shields.io/badge/themes-light_%2B_dark-6750E6?style=for-the-badge" alt="Light and dark themes" /></a>

<br/><br/>

### **Branch Predictor** — because in Indian college-speak, your *branch* is your future.

A career-discovery app for **PU students in Karnataka** that shows its working
instead of handing down a verdict.

</div>

---

<img src=".github/assets/journey.svg" width="100%" alt="The journey: start, interest quest, stream round, your map" />

---

<img src=".github/assets/why.svg" width="100%" alt="Most quizzes answer with a black box; this one shows the reasoning" />

## Why this exists

Most PU students pick a degree on the advice of relatives, coaching centres and
guesswork. Most career quizzes answer them with a black box and a confident
**"92% match"**.

A ten-question quiz cannot honestly know that. So this one does not pretend to.

> **The rule this project is built on:** every recommendation shows the reasoning
> that produced it, eligibility is a gate rather than a flattering bonus, and no
> number is invented to sound precise.

---

## How it works

```mermaid
flowchart LR
    A["Onboard<br/><sub>name · interest · stream · marks</sub>"] --> B["Stage 1<br/><sub>10 interest scenarios</sub>"]
    B --> C{"Six-dimension<br/>profile"}
    C --> D["Stage 2<br/><sub>15 questions from your subjects</sub>"]
    D --> E["Matching engine<br/><sub>fixed weighted rule</sub>"]
    C --> E
    E --> F["Stream gate"]
    E --> G["Marks gate"]
    F --> H["Ranked courses<br/><sub>Strong Match · Explore Further · Alternative Path</sub>"]
    G --> H

    style A fill:#141F3E,stroke:#FF6B35,color:#EEF1F8
    style B fill:#141F3E,stroke:#FF6B35,color:#EEF1F8
    style C fill:#FF6B35,stroke:#FF8A5F,color:#FFFFFF
    style D fill:#141F3E,stroke:#FF6B35,color:#EEF1F8
    style E fill:#141F3E,stroke:#6750E6,color:#EEF1F8
    style F fill:#1A2548,stroke:#4A70FF,color:#C3CDE6
    style G fill:#1A2548,stroke:#4A70FF,color:#C3CDE6
    style H fill:#FF6B35,stroke:#FF8A5F,color:#FFFFFF
```

**Stage 1 — ten scenarios, no wrong answers.** Grounded in a real student's week:
a free Sunday after exams, a dead table fan, a group project due Monday. Each
option carries weights across six interest dimensions.

**Stage 2 — fifteen questions from the student's own subjects.** These *do* have
a right answer, five from each of three PU subjects. A correct answer lights an
emoji path; a wrong one gets an explanation, never a scold. **No score is ever
shown.**

**The match.** Interest overlap decides the ranking. Stream eligibility and marks
band sit on separate axes — they can flag a course as a stretch, but they never
hide it and never alter its rank.

---

<img src=".github/assets/student.svg" width="100%" alt="Six dimensions, an archetype, and ranked courses" />

## What a student gets

| | |
|---|---|
| **Six interest dimensions** | technology · creativity · engineering · business · communication · analytical |
| **Seven archetypes** | from *The Digital Innovator* to *The Curious Explorer* |
| **12 real UG programmes** | the actual courses offered by **NCET** and **NCMS**, not a stock list |
| **20 career pages** | day-in-the-life, skills, and the courses that lead there |
| **Side-by-side compare** | duration, eligibility, skills and routes for any two courses |
| **Grounded mentor** | answers from the catalogue; the optional AI layer only rewords |
| **PDF export** | a profile a student can take home to a parent |

---

<img src=".github/assets/educators.svg" width="100%" alt="One batch code on the board; the class joins and the batch maps itself" />

## For educators

> Put **one code on the board.** The class joins — no accounts, no emails,
> nothing to install.

Aggregated dashboards show interest distribution, course demand and the students
still undecided. **Individual answers are never exposed by default.**

---

<img src=".github/assets/engineering.svg" width="100%" alt="A deterministic pipeline where the AI layer only rewords" />

## The engineering position

<table>
<tr><td width="50%" valign="top">

**Rules, not vibes**

Scoring is a fixed weighted formula over six dimensions. The same answers always
produce the same result. No model decides a rank.

</td><td width="50%" valign="top">

**The AI layer only rewords**

Scores, ranks, labels and eligibility are computed *before* any provider call and
are never passed back for a model to change. The deterministic answer is the
fallback on every failure path.

</td></tr>
<tr><td width="50%" valign="top">

**Local-first**

No accounts, no emails, no student records on a server by default. The whole
journey runs in the browser.

</td><td width="50%" valign="top">

**One token system, two themes**

`midnight` is the *ink* token, not a surface — it flips to near-white in dark
mode and carries 250+ usages with it. Light is the default.

</td></tr>
</table>

---

## Stack

```
Next.js 16 (App Router · Turbopack · cacheComponents)
React 19  ·  TypeScript strict  ·  Tailwind CSS v4 (CSS-first tokens)
Framer Motion  ·  GSAP (analysis sequence only)  ·  Recharts
Zustand + persist  ·  Zod  ·  jsPDF
```

---

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
```

Everything works with **no API key**. To enable the optional AI wording layer:

```bash
cp .env.example .env.local
# add any OpenAI-compatible endpoint + key
```

---


<div align="center">

<sub>Built for PU students in India. Recommendations are guidance, not admission guarantees.</sub>

</div>
