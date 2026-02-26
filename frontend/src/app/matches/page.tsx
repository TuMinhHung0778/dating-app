"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Calendar, Clock, CheckCircle } from "lucide-react";
import AuthGuard from "@/components/layout/AuthGuard";
import { likeService, getErrorMessage } from "@/lib/services";
import type { Match } from "@/types";

const statusLabel: Record<string, string> = {
  matched: "💕 Đã match",
  availability_pending: "⏳ Chờ chọn lịch",
  scheduled: "✅ Đã có lịch",
  no_slot: "😅 Chưa có lịch trùng",
};

const statusColor: Record<string, string> = {
  matched: "bg-pink-100 text-pink-700",
  availability_pending: "bg-yellow-100 text-yellow-700",
  scheduled: "bg-green-100 text-green-700",
  no_slot: "bg-orange-100 text-orange-700",
};

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    likeService
      .getMatches()
      .then((res) => {
        if (res.success && res.data) setMatches(res.data.matches);
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthGuard>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 mb-1">
          Matches của bạn 💕
        </h1>
        <p className="text-gray-500 text-sm">
          Những người đã thích nhau với bạn
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl h-20 border border-gray-200 animate-pulse"
            />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">💔</div>
          <p className="font-medium">Chưa có match nào</p>
          <p className="text-sm mt-1">Hãy vào Khám phá và like người khác!</p>
          <Link
            href="/discover"
            className="inline-block mt-4 bg-pink-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-pink-600 transition"
          >
            Khám phá ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((match) => (
            <Link key={match._id} href={`/matches/${match._id}`}>
              <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition flex items-center gap-4 cursor-pointer">
                {/* Avatar */}
                <img
                  src={
                    match.matchedUser.avatarUrl ||
                    `https://api.dicebear.com/8.x/avataaars/svg?seed=${match.matchedUser.name}`
                  }
                  alt={match.matchedUser.name}
                  className="w-12 h-12 rounded-full border-2 border-pink-100 flex-shrink-0"
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">
                      {match.matchedUser.name}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${statusColor[match.status]}`}
                    >
                      {statusLabel[match.status]}
                    </span>
                  </div>

                  {match.status === "scheduled" && match.scheduledDate.date ? (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <Calendar size={13} />
                      {match.scheduledDate.date} lúc{" "}
                      {match.scheduledDate.startTime} –{" "}
                      {match.scheduledDate.endTime}
                    </p>
                  ) : (
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span
                        className={`flex items-center gap-1 ${match.myAvailabilitySubmitted ? "text-green-500" : ""}`}
                      >
                        {match.myAvailabilitySubmitted ? (
                          <CheckCircle size={12} />
                        ) : (
                          <Clock size={12} />
                        )}
                        Bạn{" "}
                        {match.myAvailabilitySubmitted ? "đã gửi" : "chưa gửi"}
                      </span>
                      <span>·</span>
                      <span
                        className={`flex items-center gap-1 ${match.theirAvailabilitySubmitted ? "text-green-500" : ""}`}
                      >
                        {match.theirAvailabilitySubmitted ? (
                          <CheckCircle size={12} />
                        ) : (
                          <Clock size={12} />
                        )}
                        {match.matchedUser.name.split(" ").pop()}{" "}
                        {match.theirAvailabilitySubmitted
                          ? "đã gửi"
                          : "chưa gửi"}
                      </span>
                    </div>
                  )}
                </div>

                <span className="text-gray-400 text-lg">›</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </AuthGuard>
  );
}
