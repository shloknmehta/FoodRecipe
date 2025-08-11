const Recipes = require("../models/recipe");
const multer = require('multer');
const path = require('path');

// Multer storage config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images');
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const filename = Date.now() + '-' + file.fieldname + ext;
        cb(null, filename);
    }
});

const upload = multer({ storage: storage });

// Get all recipes
const getRecipes = async (req, res) => {
    const recipes = await Recipes.find();
    return res.json(recipes);
};

// Get a recipe by ID
const getRecipe = async (req, res) => {
    const recipe = await Recipes.findById(req.params.id);
    res.json(recipe);
};

// Add a new recipe
const addRecipe = async (req, res) => {
    console.log(req.user);
    const { title, ingredients, instructions, time } = req.body;

    if (!title || !ingredients || !instructions) {
        return res.status(400).json({ message: "Required fields can't be empty" });
    }

    const coverImage = req.file ? req.file.filename : null;

    const newRecipe = await Recipes.create({
        title,
        ingredients,
        instructions,
        time,
        coverImage,
        createdBy: req.user.id
    });

    return res.json(newRecipe);
};

// Edit recipe
const editRecipe = async (req, res) => {
    const { title, ingredients, instructions, time } = req.body;

    try {
        let recipe = await Recipes.findById(req.params.id);
        if (!recipe) {
            return res.status(404).json({ message: "Recipe not found" });
        }

        // Keep old image if no new one uploaded
        const coverImage = req.file ? req.file.filename : recipe.coverImage;

        recipe = await Recipes.findByIdAndUpdate(
            req.params.id,
            { title, ingredients, instructions, time, coverImage },
            { new: true }
        );

        res.json(recipe);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// Delete recipe
const deleteRecipe = async (req, res) => {
    try {
        await Recipes.deleteOne({ _id: req.params.id });
        res.json({ status: "ok" });
    } catch (err) {
        return res.status(400).json({ message: "Error deleting recipe" });
    }
};

module.exports = { getRecipes, getRecipe, addRecipe, editRecipe, deleteRecipe, upload };
