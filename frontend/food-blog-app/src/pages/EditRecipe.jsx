import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://foodrecipe-sab6.onrender.com/api";

export default function EditRecipe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipeData, setRecipeData] = useState({
    title: "",
    time: "",
    ingredients: [],
    instructions: "",
    coverImage: null
  });

  useEffect(() => {
    axios.get(`${API_BASE_URL}/recipe/${id}`)
      .then(res => {
        setRecipeData({
          title: res.data.title || "",
          time: res.data.time || "",
          ingredients: res.data.ingredients || [],
          instructions: res.data.instructions || "",
          coverImage: null
        });
      })
      .catch(err => console.error("Error fetching recipe:", err));
  }, [id]);

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
      await axios.put(`${API_BASE_URL}/recipe/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate("/myRecipe");
    } catch (err) {
      console.error("Error updating recipe:", err.response?.data || err.message);
    }
  };

  return (
    <div className='container'>
      <form className='form' onSubmit={onHandleSubmit}>
        <div className='form-control'>
          <label htmlFor="title">Title</label>
          <input type="text" id="title" className='input' name="title" value={recipeData.title} onChange={onHandleChange} required />
        </div>
        <div className='form-control'>
          <label htmlFor="time">Time</label>
          <input type="text" id="time" className='input' name="time" value={recipeData.time} onChange={onHandleChange} required />
        </div>
        <div className='form-control'>
          <label htmlFor="ingredients">Ingredients</label>
          <textarea id="ingredients" className='input-textarea' name="ingredients" rows="5" value={recipeData.ingredients.join(",")} onChange={onHandleChange} required></textarea>
        </div>
        <div className='form-control'>
          <label htmlFor="instructions">Instructions</label>
          <textarea id="instructions" className='input-textarea' name="instructions" rows="5" value={recipeData.instructions} onChange={onHandleChange} required></textarea>
        </div>
        <div className='form-control'>
          <label htmlFor="coverImage">Recipe Image</label>
          <input type="file" className='input' name="coverImage" onChange={onHandleChange} />
        </div>
        <button type="submit">Update Recipe</button>
      </form>
    </div>
  );
}
