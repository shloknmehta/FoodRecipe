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
            formData.append(key, recipeData[key])
        }

        await axios.post("http://localhost:5000/recipe", formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'authorization': 'bearer ' + localStorage.getItem("token")
            }
        })

        navigate("/")
    }

    return (
        <div className='container'>
            <form className='form' onSubmit={onHandleSubmit}>
                <div className='form-control'>
                    <label>Title</label>
                    <input type="text" className='input' name="title" onChange={onHandleChange} />
                </div>
                <div className='form-control'>
                    <label>Time</label>
                    <input type="text" className='input' name="time" onChange={onHandleChange} />
                </div>
                <div className='form-control'>
                    <label>Ingredients</label>
                    <textarea className='input-textarea' name="ingredients" rows="5" onChange={onHandleChange}></textarea>
                </div>
                <div className='form-control'>
                    <label>Instructions</label>
                    <textarea className='input-textarea' name="instructions" rows="5" onChange={onHandleChange}></textarea>
                </div>
                <div className='form-control'>
                    <label>Recipe Image</label>
                    <input type="file" className='input' name="coverImage" onChange={onHandleChange} />
                </div>
                <button type="submit">Add Recipe</button>
            </form>
        </div>
    )
}
