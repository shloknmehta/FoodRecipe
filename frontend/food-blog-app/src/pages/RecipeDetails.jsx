import React from 'react';
import { useLoaderData } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://foodrecipe-sab6.onrender.com/api";

export default function RecipeDetails() {
  const recipe = useLoaderData();

  return (
    <div className='outer-container'>
      <h3 className='title'>{recipe.title}</h3>
      {recipe.coverImage && (
        <img
          src={`${API_BASE_URL}/images/${recipe.coverImage}`}
          width="220px"
          height="200px"
          alt={recipe.title}
        />
      )}
      <div className='recipe-details'>
        <div className='ingredients'>
          <h4>Ingredients</h4>
          <ul>{recipe.ingredients.map((item, idx) => (<li key={idx}>{item}</li>))}</ul>
        </div>
        <div className='instructions'>
          <h4>Instructions</h4>
          <span>{recipe.instructions}</span>
        </div>
      </div>
    </div>
  );
}
