const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    // Availability slots submitted by each user
    availability: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        slots: [
          {
            date: { type: String, required: true }, // "YYYY-MM-DD"
            startTime: { type: String, required: true }, // "HH:MM"
            endTime: { type: String, required: true }, // "HH:MM"
          },
        ],
        submittedAt: { type: Date, default: Date.now },
      },
    ],
    // Computed first common slot
    scheduledDate: {
      date: { type: String, default: null },
      startTime: { type: String, default: null },
      endTime: { type: String, default: null },
    },
    status: {
      type: String,
      enum: ["matched", "availability_pending", "scheduled", "no_slot"],
      default: "matched",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Ensure a match between 2 users is unique (order-independent)
matchSchema.index({ users: 1 }, { unique: true });

// Find match by two user IDs (order-independent)
matchSchema.statics.findByUsers = async function (userId1, userId2) {
  return this.findOne({
    users: { $all: [userId1, userId2] },
  });
};

module.exports = mongoose.model("Match", matchSchema);
