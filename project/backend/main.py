from fastapi import FastAPI
from backend.routers import ingredients

app = FastAPI(title="Groceries & Recipes API")

app.include_router(ingredients.router, prefix="/api", tags=["ingredients"])