"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Calendar,
  CheckCircle,
  Clock,
} from "lucide-react";
import AuthGuard from "@/components/layout/AuthGuard";
import { matchService, getErrorMessage } from "@/lib/services";
import type { MatchDetail, TimeSlot } from "@/types";

// Generate dates for next 3 weeks
function getNext3Weeks() {
  const dates: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 21; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

const DATES = getNext3Weeks();

const formatDate = (d: string) => {
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
};

const statusMsg: Record<string, { label: string; color: string }> = {
  matched: { label: "💕 Đã match — hãy chọn lịch!", color: "text-pink-600" },
  availability_pending: {
    label: "⏳ Chờ người kia gửi lịch...",
    color: "text-yellow-600",
  },
  scheduled: { label: "✅ Đã tìm được lịch hẹn!", color: "text-green-600" },
  no_slot: {
    label: "😅 Không có lịch trùng — hãy chọn lại",
    color: "text-orange-600",
  },
};

export default function MatchDetailPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const router = useRouter();
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [slots, setSlots] = useState<TimeSlot[]>([
    { date: DATES[0], startTime: "09:00", endTime: "12:00" },
  ]);

  const fetchMatch = useCallback(async () => {
    try {
      const res = await matchService.getMatchDetail(matchId);
      if (res.success && res.data) {
        setMatch(res.data.match);
        if (res.data.match.myAvailability?.slots?.length) {
          setSlots(res.data.match.myAvailability.slots);
        }
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    fetchMatch();
  }, [fetchMatch]);

  const addSlot = () =>
    setSlots((s) => [
      ...s,
      { date: DATES[0], startTime: "09:00", endTime: "12:00" },
    ]);
  const removeSlot = (i: number) =>
    setSlots((s) => s.filter((_, idx) => idx !== i));
  const updateSlot = (i: number, field: keyof TimeSlot, val: string) =>
    setSlots((s) =>
      s.map((slot, idx) => (idx === i ? { ...slot, [field]: val } : slot)),
    );

  const handleSubmit = async () => {
    const invalid = slots.some(
      (s) => !s.date || !s.startTime || !s.endTime || s.startTime >= s.endTime,
    );
    if (invalid) {
      toast.error("Kiểm tra lại: giờ kết thúc phải sau giờ bắt đầu");
      return;
    }
    if (slots.length === 0) {
      toast.error("Thêm ít nhất 1 khung giờ");
      return;
    }
    setSubmitting(true);
    try {
      const res = await matchService.submitAvailability(matchId, slots);
      toast.success(res.message);
      await fetchMatch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthGuard>
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm mb-4 transition"
      >
        <ArrowLeft size={16} /> Quay lại
      </button>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-xl h-32 animate-pulse"
            />
          ))}
        </div>
      ) : !match ? (
        <div className="text-center py-16 text-gray-400">
          Không tìm thấy match này
        </div>
      ) : (
        <div className="max-w-lg space-y-4">
          {/* Match header card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-4 mb-4">
              <img
                src={
                  match.matchedUser.avatarUrl ||
                  `https://api.dicebear.com/8.x/avataaars/svg?seed=${match.matchedUser.name}`
                }
                alt={match.matchedUser.name}
                className="w-14 h-14 rounded-full border-2 border-pink-100"
              />
              <div>
                <h2 className="font-bold text-gray-900">
                  {match.matchedUser.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {match.matchedUser.age} tuổi ·{" "}
                  {match.matchedUser.location || "Việt Nam"}
                </p>
                <p
                  className={`text-xs font-medium mt-0.5 ${statusMsg[match.status]?.color}`}
                >
                  {statusMsg[match.status]?.label}
                </p>
              </div>
            </div>

            {/* Availability status */}
            <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-lg p-3">
              <div
                className={`flex items-center gap-2 text-sm ${match.myAvailabilitySubmitted ? "text-green-600" : "text-gray-400"}`}
              >
                {match.myAvailabilitySubmitted ? (
                  <CheckCircle size={15} />
                ) : (
                  <Clock size={15} />
                )}
                <span>
                  Bạn {match.myAvailabilitySubmitted ? "đã gửi" : "chưa gửi"}
                </span>
              </div>
              <div
                className={`flex items-center gap-2 text-sm ${match.theirAvailabilitySubmitted ? "text-green-600" : "text-gray-400"}`}
              >
                {match.theirAvailabilitySubmitted ? (
                  <CheckCircle size={15} />
                ) : (
                  <Clock size={15} />
                )}
                <span>
                  {match.matchedUser.name.split(" ").pop()}{" "}
                  {match.theirAvailabilitySubmitted ? "đã gửi" : "chưa gửi"}
                </span>
              </div>
            </div>
          </div>

          {/* Result: Scheduled */}
          {match.status === "scheduled" && match.scheduledDate.date && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={18} className="text-green-600" />
                <h3 className="font-semibold text-green-800">
                  Lịch hẹn đã xác nhận!
                </h3>
              </div>
              <p className="text-green-700 text-sm">
                ✅ Hai bạn có date hẹn vào:{" "}
                <strong>{formatDate(match.scheduledDate.date)}</strong> lúc{" "}
                <strong>
                  {match.scheduledDate.startTime} –{" "}
                  {match.scheduledDate.endTime}
                </strong>
              </p>
            </div>
          )}

          {/* Result: No slot */}
          {match.status === "no_slot" && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-700">
              😅 Chưa tìm được thời gian trùng. Vui lòng chọn lại!
            </div>
          )}

          {/* Availability form */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <Calendar size={17} className="text-pink-500" />
              {match.myAvailabilitySubmitted
                ? "Cập nhật lịch rảnh"
                : "Chọn thời gian rảnh"}
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Chọn các khung giờ bạn rảnh trong 3 tuần tới
            </p>

            <div className="space-y-3 mb-4">
              {slots.map((slot, i) => (
                <div
                  key={i}
                  className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-600">
                      Khung {i + 1}
                    </span>
                    {slots.length > 1 && (
                      <button
                        onClick={() => removeSlot(i)}
                        className="text-red-400 hover:text-red-600 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">
                        Ngày
                      </label>
                      <select
                        value={slot.date}
                        onChange={(e) => updateSlot(i, "date", e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-2 focus:ring-pink-400 focus:border-pink-400 bg-white"
                      >
                        {DATES.map((d) => (
                          <option key={d} value={d}>
                            {formatDate(d)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">
                        Từ
                      </label>
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) =>
                          updateSlot(i, "startTime", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">
                        Đến
                      </label>
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) =>
                          updateSlot(i, "endTime", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
                      />
                    </div>
                  </div>
                  {slot.startTime >= slot.endTime && (
                    <p className="text-red-500 text-xs mt-1">
                      ⚠ Giờ kết thúc phải sau giờ bắt đầu
                    </p>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={addSlot}
              className="w-full border-2 border-dashed border-gray-300 text-gray-400 hover:border-pink-300 hover:text-pink-400 py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition mb-4"
            >
              <Plus size={15} /> Thêm khung giờ
            </button>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white font-medium py-2.5 rounded-lg transition text-sm"
            >
              {submitting
                ? "Đang lưu..."
                : match.myAvailabilitySubmitted
                  ? "Cập nhật lịch"
                  : "Gửi lịch rảnh"}
            </button>

            {match.myAvailabilitySubmitted &&
              !match.theirAvailabilitySubmitted && (
                <p className="text-center text-xs text-gray-400 mt-3">
                  ⏳ Chờ {match.matchedUser.name.split(" ").pop()} gửi lịch để
                  hệ thống tìm thời gian trùng
                </p>
              )}
          </div>
        </div>
      )}
    </AuthGuard>
  );
}
