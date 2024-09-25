import { Router, Request, Response } from 'express';
import { buyWithJupiter } from '../../utils/trade';
import { Keypair, PublicKey } from '@solana/web3.js';
import { getUserSecretKey } from '../../controllers/user';
import base58 from 'bs58'
import { bot } from '../..';
import { BUY_SUCCESS_MSG } from '../../constants/msg.constants';
const BotRouter = Router();

// @route    GET /user/:userId
// @desc     Get user by ID
// @access   Private
BotRouter.post("/buy", async (req: Request, res: Response) => {
  console.log("req.body", req.body)
  const { userId, buyAmount, tokenMint } = req.body; // Extract the id from request parameters
  
  const secretKey: any = await getUserSecretKey(userId.toString())
  const kp: any = Keypair.fromSecretKey(base58.decode(secretKey))
  try {
    bot.sendMessage(userId, "Buying token from webchat bot.....", { parse_mode: 'HTML' });
    const tx = await buyWithJupiter(
      kp,
      // new PublicKey(userCache.activeBuyPoolId),
      new PublicKey(tokenMint),
      Number(buyAmount)
    )
    if (tx) {
      bot.sendMessage(userId, BUY_SUCCESS_MSG, { parse_mode: 'HTML' });
      console.log("tx", tx)
      return res.json({ result: "success", tx });
    }

  } catch (error: any) {
    console.error(error);
    return res.status(500).send({ error: error.message });
  }
});

export default BotRouter;