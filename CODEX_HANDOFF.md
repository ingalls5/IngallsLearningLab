# Ingalls Learning Lab — Codex handoff

## Current state

Imported from the source published as Sites version 59 on October 9, 2026.
Source commit: `592de6122aa77688cf31179619306cab889cae10`.
Production: https://jacobs-learning-lab.thedotctor.chatgpt.site
Family short link: https://tinyurl.com/IngallsLearningLab
Sites project: `appgprj_6ac29cc8d8f88191b5c82a388fbbbff5`.

The live application, database, visitor accounts, sessions, assignments, saved work, alert subscriptions, and runtime secrets remain on Sites. This repository contains code, assets, and migration definitions only. This is a development handoff, not a hosting or data migration. No GitHub automatic deployment is configured.

Legacy student setup-code salt/hash values were sanitized out of `lib/student-seed.ts` and `drizzle/0006_owen_student.sql` before upload. Blank verifiers reject legacy first-time codes; current button login remains functional. These changes have NOT been applied to the live site. Keep existing production migrations immutable when reconciling this copy with the canonical Sites checkout; do not overwrite/replay migration 0006 there. The student seed can keep blank legacy verifiers for new local profiles.

The owner explicitly authorized copying the family photo into this private GitHub repository on October 9, 2026. `assets/family-photo.jpeg` and its original homepage import are included. The placeholder from the initial transfer has been removed. Preserve the photo and the repository's private visibility.

## Start in browser Codex

Create a Cloud environment selecting `ingalls5/IngallsLearningLab`, using the connected ingalls5 GitHub account. Let Codex install the pinned dependencies, run a build and the focused checks, and publish the environment. Start a task using that environment. Read AGENTS.md first.

Use the same ChatGPT account that owns the existing Site and enable the Sites plugin if available. Verify access to the exact project before promising publication. If it is unavailable in that Codex task, GitHub changes can still be made and reviewed, but must be published through an authorized Sites session afterward.

## Code map

- `app/route.ts`: authenticated homepage HTTP response and injected browser scripts; `lib/public-home.ts`: anonymous family homepage.
- `lib/access.ts`, `lib/student.ts`, `lib/student-entry.ts`: server roles, student account/session/login controls.
- `lib/homework.ts`, `lib/assignments.ts`, `public/assignments.js`: per-student assignment queue and submission checks.
- `lib/family.ts`, `lib/report.ts`, `public/family.js`: saved results, review, reports and web-push notifications.
- `assets/home.html`, `lib/math.ts`, `lib/reading.ts`, `assets/reading-rubrics.json`: Jacob activities and answer evaluation.
- `public/handwriting.js`, `public/digit-model*.json`: number handwriting recognition.
- `public/tracing.js`, `public/penmanship.js`: drawn work collection.
- `lib/flashcards.ts`, `public/flashcards.js`, `assets/flashcards-styles.txt`: Owen's combined 81-card deck and playful presentation.
- `db/schema.ts`, `drizzle/`: schema/migrations; production storage is the existing D1 binding `DB`.

## Validation

Focused tests copied into this repo from the existing verified checkout:

1. `node tests/flashcards.mjs` checks mixed-deck behavior, partial completion, elapsed time, saved-card reports, role/assignment restrictions and older result compatibility.
2. `npm run build` builds the Worker.
3. `node tests/built-homepage.mjs` runs the actual built Worker with an ephemeral D1 database and checks anonymous Safari-compatible homepage response, owner controls, both student button sign-ins, scoped homework, and flashcard styles.

These are simulated/browser-script and Worker checks, not physical iPad/Android testing. Keep any generated test state ignored.

## Publish updates to the same live site

The Sites plugin owns the production source repository and deployment pipeline. Get the existing project and preserve its current public audience. Open its canonical source using the Sites skill's source workflow with a short-lived write credential. Copy reviewed development changes from this GitHub repository into that checkout (excluding .git, credentials, dependencies, caches and generated output). Validate, build and package using Sites helpers; save the exact pushed source commit with its corresponding archive; deploy the saved version. Keep credentials in memory/stdin only.

Do not create a new Site, alter the project ID, change sign-in infrastructure or reset/replay production migrations as a substitute for publishing. A successful GitHub commit is not evidence that the live site updated.

## Pending work

Jacob grading: awaiting the family's school grading information from MSAD49, Benton, Maine. No grading system should be added until the user supplies or approves the requirements.
