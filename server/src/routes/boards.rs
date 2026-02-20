use axum::{
    extract::{Path, State},
    http::{HeaderMap, StatusCode},
    routing::get,
    Json, Router,
};

use crate::db::DbPool;
use crate::errors::AppError;
use crate::handlers;
use crate::models::{ApiResponse, Board, CreateBoardRequest, UpdateBoardRequest};

pub fn router() -> Router<DbPool> {
    Router::new()
        .route("/", get(get_boards).post(create_board))
        .route("/:id", get(get_board).put(update_board).delete(delete_board))
}

/// Get all boards
#[utoipa::path(
    get,
    path = "/api/boards",
    tag = "Boards",
    responses(
        (status = 200, description = "List of boards", body = ApiResponse<Vec<Board>>)
    )
)]
pub async fn get_boards(
    State(pool): State<DbPool>,
) -> Result<Json<ApiResponse<Vec<Board>>>, AppError> {
    let boards = handlers::boards::get_all_boards(&pool).await?;
    Ok(Json(ApiResponse::success(boards)))
}

/// Get a single board by ID
#[utoipa::path(
    get,
    path = "/api/boards/{id}",
    tag = "Boards",
    params(
        ("id" = i32, Path, description = "Board ID")
    ),
    responses(
        (status = 200, description = "Board found", body = ApiResponse<Board>),
        (status = 404, description = "Board not found")
    )
)]
pub async fn get_board(
    State(pool): State<DbPool>,
    Path(id): Path<i32>,
) -> Result<Json<ApiResponse<Board>>, AppError> {
    let board = handlers::boards::get_board_by_id(&pool, id).await?;
    Ok(Json(ApiResponse::success(board)))
}

/// Create a new board
#[utoipa::path(
    post,
    path = "/api/boards",
    tag = "Boards",
    request_body = CreateBoardRequest,
    responses(
        (status = 201, description = "Board created", body = ApiResponse<Board>),
        (status = 400, description = "Invalid input")
    )
)]
pub async fn create_board(
    State(pool): State<DbPool>,
    headers: HeaderMap,
    Json(req): Json<CreateBoardRequest>,
) -> Result<(StatusCode, Json<ApiResponse<Board>>), AppError> {
    let user = handlers::auth::require_auth(&pool, &headers).await?;
    let board = handlers::boards::create_board(&pool, req, user.id.to_string()).await?;
    Ok((
        StatusCode::CREATED,
        Json(ApiResponse::success_with_message(
            board,
            "Board created successfully".to_string(),
        )),
    ))
}

/// Update a board
#[utoipa::path(
    put,
    path = "/api/boards/{id}",
    tag = "Boards",
    params(
        ("id" = i32, Path, description = "Board ID")
    ),
    request_body = UpdateBoardRequest,
    responses(
        (status = 200, description = "Board updated", body = ApiResponse<Board>),
        (status = 404, description = "Board not found"),
        (status = 400, description = "Invalid input")
    )
)]
pub async fn update_board(
    State(pool): State<DbPool>,
    headers: HeaderMap,
    Path(id): Path<i32>,
    Json(req): Json<UpdateBoardRequest>,
) -> Result<Json<ApiResponse<Board>>, AppError> {
    handlers::auth::require_auth(&pool, &headers).await?;
    let board = handlers::boards::update_board(&pool, id, req).await?;
    Ok(Json(ApiResponse::success_with_message(
        board,
        "Board updated successfully".to_string(),
    )))
}

/// Delete a board
#[utoipa::path(
    delete,
    path = "/api/boards/{id}",
    tag = "Boards",
    params(
        ("id" = i32, Path, description = "Board ID")
    ),
    responses(
        (status = 200, description = "Board deleted"),
        (status = 404, description = "Board not found")
    )
)]
pub async fn delete_board(
    State(pool): State<DbPool>,
    headers: HeaderMap,
    Path(id): Path<i32>,
) -> Result<Json<ApiResponse<()>>, AppError> {
    handlers::auth::require_auth(&pool, &headers).await?;
    handlers::boards::delete_board(&pool, id).await?;
    Ok(Json(ApiResponse::message_only(
        "Board deleted successfully".to_string(),
    )))
}
