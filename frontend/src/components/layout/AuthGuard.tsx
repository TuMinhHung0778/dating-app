"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Navbar from "./Navbar";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, init } = useAuthStore();
  const router = useRouter();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      init();
    }
  }, []);

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl mb-3">💕</div>
          <p className="text-gray-500 text-sm">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
    </>
  );
}
