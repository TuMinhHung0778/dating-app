const { validationResult } = require("express-validator");
const { sendError } = require("../utils/response");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return sendError(res, 422, messages[0], { errors: errors.array() });
  }
  next();
};

module.exports = { validate };

// ==> File này định nghĩa middleware `validate` để xử lý kết quả của các validator được sử dụng trong route.
// Middleware này sẽ kiểm tra nếu có lỗi validation nào, nó sẽ trả về lỗi 422 với thông báo lỗi đầu tiên và chi tiết lỗi. Nếu không có lỗi, nó sẽ gọi `next()` để tiếp tục xử lý request.
