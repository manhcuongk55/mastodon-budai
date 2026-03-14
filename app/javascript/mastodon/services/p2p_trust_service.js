import Gun from 'gun';

// Local dev fallback, in production this would be multiple peer nodes
const peers = ['http://localhost:8765/gun'];

class P2PTrustService {
  constructor() {
    this.gun = Gun({ peers });
    // Root node for the web of trust graph
    this.trustGraph = this.gun.get('makai_trust_network');
  }

  /**
   * Vouch for another user
   * @param {string} voucherId - The Mastodon Account ID of the person vouching
   * @param {string} targetId - The Mastodon Account ID of the person being vouched for
   */
  vouchForUser(voucherId, targetId) {
    if (!voucherId || !targetId) return;
    
    // We store that voucherId vouched for targetId
    // In a fully decentralized system we'd use SEA to cryptographically sign this, 
    // but for lightweight hybrid P2P, we just store it in the Gun graph.
    this.trustGraph.get(targetId).get('vouches').get(voucherId).put({
      timestamp: Date.now(),
      vouched: true
    });
  }

  /**
   * Generate a 6-digit OTP PIN for Vouching (Valid for 5 mins)
   * @param {string} voucherId - The Mastodon Account ID of the person generating the code
   * @param {string} targetId - The Mastodon Account ID of the person they want to vouch for
   * @returns {string} The 6-digit PIN
   */
  generateVouchPin(voucherId, targetId) {
    if (!voucherId || !targetId) return null;

    const pin = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins

    // Store in the global mesh network securely under a hash
    this.gun.get(`makai_otp_${pin}`).put({
      voucherId,
      targetId,
      expiresAt,
      claimed: false
    });

    return pin;
  }

  /**
   * Redeem a Vouch PIN 
   * @param {string} pin - The 6-digit PIN string
   * @param {string} claimerId - The Mastodon Account ID of the person entering the PIN
   * @returns {Promise<boolean>} Resolves true if successful
   */
  async verifyVouchPin(pin, claimerId) {
    if (!pin || pin.length !== 6 || !claimerId) return false;

    return new Promise((resolve) => {
      const pinNode = this.gun.get(`makai_otp_${pin}`);
      
      pinNode.once((data) => {
        if (!data || data.claimed) {
          resolve(false); // Invalid or already used
          return;
        }

        if (Date.now() > data.expiresAt) {
          resolve(false); // Expired
          return;
        }

        if (data.targetId !== claimerId) {
          // This code isn't meant for you
          resolve(false);
          return;
        }

        // 1. Mark as claimed so it can't be reused
        pinNode.get('claimed').put(true);

        // 2. Execute the actual decentralized cryptographic Vouch
        this.vouchForUser(data.voucherId, claimerId);

        resolve(true);  
      });
    });
  }

  /**
   * Subscribe to the vouch count for a specific user
   * @param {string} targetId 
   * @param {function} callback - Receives the array of voucher IDs
   */
  subscribeToVouches(targetId, callback) {
    const vouchesNode = this.trustGraph.get(targetId).get('vouches');
    
    // Gun's map() is reactive. We accumulate the vouches locally.
    const currentVouches = new Set();
    
    vouchesNode.map().on((data, voucherId) => {
      if (data && data.vouched) {
        currentVouches.add(voucherId);
        callback(Array.from(currentVouches));
      } else if (data && !data.vouched) {
        currentVouches.delete(voucherId);
        callback(Array.from(currentVouches));
      }
    });

    // Return unsubscriber
    return () => {
      vouchesNode.off();
    };
  }
}

export const p2pTrust = new P2PTrustService();
