"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Heart, Users, User, LogOut } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const links = [
    { href: "/discover", label: "Khám phá", icon: Users },
    { href: "/matches", label: "Matches", icon: Heart },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/discover" className="font-bold text-pink-500 text-lg">
          💕 Dating App
        </Link>

        <div className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                pathname.startsWith(href)
                  ? "bg-pink-50 text-pink-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon size={15} />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}

          <div className="flex items-center gap-2 ml-3 pl-3 border-l border-gray-200">
            <span className="text-xs text-gray-500 hidden sm:block truncate max-w-[80px]">
              {user?.name}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-2 py-1.5 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
              title="Đăng xuất"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
