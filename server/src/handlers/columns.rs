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
             ORDER BY position ASC, id ASC"
        )
        .bind(board_id)
        .fetch_all(pool)
        .await?
    } else {
        sqlx::query_as::<_, BoardColumn>(
            "SELECT id, title, board_id, position, created_at, updated_at 
             FROM board_column 
             ORDER BY position ASC, id ASC"
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

    // If a new board_id is provided, validate that the board exists
    if let Some(new_board_id) = req.board_id {
        let board_exists: bool = sqlx::query_scalar(
            "SELECT EXISTS(SELECT 1 FROM board WHERE id = $1)"
        )
        .bind(new_board_id)
        .fetch_one(pool)
        .await?;

        if !board_exists {
            return Err(AppError::NotFound(format!("Board with id {} not found", new_board_id)));
        }
    }
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

/// Delete a column (cascade deletes all cards in the column)
pub async fn delete_column(pool: &DbPool, id: i32) -> Result<(), AppError> {
    // Perform related deletes in a single transaction to avoid partial updates
    let mut tx = pool.begin().await?;

    // Check if column exists first
    let existing: Option<i32> = sqlx::query_scalar(
        "SELECT board_id FROM board_column WHERE id = $1"
    )
    .bind(id)
    .fetch_optional(&mut *tx)
    .await?;

    let Some(board_id) = existing else {
        return Err(AppError::NotFound("Column not found".to_string()));
    };

    // Delete all cards in this column first (cascade delete)
    sqlx::query("DELETE FROM card WHERE list_id = $1")
        .bind(id)
        .execute(&mut *tx)
        .await?;

    // Now delete the column
    let result = sqlx::query("DELETE FROM board_column WHERE id = $1")
        .bind(id)
        .execute(&mut *tx)
        .await?;

    if result.rows_affected() == 0 {
        // Nothing deleted; roll back the transaction by not committing
        return Err(AppError::NotFound("Column not found".to_string()));
    }

    // Renumber all remaining columns to ensure sequential positions starting from 0.
    // This handles any gaps or duplicate positions that may exist due to bugs or concurrent modifications.
    sqlx::query(
        "WITH ordered AS (
             SELECT id,
                    ROW_NUMBER() OVER (ORDER BY position ASC, id ASC) - 1 AS new_position
             FROM board_column
             WHERE board_id = $1
         )
         UPDATE board_column AS bc
         SET position = o.new_position,
             updated_at = NOW()
         FROM ordered AS o
         WHERE bc.id = o.id"
    )
    .bind(board_id)
    .execute(&mut *tx)
    .await?;

    tx.commit().await?;

    Ok(())
}
