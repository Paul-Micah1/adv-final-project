"use client";

import { useRouter } from "next/navigation";

export default function CTA() {
  const router = useRouter();

  return (
    <section className="flex flex-col items-center justify-center text-center py-16 bg-gray-900 text-white">
      <h2 className="text-3xl font-bold mb-4">Ready to start cooking?</h2>
      <p className="text-gray-300 mb-6">
        Join Recipe Finder today and explore a world of culinary delights!
      </p>
      <button
        onClick={() => router.push("/create-account")}
        className="px-6 py-3 bg-white text-black rounded hover:bg-gray-100 transition"
      >
        Create Your Free Account
      </button>
    </section>
  );
}
