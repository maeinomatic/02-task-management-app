use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    routing::get,
    Json, Router,
};
use serde::Deserialize;

use crate::db::DbPool;
use crate::errors::AppError;
use crate::handlers;
use crate::models::{ApiResponse, BoardColumn, CreateColumnRequest, UpdateColumnRequest};

pub fn router() -> Router<DbPool> {
    Router::new()
        .route("/", get(get_lists).post(create_list))
        .route("/:id", get(get_list).put(update_list).delete(delete_list))
}

#[derive(Deserialize)]
pub(crate) struct ListsQuery {
    board_id: Option<i32>,
}

/// Get all lists (optionally filtered by board_id)
#[utoipa::path(
    get,
    path = "/api/lists",
    tag = "Lists",
    params(
        ("board_id" = Option<i32>, Query, description = "Filter lists by board ID")
    ),
    responses(
        (status = 200, description = "List of lists", body = ApiResponse<Vec<BoardColumn>>) 
    )
)]
pub async fn get_lists(
    State(pool): State<DbPool>,
    Query(params): Query<ListsQuery>,
) -> Result<Json<ApiResponse<Vec<BoardColumn>>>, AppError> {
    let lists = handlers::columns::get_all_columns(&pool, params.board_id).await?;
    Ok(Json(ApiResponse::success(lists)))
}

/// Get a single list by ID
#[utoipa::path(
    get,
    path = "/api/lists/{id}",
    tag = "Lists",
    params(
        ("id" = i32, Path, description = "List ID")
    ),
    responses(
        (status = 200, description = "List found", body = ApiResponse<BoardColumn>),
        (status = 404, description = "List not found")
    )
)]
pub async fn get_list(
    State(pool): State<DbPool>,
    Path(id): Path<i32>,
) -> Result<Json<ApiResponse<BoardColumn>>, AppError> {
    let col = handlers::columns::get_column_by_id(&pool, id).await?;
    Ok(Json(ApiResponse::success(col)))
}

/// Create a new list
#[utoipa::path(
    post,
    path = "/api/lists",
    tag = "Lists",
    request_body = CreateColumnRequest,
    responses(
        (status = 201, description = "List created", body = ApiResponse<BoardColumn>),
        (status = 400, description = "Invalid input")
    )
)]
pub async fn create_list(
    State(pool): State<DbPool>,
    Json(req): Json<CreateColumnRequest>,
) -> Result<(StatusCode, Json<ApiResponse<BoardColumn>>), AppError> {
    let col = handlers::columns::create_column(&pool, req).await?;
    Ok((
        StatusCode::CREATED,
        Json(ApiResponse::success_with_message(col, "List created successfully".to_string())),
    ))
}

/// Update a list
#[utoipa::path(
    put,
    path = "/api/lists/{id}",
    tag = "Lists",
    params(
        ("id" = i32, Path, description = "List ID")
    ),
    request_body = UpdateColumnRequest,
    responses(
        (status = 200, description = "List updated", body = ApiResponse<BoardColumn>),
        (status = 404, description = "List not found"),
        (status = 400, description = "Invalid input")
    )
)]
pub async fn update_list(
    State(pool): State<DbPool>,
    Path(id): Path<i32>,
    Json(req): Json<UpdateColumnRequest>,
) -> Result<Json<ApiResponse<BoardColumn>>, AppError> {
    let col = handlers::columns::update_column(&pool, id, req).await?;
    Ok(Json(ApiResponse::success_with_message(col, "List updated successfully".to_string())))
}

/// Delete a list
#[utoipa::path(
    delete,
    path = "/api/lists/{id}",
    tag = "Lists",
    params(
        ("id" = i32, Path, description = "List ID")
    ),
    responses(
        (status = 200, description = "List deleted"),
        (status = 404, description = "List not found")
    )
)]
pub async fn delete_list(
    State(pool): State<DbPool>,
    Path(id): Path<i32>,
) -> Result<Json<ApiResponse<()>>, AppError> {
    handlers::columns::delete_column(&pool, id).await?;
    Ok(Json(ApiResponse::message_only("List deleted successfully".to_string())))
}
