import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL;

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
  const [coverPreview, setCoverPreview] = useState("");

  // Fetch recipe data
  useEffect(() => {
    axios.get(`${API_BASE_URL}/recipe/${id}`)
      .then(res => {
        const ing = res.data.ingredients?.map(i => typeof i === 'string' ? i : i.name) || [];
        setRecipeData({
          title: res.data.title || "",
          time: res.data.time || "",
          ingredients: ing,
          instructions: res.data.instructions || "",
          coverImage: null
        });
        setCoverPreview(res.data.coverImageUrl || ""); // optional: show existing image
      })
      .catch(err => console.error("Error fetching recipe:", err));
  }, [id]);

  // Handle input changes
  const onHandleChange = (e) => {
    let val;
    if (e.target.name === "ingredients") {
      val = e.target.value.split(",").map(i => i.trim());
    } else if (e.target.name === "coverImage") {
      val = e.target.files[0];
      setCoverPreview(URL.createObjectURL(val)); // show preview
    } else {
      val = e.target.value;
    }
    setRecipeData(prev => ({ ...prev, [e.target.name]: val }));
  };

  // Submit updated recipe
  const onHandleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      alert("You must be logged in to edit a recipe.");
      return;
    }

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
      await axios.put(`${API_BASE_URL}/recipe/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'authorization': 'bearer ' + token
        }
      });
      navigate("/myRecipe", { replace: true });
    } catch (err) {
      console.error("Error updating recipe:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to update recipe.");
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

        <button type="submit">Update Recipe</button>
      </form>
    </div>
  );
}
