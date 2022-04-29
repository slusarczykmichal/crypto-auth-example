import cors from 'cors';
import express, { Request, Response } from 'express';
import WalletUtils from './WalletUtils';

const app = express();
const PORT = 5001;

app.use(express.json());
app.use(cors());

const walletUtils = new WalletUtils();

app.get('/authmessage/:walletAddress', async (req: Request, res: Response) => {
  const walletAddress = req.params.walletAddress as string;
  const authMessage = await walletUtils.generateAuthMessage(walletAddress);
  return res.json({ authMessage });
});

app.post('/auth/:walletAddress', async (req: Request, res: Response) => {
  const walletAddress = req.params.walletAddress as string;
  const signature = req.body.signature as string;

  try {
    const result = await walletUtils.verifyMessage(walletAddress, signature);

    if (result) {
      return res.json({
        message: `Successfuly authenticated as ${walletAddress}`,
      });
    } else {
      return res
        .status(401)
        .json({ message: 'Unable to verify the signature!' });
    }
  } catch {
    return res
      .status(401)
      .json({ message: 'Authentication messsage expired!' });
  }
});

app.listen(PORT, () => {
  console.log(`Running on port  ${PORT}`);
});
