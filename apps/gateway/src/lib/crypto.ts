import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";
import { config } from "../config.js";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const SALT_LENGTH = 32;

function deriveKey(salt: Buffer): Buffer {
  return scryptSync(config.encryption.key, salt, 32);
}

export function encrypt(plaintext: string): string {
  const salt = randomBytes(SALT_LENGTH);
  const key = deriveKey(salt);
  const iv = randomBytes(IV_LENGTH);
  
  const cipher = createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  const tag = cipher.getAuthTag();
  
  // Format: salt:iv:tag:encrypted (all hex encoded)
  return [
    salt.toString("hex"),
    iv.toString("hex"),
    tag.toString("hex"),
    encrypted,
  ].join(":");
}

export function decrypt(encryptedData: string): string {
  const [saltHex, ivHex, tagHex, encrypted] = encryptedData.split(":");
  
  if (!saltHex || !ivHex || !tagHex || !encrypted) {
    throw new Error("Invalid encrypted data format");
  }
  
  const salt = Buffer.from(saltHex, "hex");
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const key = deriveKey(salt);
  
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
}

// Hash API key for secure storage (one-way)
export function hashApiKey(apiKey: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(apiKey, salt, 64);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

// Verify API key against hash
export function verifyApiKey(apiKey: string, storedHash: string): boolean {
  const [saltHex, hashHex] = storedHash.split(":");
  if (!saltHex || !hashHex) return false;
  
  const salt = Buffer.from(saltHex, "hex");
  const hash = scryptSync(apiKey, salt, 64);
  return hash.toString("hex") === hashHex;
}

// Generate a preview of API key (last 4 chars)
export function getKeyPreview(apiKey: string): string {
  if (apiKey.length <= 4) return "****";
  return `...${apiKey.slice(-4)}`;
}

// Generate a new API key
export function generateApiKey(prefix: string = "rsk"): string {
  const random = randomBytes(24).toString("base64url");
  return `${prefix}_${random}`;
}
