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
