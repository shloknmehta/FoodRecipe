const express = require("express");
const {
    getRecipes,
    getRecipe,
    addRecipe,
    editRecipe,
    deleteRecipe,
    upload
} = require("../controller/recipe");
const verifyToken = require("../middleware/auth");

const router = express.Router();

router.get("/", getRecipes);
router.get("/:id", getRecipe);
router.post("/", verifyToken, upload.single('coverImage'), addRecipe);
router.put("/:id", verifyToken, upload.single('coverImage'), editRecipe);
router.delete("/:id", verifyToken, deleteRecipe);

module.exports = router;
