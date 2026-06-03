"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function SignUp() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    
    try {
      await authApi.signup(data);
      router.push("/auth/signin");
    } catch (err: any) {
      setError(err.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border border-border rounded-lg bg-background">
      <h1 className="text-2xl font-bold mb-6 text-center">Create an Account</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <Input name="email" type="email" required placeholder="Enter email" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <Input name="username" required placeholder="Choose a username" />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <Input name="password" type="password" required placeholder="Create password" />
        </div>

        <Button type="submit" disabled={loading} className="mt-2">
          {loading ? "Signing up..." : "Sign Up"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/auth/signin" className="text-foreground hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
