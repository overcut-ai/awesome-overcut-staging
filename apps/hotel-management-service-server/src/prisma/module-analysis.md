# PrismaModule / PrismaService - Module Analysis

## Module Overview
- `PrismaModule` (`prisma.module.ts`) is marked `@Global()` and exports `PrismaService`, making a single Prisma client instance injectable across the NestJS application.
- `PrismaService` (`prisma.service.ts`) extends `PrismaClient` from `@prisma/client` and implements `OnModuleInit` so the database connection (`this.$connect()`) is established as soon as NestJS boots the module.
- The Prisma client surfaces the generated models defined in `prisma/schema.prisma` (Hotel, Room, Reservation, Customer) to downstream services such as `hotel.service.ts`, `room.service.ts`, and their Amplication-generated base layers.

## High-Level Module Architecture
- `PrismaModule` registers a single provider (`PrismaService`) and re-exports it, acting as the integration boundary between NestJS dependency injection and Prisma's generated client.
- Because `PrismaModule` is imported into `AppModule` (`src/app.module.ts`) and flagged as global, every feature module—Hotel, Room, Reservation, Customer, Health—can inject `PrismaService` without re-importing the module.
- Domain services (for example, `hotel/hotel.service.ts` and `hotel/base/hotel.service.base.ts`) accept `PrismaService` in their constructors and delegate CRUD operations to the generated Prisma client API.

## Inferred Business Flows
1. During application bootstrap, NestJS instantiates `PrismaService`; the `onModuleInit()` hook executes `await this.$connect()`, opening the PostgreSQL connection before any domain service runs queries.
2. Feature modules receive `PrismaService` via constructor injection (see `room/room.service.ts`, `reservation/reservation.service.ts`, etc.) and call strongly-typed Prisma model methods (e.g., `this.prisma.hotel.findMany`) to fulfill REST/GraphQL requests.
3. Generated base services (e.g., `hotel/base/hotel.service.base.ts`) rely on Prisma's relation helpers (`this.prisma.hotel.findUniqueOrThrow(...).rooms(args)`) to traverse associations, meaning PrismaService must expose the full PrismaClient surface.

## Detailed Data Models
- `Hotel` (`prisma/schema.prisma`): Stores hotel metadata (`name`, `address`, `description`) with a one-to-many relation to `Room` records (`rooms` field).
- `Room`: Represents individual rooms, linked to `Hotel` via `hotelId` and one-to-many `Reservation` relation.
- `Reservation`: Captures booking windows (`checkIn`, `checkOut`) and references both `Customer` and `Room` entities.
- `Customer`: Holds guest contact details and backs the `Reservation` relation from the customer side.
- All models share `createdAt`/`updatedAt` auditing fields with Prisma-managed defaults, implying PrismaService consumers rely on consistent timestamp semantics when persisting data.

## Deep Analysis
- Extending `PrismaClient` keeps PrismaService thin but centralizes lifecycle hooks, making it the natural place to add middleware, logging, or soft-delete guards if needed.
- No `OnModuleDestroy` hook is implemented; unless NestJS process termination triggers Prisma's default cleanup, long-lived environments (e.g., serverless warm starts, tests) may benefit from an explicit `this.$disconnect()`.
- Because the service is global and shared, any runtime configuration (e.g., `prisma.$use` middleware) would impact every domain service. Careful coordination is required if future custom behaviors are added.

## Internal Dependencies (within module)
- `PrismaModule` depends solely on `PrismaService`; there are no additional providers or configuration factories inside `src/prisma`.
- `PrismaService` depends directly on `PrismaClient` from `@prisma/client`. There are no helper utilities or wrappers within the module, so all internal coupling is contained to this inheritance relationship.

## External Dependencies (APIs, DBs, queues, SDKs, cloud services)
- Database: PostgreSQL via Prisma (`datasource db` in `prisma/schema.prisma`), configured through the `DB_URL` environment variable.
- Library: `@prisma/client` provides the generated client class extended by `PrismaService`.
- Tooling: Amplication-generated base services (e.g., `hotel/base/...`) rely on the Prisma client surface exported by this module. Regenerating Amplication outputs could change expectations about model fields or relations, so PrismaService must keep parity with the generated schema.
- Supporting scripts (`scripts/seed.ts`, `scripts/customSeed.ts`) instantiate `PrismaClient` directly for seeding workflows, duplicating connection lifecycle logic instead of reusing PrismaService; this duplication highlights an opportunity to centralize seeding through the module for consistency.

## Cross-Cutting Concerns (auth, logging, messaging, caching, events)
- Authentication/Authorization: No guards or context integration is present in PrismaService; upstream modules must enforce access control before invoking repository methods.
- Logging & Observability: The module does not add logging around connection lifecycle or queries. All logging currently happens in scripts (`console.info` in `scripts/seed.ts`), indicating a potential gap for request-scoped tracing or diagnostics within PrismaService.
- Error Handling: PrismaService relies on PrismaClient's default exceptions. There is no translation layer (e.g., to HTTP exceptions), so consumers must catch and map Prisma errors themselves.
- Caching/Messaging: No cache invalidation, event emission, or message bus integration exists at this layer; the module simply exposes raw database access.

## Complexity Indicators & Risks
- Connection Lifecycle: Absence of `OnModuleDestroy` or NestJS shutdown hooks could leave connections open during graceful shutdowns or end-to-end tests (`prisma.service.ts`).
- Seed Scripts: `scripts/seed.ts` and `scripts/customSeed.ts` create fresh `PrismaClient` instances but never `await` `customSeed()` nor `await` `$disconnect()`, risking unclosed connections and unseeded data. They also reimplement connection setup instead of reusing PrismaService, amplifying maintenance overhead. Those scripts currently perform no inserts, signaling unfinished setup dependencies on PrismaService.
- Global Scope: Marking `PrismaModule` as global simplifies injection but means misconfiguration (e.g., middleware, logging) instantly affects every service, increasing blast radius for bugs.
- Regeneration Risk: Amplication-generated base services assume model shapes from `prisma/schema.prisma`. If the schema or client are regenerated without aligning custom layers, PrismaService may expose breaking changes to domain services.
