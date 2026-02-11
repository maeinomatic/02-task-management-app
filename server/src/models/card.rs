use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use utoipa::ToSchema;

/// Card model (matches database schema)
#[derive(Debug, Clone, Serialize, Deserialize, FromRow, ToSchema)]
pub struct Card {
    pub id: i32,
    pub title: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(rename = "listId")]
    pub list_id: i32,
    pub position: i32,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(rename = "assigneeId")]
    pub assignee_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(rename = "dueDate")]
    pub due_date: Option<DateTime<Utc>>,
    #[serde(default)]
    pub labels: Vec<String>,
    #[serde(rename = "createdAt")]
    pub created_at: DateTime<Utc>,
    #[serde(rename = "updatedAt")]
    pub updated_at: DateTime<Utc>,
}

/// Request body for creating a card
#[derive(Debug, Deserialize, ToSchema)]
pub struct CreateCardRequest {
    pub title: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(rename = "listId")]
    pub list_id: i32,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(rename = "assigneeId")]
    pub assignee_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(rename = "dueDate")]
    pub due_date: Option<DateTime<Utc>>,
    #[serde(default)]
    pub labels: Vec<String>,
}

/// Request body for updating a card
#[derive(Debug, Deserialize, ToSchema)]
pub struct UpdateCardRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(rename = "listId")]
    pub list_id: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub position: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(rename = "assigneeId")]
    pub assignee_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(rename = "dueDate")]
    pub due_date: Option<DateTime<Utc>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub labels: Option<Vec<String>>,
}
