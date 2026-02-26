const { body } = require("express-validator");

const registerValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email là bắt buộc")
    .isEmail()
    .withMessage("Email không hợp lệ")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Mật khẩu là bắt buộc")
    .isLength({ min: 6 })
    .withMessage("Mật khẩu ít nhất 6 ký tự"),

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Tên là bắt buộc")
    .isLength({ max: 50 })
    .withMessage("Tên tối đa 50 ký tự"),

  body("age")
    .notEmpty()
    .withMessage("Tuổi là bắt buộc")
    .isInt({ min: 18, max: 100 })
    .withMessage("Tuổi phải từ 18 đến 100"),

  body("gender")
    .notEmpty()
    .withMessage("Giới tính là bắt buộc")
    .isIn(["male", "female", "other"])
    .withMessage("Giới tính không hợp lệ (male/female/other)"),

  body("bio")
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage("Bio tối đa 300 ký tự"),
];

const loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email là bắt buộc")
    .isEmail()
    .withMessage("Email không hợp lệ")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Mật khẩu là bắt buộc"),
];

const updateProfileValidator = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Tên từ 1 đến 50 ký tự"),

  body("age")
    .optional()
    .isInt({ min: 18, max: 100 })
    .withMessage("Tuổi phải từ 18 đến 100"),

  body("gender")
    .optional()
    .isIn(["male", "female", "other"])
    .withMessage("Giới tính không hợp lệ"),

  body("bio")
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage("Bio tối đa 300 ký tự"),

  body("location")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Địa điểm tối đa 100 ký tự"),

  body("interests").optional().isArray().withMessage("Sở thích phải là mảng"),
];

module.exports = { registerValidator, loginValidator, updateProfileValidator };

// ==> File này định nghĩa các validator cho các route liên quan đến xác thực và quản lý hồ sơ người dùng.
// Các validator này sử dụng `express-validator` để kiểm tra dữ liệu đầu vào, đảm bảo rằng các trường như email, mật khẩu, tên, tuổi, giới tính, bio, địa điểm và sở thích đều hợp lệ trước khi được xử lý bởi controller. Nếu có lỗi validation, chúng sẽ được middleware `validate` xử lý và trả về lỗi phù hợp.
