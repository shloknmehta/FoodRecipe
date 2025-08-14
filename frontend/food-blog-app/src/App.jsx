import React from 'react';
import './App.css';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from './pages/Home';
import MainNavigation from './components/MainNavigation';
import axios from 'axios';
import AddFoodRecipe from './pages/AddFoodRecipe';
import EditRecipe from './pages/EditRecipe';
import RecipeDetails from './pages/RecipeDetails';

// Use deployed backend or localhost fallback
const API_URL = process.env.REACT_APP_API_URL || "https://foodrecipe-sab6.onrender.com";

// ----------- Loader Functions ----------- //

// Fetch all recipes
const getAllRecipes = async () => {
  try {
    const res = await axios.get(`${API_URL}/recipe`);
    return res.data;
  } catch (err) {
    console.error("Error fetching all recipes:", err.response?.data || err.message);
    return [];
  }
};

// Fetch recipes created by logged-in user
const getMyRecipes = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user._id) {
      console.warn("No logged in user found in localStorage");
      return [];
    }
    const allRecipes = await getAllRecipes();
    return allRecipes.filter(item => item.createdBy === user._id);
  } catch (err) {
    console.error("Error fetching my recipes:", err.response?.data || err.message);
    return [];
  }
};

// Fetch favorite recipes from localStorage
const getFavRecipes = () => {
  try {
    return JSON.parse(localStorage.getItem("fav")) || [];
  } catch (err) {
    console.error("Error reading fav recipes:", err.message);
    return [];
  }
};

// Fetch single recipe with creator's email
const getRecipe = async ({ params }) => {
  try {
    const recipeRes = await axios.get(`${API_URL}/recipe/${params.id}`);
    let recipe = recipeRes.data;

    if (recipe.createdBy && typeof recipe.createdBy === 'string' && recipe.createdBy.length === 24) {
      try {
        const userRes = await axios.get(`${API_URL}/user/${recipe.createdBy}`);
        recipe = { ...recipe, email: userRes.data.email };
      } catch (userErr) {
        console.warn("Unable to fetch creator's email:", userErr.response?.data || userErr.message);
      }
    }
    return recipe;
  } catch (err) {
    console.error("Error fetching recipe:", err.response?.data || err.message);
    throw new Response("Recipe not found", { status: 404 });
  }
};

// ----------- Simple Error UI ----------- //
function ErrorPage({ error }) {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Oops! Something went wrong.</h1>
      <p>{error?.statusText || error?.message || "An unexpected error occurred."}</p>
      <a href="/" style={{ color: "#007bff" }}>Go back home</a>
    </div>
  );
}

// ----------- Router Setup ----------- //
const router = createBrowserRouter([
  {
    path: "/",
    element: <MainNavigation />,
    errorElement: <ErrorPage />, // <-- added to handle loader errors
    children: [
      { path: "/", element: <Home />, loader: getAllRecipes, errorElement: <ErrorPage /> },
      { path: "/myRecipe", element: <Home />, loader: getMyRecipes, errorElement: <ErrorPage /> },
      { path: "/favRecipe", element: <Home />, loader: getFavRecipes, errorElement: <ErrorPage /> },
      { path: "/addRecipe", element: <AddFoodRecipe /> },
      { path: "/editRecipe/:id", element: <EditRecipe /> },
      { path: "/recipe/:id", element: <RecipeDetails />, loader: getRecipe, errorElement: <ErrorPage /> }
    ]
  }
]);

export default function App() {
  return <RouterProvider router={router} />;
}
