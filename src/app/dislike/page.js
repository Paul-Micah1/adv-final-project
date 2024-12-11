"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; 
import { db } from "../firebase/firebaseconfig";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function DislikedRecipes() {
  const [dislikedRecipes, setDislikedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const router = useRouter(); 
  const auth = getAuth();

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchDislikedRecipes(currentUser.uid);
      } else {
        setUser(null);
        setDislikedRecipes([]);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const fetchDislikedRecipes = async (userId) => {
    try {
      const dislikesCollection = collection(db, "dislikes");
      const q = query(dislikesCollection, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);

      const dislikedRecipeIds = querySnapshot.docs.map((doc) => doc.data().recipeId);

     
      const recipePromises = dislikedRecipeIds.map(async (recipeId) => {
        const recipeDoc = await getDoc(doc(db, "recipes", recipeId));
        return recipeDoc.exists() ? { id: recipeDoc.id, ...recipeDoc.data() } : null;
      });

      const fullRecipes = await Promise.all(recipePromises);
      setDislikedRecipes(fullRecipes.filter((recipe) => recipe !== null));
    } catch (err) {
      console.error("Error fetching disliked recipes:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start px-4 py-8">
      <header className="w-full flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Disliked Recipes</h1>
        <button
          className="text-blue-500 font-semibold text-lg hover:underline"
          data-route="/main-content" 
          onClick={(e) => router.push(e.target.dataset.route)} 
        >
          &larr; Back
        </button>
      </header>
      {loading && <p className="text-gray-600">Loading...</p>}
      {!loading && dislikedRecipes.length === 0 && (
        <p className="text-gray-600">No disliked recipes found.</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-6xl">
        {dislikedRecipes.map((recipe) => (
          <div key={recipe.id} className="p-4 bg-white rounded-lg shadow-lg">
            <img
              src={recipe.imageUrl}
              alt={recipe.name}
              className="w-full h-48 object-cover rounded-t-lg"
            />
            <div className="pt-4">
              <h2 className="text-xl font-semibold">{recipe.name}</h2>
              <p className="text-sm text-gray-500 mt-2 italic">{recipe.category} Cuisine</p> 
              <p className="text-sm text-gray-600 mt-2">{recipe.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
