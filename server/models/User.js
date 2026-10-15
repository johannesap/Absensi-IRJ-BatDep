import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Admin dan User Penggembalaan memakai satu koleksi, dibedakan oleh `role`.
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: [true, 'Username wajib diisi'], unique: true, trim: true, lowercase: true },
    password: { type: String, required: [true, 'Password wajib diisi'], minlength: [10, 'Password minimal 10 karakter'], select: false },
    name: { type: String, required: [true, 'Nama wajib diisi'], trim: true },
    role: { type: String, enum: ['admin', 'penggembalaan'], default: 'penggembalaan' },
  },
  {
    timestamps: true,
    toJSON: { transform: (_doc, ret) => { delete ret.password; return ret; } },
  }
);

userSchema.pre('save', async function () {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.checkPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

export default mongoose.model('User', userSchema);
