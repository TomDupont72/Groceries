from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from pydantic import BaseModel

from backend.core.database import get_db
from backend.models import Ingredient

router = APIRouter()


class IngredientCreate(BaseModel):
    name: str


@router.post("/ingredients")
def create_ingredient(payload: IngredientCreate, db: Session = Depends(get_db)):
    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Ingredient name is empty")

    existing = db.scalar(select(Ingredient).where(Ingredient.name == name))
    if existing:
        return existing

    ingredient = Ingredient(name=name)
    db.add(ingredient)
    db.commit()
    db.refresh(ingredient)

    return ingredient
