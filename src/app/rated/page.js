"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "../firebase/firebaseconfig";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function Rated() {
  const [ratedRecipes, setRatedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchRatedRecipes(currentUser.uid);
      } else {
        setUser(null);
        setRatedRecipes([]);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const fetchRatedRecipes = async (userId) => {
    try {
      const ratingsCollection = collection(db, "ratings");
      const q = query(ratingsCollection, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);

      const ratedRecipePromises = querySnapshot.docs.map(async (ratingDoc) => {
        const { recipeId, rating } = ratingDoc.data();
        const recipeRef = doc(db, "recipes", recipeId);
        const recipeDoc = await getDoc(recipeRef);

        return recipeDoc.exists()
          ? { id: recipeDoc.id, rating, ...recipeDoc.data() }
          : null;
      });

      const fullRatedRecipes = await Promise.all(ratedRecipePromises);
      setRatedRecipes(fullRatedRecipes.filter((recipe) => recipe !== null));
    } catch (err) {
      console.error("Error fetching rated recipes:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const totalStars = 5;
    return (
        <div className="mt-4 flex justify-between items-center">
            <div className="flex space-x-1">
        {Array.from({ length: totalStars }, (_, index) => (
          <svg
            key={index}
            xmlns="http://www.w3.org/2000/svg"
            fill={index < rating ? "gold" : "gray"}
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.167 6.674a1 1 0 00.95.69h7.013c.969 0 1.372 1.24.588 1.81l-5.647 4.088a1 1 0 00-.364 1.118l2.167 6.674c.3.921-.755 1.688-1.54 1.118l-5.647-4.088a1 1 0 00-1.175 0l-5.647 4.088c-.784.57-1.84-.197-1.54-1.118l2.167-6.674a1 1 0 00-.364-1.118L2.293 12.1c-.784-.57-.38-1.81.588-1.81h7.013a1 1 0 00.95-.69l2.167-6.674z"
            />
          </svg>
        ))}
      </div>
        <span className="ml-2 text-sm text-gray-500 ">{rating} stars</span>
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start px-4 py-8">
      <header className="w-full flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Rated Recipes</h1>
        <button
          className="text-blue-500 font-semibold text-lg hover:underline"
          onClick={() => router.push("/main-content")}
        >
          &larr; Back
        </button>
      </header>
      {loading && <p className="text-gray-600">Loading...</p>}
      {!loading && ratedRecipes.length === 0 && (
        <p className="text-gray-600">No rated recipes found.</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-6xl">
        {ratedRecipes.map((recipe) => (
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
              {renderStars(recipe.rating)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
