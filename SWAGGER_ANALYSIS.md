# Swagger UI Integration Analysis

## Current Issue
Swagger UI returned 404 at `/swagger` and `/swagger/` while `/api/openapi.json` worked.

## Root Cause (Confirmed)
`utoipa-swagger-ui` uses `RustEmbed` for serving Swagger UI assets. By default, `RustEmbed` does **not** embed
files in debug builds. As a result, the UI assets were missing and `/swagger/` returned 404 even though the
route existed.

This behavior is documented in the utoipa FAQ: Swagger UI 404 in debug builds is expected unless embedding is
enabled.

## Fix Applied
Enable debug embedding for Swagger UI assets:

```toml
utoipa-swagger-ui = { version = "8", features = ["axum", "debug-embed"] }
```

After a clean rebuild (`cargo clean` then `cargo run`), `/swagger` works as expected in debug builds.

## Why It Used To Work
Swagger UI will work without `debug-embed` if the binary is built in release mode or if a previous build still
had embedded assets. The 404 appears when running debug builds without embedding enabled.

## Action Items (Completed)
1. Enable `debug-embed` feature for `utoipa-swagger-ui`.
2. Clean and rebuild the server.
3. Verify `/swagger` and `/api/openapi.json`.
