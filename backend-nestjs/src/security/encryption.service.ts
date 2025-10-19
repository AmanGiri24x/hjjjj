import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 16; // 128 bits
  private readonly tagLength = 16; // 128 bits
  private readonly saltLength = 32; // 256 bits

  private readonly encryptionKey: Buffer;

  constructor() {
    // In production, this should come from environment variables or key management service
    const keyString = process.env.ENCRYPTION_KEY || this.generateDefaultKey();
    this.encryptionKey = Buffer.from(keyString, 'hex');
  }

  /**
   * Encrypt sensitive data using AES-256-GCM
   */
  encrypt(plaintext: string): string {
    try {
      const iv = crypto.randomBytes(this.ivLength);
      const salt = crypto.randomBytes(this.saltLength);
      
      // Derive key using PBKDF2
      const key = crypto.pbkdf2Sync(this.encryptionKey, salt, 100000, this.keyLength, 'sha512');
      
      const cipher = crypto.createCipher(this.algorithm, key);
      cipher.setAAD(salt); // Additional authenticated data
      
      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      // Combine all components: salt + iv + tag + encrypted
      const combined = Buffer.concat([
        salt,
        iv,
        tag,
        Buffer.from(encrypted, 'hex')
      ]);
      
      return combined.toString('base64');
    } catch (error) {
      this.logger.error(`Encryption failed: ${error.message}`, error.stack);
      throw new Error('Encryption failed');
    }
  }

  /**
   * Decrypt sensitive data
   */
  decrypt(encryptedData: string): string {
    try {
      const combined = Buffer.from(encryptedData, 'base64');
      
      // Extract components
      const salt = combined.subarray(0, this.saltLength);
      const iv = combined.subarray(this.saltLength, this.saltLength + this.ivLength);
      const tag = combined.subarray(this.saltLength + this.ivLength, this.saltLength + this.ivLength + this.tagLength);
      const encrypted = combined.subarray(this.saltLength + this.ivLength + this.tagLength);
      
      // Derive key using same parameters
      const key = crypto.pbkdf2Sync(this.encryptionKey, salt, 100000, this.keyLength, 'sha512');
      
      const decipher = crypto.createDecipher(this.algorithm, key);
      decipher.setAAD(salt);
      decipher.setAuthTag(tag);
      
      let decrypted = decipher.update(encrypted, null, 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      this.logger.error(`Decryption failed: ${error.message}`, error.stack);
      throw new Error('Decryption failed');
    }
  }

  /**
   * Hash data using SHA-256
   */
  hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Generate HMAC for data integrity
   */
  generateHMAC(data: string, secret?: string): string {
    const key = secret || this.encryptionKey.toString('hex');
    return crypto.createHmac('sha256', key).update(data).digest('hex');
  }

  /**
   * Verify HMAC
   */
  verifyHMAC(data: string, hmac: string, secret?: string): boolean {
    const expectedHmac = this.generateHMAC(data, secret);
    return crypto.timingSafeEqual(Buffer.from(hmac, 'hex'), Buffer.from(expectedHmac, 'hex'));
  }

  /**
   * Generate secure random bytes
   */
  generateRandomBytes(length: number): Buffer {
    return crypto.randomBytes(length);
  }

  /**
   * Generate secure random string
   */
  generateRandomString(length: number): string {
    return this.generateRandomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
  }

  /**
   * Encrypt field-level data for database storage
   */
  encryptField(value: string, fieldName: string): string {
    // Add field name as additional context for encryption
    const contextualData = `${fieldName}:${value}`;
    return this.encrypt(contextualData);
  }

  /**
   * Decrypt field-level data from database
   */
  decryptField(encryptedValue: string, fieldName: string): string {
    const decrypted = this.decrypt(encryptedValue);
    const prefix = `${fieldName}:`;
    
    if (!decrypted.startsWith(prefix)) {
      throw new Error('Invalid field decryption context');
    }
    
    return decrypted.substring(prefix.length);
  }

  /**
   * Generate default encryption key (for development only)
   */
  private generateDefaultKey(): string {
    this.logger.warn('Using default encryption key - NOT suitable for production!');
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Key rotation support - encrypt with new key
   */
  rotateEncryption(oldEncryptedData: string, newKey: Buffer): string {
    // Decrypt with old key
    const plaintext = this.decrypt(oldEncryptedData);
    
    // Temporarily use new key
    const originalKey = this.encryptionKey;
    (this as any).encryptionKey = newKey;
    
    try {
      // Encrypt with new key
      const newEncryptedData = this.encrypt(plaintext);
      return newEncryptedData;
    } finally {
      // Restore original key
      (this as any).encryptionKey = originalKey;
    }
  }

  /**
   * Secure memory cleanup (best effort)
   */
  secureCleanup(sensitiveData: string): void {
    // In Node.js, we can't truly zero out memory, but we can overwrite
    if (typeof sensitiveData === 'string') {
      // Overwrite the string content (limited effectiveness in JS)
      for (let i = 0; i < sensitiveData.length; i++) {
        (sensitiveData as any)[i] = '\0';
      }
    }
  }
}
