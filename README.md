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

## Run with Docker (Production)

The project includes:

- `Dockerfile` (multi-stage build)
- `.dockerignore` (optimized build context)

### 1) Build Docker image

```bash
docker build -t switch2itech-frontend .
```

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
- If Docker build looks stale, rebuild without cache:

```bash
docker build --no-cache -t switch2itech-frontend .
```
