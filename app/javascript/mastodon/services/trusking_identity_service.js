// app/javascript/mastodon/services/trusking_identity_service.js
import Gun from 'gun';
import 'gun/sea';

const IDENTITY_KEY = 'trusking_zero_knowledge_identity';

class TruskingIdentityService {
  constructor() {
    this.keypair = null;
    this.nodeId = null;
    this.initializePromise = this.initialize();
  }

  async initialize() {
    // Attempt to load existing anonymous identity for this browser node
    const saved = localStorage.getItem(IDENTITY_KEY);
    if (saved) {
      try {
        this.keypair = JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved Trusking Identity", e);
      }
    } 
    
    // Generate new anonymous identity if null
    if (!this.keypair) {
      this.keypair = await Gun.SEA.pair();
      localStorage.setItem(IDENTITY_KEY, JSON.stringify(this.keypair));
    }
    
    // Node ID is a hash of the public key to protect the full public key from direct attribution
    // Using simple hashing wrapper from SEA
    this.nodeId = await Gun.SEA.work(this.keypair.pub, null, null, { name: 'SHA-256' });
  }

  async ensureInitialized() {
    await this.initializePromise;
  }

  /**
   * Cryptographically sign data using the anonymous node's private key
   * @param {Object|String} data 
   * @returns {String} Signed proof
   */
  async signData(data) {
    await this.ensureInitialized();
    return await Gun.SEA.sign(data, this.keypair);
  }

  /**
   * AES-Encrypt evidence (photos/videos) using a symmetric key, avoiding plaintext exposure.
   * @param {String} fileData - Base64 or Blob data
   * @param {String} networkSymmetricKey - The shared reality reality space key 
   * @returns {Object} { encryptedData, fileHash }
   */
  async encryptEvidence(fileData, networkSymmetricKey = 'trusking_public_network_key') {
    await this.ensureInitialized();
    const encrypted = await Gun.SEA.encrypt(fileData, networkSymmetricKey);
    const hash = await Gun.SEA.work(encrypted, null, null, { name: 'SHA-256' });
    return { encrypted, hash };
  }

  /**
   * Retrieve the Anonymous Node ID for reputation tracking
   * @returns {String}
   */
  getNodeId() {
    return this.nodeId;
  }
}

export const truskingIdentityService = new TruskingIdentityService();
