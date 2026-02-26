"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authService, getErrorMessage } from "@/lib/services";
import { useAuthStore } from "@/store/authStore";

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth, user, init, isLoading } = useAuthStore();
  const [form, setForm] = useState<Record<string, string>>({
    name: "",
    email: "",
    password: "",
    age: "",
    gender: "",
    bio: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    init();
  }, []);
  useEffect(() => {
    if (!isLoading && user) router.replace("/discover");
  }, [user, isLoading]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Tên là bắt buộc";
    if (!form.email) e.email = "Email là bắt buộc";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Email không hợp lệ";
    if (!form.password) e.password = "Mật khẩu là bắt buộc";
    else if (form.password.length < 6) e.password = "Mật khẩu ít nhất 6 ký tự";
    if (!form.age) e.age = "Tuổi là bắt buộc";
    else if (Number(form.age) < 18 || Number(form.age) > 100)
      e.age = "Tuổi phải từ 18 đến 100";
    if (!form.gender) e.gender = "Giới tính là bắt buộc";
    return e;
  };

  const set = (field: string, val: string) => {
    setForm((f) => ({ ...f, [field]: val }));
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const res = await authService.register({
        ...form,
        age: Number(form.age),
      });
      setAuth(res.data.user, res.data.token);
      toast.success("Đăng ký thành công! Chào mừng 🎉");
      router.push("/discover");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const field = (
    label: string,
    name: string,
    type = "text",
    placeholder = "",
  ) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        value={form[name] || ""}
        onChange={(e) => set(name, e.target.value)}
        placeholder={placeholder}
        className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition ${errors[name] ? "border-red-400" : "border-gray-300"}`}
      />
      {errors[name] && (
        <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">💕</div>
          <h1 className="text-2xl font-bold text-gray-900">Tạo tài khoản</h1>
          <p className="text-gray-500 text-sm mt-1">
            Điền thông tin để bắt đầu
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {field("Tên *", "name", "text", "Nhập tên của bạn")}
          {field("Email *", "email", "email", "email@example.com")}
          {field("Mật khẩu *", "password", "password", "Ít nhất 6 ký tự")}

          <div className="grid grid-cols-2 gap-3">
            {field("Tuổi *", "age", "number", "18-100")}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giới tính *
              </label>
              <select
                value={form.gender}
                onChange={(e) => set("gender", e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition bg-white ${errors.gender ? "border-red-400" : "border-gray-300"}`}
              >
                <option value="">Chọn...</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
              {errors.gender && (
                <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio <span className="text-gray-400">(tuỳ chọn)</span>
            </label>
            <textarea
              value={form.bio}
              onChange={(e) => set("bio", e.target.value)}
              placeholder="Giới thiệu ngắn về bản thân..."
              rows={3}
              maxLength={300}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition resize-none"
            />
            <p className="text-xs text-gray-400 text-right">
              {form.bio.length}/300
            </p>
          </div>

          {field("Địa điểm", "location", "text", "TP. Hồ Chí Minh, Hà Nội...")}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white font-medium py-2.5 rounded-lg transition text-sm"
          >
            {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Đã có tài khoản?{" "}
          <Link
            href="/login"
            className="text-pink-500 hover:underline font-medium"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
