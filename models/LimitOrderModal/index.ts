import mongoose from 'mongoose';

const LimitSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  angelSecret: { type: String, required: true },
  // poolId: { type: String, required: true },
  type: {type: String, required: true, default: 'Buy'},
  tokenMint: { type: String, required: true },
  triggerPrice: {type: Number, required: true},
  interval: { type: Number, required: true, default: 60 * 1000 },
  slippage: { type: Number, required: true, default: 10 },
  solAmount: {type: Number, required: true, default: 0.003 },
  expiredAt: { type: Number, required: true, default: Date.now },
  duration: {type: String, required: true}
});

const LimitOrderModel = mongoose.model('limitorder', LimitSchema);

export default LimitOrderModel;