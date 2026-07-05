// Read a JSON value from localStorage, falling back if missing or corrupted
function loadJSON(key, fallback) {
    try {
        return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch (e) {
        return fallback;
    }
}

// Escape user-provided text before inserting it into innerHTML
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, ch => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
    ));
}

document.addEventListener('DOMContentLoaded', function() {
    const ingredientInput = document.getElementById('ingredient-input');
    const ingredientsList = document.getElementById('ingredients-list');
    const cuisineFilter = document.getElementById('cuisine-filter');
    const mealTypeFilter = document.getElementById('meal-type-filter');
    const findRecipesBtn = document.getElementById('find-recipes-btn');
    const recipesContainer = document.getElementById('recipes-container');
    const savedRecipesList = document.getElementById('saved-recipes-list');

    let ingredients = [];
    let savedRecipes = loadJSON('savedRecipes', []);

    // Sample recipe database
    const recipeDatabase = [
        {
            id: 1,
            name: "Chicken Stir Fry",
            ingredients: ["chicken", "vegetables", "soy sauce", "garlic", "ginger"],
            cuisine: "chinese",
            mealType: "dinner",
            cookTime: "20 minutes",
            difficulty: "Easy",
            instructions: [
                "Heat oil in a wok or large pan",
                "Add chicken and cook until golden",
                "Add vegetables and stir fry for 3-4 minutes",
                "Add soy sauce, garlic, and ginger",
                "Serve with rice"
            ]
        },
        {
            id: 2,
            name: "Spaghetti Carbonara",
            ingredients: ["pasta", "eggs", "cheese", "bacon", "pepper"],
            cuisine: "italian",
            mealType: "dinner",
            cookTime: "15 minutes",
            difficulty: "Medium",
            instructions: [
                "Cook pasta according to package instructions",
                "Fry bacon until crispy",
                "Beat eggs with cheese and pepper",
                "Mix hot pasta with egg mixture",
                "Add bacon and serve immediately"
            ]
        },
        {
            id: 3,
            name: "Guacamole",
            ingredients: ["avocado", "lime", "onion", "tomato", "cilantro"],
            cuisine: "mexican",
            mealType: "snack",
            cookTime: "10 minutes",
            difficulty: "Easy",
            instructions: [
                "Mash avocados in a bowl",
                "Add lime juice immediately",
                "Mix in diced onion and tomato",
                "Add chopped cilantro",
                "Season with salt and pepper"
            ]
        },
        {
            id: 4,
            name: "Pancakes",
            ingredients: ["flour", "eggs", "milk", "butter", "sugar"],
            cuisine: "american",
            mealType: "breakfast",
            cookTime: "20 minutes",
            difficulty: "Easy",
            instructions: [
                "Mix flour, sugar, and salt in a bowl",
                "Beat eggs with milk and melted butter",
                "Combine wet and dry ingredients",
                "Cook on hot griddle until bubbles form",
                "Flip and cook until golden brown"
            ]
        },
        {
            id: 5,
            name: "Fried Rice",
            ingredients: ["rice", "eggs", "vegetables", "soy sauce", "garlic"],
            cuisine: "chinese",
            mealType: "lunch",
            cookTime: "15 minutes",
            difficulty: "Easy",
            instructions: [
                "Cook rice and let it cool",
                "Scramble eggs and set aside",
                "Stir fry vegetables with garlic",
                "Add rice and soy sauce",
                "Mix in scrambled eggs"
            ]
        },
        {
            id: 6,
            name: "Caprese Salad",
            ingredients: ["tomato", "cheese", "basil", "olive oil", "balsamic"],
            cuisine: "italian",
            mealType: "lunch",
            cookTime: "5 minutes",
            difficulty: "Easy",
            instructions: [
                "Slice tomatoes and mozzarella",
                "Arrange alternating with basil leaves",
                "Drizzle with olive oil",
                "Add balsamic vinegar",
                "Season with salt and pepper"
            ]
        },
        {
            id: 7,
            name: "Chicken Curry",
            ingredients: ["chicken", "curry powder", "coconut milk", "onion", "garlic"],
            cuisine: "indian",
            mealType: "dinner",
            cookTime: "30 minutes",
            difficulty: "Medium",
            instructions: [
                "Sauté onion and garlic",
                "Add chicken and brown",
                "Add curry powder and cook briefly",
                "Pour in coconut milk",
                "Simmer until chicken is cooked through"
            ]
        },
        {
            id: 8,
            name: "Chocolate Chip Cookies",
            ingredients: ["flour", "butter", "sugar", "eggs", "chocolate chips"],
            cuisine: "american",
            mealType: "dessert",
            cookTime: "25 minutes",
            difficulty: "Easy",
            instructions: [
                "Cream butter and sugar",
                "Beat in eggs",
                "Mix in flour gradually",
                "Fold in chocolate chips",
                "Bake at 350°F for 10-12 minutes"
            ]
        }
    ];

    // Add ingredient
    ingredientInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && ingredientInput.value.trim()) {
            const ingredient = ingredientInput.value.trim().toLowerCase();
            if (!ingredients.includes(ingredient)) {
                ingredients.push(ingredient);
                ingredientInput.value = '';
                updateIngredientsList();
            }
        }
    });

    function updateIngredientsList() {
        ingredientsList.innerHTML = '';
        ingredients.forEach(ingredient => {
            const ingredientTag = document.createElement('span');
            ingredientTag.className = 'ingredient-tag';
            ingredientTag.innerHTML = `
                ${escapeHTML(ingredient)}
                <button class="remove-ingredient" data-ingredient="${escapeHTML(ingredient)}">×</button>
            `;
            ingredientsList.appendChild(ingredientTag);
        });

        // Add remove listeners
        ingredientsList.querySelectorAll('.remove-ingredient').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const ingredientToRemove = e.target.dataset.ingredient;
                ingredients = ingredients.filter(ing => ing !== ingredientToRemove);
                updateIngredientsList();
            });
        });
    }

    // Find recipes
    findRecipesBtn.addEventListener('click', () => {
        if (ingredients.length === 0) {
            alert('Please add at least one ingredient');
            return;
        }

        const cuisine = cuisineFilter.value;
        const mealType = mealTypeFilter.value;

        const matchingRecipes = recipeDatabase.filter(recipe => {
            // Check if recipe has at least one matching ingredient
            const hasMatchingIngredient = recipe.ingredients.some(recipeIngredient =>
                ingredients.some(userIngredient =>
                    recipeIngredient.toLowerCase().includes(userIngredient) ||
                    userIngredient.includes(recipeIngredient.toLowerCase())
                )
            );

            // Check filters
            const matchesCuisine = !cuisine || recipe.cuisine === cuisine;
            const matchesMealType = !mealType || recipe.mealType === mealType;

            return hasMatchingIngredient && matchesCuisine && matchesMealType;
        });

        displayRecipes(matchingRecipes);
    });

    function displayRecipes(recipes) {
        recipesContainer.innerHTML = '';

        if (recipes.length === 0) {
            recipesContainer.innerHTML = '<p class="no-recipes">No recipes found with your ingredients. Try different ingredients or filters.</p>';
            return;
        }

        recipes.forEach(recipe => {
            const recipeCard = document.createElement('div');
            recipeCard.className = 'recipe-card';
            
            const matchingIngredients = recipe.ingredients.filter(recipeIngredient =>
                ingredients.some(userIngredient =>
                    recipeIngredient.toLowerCase().includes(userIngredient) ||
                    userIngredient.includes(recipeIngredient.toLowerCase())
                )
            );

            const missingIngredients = recipe.ingredients.filter(ingredient =>
                !matchingIngredients.includes(ingredient)
            );

            recipeCard.innerHTML = `
                <div class="recipe-header">
                    <h4>${recipe.name}</h4>
                    <div class="recipe-meta">
                        <span class="cuisine">${recipe.cuisine}</span>
                        <span class="meal-type">${recipe.mealType}</span>
                        <span class="difficulty">${recipe.difficulty}</span>
                        <span class="cook-time">${recipe.cookTime}</span>
                    </div>
                </div>
                
                <div class="ingredients-match">
                    <div class="matching-ingredients">
                        <strong>You have:</strong> ${matchingIngredients.join(', ')}
                    </div>
                    ${missingIngredients.length > 0 ? 
                        `<div class="missing-ingredients">
                            <strong>You need:</strong> ${missingIngredients.join(', ')}
                        </div>` : ''
                    }
                </div>
                
                <div class="recipe-instructions">
                    <strong>Instructions:</strong>
                    <ol>
                        ${recipe.instructions.map(step => `<li>${step}</li>`).join('')}
                    </ol>
                </div>
                
                <div class="recipe-actions">
                    <button class="save-recipe-btn" data-id="${recipe.id}">Save Recipe</button>
                </div>
            `;

            recipesContainer.appendChild(recipeCard);
        });

        // Add save recipe listeners
        recipesContainer.querySelectorAll('.save-recipe-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const recipeId = parseInt(e.target.dataset.id);
                const recipe = recipeDatabase.find(r => r.id === recipeId);
                
                if (!savedRecipes.some(r => r.id === recipeId)) {
                    savedRecipes.push({...recipe, savedAt: new Date().toLocaleDateString()});
                    localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
                    renderSavedRecipes();
                    
                    // Show feedback
                    e.target.textContent = 'Saved!';
                    e.target.classList.add('is-saved');
                    setTimeout(() => {
                        e.target.textContent = 'Save Recipe';
                        e.target.classList.remove('is-saved');
                    }, 2000);
                }
            });
        });
    }

    function renderSavedRecipes() {
        savedRecipesList.innerHTML = '';

        if (savedRecipes.length === 0) {
            savedRecipesList.innerHTML = '<p class="no-saved">No saved recipes yet.</p>';
            return;
        }

        savedRecipes.forEach(recipe => {
            const savedRecipeCard = document.createElement('div');
            savedRecipeCard.className = 'saved-recipe-card';
            
            savedRecipeCard.innerHTML = `
                <h4>${recipe.name}</h4>
                <div class="saved-meta">
                    <span>Saved: ${recipe.savedAt}</span>
                    <span>${recipe.cuisine} • ${recipe.mealType}</span>
                </div>
                <div class="saved-actions">
                    <button class="view-recipe-btn" data-id="${recipe.id}">View Recipe</button>
                    <button class="remove-saved-btn" data-id="${recipe.id}">Remove</button>
                </div>
            `;

            savedRecipesList.appendChild(savedRecipeCard);
        });

        // Add event listeners for saved recipes
        savedRecipesList.querySelectorAll('.view-recipe-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const recipeId = parseInt(e.target.dataset.id);
                const recipe = savedRecipes.find(r => r.id === recipeId);
                displayRecipes([recipe]);
            });
        });

        savedRecipesList.querySelectorAll('.remove-saved-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const recipeId = parseInt(e.target.dataset.id);
                savedRecipes = savedRecipes.filter(r => r.id !== recipeId);
                localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
                renderSavedRecipes();
            });
        });
    }

    // Initialize
    renderSavedRecipes();
});