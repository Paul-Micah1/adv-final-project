"use client";
import { useState, useEffect } from "react";
import { db } from "../firebase/firebaseconfig";
import { collection, getDocs, query, where, setDoc, doc, getDoc, deleteDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function MainContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState({}); 
  const [dislikedRecipes, setDislikedRecipes] = useState({}); 
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const router = useRouter();
  const auth = getAuth();

 
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const recipesCollection = collection(db, "recipes");
        const q =
          filterCategory === "All"
            ? query(recipesCollection)
            : query(recipesCollection, where("category", "==", filterCategory));
        const querySnapshot = await getDocs(q);

        const fetchedRecipes = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRecipes(fetchedRecipes);
      } catch (err) {
        console.error("Error fetching recipes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [filterCategory]);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [auth]);

 
  const fetchUserRatings = async () => {
    if (!user) return;

    try {
      const ratingsCollection = collection(db, "ratings");
      const q = query(ratingsCollection, where("userId", "==", user.uid));

      const querySnapshot = await getDocs(q);
      const userRatings = {};

      querySnapshot.docs.forEach((doc) => {
        const data = doc.data();
        userRatings[data.recipeId] = data.rating;
      });

      setRatings(userRatings);
    } catch (err) {
      console.error("Error fetching user ratings:", err);
    }
  };


  const fetchUserDislikes = async () => {
    if (!user) return;

    try {
      const dislikesCollection = collection(db, "dislikes");
      const q = query(dislikesCollection, where("userId", "==", user.uid));

      const querySnapshot = await getDocs(q);
      const userDislikes = {};

      querySnapshot.docs.forEach((doc) => {
        const data = doc.data();
        userDislikes[data.recipeId] = true;
      });

      setDislikedRecipes(userDislikes);
    } catch (err) {
      console.error("Error fetching user dislikes:", err);
    }
  };


  useEffect(() => {
    if (user) {
      fetchUserRatings();
      fetchUserDislikes();
    } else {
      setRatings({});
      setDislikedRecipes({});
    }
  }, [user]);

 
  const rateRecipe = async (recipeId, rating) => {
    if (!user) {
      alert("You need to be logged in to rate a recipe.");
      return;
    }

    try {
      const ratingDocRef = doc(db, "ratings", `${user.uid}_${recipeId}`);

      const existingDoc = await getDoc(ratingDocRef);
      if (existingDoc.exists()) {
        await setDoc(ratingDocRef, { rating }, { merge: true });
      } else {
        await setDoc(ratingDocRef, { userId: user.uid, recipeId, rating });
      }

      setRatings((prevState) => ({
        ...prevState,
        [recipeId]: rating,
      }));
    } catch (err) {
      console.error("Error storing rating:", err);
    }
  };


  const toggleDislike = async (recipeId) => {
    if (!user) {
      alert("You need to be logged in to dislike a recipe.");
      return;
    }
  
    try {
      const dislikeDocRef = doc(db, "dislikes", `${user.uid}_${recipeId}`);
      const existingDoc = await getDoc(dislikeDocRef);
  
      if (!existingDoc.exists()) {

        await setDoc(dislikeDocRef, {
          userId: user.uid,
          recipeId,
          dislikedAt: new Date(),
        });
        alert("You have disliked this recipe.");
      } else {
       
        await deleteDoc(dislikeDocRef);
        alert("You have undisliked this recipe.");
      }
  
      
      setDislikedRecipes((prevState) => ({
        ...prevState,
        [recipeId]: !prevState[recipeId], 
      }));
    } catch (err) {
      console.error("Error storing dislike:", err);
    }
  };
  

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };


  const filteredRecipes = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) 
    
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start px-4 py-8">
  
      <div className="w-full max-w-6xl flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Recipe Finder</h1>

        {user && (
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/rated")}
              className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Rated
            </button>
            <button
              onClick={() => router.push("/dislike")}
              className="py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Dislike
            </button>
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center"
              >
                <span className="text-gray-700 text-xl">👤</span>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg p-4">
                  <p className="text-sm text-gray-700 mb-4">{user.email}</p>
                  <button
                    onClick={handleLogout}
                    className="w-full py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <p className="text-lg text-gray-600 mb-8 text-center">
        Explore and save your favorite recipes.
      </p>

      <div className="mb-6 w-full max-w-md">
        <input
          type="text"
          placeholder="Search recipes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="mb-6 w-full max-w-md">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="w-full p-3 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="All">All Categories</option>
          <option value="Filipino">Filipino</option>
          <option value="Spanish">Spanish</option>
          <option value="Thai">Thai</option>
        </select>
      </div>

      {loading && <p className="text-gray-600">Loading recipes...</p>}

<div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {filteredRecipes.length > 0 ? (
    filteredRecipes.map((recipe) => (
      <div
        key={recipe.id}
        className="p-4 bg-white rounded-lg shadow-lg hover:shadow-xl transition duration-300 ease-in-out transform hover:scale-105 flex flex-col"
      >
        <div className="relative">
          <img
            src={recipe.imageUrl}
            alt={recipe.name}
            className="w-full h-48 object-cover rounded-t-lg"
          />
        </div>
        <div className="pt-4 flex-grow flex flex-col">
          <h2 className="text-xl font-semibold text-gray-800">{recipe.name}</h2>
          <p className="text-sm text-gray-600 mt-2 italic">{recipe.category} Cuisine</p>
          <p className="text-sm text-gray-600 mt-2 flex-grow">{recipe.description}</p>

          <div className="mt-4 flex justify-between items-center">

  <div className="flex space-x-1">
    {Array.from({ length: 5 }, (_, index) => (
      <svg
        key={index}
        xmlns="http://www.w3.org/2000/svg"
        fill={index < (ratings[recipe.id] || 0) ? "gold" : "gray"} 
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="w-5 h-5 cursor-pointer"
        onClick={() => rateRecipe(recipe.id, index + 1)} 
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.167 6.674a1 1 0 00.95.69h7.013c.969 0 1.372 1.24.588 1.81l-5.647 4.088a1 1 0 00-.364 1.118l2.167 6.674c.3.921-.755 1.688-1.54 1.118l-5.647-4.088a1 1 0 00-1.175 0l-5.647 4.088c-.784.57-1.84-.197-1.54-1.118l2.167-6.674a1 1 0 00-.364-1.118L2.293 12.1c-.784-.57-.38-1.81.588-1.81h7.013a1 1 0 00.95-.69l2.167-6.674z"
        />
      </svg>
    ))}
  </div>

  <span className="ml-2 text-sm text-gray-500">{ratings[recipe.id] || 0} stars</span>
</div>

          <div className="mt-4">
            <button
              onClick={() => toggleDislike(recipe.id)}
              className={`w-full py-2 ${user && dislikedRecipes[recipe.id] ? 'bg-gray-500' : 'bg-red-500'} text-white rounded hover:bg-red-600`}
            >
              {user && dislikedRecipes[recipe.id] ? 'Undislike' : 'Dislike'}
            </button>
          </div>
        </div>
      </div>
    ))
  ) : (
    <p className="text-gray-600">No recipes found.</p>
  )}
</div>

    </div>
  );
}
