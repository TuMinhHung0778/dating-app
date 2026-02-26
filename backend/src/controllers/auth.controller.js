const User = require("../models/User");
const { generateToken } = require("../utils/jwt");
const { sendSuccess, sendError } = require("../utils/response");

/**
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { email, password, name, age, gender, bio, interests, location } =
      req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(
        res,
        400,
        "Email đã được sử dụng. Vui lòng dùng email khác.",
      );
    }

    const user = await User.create({
      email,
      password,
      name,
      age: Number(age),
      gender,
      bio: bio || "",
      interests: interests || [],
      location: location || "",
    });

    // FIX: dùng đúng tên hàm generateToken (không phải generateToen)
    const token = generateToken(user._id);

    return sendSuccess(res, 201, "Đăng ký thành công!", {
      token,
      user: user.toPublicJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return sendError(res, 401, "Email hoặc mật khẩu không đúng.");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 401, "Email hoặc mật khẩu không đúng.");
    }

    if (!user.isActive) {
      return sendError(res, 401, "Tài khoản đã bị vô hiệu hóa.");
    }

    const token = generateToken(user._id);

    return sendSuccess(res, 200, "Đăng nhập thành công!", {
      token,
      user: user.toPublicJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return sendError(res, 404, "Người dùng không tồn tại.");
    }

    return sendSuccess(res, 200, "Lấy thông tin người dùng thành công!", {
      user: user.toPublicJSON(),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };
