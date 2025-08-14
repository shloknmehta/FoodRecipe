import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL;

export default function EditRecipe() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [time, setTime] = useState("");
    const [ingredients, setIngredients] = useState([]);
    const [instructions, setInstructions] = useState("");
    const [coverImage, setCoverImage] = useState(null);

    useEffect(() => {
        axios.get(`${API_BASE_URL}/recipe/${id}`)
            .then(res => {
                setTitle(res.data.title);
                setTime(res.data.time);
                setIngredients(res.data.ingredients);
                setInstructions(res.data.instructions);
            })
            .catch(err => console.error("Error fetching recipe:", err));
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        if (!token) {
            alert("You must be logged in to edit a recipe.");
            return;
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("time", time);
        formData.append("ingredients", JSON.stringify(ingredients));
        formData.append("instructions", instructions);
        if (coverImage) formData.append("coverImage", coverImage);

        try {
            await axios.put(`${API_BASE_URL}/recipe/${id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });
            navigate("/myRecipe");
        } catch (err) {
            console.error("Error updating recipe:", err.response?.data || err.message);
            alert(err.response?.data?.message || "Failed to update recipe.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form">
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <input type="text" value={time} onChange={(e) => setTime(e.target.value)} required />
            <textarea value={ingredients.join(",")} onChange={(e) => setIngredients(e.target.value.split(","))} required />
            <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} required />
            <input type="file" onChange={(e) => setCoverImage(e.target.files[0])} />
            <button type="submit">Update Recipe</button>
        </form>
    );
}
