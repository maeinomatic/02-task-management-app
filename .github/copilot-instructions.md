# GitHub Copilot Custom Instructions

Repository-specific guidance for Copilot when working on this codebase. These instructions apply to code generation, inline suggestions, chat, and code review.

---

## General & Language

- **All developer-facing text must be in English:** code comments, commit messages, log messages, documentation, configuration.
- **Commit messages:** Start with a verb (Add, Fix, Refactor). Use present tense. Be concise.

---

## MCP (Model Context Protocol) Usage

- **Installed providers:** `GitHub MCP`, `Chrome DevTools MCP`.
- **MCP-first for discovery tasks:** For tasks involving issue lookup, PR context, repository metadata, workflow status, browser/runtime debugging, or network/API inspection, prefer MCP providers before guessing.
- **Provider routing (default):**
    1. **GitHub MCP** for: issues, PRs, review comments, repository search, branch/commit metadata.
    2. **Chrome DevTools MCP** for: UI behavior debugging, console errors, network requests, rendering/layout/interaction checks.
    3. **Workspace files/tools** for: source-of-truth implementation details and local code edits.
- **When both are relevant:** Start with GitHub MCP for task context, then Chrome DevTools MCP for runtime verification.
- **If provider selection is ambiguous:** Ask one concise clarification question, then proceed.
- **If MCP is unavailable for a task:** State that clearly and fall back to local workspace analysis (files, code search, git diff) without blocking progress.
- **Report MCP usage briefly:** Include a one-line note in responses indicating which MCP provider was used and for what.

### Prompt shortcuts (for user requests)

- "Use **GitHub MCP** for this task" → prioritize repository/issue/PR context via GitHub MCP.
- "Use **Chrome DevTools MCP** to verify" → prioritize runtime/browser validation via Chrome DevTools MCP.
- "Use MCP by default" → use the provider routing rules above unless user overrides.

---

## Rust Naming Conventions

Follow Rust standard conventions (RFC 430):

| Element | Convention | Example |
|--------|------------|---------|
| Modules | `snake_case` | `task_manager`, `user_service`, `database` |
| Types, structs, enums, traits | `PascalCase` or `UpperCamelCase` | `TaskManager`, `UserService`, `Repository` |
| Functions, methods, variables | `snake_case` | `get_user_async`, `user_id`, `task_data` |
| Constants, statics | `SCREAMING_SNAKE_CASE` | `MAX_RETRY_COUNT`, `DATABASE_URL` |
| Type parameters | Single uppercase letter or `UpperCamelCase` | `T`, `TEntity`, `Item` |
| Lifetimes | Short lowercase, starts with `'` | `'a`, `'static` |
| Macros | `snake_case!` | `println!`, `vec!` |
| Traits | Descriptive nouns or adjectives | `Clone`, `Iterator`, `Serializable` |
| Boolean functions | Prefix with `is_`, `has_`, `can_`, `should_` | `is_active`, `has_permission` |
| Async functions | No special suffix needed | `get_user`, `fetch_data` |
| Error types | `Error` suffix | `UserNotFoundError`, `DatabaseError` |
| Result types | Use `Result<T, E>` | `Result<User, AppError>` |

---

## Code Quality & Structure

- **Clean Code:** Write readable, logically structured, self-explanatory code. Follow Rust idioms and best practices.
- **Comments:** Prefer clear naming over excessive comments. Comment only when explaining *why*, not *what*. Use `///` for documentation comments.
- **DRY:** Extract common logic into reusable functions/modules. No copy-paste duplication.
- **KISS:** Prefer simple, focused solutions. Avoid over-engineering.
- **Functions:** Keep under ~30 lines. Single responsibility. Consistent abstraction levels within each function.
- **Modules:** Modular, focused. Use `pub` judiciously. Prefer small, well-defined public APIs.

### Ownership & Borrowing

- Leverage Rust's ownership system. Prefer borrowing (`&T`, `&mut T`) over cloning unless ownership transfer is needed.
- Use `Clone` only when necessary. Prefer `Copy` for small types.
- Good: `fn process_data(data: &Data) -> Result<Output, Error>`
- Avoid: Unnecessary `.clone()` calls

### Error Handling

- Use `Result<T, E>` for operations that can fail. Propagate errors with `?` operator.
- Create custom error types with `thiserror` or `anyhow` for better error context.
- Good: `fn read_config() -> Result<Config, ConfigError>`
- Avoid: Using `unwrap()` or `expect()` in production code except when you can prove it's safe
- Use `expect()` with descriptive messages when a panic is justified

### Option Handling

- Use `Option<T>` for values that may or may not exist.
- Prefer pattern matching or combinator methods (`map`, `and_then`, `unwrap_or`) over `unwrap()`.
- Good: `user.email.as_ref().map(|e| validate_email(e))`

---

## Logging

- All log messages in English. Include relevant context (IDs, operation names).
- Use `tracing` crate for structured logging: `tracing::warn!("Task creation failed for task_id = {}", task_id)`.
- Use appropriate log levels: `error!`, `warn!`, `info!`, `debug!`, `trace!`.
- Never log secrets, tokens, or sensitive data.

---

## Architecture & Development Principles

- **Clean Architecture:** Business logic isolated from presentation and infrastructure.
- **Stateless services:** No in-memory state across requests unless using proper state management (Arc, RwLock).
- **External communication:** Use traits and abstractions. Never access external systems directly without abstraction.
- **Async/Await:** Use Tokio runtime for async operations. All I/O should be async.
- **Configuration:** Use environment variables with `dotenvy`. Never hardcode secrets.

---

## API Design (Axum)

### HTTP Methods

- `GET` — retrieve
- `POST` — create
- `PUT` — complete update
- `PATCH` — partial update
- `DELETE` — remove

Do **not** use POST for reads or GET for mutations.

### Status Codes

- `200 OK` — successful GET, PUT, PATCH, DELETE
- `201 Created` — successful POST (return created resource)
- `204 No Content` — successful DELETE with no body
- `400 Bad Request` — validation errors
- `401 Unauthorized` — missing/invalid auth
- `403 Forbidden` — insufficient permissions
- `404 Not Found` — resource not found
- `409 Conflict` — resource conflict
- `500` — server error (avoid exposing internal details in production)

### Response Consistency

- Use standardized response models (e.g. JSON with serde).
- Include pagination metadata for collections.
- Document with `utoipa` for OpenAPI/Swagger generation.

### Validation

- Validate input at handler level.
- Use `serde` with custom validators or libraries like `validator`.
- Return descriptive error messages.

---

## Axum Web Framework

- **Async:** All handlers must be `async` and use `.await` for I/O.
- **Error handling:** Implement custom error types that implement `IntoResponse`. Use `?` operator for error propagation.
- **State:** Use `State` extractor for shared application state. Wrap in `Arc` for thread-safety.
- **Extractors:** Use typed extractors (`Json<T>`, `Path<T>`, `Query<T>`) for request data.
- **Middleware:** Use tower/tower-http for CORS, logging, tracing.
- **Routes:** Organize routes logically. Use `Router::nest` for API versioning.

---

## Dependency Management

- **Crates:** Only add necessary dependencies. Review crate quality, maintenance, and license.
- **Features:** Enable only needed features to reduce compile time and binary size.
- **Versions:** Use semantic versioning. Pin major versions to avoid breaking changes.
- **Security:** Regularly run `cargo audit` to check for vulnerabilities.

---

## Testing

- **Framework:** Use built-in Rust test framework with `#[test]` and `#[tokio::test]` for async tests.
- **Structure:** Arrange-Act-Assert (AAA) pattern. One concern per test.
- **Naming:** Descriptive test names in `snake_case`: `test_get_user_with_valid_id_returns_user`.
- **Organization:** Tests can be in the same file (`#[cfg(test)] mod tests`) or in `tests/` directory.
- **Isolation:** Tests must not depend on each other. Mock external dependencies.
- **Mocking:** Use crates like `mockall` or `wiremock` for HTTP mocking.
- **Coverage:** Strive for high coverage on business logic. Use `cargo tarpaulin` for coverage reports.

Example:
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_create_task_with_valid_data_returns_created() {
        // Arrange
        let task = Task::new("Test Task");
        
        // Act
        let result = create_task(task).await;
        
        // Assert
        assert!(result.is_ok());
    }
}
```

---

## Security

- **Secrets:** Never in code or config. Use environment variables and secure vaults.
- **Authentication:** Implement proper authentication middleware. Use JWT or session tokens.
- **APIs:** Protect endpoints with authentication middleware. Validate bearer tokens.
- **Headers:** Enforce security headers (HSTS, X-Frame-Options, CSP).
- **Encryption:** Use TLS 1.2+ for all external communication. Use HTTPS in production.
- **Input:** Validate all user input. Sanitize data before database queries (SQLx helps prevent SQL injection).
- **Dependencies:** Regularly run `cargo audit` to check for known vulnerabilities.
- **Production:** Never expose stack traces or debug logs in API responses.

---

## Performance

- **Async:** Use `async`/`await` for all I/O operations.
- **Database:** Avoid N+1 queries. Use joins or batch queries. Leverage SQLx query caching.
- **Resources:** Rust handles most cleanup automatically via RAII, but be mindful of manual resource management.
- **Cloning:** Minimize unnecessary clones. Use references where possible.
- **Collections:** Choose appropriately (`Vec<T>`, `HashMap<K, V>`, `HashSet<T>`).
- **Caching:** Consider caching frequently accessed data with appropriate TTL.
- **Allocation:** Prefer stack allocation over heap when possible. Use `Box`, `Rc`, `Arc` judiciously.

---

## Code Review Checklist

Before submitting changes, verify:

1. **Purpose** — Goal clearly documented (issue/ticket reference, description).
2. **Scope** — PR is small and focused.
3. **Clarity** — Code self-explanatory, no commented-out code.
4. **DRY / KISS** — No duplication; solution not over-complex.
5. **Functions** — Short, single responsibility, consistent abstraction levels.
6. **Ownership** — Proper use of borrowing and ownership. No unnecessary clones.
7. **API** — RESTful, documented with utoipa, consistent responses.
8. **Error handling** — Proper `Result` usage, errors propagated correctly.
9. **Tests** — Present, meaningful, edge cases covered.
10. **Security** — No secrets, proper auth, input validated, no `unwrap()` in production paths.
11. **Async** — Proper use of async/await, no blocking operations in async contexts.
12. **Tooling** — Passes `cargo fmt`, `cargo clippy`, `cargo test`, `cargo build`.

---

## Tooling & Workflow

### Formatting
```bash
cargo fmt              # Format code according to Rust style guide
cargo fmt -- --check   # Check formatting without making changes
```

### Linting
```bash
cargo clippy                    # Run Clippy linter
cargo clippy -- -D warnings     # Treat warnings as errors
```

### Building
```bash
cargo build                 # Debug build
cargo build --release       # Optimized release build
cargo check                 # Fast compile check without building
```

### Testing
```bash
cargo test                  # Run all tests
cargo test test_name        # Run specific test
cargo test -- --nocapture   # Show println! output
```

### Other
```bash
cargo audit                 # Check for security vulnerabilities
cargo outdated              # Check for outdated dependencies
cargo tree                  # Show dependency tree
cargo doc --open            # Generate and open documentation
```

---

## Documentation

- Use `///` for public API documentation (generates rustdoc).
- Use `//!` for module-level documentation.
- Keep README, API docs, and OpenAPI specs in sync with code.
- Update docs whenever logic, interface, or behavior changes.
- Include examples in documentation comments when helpful.

Example:
```rust
/// Fetches a user by their unique identifier.
///
/// # Arguments
/// * `user_id` - The UUID of the user to fetch
///
/// # Returns
/// * `Ok(User)` - The user if found
/// * `Err(AppError)` - If the user is not found or database error occurs
///
/// # Examples
/// ```
/// let user = get_user(user_id).await?;
/// ```
pub async fn get_user(user_id: Uuid) -> Result<User, AppError> {
    // Implementation
}
```
