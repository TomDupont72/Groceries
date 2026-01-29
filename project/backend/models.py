from __future__ import annotations

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.core.database import Base


class Ingredient(Base):
    __tablename__ = "ingredients"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False, unique=True)

    recipe_links: Mapped[list[RecipeIngredient]] = relationship(
        back_populates="ingredient",
        cascade="all, delete-orphan",
    )


class Recipe(Base):
    __tablename__ = "recipes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(160), nullable=False)
    instructions: Mapped[str | None] = mapped_column(Text, nullable=True)

    ingredients: Mapped[list[RecipeIngredient]] = relationship(
        back_populates="recipe",
        cascade="all, delete-orphan",
    )


class RecipeIngredient(Base):
    __tablename__ = "recipe_ingredients"
    __table_args__ = (
        UniqueConstraint("recipe_id", "ingredient_id", name="uq_recipe_ingredient"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    recipe_id: Mapped[int] = mapped_column(ForeignKey("recipes.id"), nullable=False)
    ingredient_id: Mapped[int] = mapped_column(ForeignKey("ingredients.id"), nullable=False)

    quantity: Mapped[str | None] = mapped_column(String(60), nullable=True)
    unit: Mapped[str | None] = mapped_column(String(30), nullable=True)

    recipe: Mapped[Recipe] = relationship(back_populates="ingredients")
    ingredient: Mapped[Ingredient] = relationship(back_populates="recipe_links")


class GroceryItem(Base):
    __tablename__ = "grocery_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    # If you add an ingredient from a recipe, we link it.
    ingredient_id: Mapped[int | None] = mapped_column(
        ForeignKey("ingredients.id"), nullable=True
    )

    # Always keep a display name (even if ingredient is deleted later).
    name: Mapped[str] = mapped_column(String(120), nullable=False)

    quantity: Mapped[str | None] = mapped_column(String(60), nullable=True)
    unit: Mapped[str | None] = mapped_column(String(30), nullable=True)

    category: Mapped[str | None] = mapped_column(String(60), nullable=True)
    is_checked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    ingredient: Mapped[Ingredient | None] = relationship()
