use axum::{
    extract::State,
    http::{HeaderMap, StatusCode},
    routing::get,
    Json, Router,
};

use crate::db::DbPool;
use crate::errors::AppError;
use crate::handlers;
use crate::models::{ApiResponse, AuthResponse, LoginRequest, RegisterRequest, User};

pub fn router() -> Router<DbPool> {
    Router::new()
        .route("/register", axum::routing::post(register))
        .route("/login", axum::routing::post(login))
        .route("/me", get(me))
        .route("/logout", axum::routing::post(logout))
}

#[utoipa::path(
    post,
    path = "/api/auth/register",
    tag = "Auth",
    request_body = RegisterRequest,
    responses(
        (status = 201, description = "Registered successfully", body = ApiResponse<AuthResponse>),
        (status = 400, description = "Invalid input"),
        (status = 409, description = "Email already exists")
    )
)]
pub async fn register(
    State(pool): State<DbPool>,
    Json(req): Json<RegisterRequest>,
) -> Result<(StatusCode, Json<ApiResponse<AuthResponse>>), AppError> {
    let payload = handlers::auth::register(&pool, req).await?;
    Ok((
        StatusCode::CREATED,
        Json(ApiResponse::success_with_message(
            payload,
            "Registered successfully".to_string(),
        )),
    ))
}

#[utoipa::path(
    post,
    path = "/api/auth/login",
    tag = "Auth",
    request_body = LoginRequest,
    responses(
        (status = 200, description = "Login successful", body = ApiResponse<AuthResponse>),
        (status = 401, description = "Invalid credentials")
    )
)]
pub async fn login(
    State(pool): State<DbPool>,
    Json(req): Json<LoginRequest>,
) -> Result<Json<ApiResponse<AuthResponse>>, AppError> {
    let payload = handlers::auth::login(&pool, req).await?;
    Ok(Json(ApiResponse::success_with_message(
        payload,
        "Login successful".to_string(),
    )))
}

#[utoipa::path(
    get,
    path = "/api/auth/me",
    tag = "Auth",
    responses(
        (status = 200, description = "Current user", body = ApiResponse<User>),
        (status = 401, description = "Unauthorized")
    )
)]
pub async fn me(
    State(pool): State<DbPool>,
    headers: HeaderMap,
) -> Result<Json<ApiResponse<User>>, AppError> {
    let user = handlers::auth::get_current_user(&pool, &headers).await?;
    Ok(Json(ApiResponse::success(user)))
}

#[utoipa::path(
    post,
    path = "/api/auth/logout",
    tag = "Auth",
    responses(
        (status = 200, description = "Logged out")
    )
)]
pub async fn logout() -> Json<ApiResponse<()>> {
    Json(ApiResponse::message_only(
        "Logout successful".to_string(),
    ))
}
