"use client";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Heart, HeartOff, MapPin, User } from "lucide-react";
import AuthGuard from "@/components/layout/AuthGuard";
import { userService, likeService, getErrorMessage } from "@/lib/services";
import type { UserWithStatus, User as UserType } from "@/types";

// ─── It&apos;s a Match Modal ──────────────────────────────────────────────────
function MatchModal({
  user,
  matchId,
  onClose,
}: {
  user: UserType;
  matchId: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 text-center max-w-sm w-full shadow-2xl">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-pink-500 mb-2">
          It&apos;s a Match!
        </h2>
        <p className="text-gray-600 mb-1">
          Bạn và <strong>{user.name}</strong> đã thích nhau!
        </p>
        <p className="text-gray-400 text-sm mb-6">Hãy chọn lịch hẹn nhé</p>
        <img
          src={
            user.avatarUrl ||
            `https://api.dicebear.com/8.x/avataaars/svg?seed=${user.name}`
          }
          alt={user.name}
          className="w-20 h-20 rounded-full mx-auto mb-6 border-4 border-pink-200"
        />
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
          >
            Để sau
          </button>
          <a
            href={`/matches/${matchId}`}
            className="flex-1 bg-pink-500 text-white py-2 rounded-lg text-sm hover:bg-pink-600 transition font-medium"
          >
            Chọn lịch hẹn
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Profile Card ─────────────────────────────────────────────────────────────
function ProfileCard({
  user,
  onLike,
  onUnlike,
}: {
  user: UserWithStatus;
  onLike: (id: string) => Promise<void>;
  onUnlike: (id: string) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);

  const genderLabel =
    user.gender === "male" ? "Nam" : user.gender === "female" ? "Nữ" : "Khác";

  const handleClick = async () => {
    setLoading(true);
    try {
      if (user.isLikedByMe) await onUnlike(user._id);
      else await onLike(user._id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition">
      {/* Avatar */}
      <div className="h-40 bg-gradient-to-br from-pink-50 to-rose-100 flex items-center justify-center relative">
        <img
          src={
            user.avatarUrl ||
            `https://api.dicebear.com/8.x/avataaars/svg?seed=${user.name}`
          }
          alt={user.name}
          className="w-24 h-24 rounded-full border-4 border-white shadow"
        />
        {user.isMatch && (
          <span className="absolute top-2 right-2 bg-pink-500 text-white text-xs px-2 py-0.5 rounded-full">
            💕 Match
          </span>
        )}
        {user.likedMe && !user.isMatch && (
          <span className="absolute top-2 right-2 bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
            ❤️ Thích bạn
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-semibold text-gray-900">{user.name}</h3>
          <span className="text-sm text-gray-500">{user.age} tuổi</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
          <span className="flex items-center gap-1">
            <User size={11} /> {genderLabel}
          </span>
          {user.location && (
            <span className="flex items-center gap-1">
              <MapPin size={11} /> {user.location}
            </span>
          )}
        </div>

        {user.bio && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{user.bio}</p>
        )}

        {user.interests?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {user.interests.slice(0, 3).map((i) => (
              <span
                key={i}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
              >
                {i}
              </span>
            ))}
          </div>
        )}

        <button
          onClick={handleClick}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition ${
            user.isLikedByMe
              ? "bg-pink-50 text-pink-500 border border-pink-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200"
              : "bg-pink-500 text-white hover:bg-pink-600"
          } disabled:opacity-50`}
        >
          {loading ? (
            "..."
          ) : user.isLikedByMe ? (
            <>
              <HeartOff size={15} /> Bỏ like
            </>
          ) : (
            <>
              <Heart size={15} /> Like
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DiscoverPage() {
  const [users, setUsers] = useState<UserWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [matchModal, setMatchModal] = useState<{
    user: UserType;
    matchId: string;
  } | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await userService.getUsers();
      if (res.success && res.data) setUsers(res.data.users);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleLike = async (userId: string) => {
    const res = await likeService.likeUser(userId);
    if (res.data?.isMatch && res.data.matchId) {
      const liked = users.find((u) => u._id === userId);
      if (liked) setMatchModal({ user: liked, matchId: res.data.matchId });
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, isLikedByMe: true, isMatch: true } : u,
        ),
      );
    } else {
      toast.success("Đã like! 💕");
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isLikedByMe: true } : u)),
      );
    }
  };

  const handleUnlike = async (userId: string) => {
    await likeService.unlikeUser(userId);
    setUsers((prev) =>
      prev.map((u) =>
        u._id === userId ? { ...u, isLikedByMe: false, isMatch: false } : u,
      ),
    );
    toast.success("Đã bỏ like");
  };

  const filtered = users.filter(
    (u) =>
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.bio?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <AuthGuard>
      {matchModal && (
        <MatchModal
          user={matchModal.user}
          matchId={matchModal.matchId}
          onClose={() => setMatchModal(null)}
        />
      )}

      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Khám phá 🔍</h1>
        <p className="text-gray-500 text-sm">
          Tìm kiếm và kết nối với mọi người
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm theo tên, bio..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition max-w-sm"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-xl h-64 animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">🌸</div>
          <p>{search ? "Không tìm thấy kết quả" : "Chưa có ai ở đây"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((u) => (
            <ProfileCard
              key={u._id}
              user={u}
              onLike={handleLike}
              onUnlike={handleUnlike}
            />
          ))}
        </div>
      )}
    </AuthGuard>
  );
}
