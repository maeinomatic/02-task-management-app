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
    let mut tx = pool.begin().await?;

    // Check if the board exists
    let board_exists: bool = sqlx::query_scalar(
        "SELECT EXISTS(SELECT 1 FROM board WHERE id = $1)"
    )
    .bind(req.board_id)
    .fetch_one(&mut *tx)
    .await?;

    if !board_exists {
        return Err(AppError::NotFound(format!("Board with id {} not found", req.board_id)));
    }

    let existing_ids: Vec<i32> = sqlx::query_scalar(
        "SELECT id FROM board_column WHERE board_id = $1"
    )
    .bind(req.board_id)
    .fetch_all(&mut *tx)
    .await?;

    // Allow empty column arrays when board has no columns
    if existing_ids.is_empty() && req.columns.is_empty() {
        // Return empty result for boards with no columns
        tx.commit().await?;
        return Ok(vec![]);
    }

    if req.columns.is_empty() {
        return Err(AppError::ValidationError("At least one column is required".to_string()));
    }

    // Validate that all positions are non-negative
    if req.columns.iter().any(|c| c.position < 0) {
        return Err(AppError::ValidationError(
            "Position values must be non-negative".to_string(),
        ));
    }

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

    // Perform bulk update in a single statement to reduce round-trips and lock time
    let mut sql = String::from(
        "UPDATE board_column AS bc \
         SET position = v.position, updated_at = NOW() \
         FROM (VALUES ",
    );

    // Build the VALUES list: ($1, $2), ($3, $4), ...
    for (i, _col) in req.columns.iter().enumerate() {
        if i > 0 {
            sql.push_str(", ");
        }
        let base = i * 2 + 1;
        sql.push_str(&format!("(${}, ${})", base, base + 1));
    }

    // Final parameter is board_id
    let board_id_param = req.columns.len() * 2 + 1;
    sql.push_str(&format!(
        ") AS v(id, position) WHERE bc.board_id = ${} AND bc.id = v.id",
        board_id_param
    ));

    let mut query = sqlx::query(&sql);
    for col in &req.columns {
        query = query.bind(col.id).bind(col.position);
    }
    query = query.bind(req.board_id);
    let result = query.execute(&mut *tx).await?;
    
    // Verify that all requested columns were updated
    let expected_rows = req.columns.len() as u64;
    if result.rows_affected() != expected_rows {
        // At least one requested column was not updated (likely deleted concurrently).
        // Treat this as an error so we don't return a partially-updated set.
        return Err(sqlx::Error::RowNotFound.into());
    }

    // Return updated columns within the transaction to avoid race conditions
    let updated = sqlx::query_as::<_, BoardColumn>(
        "SELECT id, title, board_id, position, created_at, updated_at FROM board_column WHERE board_id = $1 ORDER BY position ASC"
    )
    .bind(req.board_id)
    .fetch_all(&mut *tx)
    .await?;

    tx.commit().await?;

    Ok(updated)
}
