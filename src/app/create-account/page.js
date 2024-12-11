"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase/firebaseconfig"; // Import db
import { addDoc, collection } from "firebase/firestore"; // Import addDoc and collection
import { useRouter } from "next/navigation";

export default function CreateAccount() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user; 

  
      await addDoc(collection(db, "users"), {
        uid: user.uid,
        email: user.email,
        dateTimeStamp: new Date().toDateString(),
      });

      router.push("/sign-in"); 
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Create an Account</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      <form
        onSubmit={handleSignUp}
        className="bg-white p-8 rounded shadow-md w-full max-w-sm"
      >
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            className="w-full px-3 py-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
        >
          Sign Up
        </button>
      </form>


      <button
        onClick={() => router.push("/")}
        className="mt-6 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition"
      >
        ← Back to Home
      </button>
    </div>
  );
}
