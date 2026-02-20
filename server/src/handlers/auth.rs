use axum::http::HeaderMap;
use bcrypt::{hash, verify, DEFAULT_COST};
use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::Deserialize;

use crate::db::DbPool;
use crate::errors::AppError;
use crate::models::{AuthResponse, Claims, LoginRequest, RegisterRequest, User};

#[derive(Debug, Deserialize, sqlx::FromRow)]
struct UserAuthRow {
    id: i32,
    email: String,
    name: String,
    avatar_url: Option<String>,
    password_hash: String,
    created_at: chrono::DateTime<chrono::Utc>,
    updated_at: chrono::DateTime<chrono::Utc>,
}

fn jwt_secret() -> String {
    std::env::var("JWT_SECRET").unwrap_or_else(|_| "dev-secret-change-me".to_string())
}

fn jwt_exp_hours() -> i64 {
    std::env::var("JWT_EXP_HOURS")
        .ok()
        .and_then(|value| value.parse::<i64>().ok())
        .filter(|value| *value > 0)
        .unwrap_or(24)
}

fn create_token(user_id: i32, email: &str) -> Result<String, AppError> {
    let exp = (Utc::now() + Duration::hours(jwt_exp_hours())).timestamp() as usize;
    let claims = Claims {
        sub: user_id.to_string(),
        email: email.to_string(),
        exp,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(jwt_secret().as_bytes()),
    )
    .map_err(|_| AppError::InternalError("Failed to create auth token".to_string()))
}

fn decode_token(token: &str) -> Result<Claims, AppError> {
    let decoded = decode::<Claims>(
        token,
        &DecodingKey::from_secret(jwt_secret().as_bytes()),
        &Validation::default(),
    )
    .map_err(|_| AppError::Unauthorized("Invalid or expired token".to_string()))?;

    Ok(decoded.claims)
}

fn extract_bearer_token(headers: &HeaderMap) -> Result<String, AppError> {
    let value = headers
        .get("Authorization")
        .ok_or_else(|| AppError::Unauthorized("Missing Authorization header".to_string()))?;

    let raw = value
        .to_str()
        .map_err(|_| AppError::Unauthorized("Invalid Authorization header".to_string()))?;

    let token = raw
        .strip_prefix("Bearer ")
        .ok_or_else(|| AppError::Unauthorized("Invalid bearer token format".to_string()))?;

    if token.trim().is_empty() {
        return Err(AppError::Unauthorized("Bearer token cannot be empty".to_string()));
    }

    Ok(token.to_string())
}

fn into_user(row: UserAuthRow) -> User {
    User {
        id: row.id,
        email: row.email,
        name: row.name,
        avatar_url: row.avatar_url,
        created_at: row.created_at,
        updated_at: row.updated_at,
    }
}

pub async fn register(pool: &DbPool, req: RegisterRequest) -> Result<AuthResponse, AppError> {
    if req.name.trim().is_empty() {
        return Err(AppError::ValidationError("Name is required".to_string()));
    }
    if req.email.trim().is_empty() {
        return Err(AppError::ValidationError("Email is required".to_string()));
    }
    if req.password.len() < 8 {
        return Err(AppError::ValidationError(
            "Password must be at least 8 characters".to_string(),
        ));
    }

    let existing = sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM users WHERE LOWER(email) = LOWER($1)")
        .bind(req.email.trim())
        .fetch_one(pool)
        .await?;

    if existing > 0 {
        return Err(AppError::Conflict("Email already registered".to_string()));
    }

    let password_hash = hash(req.password, DEFAULT_COST)
        .map_err(|_| AppError::InternalError("Failed to hash password".to_string()))?;

    let row = sqlx::query_as::<_, UserAuthRow>(
        r#"
        INSERT INTO users (email, password_hash, name)
        VALUES ($1, $2, $3)
        RETURNING id, email, name, avatar_url, password_hash, created_at, updated_at
        "#,
    )
    .bind(req.email.trim().to_lowercase())
    .bind(password_hash)
    .bind(req.name.trim())
    .fetch_one(pool)
    .await?;

    let user = into_user(row);
    let token = create_token(user.id, &user.email)?;

    Ok(AuthResponse { token, user })
}

pub async fn login(pool: &DbPool, req: LoginRequest) -> Result<AuthResponse, AppError> {
    if req.email.trim().is_empty() || req.password.is_empty() {
        return Err(AppError::ValidationError(
            "Email and password are required".to_string(),
        ));
    }

    let row = sqlx::query_as::<_, UserAuthRow>(
        r#"
        SELECT id, email, name, avatar_url, password_hash, created_at, updated_at
        FROM users
        WHERE LOWER(email) = LOWER($1)
        "#,
    )
    .bind(req.email.trim())
    .fetch_optional(pool)
    .await?;

    let row = row.ok_or_else(|| AppError::Unauthorized("Invalid email or password".to_string()))?;

    let valid = verify(req.password, &row.password_hash)
        .map_err(|_| AppError::Unauthorized("Invalid email or password".to_string()))?;

    if !valid {
        return Err(AppError::Unauthorized("Invalid email or password".to_string()));
    }

    let user = into_user(row);
    let token = create_token(user.id, &user.email)?;

    Ok(AuthResponse { token, user })
}

pub async fn get_current_user(pool: &DbPool, headers: &HeaderMap) -> Result<User, AppError> {
    let token = extract_bearer_token(headers)?;
    let claims = decode_token(&token)?;
    let user_id = claims
        .sub
        .parse::<i32>()
        .map_err(|_| AppError::Unauthorized("Invalid token subject".to_string()))?;

    let user = sqlx::query_as::<_, User>(
        "SELECT id, email, name, avatar_url, created_at, updated_at FROM users WHERE id = $1",
    )
    .bind(user_id)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| AppError::Unauthorized("User not found".to_string()))?;

    Ok(user)
}

pub async fn require_auth(pool: &DbPool, headers: &HeaderMap) -> Result<User, AppError> {
    get_current_user(pool, headers).await
}
