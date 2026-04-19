# Awesome Overcut Staging

<p align="center">
  <img src="./overcut-logo.png" alt="Overcut logo" width="180" />
</p>

A small monorepo for a hotel management example generated with Amplication. It includes a NestJS backend API and a React-Admin frontend for managing hotels, rooms, reservations, and customers.

## What's in this repository

- `apps/hotel-management-service-server` – NestJS 10 service with REST, GraphQL, Prisma, and PostgreSQL configuration.
- `apps/hotel-management-service-admin` – React 18 + React-Admin application built with Vite.
- `repo-architecture-analysis.md` – architecture notes describing the generated structure and key risks.
- `overcut-logo.png` / `overcut-loading.gif` – project assets.

## Application overview

### Server

The server app is an Amplication-generated NestJS service with:

- REST and GraphQL endpoints
- Prisma models for `Hotel`, `Room`, `Reservation`, and `Customer`
- PostgreSQL connection through `DB_URL`
- Docker and Docker Compose files for local development

Default server environment values live in `apps/hotel-management-service-server/.env`, including `PORT=3000` and a local PostgreSQL connection.

### Admin UI

The admin app is a Vite-based React-Admin console with generated CRUD screens for:

- hotels
- rooms
- reservations
- customers

It expects the backend at `VITE_REACT_APP_SERVER_URL=http://localhost:3000` and runs on `PORT=3001` by default.

## Repository structure

```text
.
├── apps/
│   ├── hotel-management-service-admin/
│   └── hotel-management-service-server/
├── overcut-loading.gif
├── overcut-logo.png
├── repo-architecture-analysis.md
└── README.md
```

## Getting started

Each app has its own package manifest and README with app-specific details.

### Backend

```bash
cd apps/hotel-management-service-server
npm install
npm run docker:dev
npm run prisma:generate
npm run db:init
npm run start
```

Useful backend scripts from `package.json`:

- `npm run start`
- `npm run start:watch`
- `npm run build`
- `npm run test`
- `npm run compose:up`
- `npm run compose:down`

### Frontend

```bash
cd apps/hotel-management-service-admin
npm install
npm run start
```

Useful frontend scripts from `package.json`:

- `npm run start`
- `npm run build`
- `npm run serve`
- `npm run type-check`
- `npm run lint`

> [!NOTE]
> The repository already contains generated README files inside both application folders. This root README is intended to give a quick, accurate overview of the monorepo itself.
