const express = require("express");
const router = express.Router();

const {
  likeUser,
  unlikeUser,
  getMatches,
} = require("../controllers/like.controller");
const { protect } = require("../middlewares/auth.middleware");

router.use(protect);

// NOTE: GET /matches/list MUST be before POST /:userId — otherwise "matches" is treated as a userId param
router.get("/matches/list", getMatches);
router.post("/:userId", likeUser);
router.delete("/:userId", unlikeUser);

module.exports = router;
