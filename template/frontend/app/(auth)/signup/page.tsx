"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { pb, persistAuth } from "@/lib/pocketbase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

function GoogleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      aria-hidden="true"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await pb.collection("users").create({
        name,
        email,
        password,
        passwordConfirm: confirm,
      });
      await pb.collection("users").authWithPassword(email, password);
      persistAuth();
      router.push("/");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "something went wrong. try again.";
      setError(msg.toLowerCase());
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleAuth() {
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
    <Card className="w-full max-w-md shadow-none">
      <CardHeader className="space-y-2 pb-6">
        <p className="font-mono text-xs font-semibold tracking-widest uppercase text-muted-foreground">
          mantis
        </p>
        <CardTitle className="text-2xl font-mono font-semibold tracking-tight">
          create an account
        </CardTitle>
        <CardDescription className="font-mono text-sm">
          own your infrastructure from day one
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Google OAuth */}
        <Button
          type="button"
          variant="outline"
          className="w-full font-mono text-sm gap-3"
          onClick={handleGoogleAuth}
          disabled={oauthLoading || loading}
        >
          <GoogleIcon />
          {oauthLoading ? "redirecting..." : "continue with google"}
        </Button>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <Separator className="flex-1" />
          <span className="font-mono text-xs text-muted-foreground shrink-0">
            or sign up with email
          </span>
          <Separator className="flex-1" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="font-mono text-xs font-medium">
              name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              className="font-mono text-sm h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="font-mono text-xs font-medium">
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
              className="font-mono text-sm h-10"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="password" className="font-mono text-xs font-medium">
                password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="min. 8 chars"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="font-mono text-sm h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm" className="font-mono text-xs font-medium">
                confirm
              </Label>
              <Input
                id="confirm"
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                className="font-mono text-sm h-10"
              />
            </div>
          </div>

          {error && (
            <p className="text-destructive text-xs font-mono bg-destructive/10 px-3 py-2 rounded">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading || oauthLoading}
            className="w-full font-mono text-sm h-10"
          >
            {loading ? "creating account..." : "create account →"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center pt-0 pb-6">
        <p className="font-mono text-xs text-muted-foreground">
          already have an account?{" "}
          <Link
            href="/login"
            className="text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors"
          >
            sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
