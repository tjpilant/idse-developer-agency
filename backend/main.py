"""
IDSE Developer Agency - Multi-Protocol Backend

Provides dual protocol support:
- AG-UI protocol endpoints at /admin/ag-ui/* for admin interfaces
- CopilotKit protocol endpoints at /api/copilot/* for embeddable chat widgets

Designed for deployment on Agencii Cloud with widget embedding on external sites.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title="IDSE Developer Agency API",
    description="Multi-protocol backend for AI agent chat widgets and admin interfaces",
    version="1.0.0",
)

# CORS middleware for widget embedding on external sites
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Configure specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "IDSE Developer Agency",
        "protocols": ["AG-UI", "CopilotKit"],
        "endpoints": {
            "admin": "/admin/ag-ui",
            "widget": "/api/copilot",
            "docs": "/docs",
        },
    }


@app.get("/health")
async def health_check():
    """Detailed health check for monitoring"""
    return {
        "status": "healthy",
        "service": "IDSE Developer Agency Backend",
        "version": "1.0.0",
    }


# Import and register route modules
# Note: These imports are deferred to avoid circular dependencies
def register_routes():
    """Register all API route modules."""
    try:
        import os
        from backend.routes import (
            agui_realtime,
            agui_routes,
            copilot_routes,
            puck_routes,
            git_routes,
            status_routes,
            status_pages,
        )

        status_enabled = (
            os.environ.get("STATUS_BROWSER_ENABLED", "true").lower() == "true"
        )

        app.include_router(
            agui_routes.router, prefix="/admin/ag-ui", tags=["AG-UI Admin"]
        )
        app.include_router(
            copilot_routes.router, prefix="/api/copilot", tags=["CopilotKit Widget"]
        )
        app.include_router(
            puck_routes.router, prefix="/api/pages", tags=["Puck Pages"]
        )
        app.include_router(
            git_routes.router, tags=["Git Integration"]
        )
        app.include_router(agui_realtime.router, tags=["AG-UI Realtime"])

        if status_enabled:
            app.include_router(status_routes.router, tags=["Status Browser"])
            app.include_router(status_pages.router, tags=["Status Pages"])
            logger.info("✅ Status browser routes enabled")
        else:
            logger.info(
                "ℹ️ Status browser routes disabled via STATUS_BROWSER_ENABLED=false"
            )

        logger.info(
            "✅ Routes registered: %s",
            [
                r.prefix
                for r in app.router.routes
                if hasattr(r, "prefix") and r.prefix is not None
            ],
        )
    except Exception as e:
        logger.error("❌ Failed to register routes: %s", e)
        raise

        # AG-UI routes for admin interface
        app.include_router(
            agui_routes.router,
            prefix="/admin/ag-ui",
            tags=["AG-UI Admin"],
        )

        # CopilotKit routes for embeddable chat widgets
        app.include_router(
            copilot_routes.router,
            prefix="/api/copilot",
            tags=["CopilotKit Widget"],
        )

        # Puck page builder routes
        app.include_router(
            puck_routes.router,
            prefix="/api/pages",
            tags=["Puck Pages"],
        )

        # Public AG-UI stream/inbound endpoints for the widget shell
        app.include_router(
            agui_realtime.router,
            tags=["AG-UI Realtime"],
        )

        # Status Browser routes (feature-flagged)
        status_enabled = os.environ.get("STATUS_BROWSER_ENABLED", "true").lower() == "true"
        if status_enabled:
            app.include_router(
                status_routes.router,
                tags=["Status Browser"],
            )
            app.include_router(
                status_pages.router,
                tags=["Status Pages"],
            )
            logger.info("✅ Status Browser routes enabled")
        else:
            logger.info("⚪ Status Browser routes disabled by STATUS_BROWSER_ENABLED")

        logger.info("✅ All routes registered successfully")
    except Exception as e:
        logger.error(f"❌ Failed to register routes: {e}")
        raise


# Register routes on startup
@app.on_event("startup")
async def startup_event():
    """Application startup event handler"""
    logger.info("🚀 Starting IDSE Developer Agency Backend...")
    register_routes()
    logger.info("✅ Backend ready for requests")


@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown event handler"""
    logger.info("🛑 Shutting down IDSE Developer Agency Backend...")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )
