# Ingalls Learning Lab

This is the existing family learning app, not a new site. Read `CODEX_HANDOFF.md` before implementation or publication. Keep the site free to use and preserve the current accounts, assignments, results, and role permissions.

## Development

- Node >=22.13.0; package manager pnpm 11.25.0; preserve pnpm-lock.yaml.
- Install with `npm run install:ci` in Linux, or follow the installed Sites skill's dependency helper when available. Do not run overlapping installers.
- Build with `npm run build` for standalone checks; use the Sites build/package helper for publication.
- Focused regression checks are in `tests/`: run `node tests/flashcards.mjs` and, after a successful build, `node tests/built-homepage.mjs`.
- Never commit credentials, database contents, `.env*`, `.wrangler/`, `.sites-runtime/`, node_modules, or build output.

## Hosting

- This GitHub repo stores development source. GitHub Pages cannot run this app's Worker and D1 database.
- Existing Sites project: `appgprj_6ac29cc8d8f88191b5c82a388fbbbff5`. Preserve `.openai/hosting.json`, audience, D1 binding DB, and production identity.
- Use the Sites plugin under the owner's same ChatGPT account to open the EXISTING project and publish changes. Do not create a replacement site or point production at a new database.
- GitHub pushes and Codex merges do not automatically publish. Verify Sites access first, open its canonical source checkout using the Sites workflow, apply reviewed GitHub changes there, and build/push/package/save/deploy through that workflow. Do not replace the canonical Sites remote with this GitHub remote.
- If Sites publishing tools are unavailable, finish and commit the change in GitHub and clearly report that production has not been updated.
- Legacy setup-code verifiers were removed from this GitHub handoff. Preserve existing canonical production migration files rather than overwriting them with the sanitized import. Never restore the old credential values into GitHub.
- The owner explicitly authorized copying the family photo into this private GitHub repository on October 9, 2026. The original photo and import are included; preserve them and keep the repository private.

## Required behavior

- Owner is highest access and alone sees Accounts & access. Parents assign work and review results; teachers see only their selected student. Students see only their own assigned work.
- Jacob and Owen currently log in through clickable student buttons, without passwords. Closed student accounts must remain blocked; server authorization is required for all access.
- Jacob: math single submitted attempt, wrong answers included; reading six typed answers with parent correct/wrong review; penmanship up to five lines on one page in the accepted regular notebook size.
- Owen: tracing requires all three guided characters, then independent drawing. Flashcards are ONE mixed deck: upper/lowercase letters, numbers 0–20, shapes. No deck picker or Hear it button. All done can finish anytime; report time elapsed and cards viewed, never a grade.
- Free alerts are web push. Do not replace them with paid SMS or claim email is configured.
- No countdown timers, Nintendo integration, test/demo pages, or grading system. Jacob's school grading remains a future TODO awaiting MSAD49 guidance.
- Preserve the family homepage and existing playful flashcard design.

## Critical regression

`app/route.ts` is an HTTP GET handler returning a Response. Importing a `.css?raw` asset there caused Vite RSC to wrap it as a React component and the production homepage returned HTTP 500. Inline flashcard CSS therefore lives in `assets/flashcards-styles.txt?raw`. Keep it a text asset and verify the actual built Worker response, not just source compilation.
