"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { pb, persistAuth } from "@/lib/pocketbase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await pb.collection("users").authWithPassword(email, password);
      persistAuth();
      router.push("/");
    } catch {
      setError("invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setOauthLoading(true);
    try {
      await pb.collection("users").authWithOAuth2({ provider: "google" });
      persistAuth();
      router.push("/");
    } catch {
      setError("google sign-in failed. try again.");
    } finally {
      setOauthLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <div style={{ padding: "2.5rem" }}>

        {/* Brand + heading */}
        <div style={{ marginBottom: "2rem" }}>
          <p className="font-mono text-sm text-muted-foreground" style={{ marginBottom: "0.75rem" }}>
            mantis
          </p>
          <h1 className="font-mono text-2xl font-semibold tracking-tight text-foreground" style={{ marginBottom: "0.375rem" }}>
            welcome back
          </h1>
          <p className="font-mono text-sm text-muted-foreground">
            sign in to your account to continue
          </p>
        </div>

        {/* Google OAuth */}
        <div style={{ marginBottom: "1.5rem" }}>
          <Button
            type="button"
            variant="outline"
            className="w-full font-mono text-sm"
            style={{ gap: "0.625rem", height: "2.625rem" }}
            onClick={handleGoogle}
            disabled={oauthLoading || loading}
          >
            <GoogleIcon />
            {oauthLoading ? "redirecting..." : "continue with google"}
          </Button>
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
          <Separator className="flex-1" />
          <span className="font-mono text-xs text-muted-foreground" style={{ whiteSpace: "nowrap" }}>
            or sign in with email
          </span>
          <Separator className="flex-1" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.25rem" }}>
            <Label htmlFor="email" className="font-mono text-xs font-medium" style={{ display: "block", marginBottom: "0.5rem" }}>
              email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="font-mono text-sm"
              style={{ height: "2.625rem" }}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <Label htmlFor="password" className="font-mono text-xs font-medium" style={{ display: "block", marginBottom: "0.5rem" }}>
              password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="font-mono text-sm"
              style={{ height: "2.625rem" }}
            />
          </div>

          {error && (
            <p className="font-mono text-xs text-destructive" style={{ marginBottom: "1rem" }}>
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading || oauthLoading}
            className="w-full font-mono text-sm"
            style={{ height: "2.625rem" }}
          >
            {loading ? "signing in..." : "sign in →"}
          </Button>
        </form>

        {/* Footer link */}
        <p className="font-mono text-xs text-muted-foreground text-center" style={{ marginTop: "1.5rem" }}>
          no account?{" "}
          <Link href="/signup" className="text-foreground underline underline-offset-4">
            sign up
          </Link>
        </p>

      </div>
    </Card>
  );
}
