"use client";

import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();

  return (
    <section className="flex flex-col items-center justify-center text-center py-20 bg-white">
      <h2 className="text-4xl font-bold mb-4">Discover Delicious Recipes</h2>
      <p className="text-gray-600 mb-6">
        Find, save, and share your favorite recipes with Recipe Finder
      </p>
      <button
        onClick={() => router.push("/create-account")}
        className="px-6 py-3 bg-black text-white rounded hover:bg-gray-800 transition"
      >
        Get Started
      </button>
    </section>
  );
}
