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
use crate::models::{ApiResponse, Card, CreateCardRequest, UpdateCardRequest};

pub fn router() -> Router<DbPool> {
    Router::new()
        .route("/", get(get_cards).post(create_card))
        .route("/:id", get(get_card).put(update_card).delete(delete_card))
}

#[derive(Deserialize)]
pub(crate) struct CardsQuery {
    list_id: Option<i32>,
}

/// Get all cards, optionally filtered by list_id
#[utoipa::path(
    get,
    path = "/api/cards",
    tag = "Cards",
    params(
        ("list_id" = Option<i32>, Query, description = "Filter cards by list ID")
    ),
    responses(
        (status = 200, description = "List of cards", body = ApiResponse<Vec<Card>>)
    )
)]
pub async fn get_cards(
    State(pool): State<DbPool>,
    Query(params): Query<CardsQuery>,
) -> Result<Json<ApiResponse<Vec<Card>>>, AppError> {
    let cards = handlers::cards::get_all_cards(&pool, params.list_id).await?;
    Ok(Json(ApiResponse::success(cards)))
}

/// Get a single card by ID
#[utoipa::path(
    get,
    path = "/api/cards/{id}",
    tag = "Cards",
    params(
        ("id" = i32, Path, description = "Card ID")
    ),
    responses(
        (status = 200, description = "Card found", body = ApiResponse<Card>),
        (status = 404, description = "Card not found")
    )
)]
pub async fn get_card(
    State(pool): State<DbPool>,
    Path(id): Path<i32>,
) -> Result<Json<ApiResponse<Card>>, AppError> {
    let card = handlers::cards::get_card_by_id(&pool, id).await?;
    Ok(Json(ApiResponse::success(card)))
}

/// Create a new card
#[utoipa::path(
    post,
    path = "/api/cards",
    tag = "Cards",
    request_body = CreateCardRequest,
    responses(
        (status = 201, description = "Card created", body = ApiResponse<Card>),
        (status = 400, description = "Invalid input")
    )
)]
pub async fn create_card(
    State(pool): State<DbPool>,
    Json(req): Json<CreateCardRequest>,
) -> Result<(StatusCode, Json<ApiResponse<Card>>), AppError> {
    let card = handlers::cards::create_card(&pool, req).await?;
    Ok((
        StatusCode::CREATED,
        Json(ApiResponse::success_with_message(
            card,
            "Card created successfully".to_string(),
        )),
    ))
}

/// Update a card
#[utoipa::path(
    put,
    path = "/api/cards/{id}",
    tag = "Cards",
    params(
        ("id" = i32, Path, description = "Card ID")
    ),
    request_body = UpdateCardRequest,
    responses(
        (status = 200, description = "Card updated", body = ApiResponse<Card>),
        (status = 404, description = "Card not found"),
        (status = 400, description = "Invalid input")
    )
)]
pub async fn update_card(
    State(pool): State<DbPool>,
    Path(id): Path<i32>,
    Json(req): Json<UpdateCardRequest>,
) -> Result<Json<ApiResponse<Card>>, AppError> {
    let card = handlers::cards::update_card(&pool, id, req).await?;
    Ok(Json(ApiResponse::success_with_message(
        card,
        "Card updated successfully".to_string(),
    )))
}

/// Delete a card
#[utoipa::path(
    delete,
    path = "/api/cards/{id}",
    tag = "Cards",
    params(
        ("id" = i32, Path, description = "Card ID")
    ),
    responses(
        (status = 200, description = "Card deleted"),
        (status = 404, description = "Card not found")
    )
)]
pub async fn delete_card(
    State(pool): State<DbPool>,
    Path(id): Path<i32>,
) -> Result<Json<ApiResponse<()>>, AppError> {
    handlers::cards::delete_card(&pool, id).await?;
    Ok(Json(ApiResponse::message_only(
        "Card deleted successfully".to_string(),
    )))
}
