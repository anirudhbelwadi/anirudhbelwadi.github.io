# Portfolio Website

Personal portfolio site for Anirudh Belwadi with a custom analytics dashboard.

Live site: https://anirudhbelwadi.com/

## Tech Stack

- React 18 + TypeScript, built with Vite
- Bootstrap 5 / react-bootstrap for layout and modals
- glider-js for the recommendations carousel
- Python (Flask) for the analytics dashboard backend
- SQLite for analytics data storage
- External APIs for IP geolocation and source mapping

## Local development

```bash
npm install
npm run dev        # http://localhost:3000
```

Other scripts:

```bash
npm run build      # type-check, then build to dist/
npm run preview    # serve the production build locally
npm run typecheck  # types only
```

The visit counter and visitor prompt call the Flask service. On localhost they
point at `http://127.0.0.1:5000`, so run the backend alongside the dev server if
you need them:

```bash
python3 backend-service/flask_app.py
```

Without it the counter shows 0 and the visitor prompt stays hidden — the rest of
the site works normally.

## Editing content

Content lives in `src/data/` as typed data, not in JSX. To add or change a
project, recommendation, or admit, edit the relevant file — no component changes
needed:

| File | Contents |
| --- | --- |
| `src/data/projects.ts` | Project cards, their categories, and modal bodies |
| `src/data/recommendations.ts` | Carousel slides and their modal bodies |
| `src/data/admits.ts` | Admit logos and links |
| `src/data/profile.ts` | Name, tagline, about text, social links |
| `src/config.ts` | Third-party endpoints and keys |

Modal bodies are an ordered list of blocks (`image`, `heading`, `paragraph`,
`list`). Text may embed links with markdown syntax: `[label](https://url)`.

Set `hidden: true` on a project to keep it in the file but off the page.

Images are served from `public/assets/` and keep their original URLs, so
existing external links and search results stay valid.

## Deployment

Pushing to `master` triggers `.github/workflows/deploy.yml`, which builds the
site and publishes `dist/` to GitHub Pages. The Pages source must be set to
**GitHub Actions** (Settings → Pages → Build and deployment → Source).

`public/CNAME` keeps the custom domain attached on every deploy.

## Backend deployment

Pushing changes under `backend-service/` triggers
`.github/workflows/deploy-backend.yml`, which uploads the application files over
the PythonAnywhere Files API and reloads the web app.

The live SQLite database sits in the same directory as the code, so the deploy
works from an explicit allowlist in `.github/scripts/deploy_pythonanywhere.py`
and a second guard aborts the run if anything protected reaches the manifest.
`database.db` and `source_config.json` are never uploaded.

Preview what would deploy without uploading:

```bash
gh workflow run deploy-backend.yml -f dry_run=true
```

Uploading `requirements.txt` does not install anything. After a dependency
change, run `pip install -r requirements.txt` in a PythonAnywhere console.

### Keeping the web app alive

Free-tier web apps expire every 30 days. PythonAnywhere has no API for renewal,
so `.github/workflows/renew-pythonanywhere.yml` drives the web form weekly and
opens an issue if it fails.

Two things to know about it:

- It needs the account password (`PA_PASSWORD`), not the scoped API token,
  because the renewal form is behind session auth.
- GitHub disables scheduled workflows after 60 days without repository activity.
  If this repo goes quiet, the renewals stop and the web app will expire.

### Required settings

| Setting | Kind | Purpose |
| --- | --- | --- |
| `PA_API_TOKEN` | secret | Files API uploads and reload |
| `PA_PASSWORD` | secret | Web-form login for renewal |
| `PA_USERNAME` | variable | PythonAnywhere account name |
| `PA_DOMAIN` | variable | `<user>.pythonanywhere.com` |
| `PA_REMOTE_DIR` | variable | App directory, e.g. `/home/<user>/mysite` |
| `PA_HOST` | variable | Optional; `eu.pythonanywhere.com` for EU accounts |

## Analytics Dashboard

The analytics dashboard tracks visits, sources, geolocation, and repeat visitors.

Pages:
- Readme: https://anirudhbelwadiportfolio.pythonanywhere.com/
- Dashboard: https://anirudhbelwadiportfolio.pythonanywhere.com/admin/viewVisitors/
- All visitors: https://anirudhbelwadiportfolio.pythonanywhere.com/admin/viewVisitors/allVisitors/
