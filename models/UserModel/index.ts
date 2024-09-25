import mongoose from 'mongoose';

export enum UserRole {
  Admin,
  Manager,
  User,
}

const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  walletAddress: { type: [String] }, // Updated to be an array of strings
  name: { type: String },
  username: { type: String },
  role: { type: Number, required: true, default: UserRole.User },
  lastLogin: { type: Date, required: true, default: Date.now },
  isVerified: { type: Boolean, required: true, default: false },
  type: { type: String },
});

const UserModel = mongoose.model('user', UserSchema);

export default UserModel;