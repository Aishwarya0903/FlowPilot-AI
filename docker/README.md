# Docker

Per-service Dockerfiles live next to their source code so each build context
only contains what it needs:

- `backend/Dockerfile` — multi-stage Maven build → JRE runtime image
- `frontend/Dockerfile` — multi-stage npm build → nginx runtime image
- `docker-compose.yml` (repo root) — orchestrates `postgres`, `backend`, and `frontend` together

Run everything with:

```bash
docker compose up --build
```

See the root [README.md](../README.md#running-with-docker) for full details, environment variables, and seeded demo accounts.
