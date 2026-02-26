const Like = require("../models/Like");
const Match = require("../models/Match");
const User = require("../models/User");
const { sendSuccess, sendError } = require("../utils/response");

/**
 * POST /api/likes/:userId
 * Like a user. If mutual, create a match.
 * ==> api này mục đích chính là để tạo like, còn việc kiểm tra có match hay không sẽ được xử lý trong controller này luôn cho tiện.
 * Nếu để match controller xử lý thì sẽ phải check rất nhiều lần (khi nào cũng phải check khi tạo like mới, và cả khi xóa like nữa)
 */
const likeUser = async (req, res, next) => {
  try {
    const likerId = req.user._id;
    const likedId = req.params.userId;

    if (likerId.toString() === likedId) {
      return sendError(res, 400, "Bạn không thể like chính mình.");
    }

    const likedUser = await User.findById(likedId);
    if (!likedUser) {
      return sendError(res, 404, "Người dùng không tồn tại.");
    }

    // Check if already liked
    const existingLike = await Like.findOne({ liker: likerId, liked: likedId });
    if (existingLike) {
      return sendError(res, 400, "Bạn đã like người này rồi.");
    }

    // Create like
    await Like.create({ liker: likerId, liked: likedId });

    // Check if mutual like exists (the other person liked me back)
    const mutualLike = await Like.findOne({ liker: likedId, liked: likerId });

    let isMatch = false;
    let match = null;

    if (mutualLike) {
      // Check if match already created
      const existingMatch = await Match.findByUsers(likerId, likedId);

      if (!existingMatch) {
        match = await Match.create({
          users: [likerId, likedId],
          status: "matched",
        });
      } else {
        match = existingMatch;
      }
      isMatch = true;
    }

    return sendSuccess(
      res,
      201,
      isMatch ? "It's a Match! 🎉" : "Đã like thành công!",
      {
        isMatch,
        matchId: match?._id || null,
      },
    );
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/likes/:userId
 * Unlike a user
 * ==> api này chỉ đơn thuần xóa like, còn việc xóa match nếu có sẽ được xử lý trong match controller để tránh phải check nhiều lần như đã giải thích ở trên.
 */
const unlikeUser = async (req, res, next) => {
  try {
    const likerId = req.user._id;
    const likedId = req.params.userId;

    await Like.findOneAndDelete({ liker: likerId, liked: likedId });

    return sendSuccess(res, 200, "Đã bỏ like.");
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/likes/matches
 * Get all matches for the current user
 * ==> api này chỉ trả về danh sách match, còn việc lấy thông tin chi tiết của match đó sẽ được xử lý trong match controller để tránh phải check nhiều lần như đã giải thích ở trên.
 */
const getMatches = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const matches = await Match.find({ users: userId })
      .populate("users", "-password")
      .sort({ createdAt: -1 });

    const formattedMatches = matches.map((m) => {
      const matchedUser = m.users.find(
        (u) => u._id.toString() !== userId.toString(),
      );
      const myAvailability = m.availability.find(
        (a) => a.userId?.toString() === userId.toString(),
      );
      const theirAvailability = m.availability.find(
        (a) => a.userId?.toString() !== userId.toString(),
      );

      const matchedUserObj = matchedUser?.toObject
        ? matchedUser.toObject({ virtuals: true })
        : matchedUser;

      return {
        _id: m._id,
        matchedUser: matchedUserObj,
        status: m.status,
        scheduledDate: m.scheduledDate,
        myAvailabilitySubmitted: !!myAvailability,
        theirAvailabilitySubmitted: !!theirAvailability,
        createdAt: m.createdAt,
      };
    });

    return sendSuccess(res, 200, "Lấy danh sách match thành công", {
      matches: formattedMatches,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { likeUser, unlikeUser, getMatches };
