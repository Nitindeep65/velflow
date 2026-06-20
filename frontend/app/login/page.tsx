"use client";

import { useState } from "react";
import Link from "next/navigation";
import LinkComponent from "next/link";
import { AuthGuard } from "@/components/auth-guard";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { Sparkles, Mail, Lock, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      // Small artificial delay to showcase premium loading micro-animations
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await login(email, password);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen bg-zinc-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-blue-200 relative overflow-hidden">
        
        {/* Soft glowing mesh blobs for visual depth */}
        <div className="absolute top-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none" />

        <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center relative z-10">
          <LinkComponent href="/" className="flex items-center gap-2.5 group mb-6 hover:scale-105 transition-transform duration-300">
            <div className="h-8 w-8 rounded-lg bg-zinc-950 flex items-center justify-center text-white font-extrabold text-base shadow-md group-hover:bg-blue-600 transition-colors">
              V
            </div>
            <span className="font-extrabold text-lg tracking-tight text-zinc-950">
              Vel<span className="text-blue-600">flow</span>
            </span>
          </LinkComponent>
          <h2 className="text-center text-2xl font-black tracking-tight text-zinc-950">
            Sign in to Velflow
          </h2>
          <p className="mt-1.5 text-center text-xs text-zinc-500 font-bold flex items-center gap-1 mb-6 select-none">
            <Sparkles className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
            Velflow Safe Compliance Access
          </p>
        </div>

        <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
          <div className="bg-white border border-zinc-200/80 rounded-2xl py-8 px-6 sm:px-10 shadow-xl space-y-6">
            
            {error && (
              <div className="p-3 text-xs bg-rose-50 border border-rose-100 text-rose-600 rounded-xl font-bold animate-scale-in">
                {error}
              </div>
            )}

            {isSuccess && (
              <div className="p-3 text-xs bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl font-bold flex items-center gap-2 animate-scale-in">
                <CheckCircle2 className="h-4 w-4" />
                Successfully authenticated! Redirecting...
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 select-none">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-zinc-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="block w-full pl-9 pr-3 py-2 text-sm bg-white border border-zinc-200 rounded-xl text-zinc-950 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-semibold placeholder:text-zinc-400 placeholder:font-normal"
                    disabled={isLoading || isSuccess}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest select-none">
                    Password
                  </label>
                  <a href="#" className="text-[10px] text-blue-600 hover:text-blue-700 font-bold">
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-zinc-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-9 pr-3 py-2 text-sm bg-white border border-zinc-200 rounded-xl text-zinc-950 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-semibold placeholder:text-zinc-400"
                    disabled={isLoading || isSuccess}
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isLoading || isSuccess}
                  className="w-full h-11 bg-zinc-950 text-white hover:bg-zinc-850 font-extrabold cursor-pointer rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Authenticating Secure Session...
                    </>
                  ) : isSuccess ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Redirecting to Dashboard...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="relative flex py-2 items-center select-none">
              <div className="flex-grow border-t border-zinc-150"></div>
              <span className="flex-shrink mx-4 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Access Info</span>
              <div className="flex-grow border-t border-zinc-150"></div>
            </div>

            <div className="bg-zinc-50 border border-zinc-150 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider flex items-center gap-1.5 select-none">
                💡 Developer Dummy Access Active
              </span>
              <p className="text-[10.5px] text-zinc-500 leading-relaxed font-semibold">
                Enter any dummy email and password to log in instantly. The app will simulate a secure active session.
              </p>
            </div>

            <p className="text-center text-xs text-zinc-500 font-bold select-none pt-2">
              New to Velflow?{" "}
              <LinkComponent href="/signup" className="text-blue-600 hover:text-blue-700 font-extrabold">
                Create a Free Account
              </LinkComponent>
            </p>

          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
