"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { Edit2, Save, X } from "lucide-react";
import AuthGuard from "@/components/layout/AuthGuard";
import { userService, getErrorMessage } from "@/lib/services";
import { useAuthStore } from "@/store/authStore";
import type { Gender } from "@/types";

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    age: String(user?.age || ""),
    gender: user?.gender || "",
    bio: user?.bio || "",
    location: user?.location || "",
  });

  const set = (field: string, val: string) =>
    setForm((f) => ({ ...f, [field]: val }));

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await userService.updateProfile({
        name: form.name,
        age: Number(form.age),
        gender: form.gender as Gender,
        bio: form.bio,
        location: form.location,
      });
      updateUser(res.data.user);
      setEditing(false);
      toast.success("Đã cập nhật profile!");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const genderLabel = { male: "Nam", female: "Nữ", other: "Khác" };

  if (!user) return null;

  return (
    <AuthGuard>
      <div className="max-w-lg">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Profile của bạn</h1>
            <p className="text-gray-500 text-sm">
              Thông tin hiển thị với người khác
            </p>
          </div>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition"
            >
              <Edit2 size={14} /> Chỉnh sửa
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(false)}
                className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                <X size={14} /> Huỷ
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-1 px-3 py-2 bg-pink-500 text-white rounded-lg text-sm hover:bg-pink-600 disabled:bg-pink-300 transition"
              >
                <Save size={14} /> {loading ? "Lưu..." : "Lưu"}
              </button>
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {/* Avatar section */}
          <div className="bg-gradient-to-br from-pink-50 to-rose-100 p-6 text-center">
            <img
              src={
                user.avatarUrl ||
                `https://api.dicebear.com/8.x/avataaars/svg?seed=${user.name}`
              }
              alt={user.name}
              className="w-20 h-20 rounded-full border-4 border-white shadow mx-auto mb-3"
            />
            <h2 className="font-bold text-lg text-gray-900">{user.name}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>

          {/* Fields */}
          <div className="p-5 space-y-4">
            <Row label="Tên" editing={editing}>
              {editing ? (
                <input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  className="input"
                />
              ) : (
                <span>{user.name}</span>
              )}
            </Row>

            <Row label="Tuổi" editing={editing}>
              {editing ? (
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => set("age", e.target.value)}
                  className="input w-24"
                />
              ) : (
                <span>{user.age} tuổi</span>
              )}
            </Row>

            <Row label="Giới tính" editing={editing}>
              {editing ? (
                <select
                  value={form.gender}
                  onChange={(e) => set("gender", e.target.value)}
                  className="input w-32 bg-white"
                >
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              ) : (
                <span>{genderLabel[user.gender] || user.gender}</span>
              )}
            </Row>

            <Row label="Địa điểm" editing={editing}>
              {editing ? (
                <input
                  value={form.location}
                  onChange={(e) => set("location", e.target.value)}
                  placeholder="TP. HCM, Hà Nội..."
                  className="input"
                />
              ) : (
                <span>
                  {user.location || (
                    <span className="text-gray-400 italic">Chưa có</span>
                  )}
                </span>
              )}
            </Row>

            <Row label="Bio" editing={editing}>
              {editing ? (
                <div className="w-full">
                  <textarea
                    value={form.bio}
                    onChange={(e) => set("bio", e.target.value)}
                    rows={3}
                    maxLength={300}
                    className="input resize-none"
                  />
                  <p className="text-xs text-gray-400 text-right">
                    {form.bio.length}/300
                  </p>
                </div>
              ) : (
                <span className="text-gray-600">
                  {user.bio || (
                    <span className="text-gray-400 italic">Chưa có</span>
                  )}
                </span>
              )}
            </Row>

            {user.interests?.length > 0 && (
              <Row label="Sở thích" editing={false}>
                <div className="flex flex-wrap gap-1">
                  {user.interests.map((i) => (
                    <span
                      key={i}
                      className="text-xs bg-pink-50 text-pink-600 px-2 py-0.5 rounded-full border border-pink-100"
                    >
                      {i}
                    </span>
                  ))}
                </div>
              </Row>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          padding: 0.375rem 0.75rem;
          font-size: 0.875rem;
          transition: all 0.15s;
        }
        .input:focus {
          outline: none;
          ring: 2px;
          border-color: #f472b6;
          box-shadow: 0 0 0 2px rgba(244, 114, 182, 0.2);
        }
      `}</style>
    </AuthGuard>
  );
}

function Row({
  label,
  children,
  editing,
}: {
  label: string;
  children: React.ReactNode;
  editing: boolean;
}) {
  return (
    <div className={`flex ${editing ? "flex-col gap-1" : "items-start gap-4"}`}>
      <span
        className={`text-sm font-medium text-gray-500 ${editing ? "" : "w-24 flex-shrink-0"}`}
      >
        {label}
      </span>
      <div className="flex-1 text-sm text-gray-900">{children}</div>
    </div>
  );
}
