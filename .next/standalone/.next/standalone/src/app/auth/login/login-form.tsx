"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { images } from "@/lib/images";
import { usePlatform } from "@/lib/store/platform-store";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = usePlatform();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const revoked = searchParams.get("revoked") === "1";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Enter email and password");
      return;
    }
    setLoading(true);
    setError("");
    const result = await login(email, password);
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? "Login failed");
      return;
    }
    router.push(searchParams.get("next") ?? "/admin");
  };

  return (
    <div className="flex min-h-screen bg-background electric-grid">
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image src={images.authLogin} alt="Concert under neon lights" fill className="object-cover" sizes="50vw" />
        <div className="hero-gradient absolute inset-0" />
        <div className="hero-electric-overlay absolute inset-0" />
        <div className="absolute bottom-12 left-12">
          <p className="font-heading text-3xl font-bold text-white">Staff Portal</p>
          <p className="mt-2 text-electric">Super admins and staff only</p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-2 font-heading text-2xl font-bold text-white">
            <Zap className="h-5 w-5 text-electric" />
            CORE<span className="text-electric">CHELLA</span>
          </Link>

          <div className="mt-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-electric/20 bg-electric/10">
              <Shield className="h-6 w-6 text-electric" />
            </div>
            <div>
              <h1 className="font-heading text-3xl font-bold text-white">Sign In</h1>
              <p className="text-sm text-muted">Super admin & staff access</p>
            </div>
          </div>

          {revoked && (
            <p className="mt-4 rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-sm text-orange-300">
              Your staff access has been revoked. Contact the super admin.
            </p>
          )}

          <form className="mt-8 space-y-4 rounded-2xl electric-card p-6" onSubmit={handleSubmit}>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <div>
              <Label className="mb-2 block">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@corechella.com"
                required
              />
            </div>
            <div>
              <Label className="mb-2 block">Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                required
                minLength={8}
              />
            </div>
            <Button className="w-full" size="lg" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Buying tickets?{" "}
            <Link href="/tickets" className="text-electric hover:underline">Get tickets as a guest →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
