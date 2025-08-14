import React from 'react';
import './App.css';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from './pages/Home';
import MainNavigation from './components/MainNavigation';
import axios from 'axios';
import AddFoodRecipe from './pages/AddFoodRecipe';
import EditRecipe from './pages/EditRecipe';
import RecipeDetails from './pages/RecipeDetails';

// Fetch all recipes safely
const getAllRecipes = async () => {
  try {
    const res = await axios.get('http://localhost:5000/recipe');
    return res.data;
  } catch (err) {
    console.error("Error fetching all recipes:", err.response?.data || err.message);
    return [];
  }
};

// Fetch my recipes safely
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

// Get favorite recipes from localStorage
const getFavRecipes = () => {
  try {
    return JSON.parse(localStorage.getItem("fav")) || [];
  } catch (err) {
    console.error("Error reading fav recipes:", err.message);
    return [];
  }
};

// Fetch single recipe with creator's email safely
const getRecipe = async ({ params }) => {
  try {
    const recipeRes = await axios.get(`http://localhost:5000/recipe/${params.id}`);
    let recipe = recipeRes.data;

    // Validate createdBy before making a user request
    if (recipe.createdBy && typeof recipe.createdBy === 'string' && recipe.createdBy.length === 24) {
      try {
        const userRes = await axios.get(`http://localhost:5000/user/${recipe.createdBy}`);
        recipe = { ...recipe, email: userRes.data.email };
      } catch (userErr) {
        console.warn("Unable to fetch creator's email:", userErr.response?.data || userErr.message);
      }
    } else {
      console.warn("Invalid or missing createdBy in recipe:", recipe);
    }

    return recipe;
  } catch (err) {
    console.error("Error fetching recipe:", err.response?.data || err.message);
    throw err; // Let React Router show error boundary if needed
  }
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainNavigation />,
    children: [
      { path: "/", element: <Home />, loader: getAllRecipes },
      { path: "/myRecipe", element: <Home />, loader: getMyRecipes },
      { path: "/favRecipe", element: <Home />, loader: getFavRecipes },
      { path: "/addRecipe", element: <AddFoodRecipe /> },
      { path: "/editRecipe/:id", element: <EditRecipe /> },
      { path: "/recipe/:id", element: <RecipeDetails />, loader: getRecipe }
    ]
  }
]);

export default function App() {
  return (
    <RouterProvider router={router}></RouterProvider>
  );
}
