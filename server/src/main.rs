mod db;
mod errors;
mod models;
mod handlers;
mod routes;

use axum::{
    routing::get,
    Router,
    Json,
};
use serde_json::{json, Value};
use tower_http::cors::{CorsLayer, Any};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

#[tokio::main]
async fn main() {
    // Load environment variables
    dotenvy::dotenv().ok();

    // Initialize tracing
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "info".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    tracing::info!("Starting Task Management API server");

    // Initialize database connection pool
    let db_pool = db::create_pool()
        .await
        .expect("Failed to create database pool");

    // Test database connection
    db::test_connection(&db_pool)
        .await
        .expect("Failed to connect to database");

    // Configure CORS (allow all origins to match Node.js setup)
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Create OpenAPI documentation
    #[derive(OpenApi)]
    #[openapi(
        info(
            title = "Task Management API",
            version = "1.0.0",
            description = "OpenAPI spec for the Task Management app (Rust/Axum)"
        ),
        paths(
            health_check,
            routes::boards::get_boards,
            routes::boards::get_board,
            routes::boards::create_board,
            routes::boards::update_board,
            routes::boards::delete_board,
            routes::cards::get_cards,
            routes::cards::get_card,
            routes::cards::create_card,
            routes::cards::update_card,
            routes::cards::delete_card,
            routes::columns::get_lists,
            routes::columns::get_list,
            routes::columns::create_list,
            routes::columns::bulk_update_column_order,
            routes::columns::update_list,
            routes::columns::delete_list,
        ),
        components(schemas(
            models::Board,
            models::Card,
            models::BoardColumn,
            models::CreateBoardRequest,
            models::UpdateBoardRequest,
            models::CreateCardRequest,
            models::UpdateCardRequest,
            models::CreateColumnRequest,
            models::UpdateColumnRequest,
            handlers::columns_bulk::BulkColumnOrderUpdate,
            handlers::columns_bulk::ColumnOrderUpdate,
            models::ApiResponse<models::Board>,
            models::ApiResponse<Vec<models::Board>>,
            models::ApiResponse<models::Card>,
            models::ApiResponse<Vec<models::Card>>,
            models::ApiResponse<models::BoardColumn>,
            models::ApiResponse<Vec<models::BoardColumn>>,
        ))
    )]
    struct ApiDoc;

    // Build app with all routes
    let app = Router::new()
        .route("/api/health", get(health_check))
        .nest("/api/boards", routes::boards::router())
        .nest("/api/cards", routes::cards::router())
        .nest("/api/lists", routes::columns::router())
        .merge(SwaggerUi::new("/swagger").url("/api/openapi.json", ApiDoc::openapi()))
        .with_state(db_pool)
        .layer(cors);

    // Get port from environment or default to 5000
    let port = std::env::var("PORT")
        .unwrap_or_else(|_| "5000".to_string())
        .parse::<u16>()
        .expect("PORT must be a valid number");

    let addr = format!("0.0.0.0:{}", port);
    let listener = tokio::net::TcpListener::bind(&addr)
        .await
        .expect("Failed to bind server");

    tracing::info!("Server running on http://{}", addr);
    tracing::info!("Swagger UI available at http://localhost:{}/swagger", port);
    tracing::info!("OpenAPI spec available at http://localhost:{}/api/openapi.json", port);

    // Start server with graceful shutdown
    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await
        .expect("Server error");
}

/// Health check endpoint
#[utoipa::path(
    get,
    path = "/api/health",
    tag = "System",
    responses(
        (status = 200, description = "Service is healthy", body = Value)
    )
)]
async fn health_check() -> Json<Value> {
    Json(json!({ "status": "ok" }))
}

/// Graceful shutdown signal handler
async fn shutdown_signal() {
    let ctrl_c = async {
        tokio::signal::ctrl_c()
            .await
            .expect("Failed to install Ctrl+C handler");
    };

    #[cfg(unix)]
    let terminate = async {
        tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
            .expect("Failed to install signal handler")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => { tracing::info!("Received Ctrl+C signal"); },
        _ = terminate => { tracing::info!("Received terminate signal"); },
    }

    tracing::info!("Shutting down gracefully");
}
