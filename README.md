# Switch2iTech - Frontend

React + Vite based frontend for the Switch2iTech website.

## Requirements

- Node.js `20+`
- npm `9+` (comes with recent Node.js)
- Docker Desktop (optional, for container run)

## Quick Start (Local)

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run host
```

3. Open in browser:

```text
http://localhost:5173
```

## Available Scripts

- `npm run dev` - start Vite on default host
- `npm run host` - start Vite on `0.0.0.0` (LAN accessible)
- `npm run build` - create production build in `dist/`
- `npm run preview` - preview production build locally
- `npm run lint` - run ESLint checks

## Environment Variables

- `VITE_API_URL` is a Vite variable, so it is injected at **build time**.
- For local development, keep it in `.env`.
- For Docker/production builds, pass it as a Docker build argument.

## Run with Docker (Production)

The project includes:

- `Dockerfile` (multi-stage build)
- `.dockerignore` (optimized build context)

### 1) Build Docker image

```bash
docker build --build-arg VITE_API_URL=https://your-api-domain.com/api -t switch2itech-frontend .
```

If you do not pass this argument, default is `/api`.

### 2) Run container

```bash
docker run -d -p 8080:80 --name switch2itech-frontend switch2itech-frontend
```

### 3) Open app

```text
http://localhost:8080
```

### Useful Docker Commands

Stop container:

```bash
docker stop switch2itech-frontend
```

Start again:

```bash
docker start switch2itech-frontend
```

View logs:

```bash
docker logs -f switch2itech-frontend
```

Remove container:

```bash
docker rm -f switch2itech-frontend
```

## Troubleshooting

- If `npm install` fails, confirm Node version with `node -v` (must be `20+`).
- If port `5173` or `8080` is busy, change host port in run command (example `-p 3000:80`).
- If Docker build fails with `Cannot find module @rollup/rollup-linux-*`, make sure latest `Dockerfile` is deployed and rebuild with `--no-cache`.
- If production still uses old API URL, force a fresh image build (no cache) because Vite env is embedded at build time.
- If refreshing a frontend route shows Nginx 404, redeploy latest image (it includes SPA fallback via `nginx.conf`).
- If Docker build looks stale, rebuild without cache:

```bash
docker build --no-cache --build-arg VITE_API_URL=https://your-api-domain.com/api -t switch2itech-frontend .
```
