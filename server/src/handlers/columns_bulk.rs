use crate::db::DbPool;
use crate::errors::AppError;
use crate::models::BoardColumn;
use serde::Deserialize;
use utoipa::ToSchema;

#[derive(Debug, Deserialize, ToSchema)]
pub struct BulkColumnOrderUpdate {
    #[serde(rename = "boardId")]
    pub board_id: i32,
    pub columns: Vec<ColumnOrderUpdate>,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct ColumnOrderUpdate {
    pub id: i32,
    pub position: i32,
}

/// Bulk update column order for a board
pub async fn bulk_update_column_order(pool: &DbPool, req: BulkColumnOrderUpdate) -> Result<Vec<BoardColumn>, AppError> {
    if req.columns.is_empty() {
        return Err(AppError::ValidationError("At least one column is required".to_string()));
    }

    let mut tx = pool.begin().await?;

    let existing_ids: Vec<i32> = sqlx::query_scalar(
        "SELECT id FROM board_column WHERE board_id = $1"
    )
    .bind(req.board_id)
    .fetch_all(&mut *tx)
    .await?;

    if existing_ids.len() != req.columns.len() {
        return Err(AppError::ValidationError(
            "Columns payload must include all columns for the board".to_string(),
        ));
    }

    let mut existing_ids_sorted = existing_ids;
    existing_ids_sorted.sort_unstable();

    let mut payload_ids: Vec<i32> = req.columns.iter().map(|c| c.id).collect();
    payload_ids.sort_unstable();

    if existing_ids_sorted != payload_ids {
        return Err(AppError::ValidationError(
            "Columns payload does not match board columns".to_string(),
        ));
    }

    for col in &req.columns {
        sqlx::query("UPDATE board_column SET position = $1, updated_at = NOW() WHERE id = $2 AND board_id = $3")
            .bind(col.position)
            .bind(col.id)
            .bind(req.board_id)
            .execute(&mut *tx)
            .await?;
    }
    tx.commit().await?;
    // Return updated columns
    let updated = sqlx::query_as::<_, BoardColumn>(
        "SELECT id, title, board_id, position, created_at, updated_at FROM board_column WHERE board_id = $1 ORDER BY position ASC"
    )
    .bind(req.board_id)
    .fetch_all(pool)
    .await?;

    Ok(updated)
}
