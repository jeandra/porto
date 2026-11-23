# OSINT Dashboard replaces Recon Pipeline card

Date: 2026-11-23
Status: approved 2026-11-23

## Intent

Swap the second "Selected work" card from Recon Pipeline to the local
osint-dashboard project (FastAPI + Next.js recon frontend, docker-compose).

## Design

- Card: meta `OSINT dashboard · 2026`, title `OSINT Dashboard`.
- Copy grounded in `osint-dashboard/main.py` and frontend `page.tsx`: domain query,
  crt.sh / HackerTarget / OTX passive sources, DNS resolution, subdomain status rows.
- Tags: Python, FastAPI, Next.js, crt.sh, HackerTarget, AlienVault OTX.
- Media: new designed cover at `assets/work/osint-dashboard.webp` (same palette and
  cover approach as the previous card it replaces).

## Left to the builder

- None. Single-card content/media swap.
