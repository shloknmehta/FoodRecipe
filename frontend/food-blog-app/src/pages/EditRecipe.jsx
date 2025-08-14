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
        const token = localStorage.getItem("token");

        if (!token) {
            alert("You must be logged in to edit a recipe.");
            return;
        }

        const formData = new FormData();
        for (const key in recipeData) {
            if (recipeData[key] !== null) {
                formData.append(key, key === "ingredients" ? JSON.stringify(recipeData[key]) : recipeData[key]);
            }
        }

        try {
            await axios.put(`${API_BASE_URL}/recipe/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'authorization': 'bearer ' + token
                }
            });
            navigate("/myRecipe");
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
                        value={recipeData.ingredients.join(",")}
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
                </div>
                <button type="submit">Update Recipe</button>
            </form>
        </div>
    );
}
