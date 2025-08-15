import React from 'react';
import { useLoaderData } from 'react-router-dom';

// Fallback for local dev if REACT_APP_API_URL isn't set
const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'https://your-backend-domain.com';

export default function RecipeDetails() {
  const recipe = useLoaderData();

  // Safety check in case loader fails
  if (!recipe) {
    return <p style={{ textAlign: 'center' }}>Recipe not found.</p>;
  }

  return (
    <div className="outer-container">
      <h3 className="title">{recipe.title}</h3>

      {/* Image from GridFS */}
      {recipe.coverImage && (
        <img
          src={`${API_BASE_URL}/images/${recipe.coverImage}`}
          alt={recipe.title || 'Recipe image'}
          style={{
            width: '220px',
            height: '200px',
            objectFit: 'cover',
            borderRadius: '8px',
            marginBottom: '1rem',
          }}
        />
      )}

      <div className="recipe-details">
        <div className="ingredients">
          <h4>Ingredients</h4>
          {Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 ? (
            <ul>
              {recipe.ingredients.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>No ingredients listed.</p>
          )}
        </div>

        <div className="instructions" style={{ marginTop: '1rem' }}>
          <h4>Instructions</h4>
          <span>{recipe.instructions || 'No instructions provided.'}</span>
        </div>
      </div>
    </div>
  );
}
