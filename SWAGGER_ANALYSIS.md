# Swagger UI Integration Analysis

## Current Issue
Swagger UI returns 404 at `/swagger` and `/swagger/` despite server logs indicating it's configured.

## Current Implementation

### main.rs (Lines 87-98)
```rust
// Build API router with state
let api_router = Router::new()
    .route("/api/health", get(health_check))
    .nest("/api/boards", routes::boards::router())
    .nest("/api/cards", routes::cards::router())
    .with_state(db_pool);

// Build complete app with Swagger UI
let app = Router::new()
    .merge(SwaggerUi::new("/swagger").url("/api/openapi.json", ApiDoc::openapi()))
    .merge(api_router)
    .layer(cors);
```

**Type Analysis:**
- `api_router`: `Router<()>` (after `.with_state(db_pool)`, state is consumed)
- `SwaggerUi::new(...)`: Converts `Into<Router<S>>` where `S: Clone + Send + Sync + 'static`
- Problem: Merging routers with potentially incompatible state types

## Documentation Examples from utoipa-swagger-ui

### Example 1: axum-utoipa-bindings (WORKING)
```rust
let (router, api) = OpenApiRouter::with_openapi(ApiDoc::openapi())
    .routes(routes!(health))
    .nest("/api/customer", customer::router())
    .nest("/api/order", order::router())
    .split_for_parts();

let router = router.merge(SwaggerUi::new("/swagger-ui").url("/apidoc/openapi.json", api));
```
**Pattern**: Split router from API doc, then merge SwaggerUi

### Example 2: axum-multipart (WORKING)
```rust
let (router, api) = OpenApiRouter::new()
    .routes(routes!(hello_form))
    .split_for_parts();

let router = router.merge(SwaggerUi::new("/swagger-ui").url("/api/openapi.json", api));
```
**Pattern**: Same split pattern

### Example 3: simple-axum (WORKING, no SwaggerUi)
```rust
let app = axum::Router::new().route("/api-docs/openapi.json", get(openapi));
```
**Pattern**: Manual route for OpenAPI JSON

### Example 4: axum-utoipa-nesting-vendored (WORKING)
```rust
let app = Router::new()
    .merge(SwaggerUi::new("/swagger-ui").url("/api-docs/openapi.json", doc))
    .route("/hello", routing::get(|| async { "hello" }))
    .nest("/api/v1/ones", one::router());
```
**Pattern**: Merge SwaggerUi FIRST, then add routes

## Issues Identified

1. **Router State Mismatch**: 
   - We're calling `.with_state(db_pool)` BEFORE merging with SwaggerUi
   - This consumes the state and makes router stateless `Router<()>`
   - SwaggerUi creates its own `Router<S>` 
   - Merging may not work correctly due to state type mismatch

2. **Layer Application Order**:
   - CORS layer is applied AFTER merging routers
   - Should verify if this affects routing

3. **Path Pattern**:
   - Using `/swagger` (correct for axum - no wildcards needed)
   - Examples use `/swagger-ui` but `/swagger` should work

## Recommended Fix Pattern

Based on utoipa-swagger-ui documentation and working examples:

### Option A: Merge Before State (Preferred)
```rust
let app = Router::new()
    .merge(SwaggerUi::new("/swagger").url("/api/openapi.json", ApiDoc::openapi()))
    .route("/api/health", get(health_check))
    .nest("/api/boards", routes::boards::router())
    .nest("/api/cards", routes::cards::router())
    .with_state(db_pool)
    .layer(cors);
```

### Option B: Apply State to Nested Routes Only
```rust
let api_router = Router::new()
    .route("/api/health", get(health_check))
    .nest("/api/boards", routes::boards::router())
    .nest("/api/cards", routes::cards::router());

let app = Router::new()
    .merge(SwaggerUi::new("/swagger").url("/api/openapi.json", ApiDoc::openapi()))
    .merge(api_router)
    .with_state(db_pool)
    .layer(cors);
```

## Root Cause
The issue is that `SwaggerUi` creates a stateless `Router<()>`, but when we merge it with a router that has already consumed its state via `.with_state()`, the routing table may not be properly combined. The SwaggerUi routes are likely not being registered in the final router.

## Action Items
1. Implement Option A (merge SwaggerUi before applying state)
2. Test `/swagger` endpoint
3. Verify `/api/openapi.json` still works
4. Confirm all API routes still function with state
