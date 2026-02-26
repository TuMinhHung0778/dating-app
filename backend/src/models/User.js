const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email là bắt buộc"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Email không hợp lệ"],
    },
    password: {
      type: String,
      required: [true, "Mật khẩu là bắt buộc"],
      minlength: [6, "Mật khẩu ít nhất 6 ký tự"],
      select: false,
    },
    name: {
      type: String,
      required: [true, "Tên là bắt buộc"],
      trim: true,
      maxlength: [50, "Tên tối đa 50 ký tự"],
    },
    age: {
      type: Number,
      required: [true, "Tuổi là bắt buộc"],
      min: [18, "Bạn phải ít nhất 18 tuổi"],
      max: [100, "Tuổi không hợp lệ"],
    },
    gender: {
      type: String,
      required: [true, "Giới tính là bắt buộc"],
      enum: {
        values: ["male", "female", "other"],
        message: "Giới tính không hợp lệ",
      },
    },
    bio: {
      type: String,
      maxlength: [300, "Bio tối đa 300 ký tự"],
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    interests: [
      {
        type: String,
        trim: true,
      },
    ],
    location: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ─── Hash password before save ────────────────────────────────────────────────
// FIX: Mongoose 7+ async middleware — KHÔNG truyền `next` vào async function.
// Mongoose tự detect promise trả về và handle. Truyền `next` vào async function
// sẽ gây lỗi "next is not a function" trên Mongoose 7/8.
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Instance method: so sánh password khi login
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual: trả về avatar URL (dùng DiceBear nếu chưa upload)
userSchema.virtual("avatarUrl").get(function () {
  if (this.avatar) return this.avatar;
  const seed = encodeURIComponent(this.name || this.email);
  return `https://api.dicebear.com/8.x/avataaars/svg?seed=${seed}`;
});

// Method: trả về user object không có password
userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject({ virtuals: true });
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
