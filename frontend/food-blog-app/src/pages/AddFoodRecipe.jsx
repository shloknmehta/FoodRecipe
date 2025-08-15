import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://foodrecipe-sab6.onrender.com/api";

export default function AddFoodRecipe() {
  const [recipeData, setRecipeData] = useState({});
  const navigate = useNavigate();

  const onHandleChange = (e) => {
    let val =
      e.target.name === "ingredients"
        ? e.target.value.split(",")
        : e.target.name === "coverImage"
          ? e.target.files[0]
          : e.target.value;

    setRecipeData(prev => ({ ...prev, [e.target.name]: val }));
  };

  const onHandleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    for (const key in recipeData) {
      formData.append(key, key === "ingredients" ? JSON.stringify(recipeData[key]) : recipeData[key]);
    }

    try {
      await axios.post(`${API_BASE_URL}/recipe`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      navigate("/");
    } catch (error) {
      console.error("Error adding recipe:", error.response?.data || error.message);
    }
  };

  return (
    <div className='container'>
      <form className='form' onSubmit={onHandleSubmit}>
        <div className='form-control'>
          <label htmlFor="title">Title</label>
          <input type="text" id="title" className='input' name="title" onChange={onHandleChange} placeholder="Recipe title" required />
        </div>
        <div className='form-control'>
          <label htmlFor="time">Time</label>
          <input type="text" id="time" className='input' name="time" onChange={onHandleChange} placeholder="Cooking time" required />
        </div>
        <div className='form-control'>
          <label htmlFor="ingredients">Ingredients</label>
          <textarea id="ingredients" className='input-textarea' name="ingredients" rows="5" onChange={onHandleChange} placeholder="Separate by commas" required></textarea>
        </div>
        <div className='form-control'>
          <label htmlFor="instructions">Instructions</label>
          <textarea id="instructions" className='input-textarea' name="instructions" rows="5" onChange={onHandleChange} placeholder="Cooking steps" required></textarea>
        </div>
        <div className='form-control'>
          <label htmlFor="coverImage">Recipe Image</label>
          <input type="file" className='input' name="coverImage" onChange={onHandleChange} />
        </div>
        <button type="submit">Add Recipe</button>
      </form>
    </div>
  );
}
