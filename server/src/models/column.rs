use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use utoipa::ToSchema;

/// BoardColumn model (matches database schema)
#[derive(Debug, Clone, Serialize, Deserialize, FromRow, ToSchema)]
pub struct BoardColumn {
    pub id: i32,
    pub title: String,
    #[serde(rename = "boardId")]
    #[sqlx(rename = "boardid")]
    pub board_id: i32,
    pub position: i32,
    #[serde(rename = "createdAt")]
    #[sqlx(rename = "createdat")]
    pub created_at: DateTime<Utc>,
    #[serde(rename = "updatedAt")]
    #[sqlx(rename = "updatedat")]
    pub updated_at: DateTime<Utc>,
}
