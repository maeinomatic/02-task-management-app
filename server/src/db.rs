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
