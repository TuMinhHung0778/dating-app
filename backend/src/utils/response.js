const sendSuccess = (
  res,
  statusCode = 200,
  message = "Thành công",
  data = null,
  meta = null,
) => {
  const response = { success: true, message };
  if (data !== null) response.data = data; // Chỉ thêm trường data nếu có dữ liệu
  if (meta !== null) response.meta = meta; // Chỉ thêm trường meta nếu có dữ liệu
  return res.status(statusCode).json(response);
};

const sendError = (
  res,
  statusCode = 500,
  message = "Lỗi server",
  data = null,
) => {
  const response = { success: false, message };
  if (data !== null) response.data = data; // Chỉ thêm trường data nếu có dữ liệu
  return res.status(statusCode).json(response);
};

module.exports = {
  sendSuccess,
  sendError,
};
