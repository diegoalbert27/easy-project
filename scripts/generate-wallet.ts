import { Wallet } from 'ethers';
import * as crypto from 'crypto';

// Clave secreta para encriptación (32 bytes para AES-256)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-secret-key!!';

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    'aes-256-gcm',
    Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)),
    iv,
  );
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

function decrypt(encryptedText: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)),
    iv,
  );
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function generateWallet(walletType: string) {
  const wallet = Wallet.createRandom();

  console.log('\n========================================');
  console.log(`WALLET TYPE: ${walletType}`);
  console.log('========================================\n');

  console.log('--- RAW VALUES (DO NOT SHARE) ---');
  console.log('Address:', wallet.address);
  console.log('Private Key:', wallet.privateKey);
  console.log('Mnemonic:', wallet.mnemonic?.phrase);

  const encryptedPrivateKey = encrypt(wallet.privateKey);
  const encryptedPhrase = encrypt(wallet.mnemonic?.phrase || '');

  console.log('\n--- ENCRYPTED VALUES (FOR DATABASE) ---');
  console.log('address:', wallet.address);
  console.log('private_key (encrypted):', encryptedPrivateKey);
  console.log('phrase (encrypted):', encryptedPhrase);
  console.log('wallet_type:', walletType);

  // Verify decryption works
  console.log('\n--- VERIFICATION ---');
  console.log('Decrypted Private Key matches:', decrypt(encryptedPrivateKey) === wallet.privateKey);
  console.log('Decrypted Phrase matches:', decrypt(encryptedPhrase) === wallet.mnemonic?.phrase);

  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
    phrase: wallet.mnemonic?.phrase,
    encryptedPrivateKey,
    encryptedPhrase,
  };
}

// Generate wallets
console.log('\n🔐 GENERATING TEST WALLETS FOR SEPOLIA\n');
console.log('ENCRYPTION_KEY used:', ENCRYPTION_KEY.slice(0, 10) + '...');

// Wallet Recipient (Global)
generateWallet('recipient');

// Wallet Client (Simulation)
generateWallet('client');

console.log('\n========================================');
console.log('📋 NEXT STEPS:');
console.log('1. Copy the encrypted values to your database');
console.log('2. Fund the wallets with Sepolia ETH and USDC');
console.log('3. Add ENCRYPTION_KEY to your .env');
console.log('========================================\n');
