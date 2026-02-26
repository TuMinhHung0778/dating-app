const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendError } = require("../utils/response");

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return sendError(
        res,
        401,
        "Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.",
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return sendError(
        res,
        401,
        "Token không hợp lệ hoặc tài khoản không tồn tại.",
      );
    }

    if (!user.isActive) {
      return sendError(res, 401, "Tài khoản đã bị vô hiệu hóa.");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return sendError(res, 401, "Token không hợp lệ.");
    }
    if (error.name === "TokenExpiredError") {
      return sendError(res, 401, "Token đã hết hạn. Vui lòng đăng nhập lại.");
    }
    next(error);
  }
};

module.exports = { protect };

// ==> File này định nghĩa middleware `protect` để bảo vệ các route yêu cầu xác thực.
// Middleware này sẽ kiểm tra token JWT trong header của request, xác minh token, và nếu hợp lệ, gắn thông tin người dùng vào `req.user` để các route tiếp theo có thể sử dụng.
// Nếu token không hợp lệ hoặc hết hạn, middleware sẽ trả về lỗi 401 với thông báo phù hợp.
