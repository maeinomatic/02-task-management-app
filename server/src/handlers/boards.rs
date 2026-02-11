use crate::db::DbPool;
use crate::errors::AppError;
use crate::models::{Board, CreateBoardRequest, UpdateBoardRequest};

/// Get all boards
pub async fn get_all_boards(pool: &DbPool) -> Result<Vec<Board>, AppError> {
    let boards = sqlx::query_as::<_, Board>(
        "SELECT id, title, description, owner_id, members, created_at, updated_at 
         FROM board 
         ORDER BY created_at DESC"
    )
    .fetch_all(pool)
    .await?;

    Ok(boards)
}

/// Get board by ID
pub async fn get_board_by_id(pool: &DbPool, id: i32) -> Result<Board, AppError> {
    let board = sqlx::query_as::<_, Board>(
        "SELECT id, title, description, owner_id, members, created_at, updated_at 
         FROM board 
         WHERE id = $1"
    )
    .bind(id)
    .fetch_one(pool)
    .await?;

    Ok(board)
}

/// Create a new board
pub async fn create_board(
    pool: &DbPool,
    req: CreateBoardRequest,
) -> Result<Board, AppError> {
    // Validate title
    if req.title.trim().is_empty() {
        return Err(AppError::ValidationError("Title is required".to_string()));
    }

    let board = sqlx::query_as::<_, Board>(
        "INSERT INTO board (title, description) 
         VALUES ($1, $2) 
         RETURNING id, title, description, owner_id, members, created_at, updated_at"
    )
    .bind(&req.title)
    .bind(&req.description)
    .fetch_one(pool)
    .await?;

    Ok(board)
}

/// Update a board
pub async fn update_board(
    pool: &DbPool,
    id: i32,
    req: UpdateBoardRequest,
) -> Result<Board, AppError> {
    // Build dynamic update query
    let mut query = String::from("UPDATE board SET ");
    let mut updates = Vec::new();
    let mut param_count = 1;

    if let Some(ref title) = req.title {
        if title.trim().is_empty() {
            return Err(AppError::ValidationError("Title cannot be empty".to_string()));
        }
        updates.push(format!("title = ${}", param_count));
        param_count += 1;
    }

    if req.description.is_some() {
        updates.push(format!("description = ${}", param_count));
        param_count += 1;
    }

    if updates.is_empty() {
        return Err(AppError::ValidationError("No fields to update".to_string()));
    }

    updates.push("updated_at = NOW()".to_string());
    query.push_str(&updates.join(", "));
    query.push_str(&format!(" WHERE id = ${} RETURNING id, title, description, owner_id, members, created_at, updated_at", param_count));

    // Build and execute query
    let mut query_builder = sqlx::query_as::<_, Board>(&query);

    if let Some(title) = req.title {
        query_builder = query_builder.bind(title);
    }
    if let Some(description) = req.description {
        query_builder = query_builder.bind(description);
    }
    query_builder = query_builder.bind(id);

    let board = query_builder
        .fetch_one(pool)
        .await?;

    Ok(board)
}

/// Delete a board
pub async fn delete_board(pool: &DbPool, id: i32) -> Result<(), AppError> {
    let result = sqlx::query("DELETE FROM board WHERE id = $1")
        .bind(id)
        .execute(pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound("Board not found".to_string()));
    }

    Ok(())
}
