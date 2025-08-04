/**
 * Secure Credential Manager
 * Handles secure storage and encryption of sensitive credentials
 */

export interface EncryptedCredential {
  data: string
  iv: string
  timestamp: number
}

export interface CredentialValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export class CredentialManager {
  private static instance: CredentialManager
  private readonly ENCRYPTION_KEY_LENGTH = 32
  private readonly IV_LENGTH = 16
  private encryptionKey: CryptoKey | null = null
  
  private constructor() {}
  
  public static getInstance(): CredentialManager {
    if (!CredentialManager.instance) {
      CredentialManager.instance = new CredentialManager()
    }
    return CredentialManager.instance
  }

  /**
   * Initialize the credential manager with encryption capabilities
   */
  public async initialize(): Promise<void> {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      try {
        // Generate or retrieve encryption key
        this.encryptionKey = await this.getOrCreateEncryptionKey()
      } catch (error) {
        console.warn('Failed to initialize encryption:', error)
        // Continue without encryption in fallback mode
      }
    }
  }

  /**
   * Securely store a credential
   */
  public async storeCredential(key: string, value: string): Promise<boolean> {
    try {
      if (this.encryptionKey) {
        // Encrypt the credential
        const encrypted = await this.encrypt(value)
        const serialized = JSON.stringify(encrypted)
        
        // Store in sessionStorage (more secure than localStorage for credentials)
        sessionStorage.setItem(`cred_${key}`, serialized)
      } else {
        // Fallback: store with basic obfuscation
        const obfuscated = this.obfuscateString(value)
        sessionStorage.setItem(`cred_${key}`, obfuscated)
      }
      
      return true
    } catch (error) {
      console.error('Failed to store credential:', error)
      return false
    }
  }

  /**
   * Retrieve and decrypt a credential
   */
  public async retrieveCredential(key: string): Promise<string | null> {
    try {
      const stored = sessionStorage.getItem(`cred_${key}`)
      if (!stored) {
        return null
      }

      if (this.encryptionKey) {
        // Decrypt the credential
        const encrypted = JSON.parse(stored) as EncryptedCredential
        return await this.decrypt(encrypted)
      } else {
        // Fallback: deobfuscate
        return this.deobfuscateString(stored)
      }
    } catch (error) {
      console.error('Failed to retrieve credential:', error)
      return null
    }
  }

  /**
   * Remove a stored credential
   */
  public removeCredential(key: string): void {
    try {
      sessionStorage.removeItem(`cred_${key}`)
    } catch (error) {
      console.error('Failed to remove credential:', error)
    }
  }

  /**
   * Clear all stored credentials
   */
  public clearAllCredentials(): void {
    try {
      const keys = Object.keys(sessionStorage)
      for (const key of keys) {
        if (key.startsWith('cred_')) {
          sessionStorage.removeItem(key)
        }
      }
    } catch (error) {
      console.error('Failed to clear credentials:', error)
    }
  }

  /**
   * Validate credential format and security
   */
  public validateCredential(credential: string, type: 'token' | 'secret' | 'key'): CredentialValidation {
    const errors: string[] = []
    const warnings: string[] = []

    // Basic validation
    if (!credential || credential.trim().length === 0) {
      errors.push('Credential is empty')
      return { isValid: false, errors, warnings }
    }

    // Length validation
    const minLengths = { token: 20, secret: 16, key: 8 }
    if (credential.length < minLengths[type]) {
      errors.push(`Credential too short (minimum ${minLengths[type]} characters)`)
    }

    // Pattern validation
    switch (type) {
      case 'token':
        if (!/^[A-Za-z0-9+/=_-]+$/.test(credential)) {
          warnings.push('Token contains unexpected characters')
        }
        break
      case 'secret':
        if (!/^[A-Za-z0-9~!@#$%^&*()_+\-=\[\]{}|;:,.<>?]+$/.test(credential)) {
          warnings.push('Secret contains potentially problematic characters')
        }
        break
      case 'key':
        if (credential.includes(' ')) {
          warnings.push('Key contains spaces')
        }
        break
    }

    // Security checks
    if (credential.toLowerCase().includes('password')) {
      warnings.push('Credential appears to contain the word "password"')
    }

    if (/^(.)\1+$/.test(credential)) {
      errors.push('Credential consists of repeated characters')
    }

    // Common weak patterns
    const weakPatterns = [
      /^123+/,
      /^abc+/i,
      /^test/i,
      /^demo/i,
      /^admin/i
    ]

    for (const pattern of weakPatterns) {
      if (pattern.test(credential)) {
        warnings.push('Credential appears to follow a weak pattern')
        break
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Generate a secure random credential
   */
  public generateSecureCredential(length: number = 32): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
    const array = new Uint8Array(length)
    
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(array)
    } else {
      // Fallback for environments without crypto API
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256)
      }
    }

    let result = ''
    for (let i = 0; i < length; i++) {
      result += charset[array[i] % charset.length]
    }

    return result
  }

  /**
   * Encrypt a string using Web Crypto API
   */
  private async encrypt(plaintext: string): Promise<EncryptedCredential> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not available')
    }

    const encoder = new TextEncoder()
    const data = encoder.encode(plaintext)
    
    // Generate random IV
    const iv = window.crypto.getRandomValues(new Uint8Array(this.IV_LENGTH))
    
    // Encrypt the data
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.encryptionKey,
      data
    )

    return {
      data: this.arrayBufferToBase64(encrypted),
      iv: this.arrayBufferToBase64(iv),
      timestamp: Date.now()
    }
  }

  /**
   * Decrypt an encrypted credential
   */
  private async decrypt(encrypted: EncryptedCredential): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not available')
    }

    const data = this.base64ToArrayBuffer(encrypted.data)
    const iv = this.base64ToArrayBuffer(encrypted.iv)

    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      this.encryptionKey,
      data
    )

    const decoder = new TextDecoder()
    return decoder.decode(decrypted)
  }

  /**
   * Get or create encryption key
   */
  private async getOrCreateEncryptionKey(): Promise<CryptoKey> {
    // In a real application, you might want to derive this from user input
    // or retrieve from a secure key management service
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      window.crypto.getRandomValues(new Uint8Array(this.ENCRYPTION_KEY_LENGTH)),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    )

    return await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: window.crypto.getRandomValues(new Uint8Array(16)),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    )
  }

  /**
   * Simple obfuscation for fallback mode
   */
  private obfuscateString(str: string): string {
    return btoa(str).split('').reverse().join('')
  }

  /**
   * Deobfuscate string
   */
  private deobfuscateString(str: string): string {
    return atob(str.split('').reverse().join(''))
  }

  /**
   * Convert ArrayBuffer to base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  /**
   * Convert base64 to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
  }
}