"use client"

import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  return (
    <header className="flex justify-between items-center px-6 py-4 bg-white shadow">
      <h1 className="text-2xl font-bold cursor-pointer" onClick={() => router.push("/")}>
        Recipe Finder
      </h1>
      <div className="space-x-4">
        <button
          onClick={() => router.push("/sign-in")}
          className="px-4 py-2 border rounded"
        >
          Sign In
        </button>
        <button
          onClick={() => router.push("/create-account")}
          className="px-4 py-2 bg-black text-white rounded"
        >
          Create an Account
        </button>
      </div>
    </header>
  );
}
