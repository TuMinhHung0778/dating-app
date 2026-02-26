const express = require("express");
const router = express.Router();

const {
  getUsers,
  getUserById,
  updateProfile,
} = require("../controllers/user.controller");
const { protect } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { updateProfileValidator } = require("../validators/auth.validator");

router.use(protect);

router.get("/", getUsers);
// NOTE: PUT /profile MUST be before GET /:id to avoid "profile" being treated as an :id param
router.put("/profile", updateProfileValidator, validate, updateProfile);
router.get("/:id", getUserById);

module.exports = router;
