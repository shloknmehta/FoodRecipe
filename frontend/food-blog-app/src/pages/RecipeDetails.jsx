import React from 'react';
import profileImg from '../assets/profile.png';
import { useLoaderData } from 'react-router-dom';

const API_BASE_URL = "https://foodrecipe-sab6.onrender.com";

export default function RecipeDetails() {
  const recipe = useLoaderData();

  // Handle case where recipe might not be loaded yet
  if (!recipe) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>Loading recipe...</h2>
      </div>
    );
  }

  // Ensure ingredients is always an array
  const ingredientsList = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];

  return (
    <div className='outer-container'>
      <div className='profile'>
        <img src={profileImg} width="50" height="50" alt="profile" />
        <h5>{recipe.email || "Unknown Author"}</h5>
      </div>

      <h3 className='title'>{recipe.title || "Untitled Recipe"}</h3>

      {recipe.coverImage ? (
        <img
          src={`${API_BASE_URL}/images/${recipe.coverImage}`}
          width="220"
          height="200"
          alt={recipe.title || "Recipe Image"}
        />
      ) : (
        <img src={profileImg} width="220" height="200" alt="Placeholder" />
      )}

      <div className='recipe-details'>
        <div className='ingredients'>
          <h4>Ingredients</h4>
          {ingredientsList.length > 0 ? (
            <ul>
              {ingredientsList.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>No ingredients available.</p>
          )}
        </div>

        <div className='instructions'>
          <h4>Instructions</h4>
          <span>{recipe.instructions || "No instructions provided."}</span>
        </div>
      </div>
    </div>
  );
}
