const { body } = require("express-validator");

const availabilityValidator = [
  body("slots").isArray({ min: 1 }).withMessage("Phải có ít nhất 1 khung giờ"),

  body("slots.*.date")
    .notEmpty()
    .withMessage("Ngày là bắt buộc")
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("Ngày phải theo định dạng YYYY-MM-DD"),

  body("slots.*.startTime")
    .notEmpty()
    .withMessage("Giờ bắt đầu là bắt buộc")
    .matches(/^\d{2}:\d{2}$/)
    .withMessage("Giờ phải theo định dạng HH:MM"),

  body("slots.*.endTime")
    .notEmpty()
    .withMessage("Giờ kết thúc là bắt buộc")
    .matches(/^\d{2}:\d{2}$/)
    .withMessage("Giờ phải theo định dạng HH:MM"),
];

module.exports = { availabilityValidator };

// ==> File này định nghĩa validator `availabilityValidator` để kiểm tra dữ liệu đầu vào khi người dùng cập nhật khung giờ sẵn có của mình.
// Validator này sử dụng `express-validator` để đảm bảo rằng trường `slots` là một mảng có ít nhất một phần tử, và mỗi phần tử phải có các trường `date`, `startTime`, và `endTime` với định dạng hợp lệ. Nếu có lỗi validation, chúng sẽ được middleware `validate` xử lý và trả về lỗi phù hợp.
