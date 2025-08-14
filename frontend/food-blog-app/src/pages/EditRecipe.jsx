import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export default function EditRecipe() {
    const [recipeData, setRecipeData] = useState({})
    const navigate = useNavigate()
    const { id } = useParams()

    useEffect(() => {
        const getData = async () => {
            const response = await axios.get(`http://localhost:5000/recipe/${id}`)
            let res = response.data
            setRecipeData({
                title: res.title,
                ingredients: res.ingredients.join(","),
                instructions: res.instructions,
                time: res.time
            })
        }
        getData()
    }, [id])

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

        await axios.put(`http://localhost:5000/recipe/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'authorization': 'bearer ' + localStorage.getItem("token")
            }
        })

        navigate("/myRecipe")
    }

    return (
        <div className='container'>
            <form className='form' onSubmit={onHandleSubmit}>
                <div className='form-control'>
                    <label>Title</label>
                    <input
                        type="text"
                        className='input'
                        name="title"
                        onChange={onHandleChange}
                        value={recipeData.title || ""}
                    />
                </div>
                <div className='form-control'>
                    <label>Time</label>
                    <input
                        type="text"
                        className='input'
                        name="time"
                        onChange={onHandleChange}
                        value={recipeData.time || ""}
                    />
                </div>
                <div className='form-control'>
                    <label>Ingredients</label>
                    <textarea
                        className='input-textarea'
                        name="ingredients"
                        rows="5"
                        onChange={onHandleChange}
                        value={recipeData.ingredients || ""}
                    />
                </div>
                <div className='form-control'>
                    <label>Instructions</label>
                    <textarea
                        className='input-textarea'
                        name="instructions"
                        rows="5"
                        onChange={onHandleChange}
                        value={recipeData.instructions || ""}
                    />
                </div>
                <div className='form-control'>
                    <label>Recipe Image</label>
                    <input
                        type="file"
                        className='input'
                        name="coverImage"
                        onChange={onHandleChange}
                    />
                </div>
                <button type="submit">Edit Recipe</button>
            </form>
        </div>
    )
}
