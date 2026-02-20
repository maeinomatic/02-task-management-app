use sqlx::{Pool, Postgres};
use std::env;

pub type DbPool = Pool<Postgres>;

/// Initialize database connection pool
pub async fn create_pool() -> Result<DbPool, sqlx::Error> {
    let database_url = env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set in environment");

    tracing::info!("Connecting to database: {}", 
        database_url.split('@').last().unwrap_or("unknown"));

    let pool = sqlx::postgres::PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await?;

    tracing::info!("Database connection pool established");

    Ok(pool)
}

/// Test database connection
pub async fn test_connection(pool: &DbPool) -> Result<(), sqlx::Error> {
    sqlx::query("SELECT 1 as test")
        .fetch_one(pool)
        .await?;
    
    tracing::info!("Database connection test successful");
    Ok(())
}

/// Ensure authentication schema objects exist
pub async fn ensure_auth_schema(pool: &DbPool) -> Result<(), sqlx::Error> {
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            name TEXT NOT NULL,
            avatar_url TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
        "#,
    )
    .execute(pool)
    .await?;

    tracing::info!("Authentication schema ensured");
    Ok(())
}
