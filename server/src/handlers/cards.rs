use crate::db::DbPool;
use crate::errors::AppError;
use crate::models::{Card, CreateCardRequest, UpdateCardRequest};

/// Get all cards, optionally filtered by list_id
pub async fn get_all_cards(pool: &DbPool, list_id: Option<i32>) -> Result<Vec<Card>, AppError> {
    let cards = if let Some(list_id) = list_id {
        sqlx::query_as::<_, Card>(
            "SELECT id, title, description, list_id, position, assignee_id, due_date, labels, created_at, updated_at 
             FROM card 
             WHERE list_id = $1
             ORDER BY position ASC"
        )
        .bind(list_id)
        .fetch_all(pool)
        .await?
    } else {
        sqlx::query_as::<_, Card>(
            "SELECT id, title, description, list_id, position, assignee_id, due_date, labels, created_at, updated_at 
             FROM card 
             ORDER BY created_at DESC"
        )
        .fetch_all(pool)
        .await?
    };

    Ok(cards)
}

/// Get card by ID
pub async fn get_card_by_id(pool: &DbPool, id: i32) -> Result<Card, AppError> {
    let card = sqlx::query_as::<_, Card>(
        "SELECT id, title, description, list_id, position, assignee_id, due_date, labels, created_at, updated_at 
         FROM card 
         WHERE id = $1"
    )
    .bind(id)
    .fetch_one(pool)
    .await?;

    Ok(card)
}

/// Create a new card
pub async fn create_card(
    pool: &DbPool,
    req: CreateCardRequest,
) -> Result<Card, AppError> {
    // Validate title
    if req.title.trim().is_empty() {
        return Err(AppError::ValidationError("Title is required".to_string()));
    }

    // Get the next position for this list
    let next_position: i32 = sqlx::query_scalar(
        "SELECT COALESCE(MAX(position), -1) + 1 FROM card WHERE list_id = $1"
    )
    .bind(req.list_id)
    .fetch_one(pool)
    .await?;

    let card = sqlx::query_as::<_, Card>(
        "INSERT INTO card (title, description, list_id, position, assignee_id, due_date, labels) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING id, title, description, list_id, position, assignee_id, due_date, labels, created_at, updated_at"
    )
    .bind(&req.title)
    .bind(&req.description)
    .bind(req.list_id)
    .bind(next_position)
    .bind(&req.assignee_id)
    .bind(&req.due_date)
    .bind(&req.labels)
    .fetch_one(pool)
    .await?;

    Ok(card)
}

/// Update a card
pub async fn update_card(
    pool: &DbPool,
    id: i32,
    req: UpdateCardRequest,
) -> Result<Card, AppError> {
    // Fetch current card first
    let current_card = get_card_by_id(pool, id).await?;
    
    // Use provided values or keep current ones
    let title = req.title.unwrap_or(current_card.title);
    let description = req.description.or(current_card.description);
    let list_id = req.list_id.unwrap_or(current_card.list_id);
    let position = req.position.unwrap_or(current_card.position);
    let assignee_id = req.assignee_id.or(current_card.assignee_id);
    let due_date = req.due_date.or(current_card.due_date);
    let labels = req.labels.unwrap_or(current_card.labels);

    let card = sqlx::query_as::<_, Card>(
        "UPDATE card 
         SET title = $1, description = $2, list_id = $3, position = $4, 
             assignee_id = $5, due_date = $6, labels = $7, updated_at = NOW()
         WHERE id = $8
         RETURNING id, title, description, list_id, position, assignee_id, due_date, labels, created_at, updated_at"
    )
    .bind(title)
    .bind(description)
    .bind(list_id)
    .bind(position)
    .bind(assignee_id)
    .bind(due_date)
    .bind(labels)
    .bind(id)
    .fetch_one(pool)
    .await?;

    Ok(card)
}

/// Delete a card
pub async fn delete_card(pool: &DbPool, id: i32) -> Result<(), AppError> {
    let result = sqlx::query("DELETE FROM card WHERE id = $1")
        .bind(id)
        .execute(pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound("Card not found".to_string()));
    }

    Ok(())
}
