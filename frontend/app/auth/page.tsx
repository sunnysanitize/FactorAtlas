"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/providers/auth-provider";

type Mode = "login" | "signup";

export default function AuthPage() {
  const { login, signup, user, loading } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await signup(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-10">
        <div className="max-w-xl">
          <Link href="/" className="text-sm font-semibold tracking-[0.24em] text-muted-foreground">
            FACTORATLAS
          </Link>
          <h1 className="mt-6 text-4xl font-bold text-foreground">
            Create an account to start using the app.
          </h1>
          <p className="mt-4 text-base text-muted-foreground">
            This local setup does not create a default login. Use Sign Up first, then Log In with the same email and password.
          </p>
        </div>

        <Card className="w-full max-w-md bg-card border-border">
          <CardHeader>
            <div className="flex gap-2">
              <Button variant={mode === "login" ? "default" : "outline"} onClick={() => setMode("login")}>
                Log In
              </Button>
              <Button variant={mode === "signup" ? "default" : "outline"} onClick={() => setMode("signup")}>
                Sign Up
              </Button>
            </div>
            <CardTitle className="pt-4 text-xl">
              {mode === "login" ? "Log in with email" : "Create your account"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting || loading}
              />
              <Input
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting || loading}
              />
              <p className="text-xs text-muted-foreground">
                No seeded account is included in local dev. Create one with Sign Up before using Log In.
              </p>
              {error && <p className="text-sm text-destructive">{error}</p>}
              {user && <p className="text-sm text-emerald-500">You are logged in as {user.email}.</p>}
              <Button type="submit" className="w-full" disabled={submitting || loading || !email || password.length < 8}>
                {submitting ? "Submitting..." : mode === "login" ? "Log In" : "Sign Up"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
