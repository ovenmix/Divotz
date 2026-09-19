# Images

Everything in here is a **placeholder**. Replace each file in place, keeping
the same path, and the UI picks it up without a code change.

| Path | Used by | Suggested size |
| --- | --- | --- |
| `club-hero-placeholder.jpg` | Club home hero (Pro clubs) | 1920 × 720 |
| `tournament-placeholder.jpg` | Tournament hero | 1600 × 640 |
| `course-placeholder.jpg` | General course imagery | 1600 × 900 |
| `clubs/gleniffer-logo.svg` | Seed club logo | square, any size |
| `clubs/gleniffer-icon.svg` | Seed club favicon | square, 32–64 |

Regenerate the JPEG placeholders with `python3 scripts/generate-placeholders.py`.

No component references a remote image host. Everything resolves from `/public`
so the app renders identically offline and in CI.
