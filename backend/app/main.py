from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.models.user import User
from app.auth.security import get_password_hash
from app.routers import auth_router, twin_router, simulation_router, detection_router, compliance_router
from app.ml.model_service import ml_service

# Create database tables
Base.metadata.create_all(bind=engine)

# Seed default users
def seed_users():
    db = SessionLocal()
    try:
        defaults = [
            ("admin", "admin@digitaltwin.sec", "AdminPassword123!", "admin"),
            ("analyst", "analyst@digitaltwin.sec", "AnalystPassword123!", "security_analyst"),
            ("auditor", "auditor@digitaltwin.sec", "AuditorPassword123!", "compliance_auditor")
        ]
        for uname, email, pwd, role in defaults:
            if not db.query(User).filter(User.username == uname).first():
                db.add(User(
                    username=uname,
                    email=email,
                    hashed_password=get_password_hash(pwd),
                    role=role
                ))
        db.commit()
    finally:
        db.close()

seed_users()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Production-grade AI-Driven Cyber Digital Twin for Security Threat Simulation and Compliance Optimization."
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits localhost:3000 and dynamic client origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router.router, prefix="/api")
app.include_router(twin_router.router, prefix="/api")
app.include_router(simulation_router.router, prefix="/api")
app.include_router(detection_router.router, prefix="/api")
app.include_router(compliance_router.router, prefix="/api")

@app.get("/")
def health_check():
    return {
        "status": "ONLINE",
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "ai_engine": {
            "status": "READY" if ml_service.metrics["models_ready"] else "INITIALIZING",
            "benchmark_metrics": ml_service.metrics
        },
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)

