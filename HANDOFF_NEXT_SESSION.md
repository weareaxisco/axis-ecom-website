# Next-session handoff: investigate and finish CI failure

## Copy/paste onboarding prompt

You are continuing work on `C:\Users\abder\Desktop\axis-ecom-website`, repository
`weareaxisco/axis-ecom-website`.

The user showed a screenshot of several recent commits with red GitHub check
failures (`1/2` and one `0/2`) and asked for the failures to be investigated and
fixed. The CI workflow is [.github/workflows/ci.yml](./.github/workflows/ci.yml)
and runs:

```text
npm ci
npm run lint
npm run test
npm run build
npx playwright install --with-deps chromium
npm run test:e2e
```

## What has already been investigated

The local worktree is intentionally dirty and contains the user's/current
development changes. Do **not** reset, checkout, clean, or revert unrelated
changes. Preserve all existing modifications.

The important finding was a real lint error in
[src/components/WhatsAppConcierge.jsx](./src/components/WhatsAppConcierge.jsx):
the component returned `null` for non-approved routes before calling
`useSiteConfig()` and `useSiteConfigSettings()`. This violated React's Rules of
Hooks because the hooks were conditional across renders.

That issue has already been fixed by moving both context hook calls above the
`isApprovedRoute` guard. Keep this fix unless a later test proves it needs
adjustment:

```jsx
const { config } = useSiteConfig()
const { siteConfig } = useSiteConfigSettings()
const isApprovedRoute = whatsappRoutes.includes(location.pathname)
  || location.pathname.startsWith('/product/')
if (!isApprovedRoute) return null
```

The phone selection currently prioritizes the configured WhatsApp number:

```jsx
const phone = (
  siteConfig.whatsapp_number
  || config.whatsapp_number
  || siteConfig.contact_phone
  || '212600000000'
).replace(/\D/g, '')
```

Do not remove the approved-route behavior or the route-aware message behavior.

## Local validation already completed

Using the existing installed dependencies:

- `npm.cmd run lint` passed with exit code 0. It still reports non-blocking
  warnings, mainly Fast Refresh/effect warnings and duplicate translation keys.
- `npm.cmd run test` passed: 7 test files, 16 tests.
- `npm.cmd run build` passed with Vite.
- `npm.cmd run test:e2e` passed: all 4 Playwright tests.
- `git diff --check` completed without whitespace errors.

The first local npm commands used `npm` and were blocked by this Windows
execution-policy issue; use `npm.cmd` in PowerShell:

```text
npm.ps1 cannot be loaded because running scripts is disabled
```

An additional `npm.cmd ci --ignore-scripts` attempt was blocked by Windows
locking the native file
`node_modules/@rolldown/binding-win32-x64-msvc/rolldown-binding.win32-x64-msvc.node`
(`EPERM` while unlinking). This is an environment/file-lock issue, not a
reported dependency or lockfile failure. Do not delete the repository or
node_modules broadly. If a clean install is required, inspect the locking
process first and use a narrowly scoped, safe approach.

## Current worktree warning

At handoff time, these files were modified or untracked. They may include
intentional user changes and must be preserved:

```text
QA_ACCEPTANCE_CHECKLIST.md       (deleted in worktree; do not restore/revert blindly)
index.html
package-lock.json
package.json
qa_actionable.md
src/App.jsx
src/components/AdminAnalytics.jsx
src/components/AdminProductTable.jsx
src/components/GlobalLoader.jsx
src/components/Hero.jsx
src/components/LoginDrawer.jsx
src/components/Navbar.jsx
src/components/ProductCard.jsx
src/components/ProductCatalog.jsx
src/components/ResendVerificationModal.jsx
src/components/SortFilterDrawer.jsx
src/components/WhatsAppConcierge.jsx
src/index.css
src/locales/en.js
src/locales/fr.js
src/pages/Admin.jsx
src/pages/Catalog.jsx
qa_acceptance_checklist_v2.md
test-results/
```

Start with `git status --short` and inspect before editing. Do not assume all
changes belong to the previous agent.

## Project context

Read [PROJECT_PLAN.md](./PROJECT_PLAN.md) before making broader changes. It is
the project blueprint for a white-label luxury jewelry storefront using React,
Vite, Supabase, React Router, Vitest, Playwright, Tailwind, and `lucide-react`.
The plan marks the major product, catalog, admin, localization, footer,
analytics, RBAC, Ameex, and QA work as implemented, while noting a few
follow-up/QA areas.

Relevant repository conventions:

- Use existing scripts and tests; do not add a new test/build tool.
- Prefer precise, surgical edits.
- Keep public storefront access separate from protected admin/RBAC flows.
- Preserve dynamic site configuration, theme tokens, FR/EN localization, and
  responsive luxury UI behavior.
- Use `lucide-react` for UI icons.
- Do not expose Supabase secrets or credentials.
- Use `apply_patch` for manual edits.

## Required next steps

1. Inspect `git status --short`, the current diff, and the latest commits.
2. Confirm the `WhatsAppConcierge` hook-order fix is still present.
3. If GitHub CLI authentication is available, run:

   ```text
   gh run list --limit 10
   ```

   Then inspect the failing run/job/log to verify whether the remote failure
   was the hook lint error or another issue.
4. If GitHub CLI is not authenticated, state that clearly and continue with the
   local CI-equivalent checks rather than asking the user to discard changes.
5. Run the smallest relevant validation first, then the complete existing
   sequence if needed:

   ```text
   npm.cmd run lint
   npm.cmd run test
   npm.cmd run build
   npm.cmd run test:e2e
   ```

6. Investigate any remaining non-zero result. Warnings alone are not a failure
   unless the CI configuration treats them as errors.
7. Review the final diff and report exactly what changed and which checks
   passed. Do not commit unless the user explicitly asks for a commit.

## Definition of done

The next session is complete when the actual remote failure is identified (or
remote access is explicitly unavailable), the smallest necessary code change is
implemented without disturbing unrelated worktree changes, and the relevant
local checks pass. The final response should link to changed files using
absolute workspace paths and mention any environment-only limitation such as
GitHub authentication or Windows file locking.
