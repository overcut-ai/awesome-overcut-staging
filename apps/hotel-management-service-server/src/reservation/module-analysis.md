# Module Overview
- **Purpose:** The Reservation module exposes REST and GraphQL APIs for managing reservations, acting as a thin wrapper around Amplication-generated CRUD logic. It wires the generated base module, controller, resolver, and Prisma-backed service into NestJS so consumers can create, query, update, and delete reservation records while traversing related customer and room entities.
- **Entry Points:**
  - REST controller at `apps/hotel-management-service-server/src/reservation/reservation.controller.ts`, mounted on `/reservations` with Swagger tag `reservations`.
  - GraphQL resolver at `apps/hotel-management-service-server/src/reservation/reservation.resolver.ts`, bound to the `Reservation` object type defined in `base/Reservation.ts`.
- **Core Service:** `reservation.service.ts` extends the generated `ReservationServiceBase`, injecting the shared `PrismaService` from `../prisma/prisma.service` to reach the PostgreSQL database through Prisma Client.

## High-Level Module Architecture
1. `reservation.module.ts` imports `ReservationModuleBase` and registers the custom controller, resolver, and service with NestJS, exporting the service for other modules.
2. `reservation.service.ts` delegates all operations to `base/reservation.service.base.ts`, which implements CRUD methods (`count`, `reservations`, `reservation`, `createReservation`, `updateReservation`, `deleteReservation`) and relation loaders (`getCustomer`, `getRoom`) using `PrismaService`.
3. The REST layer (`reservation.controller.ts` → `base/reservation.controller.base.ts`) maps HTTP verbs to service calls, applying DTO transformations (`plainToClass`) and connection wiring for related `customer` and `room` records.
4. The GraphQL layer (`reservation.resolver.ts` → `base/reservation.resolver.base.ts`) declares queries, mutations, and field resolvers, reshaping mutation inputs to Prisma connection syntax and surfacing relation loaders.
5. Generated DTOs and arg types in `reservation/base/*.ts` standardize request/response payloads across REST and GraphQL, sharing validation rules via `class-validator` and serialization hints via `class-transformer`.

## Major Submodules / Inner Bounded Contexts
- **Generated Base Layer (`reservation/base/`)**: Amplication-produced scaffolding for DTOs, args, base controller/resolver logic, and the Prisma-driven `ReservationServiceBase`. These files encapsulate schema shape (`Reservation.ts`, `ReservationCreateInput.ts`, `ReservationWhereInput.ts`, etc.) and common behaviors like not-found handling with `isRecordNotFoundError` (`../../prisma.util`).
- **Custom Extension Layer (`reservation/*.ts`)**: Lightweight NestJS wrappers (`reservation.controller.ts`, `reservation.resolver.ts`, `reservation.service.ts`, `reservation.module.ts`) that plug the generated layer into the enclosing application while providing safe hooks for future customization that will survive regeneration.

## Internal Dependencies
- `ReservationModule` imports only `ReservationModuleBase`, ensuring regeneration-safe configuration (`reservation.module.ts`).
- `ReservationService` depends on `PrismaService` (`../prisma/prisma.service.ts`), exposing base methods without additional overrides (`reservation.service.ts`).
- Controller and resolver classes extend their generated counterparts, inheriting REST and GraphQL behaviors while sharing the same injected `ReservationService` instance (`reservation.controller.ts`, `reservation.resolver.ts`).
- DTOs reference other bounded contexts through generated types: `ReservationCreateInput` and `ReservationWhereInput` link to customer and room unique identifiers (`reservation/base/ReservationCreateInput.ts`, `reservation/base/ReservationWhereInput.ts`).

## External Dependencies
- **NestJS Core:** `@nestjs/common`, `@nestjs/graphql`, and `@nestjs/swagger` power module wiring, controller decorators, resolver definitions, and OpenAPI metadata (`reservation.module.ts`, `reservation.controller.ts`, `reservation.resolver.ts`, base counterparts).
- **Prisma Client:** Queries run through `PrismaService` extending `PrismaClient` to reach the PostgreSQL backing store (`reservation.service.ts`, `reservation/base/reservation.service.base.ts`, `../prisma/prisma.service.ts`).
- **Class Utilities:** `class-transformer` (`plainToClass`, `Type`) and `class-validator` enforce DTO validation and serialization across REST and GraphQL inputs (`reservation/base/*.ts`, `reservation/base/reservation.controller.base.ts`).
- **Shared Application Utilities:** Error helpers (`../../errors.ts`) and Prisma error guards (`../../prisma.util.ts`) provide consistent HTTP and GraphQL error semantics in generated layers.

## Cross-Cutting Concerns
- **Validation & Serialization:** DTOs enforce type safety (e.g., `@IsDate`, `@ValidateNested`) for reservation fields and relations, guaranteeing consistent payload shapes across transport layers (`reservation/base/Reservation.ts`, `ReservationCreateInput.ts`).
- **Error Handling:** Both REST and GraphQL layers translate Prisma "record not found" errors into domain-friendly responses using `isRecordNotFoundError` and context-appropriate exception types (`reservation/base/reservation.controller.base.ts`, `reservation/base/reservation.resolver.base.ts`).
- **Relation Resolution:** Relation connection logic centralizes in base controller/resolver, ensuring customer and room references are consistently connected and exposed via resolver field methods (`reservation/base/reservation.resolver.base.ts`).
- **Metadata Exposure:** Swagger decorators and the custom `ApiNestedQuery` decorator (`../../decorators/api-nested-query.decorator`) provide documentation for filterable REST endpoints, aligning with broader API documentation practices (`reservation/base/reservation.controller.base.ts`).

## Complexity Indicators & Risks
- **Generated Code Overwrite Risk:** Customizations must remain outside `reservation/base/*`; regenerating via Amplication would overwrite base behaviors, so any future domain logic must reside in the thin extension layer (`reservation.module.ts`, `reservation.service.ts`).
- **Relation Integrity:** Mutations depend on clients supplying valid `customer` and `room` identifiers. Missing or stale references will surface as Prisma not-found errors, currently bubbled through without additional guarding (`reservation/base/reservation.controller.base.ts`).
- **Lack of Tests:** No reservation-specific tests accompany the module; the generated base spec is limited to controller smoke tests (`reservation/base/reservation.controller.base.spec.ts`), leaving business behaviors unverified.
- **Flexible Filtering Complexity:** `ReservationFindManyArgs` allows composable filters (`where`, `orderBy`, `skip`, `take`), which increases query surface area and necessitates careful validation when composing client queries (`reservation/base/ReservationFindManyArgs.ts`, `ReservationWhereInput.ts`).
