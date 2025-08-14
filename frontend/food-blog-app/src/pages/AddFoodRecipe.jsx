import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AddFoodRecipe() {
  const [recipeData, setRecipeData] = useState({})
  const navigate = useNavigate()

  const onHandleChange = (e) => {
    let val =
      e.target.name === "ingredients"
        ? e.target.value.split(",")
        : e.target.name === "coverImage"
          ? e.target.files[0]
          : e.target.value

    setRecipeData(prev => ({ ...prev, [e.target.name]: val }))
  }

  const onHandleSubmit = async (e) => {
    e.preventDefault()

    const formData = new FormData()
    for (const key in recipeData) {
      formData.append(key, key === "ingredients" ? JSON.stringify(recipeData[key]) : recipeData[key])
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/recipe`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'authorization': 'bearer ' + localStorage.getItem("token")
        }
      })
      navigate("/")
    } catch (error) {
      console.error("Error adding recipe:", error.response?.data || error.message)
      alert(error.response?.data?.message || "Failed to add recipe.")
    }
  }

  return (
    <div className='container'>
      <form className='form' onSubmit={onHandleSubmit}>
        <div className='form-control'>
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            placeholder="Enter recipe title"
            className='input'
            onChange={onHandleChange}
            required
          />
        </div>

        <div className='form-control'>
          <label htmlFor="time">Time</label>
          <input
            type="text"
            id="time"
            name="time"
            placeholder="Enter cooking time (e.g., 30 mins)"
            className='input'
            onChange={onHandleChange}
            required
          />
        </div>

        <div className='form-control'>
          <label htmlFor="ingredients">Ingredients</label>
          <textarea
            id="ingredients"
            name="ingredients"
            placeholder="Enter ingredients separated by commas"
            rows="5"
            className='input-textarea'
            onChange={onHandleChange}
            required
          />
        </div>

        <div className='form-control'>
          <label htmlFor="instructions">Instructions</label>
          <textarea
            id="instructions"
            name="instructions"
            placeholder="Enter step-by-step instructions"
            rows="5"
            className='input-textarea'
            onChange={onHandleChange}
            required
          />
        </div>

        <div className='form-control'>
          <label htmlFor="coverImage">Recipe Image</label>
          <input
            type="file"
            id="coverImage"
            name="coverImage"
            className='input'
            onChange={onHandleChange}
          />
        </div>

        <button type="submit">Add Recipe</button>
      </form>
    </div>
  )
}
