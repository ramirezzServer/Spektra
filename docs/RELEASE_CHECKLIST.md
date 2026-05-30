# Release Checklist

## Code Quality

- [ ] Frontend typecheck passes.
- [ ] Frontend build passes.
- [ ] Backend syntax checks or tests pass.
- [ ] Worker compile checks pass.
- [ ] CI is green.

## Environment

- [ ] Production API env configured.
- [ ] Frontend env configured.
- [ ] Worker env configured.
- [ ] Database URL configured.
- [ ] Redis configured if required.
- [ ] Mail configured.
- [ ] External API keys configured.
- [ ] Analytics/monitoring decision documented.

## Database

- [ ] Migrations applied.
- [ ] Seed/demo policy clear.
- [ ] Backup plan noted.

## Security

- [ ] `APP_DEBUG=false`.
- [ ] No secrets committed.
- [ ] CORS frontend URL correct.
- [ ] Email verification setting decided.
- [ ] Privacy and terms routes available.

## Smoke Tests

- [ ] Frontend loads.
- [ ] API health passes.
- [ ] Worker health passes.
- [ ] Register/login works.
- [ ] Email verification works.
- [ ] Content search works.
- [ ] Library tracking works.
- [ ] Follow/feed works.
- [ ] Lists work.

## SEO/PWA

- [ ] Domain in `robots.txt` and `sitemap.xml` updated.
- [ ] Favicon and touch icon verified.
- [ ] Manifest verified.
- [ ] Install/update prompt tested.
- [ ] Private pages noindex where appropriate.
