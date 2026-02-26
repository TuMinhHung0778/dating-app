const express = require("express");
const router = express.Router();

const {
  getMatchDetail,
  submitAvailability,
} = require("../controllers/match.controller");
const { protect } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const {
  availabilityValidator,
} = require("../validators/availability.validator");

router.use(protect);

router.get("/:matchId", getMatchDetail);
router.post(
  "/:matchId/availability",
  availabilityValidator,
  validate,
  submitAvailability,
);

module.exports = router;
