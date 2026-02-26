const express = require("express");
const router = express.Router();

const { register, login, getMe } = require("../controllers/auth.controller");
const { protect } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const {
  registerValidator,
  loginValidator,
} = require("../validators/auth.validator");

router.post("/register", registerValidator, validate, register);
router.post("/login", loginValidator, validate, login);
router.get("/me", protect, getMe);

module.exports = router;

// ==> File này định nghĩa các route liên quan đến xác thực người dùng, bao gồm đăng ký, đăng nhập và lấy thông tin người dùng hiện tại.
// Các route này sử dụng các validator để kiểm tra dữ liệu đầu vào và middleware `validate` để xử lý lỗi validation. Route `/me` được bảo vệ bằng middleware `protect`, yêu cầu người dùng phải có token hợp lệ để truy cập.
