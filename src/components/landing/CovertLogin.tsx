"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface CovertLoginProps {
  open: boolean;
  onClose: () => void;
}

export function CovertLogin({ open, onClose }: CovertLoginProps) {
  const [key, setKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const { login, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login(key);
    if (ok) {
      window.location.href = "/dashboard";
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-none border border-gray-800 bg-gray-950 p-6 shadow-2xl glass-surface hud-accent"
          >
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="rounded-none bg-green-500/10 p-2 border border-green-500/20">
                  <Lock className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold font-heading text-gray-100 uppercase tracking-wider">Secure Access</h2>
                  <p className="text-xs text-gray-400 font-mono">Authentication Required</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-none p-1.5 text-gray-400 hover:bg-white/5 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="Enter access key..."
                  className="h-11 w-full rounded-none border border-gray-800 bg-black/40 px-3 py-1 pr-10 font-mono text-sm tracking-wider text-gray-200 placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-500 focus-visible:border-green-500"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-500 font-mono"
                >
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={isLoading || !key}
                className="w-full h-10 rounded-none bg-green-500 text-gray-950 font-bold font-heading uppercase text-sm hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors tracking-wider"
              >
                {isLoading ? "Authenticating..." : "Access System"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
