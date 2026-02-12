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
    pub board_id: i32,
    pub position: i32,
    #[serde(rename = "createdAt")]
    pub created_at: DateTime<Utc>,
    #[serde(rename = "updatedAt")]
    pub updated_at: DateTime<Utc>,
}

/// Request body for creating a column/list
#[derive(Debug, Deserialize, ToSchema)]
pub struct CreateColumnRequest {
    pub title: String,
    #[serde(rename = "boardId")]
    pub board_id: i32,
}

/// Request body for updating a column/list
#[derive(Debug, Deserialize, ToSchema)]
pub struct UpdateColumnRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(rename = "boardId")]
    pub board_id: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub position: Option<i32>,
}
