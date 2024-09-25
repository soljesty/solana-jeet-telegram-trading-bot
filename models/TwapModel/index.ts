import mongoose from 'mongoose';

const DCAOrderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  angelSecret: { type: String, required: true },
  // poolId: { type: String, required: true },
  type: { type: String, required: true, default: 'Buy' },
  tokenMint: { type: String, required: true },
  orderNum: { type: Number, required: true },
  interval: { type: Number, required: true, default: 60 * 1000 },
  slippage: { type: Number, required: true, default: 10 },
  solAmount: { type: Number, required: true, default: 0.003 },
  duration: { type: Number, required: true },
  expiredAt: { type: Number, required: true, default: Date.now },
  poolId: { type: String }
});

const DCAOrderModel = mongoose.model('dcaorder', DCAOrderSchema);

export default DCAOrderModel;