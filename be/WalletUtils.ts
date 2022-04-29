import crypto from 'crypto';
import Keyv from 'keyv';

import { recoverPersonalSignature } from 'eth-sig-util';
import { bufferToHex } from 'ethereumjs-util';

export default class WalletUtils {
  private keyv = new Keyv();
  private baseKey = 'auth-messages:';
  private TTL = 60 * 1000;

  async generateAuthMessage(walletAddress: string): Promise<string> {
    const message = `Confirm authentication for wallet ${walletAddress}. Nonce: ${crypto
      .randomBytes(16)
      .toString('hex')}`;
    const key = this.baseKey + walletAddress;

    await this.keyv.set(key, message, this.TTL);

    return message;
  }

  async verifyMessage(walletAddress: string, signature: string) {
    const key = this.baseKey + walletAddress;

    const message = await this.keyv.get(key);
    await this.keyv.delete(key);

    if (!message) {
      throw new Error('Authentication message expired!');
    }

    const msgBufferHex = bufferToHex(Buffer.from(message, 'utf8'));
    const address = recoverPersonalSignature({
      data: msgBufferHex,
      sig: signature,
    });

    return address.toLocaleLowerCase() === walletAddress.toLocaleLowerCase();
  }
}
