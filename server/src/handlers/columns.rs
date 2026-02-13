use crate::db::DbPool;
use crate::errors::AppError;
use crate::models::{BoardColumn, CreateColumnRequest, UpdateColumnRequest};

/// Get all columns (optionally filtered by board_id)
pub async fn get_all_columns(pool: &DbPool, board_id: Option<i32>) -> Result<Vec<BoardColumn>, AppError> {
    let cols = if let Some(board_id) = board_id {
        sqlx::query_as::<_, BoardColumn>(
            "SELECT id, title, board_id, position, created_at, updated_at 
             FROM board_column 
             WHERE board_id = $1
             ORDER BY position ASC"
        )
        .bind(board_id)
        .fetch_all(pool)
        .await?
    } else {
        sqlx::query_as::<_, BoardColumn>(
            "SELECT id, title, board_id, position, created_at, updated_at 
             FROM board_column 
             ORDER BY position ASC"
        )
        .fetch_all(pool)
        .await?
    };

    Ok(cols)
}

/// Get column by ID
pub async fn get_column_by_id(pool: &DbPool, id: i32) -> Result<BoardColumn, AppError> {
    let col = sqlx::query_as::<_, BoardColumn>(
        "SELECT id, title, board_id, position, created_at, updated_at 
         FROM board_column 
         WHERE id = $1"
    )
    .bind(id)
    .fetch_one(pool)
    .await?;

    Ok(col)
}

/// Create a new column
pub async fn create_column(pool: &DbPool, req: CreateColumnRequest) -> Result<BoardColumn, AppError> {
    if req.title.trim().is_empty() {
        return Err(AppError::ValidationError("Title is required".to_string()));
    }

    // Validate that the board exists
    let board_exists: bool = sqlx::query_scalar(
        "SELECT EXISTS(SELECT 1 FROM board WHERE id = $1)"
    )
    .bind(req.board_id)
    .fetch_one(pool)
    .await?;

    if !board_exists {
        return Err(AppError::NotFound(format!("Board with id {} not found", req.board_id)));
    }

    let next_position: i32 = sqlx::query_scalar(
        "SELECT COALESCE(MAX(position), -1) + 1 FROM board_column WHERE board_id = $1"
    )
    .bind(req.board_id)
    .fetch_one(pool)
    .await?;

    let col = sqlx::query_as::<_, BoardColumn>(
        "INSERT INTO board_column (title, board_id, position) 
         VALUES ($1, $2, $3) 
         RETURNING id, title, board_id, position, created_at, updated_at"
    )
    .bind(&req.title)
    .bind(req.board_id)
    .bind(next_position)
    .fetch_one(pool)
    .await?;

    Ok(col)
}

/// Update a column
pub async fn update_column(pool: &DbPool, id: i32, req: UpdateColumnRequest) -> Result<BoardColumn, AppError> {
    if let Some(ref title) = req.title {
        if title.trim().is_empty() {
            return Err(AppError::ValidationError("Title is required".to_string()));
        }
    }

    // Fetch current column
    let current = get_column_by_id(pool, id).await?;

    let title = req.title.unwrap_or(current.title);
    let board_id = req.board_id.unwrap_or(current.board_id);
    let position = req.position.unwrap_or(current.position);

    let col = sqlx::query_as::<_, BoardColumn>(
        "UPDATE board_column 
         SET title = $1, board_id = $2, position = $3, updated_at = NOW()
         WHERE id = $4
         RETURNING id, title, board_id, position, created_at, updated_at"
    )
    .bind(title)
    .bind(board_id)
    .bind(position)
    .bind(id)
    .fetch_one(pool)
    .await?;

    Ok(col)
}

/// Delete a column
pub async fn delete_column(pool: &DbPool, id: i32) -> Result<(), AppError> {
    // Check if column exists first
    let column_exists: bool = sqlx::query_scalar(
        "SELECT EXISTS(SELECT 1 FROM board_column WHERE id = $1)"
    )
    .bind(id)
    .fetch_one(pool)
    .await?;

    if !column_exists {
        return Err(AppError::NotFound("Column not found".to_string()));
    }

    // Check if there are any cards in this column
    let card_count: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM card WHERE list_id = $1"
    )
    .bind(id)
    .fetch_one(pool)
    .await?;

    if card_count > 0 {
        return Err(AppError::ValidationError(
            format!("Cannot delete column with {} card(s). Please move or delete the cards first.", card_count)
        ));
    }

    // Now safe to delete the column
    let result = sqlx::query("DELETE FROM board_column WHERE id = $1")
        .bind(id)
        .execute(pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound("Column not found".to_string()));
    }

    Ok(())
}
