const User = require("../models/User");
const Like = require("../models/Like");
const { sendSuccess, sendError } = require("../utils/response");

/**
 * GET /api/users
 * Get all users except current user, with like status
 */
const getUsers = async (req, res, next) => {
  try {
    const currentUserId = req.user._id; // Lấy ID người dùng hiện tại từ req.user (được set bởi middleware protect)

    // Lấy tất cả người dùng khác (isActive: true) và sắp xếp theo createdAt giảm dần
    const users = await User.find({
      _id: { $ne: currentUserId },
      isActive: true,
    })
      .select("-password")
      .sort({ createdAt: -1 });

    // Get all likes của current user để xác định trạng thái like
    const myLikes = await Like.find({ liker: currentUserId });
    const likedIds = new Set(myLikes.map((l) => l.liked.toString())); // Chuyển liked ObjectId thành string để dễ so sánh

    // Get all likes TO current user để xác định trạng thái được like - để hiển thị "Đã thích bạn" nếu người khác đã like current user
    const likesToMe = await Like.find({ liked: currentUserId });
    const whoLikedMeIds = new Set(likesToMe.map((l) => l.liker.toString()));

    // Map users để thêm thông tin trạng thái like
    const usersWithStatus = users.map((u) => {
      const uid = u._id.toString();
      const obj = u.toObject({ virtuals: true });
      delete obj.password;
      return {
        ...obj,
        isLikedByMe: likedIds.has(uid),
        likedMe: whoLikedMeIds.has(uid),
        isMatch: likedIds.has(uid) && whoLikedMeIds.has(uid),
      };
    });

    // Trả về danh sách người dùng kèm trạng thái like
    return sendSuccess(res, 200, "Lấy danh sách người dùng thành công", {
      users: usersWithStatus,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/:id
 * Get single user profile
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password"); // Lấy thông tin người dùng theo ID, loại bỏ trường password

    // Nếu không tìm thấy người dùng, trả về lỗi 404
    if (!user) {
      return sendError(res, 404, "Không tìm thấy người dùng");
    }

    const obj = user.toObject({ virtuals: true }); // Chuyển document thành object để có thể thêm virtuals
    return sendSuccess(res, 200, "Lấy thông tin thành công", { user: obj }); // Trả về thông tin người dùng
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/users/profile
 * Update current user profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, age, gender, bio, interests, location, avatar } = req.body; // Lấy thông tin cập nhật từ request body

    const updateFields = {}; // Tạo object chứa các trường cần cập nhật

    // Chỉ cập nhật những trường được cung cấp trong request body
    if (name !== undefined) updateFields.name = name;
    if (age !== undefined) updateFields.age = Number(age);
    if (gender !== undefined) updateFields.gender = gender;
    if (bio !== undefined) updateFields.bio = bio;
    if (interests !== undefined) updateFields.interests = interests;
    if (location !== undefined) updateFields.location = location;
    if (avatar !== undefined) updateFields.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.user._id, // Lấy ID người dùng hiện tại từ req.user (được set bởi middleware protect)
      { $set: updateFields }, // Cập nhật các trường được cung cấp
      { new: true, runValidators: true }, // Trả về document sau khi cập nhật và chạy validators
    );

    return sendSuccess(res, 200, "Cập nhật profile thành công!", {
      user: user.toPublicJSON(),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, getUserById, updateProfile };
