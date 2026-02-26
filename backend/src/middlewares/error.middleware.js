const { sendError } = require("../utils/response");

const errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err);

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return sendError(res, 400, messages.join(". "));
  }

  // Mongoose Duplicate Key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const fieldMap = { email: "Email" };
    return sendError(res, 400, `${fieldMap[field] || field} đã tồn tại.`);
  }

  // Mongoose Cast Error (invalid ObjectId)
  if (err.name === "CastError") {
    return sendError(res, 400, "ID không hợp lệ.");
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return sendError(res, 401, "Token không hợp lệ.");
  }

  if (err.name === "TokenExpiredError") {
    return sendError(res, 401, "Token hết hạn.");
  }

  // Default
  const status = err.statusCode || err.status || 500;
  const message = err.message || "Lỗi server. Vui lòng thử lại sau.";
  return sendError(res, status, message);
};

const notFound = (req, res) => {
  return sendError(res, 404, `Không tìm thấy route: ${req.originalUrl}`);
};

module.exports = { errorHandler, notFound };

// ==> File này định nghĩa middleware `errorHandler` để xử lý tất cả các lỗi phát sinh trong ứng dụng.
// Middleware này sẽ kiểm tra loại lỗi và trả về phản hồi phù hợp với mã lỗi và thông báo.
// Nó cũng định nghĩa middleware `notFound` để xử lý các route không tồn tại, trả về lỗi 404 với thông báo chi tiết.
