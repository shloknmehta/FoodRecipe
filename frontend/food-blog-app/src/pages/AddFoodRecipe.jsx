import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AddFoodRecipe() {
  const [recipeData, setRecipeData] = useState({
    title: "",
    time: "",
    ingredients: [],
    instructions: "",
    coverImage: null
  });
  const [coverPreview, setCoverPreview] = useState("");
  const navigate = useNavigate();

  // Handle input changes
  const onHandleChange = (e) => {
    let val;
    if (e.target.name === "ingredients") {
      val = e.target.value.split(",").map(i => i.trim()); // ensure array of strings
    } else if (e.target.name === "coverImage") {
      val = e.target.files[0];
      setCoverPreview(URL.createObjectURL(val)); // optional preview
    } else {
      val = e.target.value;
    }

    setRecipeData(prev => ({ ...prev, [e.target.name]: val }));
  };

  // Submit new recipe
  const onHandleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    for (const key in recipeData) {
      if (recipeData[key] !== null) {
        formData.append(
          key,
          key === "ingredients" ? JSON.stringify(recipeData[key]) : recipeData[key]
        );
      }
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/recipe`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'authorization': 'bearer ' + localStorage.getItem("token")
        }
      });
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Error adding recipe:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to add recipe.");
    }
  };

  return (
    <div className='container'>
      <form className='form' onSubmit={onHandleSubmit}>
        <div className='form-control'>
          <label>Title</label>
          <input
            type="text"
            className='input'
            name="title"
            value={recipeData.title}
            onChange={onHandleChange}
            required
          />
        </div>

        <div className='form-control'>
          <label>Time</label>
          <input
            type="text"
            className='input'
            name="time"
            value={recipeData.time}
            onChange={onHandleChange}
            required
          />
        </div>

        <div className='form-control'>
          <label>Ingredients</label>
          <textarea
            className='input-textarea'
            name="ingredients"
            rows="5"
            value={recipeData.ingredients.join(", ")}
            onChange={onHandleChange}
            required
          ></textarea>
        </div>

        <div className='form-control'>
          <label>Instructions</label>
          <textarea
            className='input-textarea'
            name="instructions"
            rows="5"
            value={recipeData.instructions}
            onChange={onHandleChange}
            required
          ></textarea>
        </div>

        <div className='form-control'>
          <label>Recipe Image</label>
          <input
            type="file"
            className='input'
            name="coverImage"
            onChange={onHandleChange}
          />
          {coverPreview && (
            <div style={{ marginTop: '10px' }}>
              <img
                src={coverPreview}
                alt="Preview"
                style={{ width: '200px', height: 'auto', borderRadius: '5px' }}
              />
            </div>
          )}
        </div>

        <button type="submit">Add Recipe</button>
      </form>
    </div>
  );
}
