const Match = require("../models/Match");
const { findFirstCommonSlot, isValidSlot } = require("../utils/slotMatcher");
const { sendSuccess, sendError } = require("../utils/response");

/**
 * GET /api/matches/:matchId
 * Get match detail
 */
const getMatchDetail = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { matchId } = req.params;

    const match = await Match.findOne({
      _id: matchId,
      users: userId,
    }).populate("users", "-password");

    if (!match) return sendError(res, 404, "Không tìm thấy match.");

    const matchedUser = match.users.find(
      (u) => u._id.toString() !== userId.toString(),
    );
    const matchedUserObj = matchedUser?.toObject
      ? matchedUser.toObject({ virtuals: true })
      : matchedUser;

    const myAvailability = match.availability.find(
      (a) => a.userId?.toString() === userId.toString(),
    );
    const theirAvailability = match.availability.find(
      (a) => a.userId?.toString() !== userId.toString(),
    );

    return sendSuccess(res, 200, "Lấy thông tin match thành công", {
      match: {
        _id: match._id,
        matchedUser: matchedUserObj,
        status: match.status,
        scheduledDate: match.scheduledDate,
        myAvailability: myAvailability || null,
        myAvailabilitySubmitted: !!myAvailability,
        theirAvailabilitySubmitted: !!theirAvailability,
        createdAt: match.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/matches/:matchId/availability
 * Submit availability slots for a match
 */
const submitAvailability = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { matchId } = req.params;
    const { slots } = req.body;

    // Validate each slot
    const invalidSlots = slots.filter((s) => !isValidSlot(s));
    if (invalidSlots.length > 0) {
      return sendError(
        res,
        400,
        "Một số khung giờ không hợp lệ. Giờ bắt đầu phải trước giờ kết thúc và ngày phải trong 3 tuần tới.",
      );
    }

    const match = await Match.findOne({ _id: matchId, users: userId });
    if (!match) return sendError(res, 404, "Không tìm thấy match.");

    // Find OTHER user's availability BEFORE modifying the array
    const otherAvailability = match.availability.find(
      (a) => a.userId?.toString() !== userId.toString(),
    );

    // Update or insert MY availability
    const myAvailIndex = match.availability.findIndex(
      (a) => a.userId?.toString() === userId.toString(),
    );

    if (myAvailIndex >= 0) {
      match.availability[myAvailIndex].slots = slots;
      match.availability[myAvailIndex].submittedAt = new Date();
    } else {
      match.availability.push({ userId, slots, submittedAt: new Date() });
    }

    if (otherAvailability) {
      const mySlots = slots;
      const theirSlots = otherAvailability.slots;

      const commonSlot = findFirstCommonSlot(mySlots, theirSlots);

      if (commonSlot) {
        match.scheduledDate = commonSlot;
        match.status = "scheduled";
      } else {
        match.scheduledDate = { date: null, startTime: null, endTime: null };
        match.status = "no_slot";
      }
    } else {
      match.status = "availability_pending";
    }

    await match.save();

    let message = "Đã lưu lịch rảnh của bạn!";
    if (match.status === "scheduled") {
      message = `✅ Hai bạn có date hẹn vào: ${match.scheduledDate.date} lúc ${match.scheduledDate.startTime} – ${match.scheduledDate.endTime}`;
    } else if (match.status === "no_slot") {
      message = "Chưa tìm được thời gian trùng. Vui lòng chọn lại.";
    }

    return sendSuccess(res, 200, message, {
      status: match.status,
      scheduledDate: match.scheduledDate,
      bothSubmitted: !!otherAvailability,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMatchDetail, submitAvailability };
