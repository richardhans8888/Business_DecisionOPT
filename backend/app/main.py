from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.routers import optimization, simulation, evaluation
from .api.routers import ingestion

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(optimization.router, prefix="/api/optimization", tags=["optimization"])
app.include_router(simulation.router, prefix="/api/simulation", tags=["simulation"])
app.include_router(evaluation.router, prefix="/api/evaluation", tags=["evaluation"])
app.include_router(ingestion.router, prefix="/api/ingestion", tags=["ingestion"])
