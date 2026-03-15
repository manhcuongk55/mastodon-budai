import Gun from 'gun';
import 'gun/sea'; // Security, Encryption, Authorization

// Local dev fallback or dynamic production relay
const peerUrl = window.GUNJS_PEER_URL || (process.env.NODE_ENV === 'production' ? `wss://${window.location.host}/gun` : 'http://localhost:8765/gun');
const peers = [peerUrl];

export class P2PChatService {
  constructor() {
    this.gun = Gun({ peers });
    this.user = this.gun.user().recall({ sessionStorage: true });
    
    // We prefix our graph to avoid collisions with other apps using the same relay
    this.graph = this.gun.get('makai_p2p_network');
  }

  // Generate a random alias or use the Mastodon username
  // The passphrase ideally would be something the user manages, 
  // but for "lightweight P2P speed" we can auto-generate and store locally if they aren't explicitly signing up
  async authenticate(alias, passphrase) {
    return new Promise((resolve) => {
      this.user.auth(alias, passphrase, (ack) => {
        if (ack.err) {
          // If account doesn't exist, create it
          this.user.create(alias, passphrase, (createAck) => {
            if (createAck.err) {
              resolve({ success: false, error: createAck.err });
            } else {
              // Successfully created, now authenticate
              this.user.auth(alias, passphrase, (authAck) => {
                 resolve({ success: !authAck.err, error: authAck.err });
              });
            }
          });
        } else {
          resolve({ success: true });
        }
      });
    });
  }

  logout() {
    this.user.leave();
  }

  get isP2pAuthenticated() {
    return this.user.is;
  }

  /**
   * Send an encrypted message to a specific room
   * @param {string} roomId
   * @param {string} text
   * @param {string} authorName
   */
  async sendMessage(roomId, text, authorName) {
    if (!this.user.is) throw new Error("Not authenticated for P2P");

    const secretObj = await Gun.SEA.work(roomId, null, null, { name: 'SHA-256' }); // Deterministic room secret
    const secretKey = typeof secretObj === 'string' ? secretObj : secretObj.toString();
    
    const encryptedMsg = await Gun.SEA.encrypt(text, secretKey);
    
    const messageNode = {
      text: encryptedMsg,
      author: authorName,
      timestamp: Date.now(),
    };

    // Store the message under the room node
    this.graph.get('chat').get(roomId).set(messageNode);
  }

  /**
   * Listen for messages in a specific room
   * @param {string} roomId
   * @param {function} callback
   */
  async subscribeToRoom(roomId, callback) {
    const secretObj = await Gun.SEA.work(roomId, null, null, { name: 'SHA-256' });
    const secretKey = typeof secretObj === 'string' ? secretObj : secretObj.toString();

    const roomNode = this.graph.get('chat').get(roomId);
    
    roomNode.map().on(async (msg, id) => {
      if (msg && msg.text) {
        try {
          // Decrypt the message payload
          const decryptedText = await Gun.SEA.decrypt(msg.text, secretKey);
          if (decryptedText) {
            callback({
              id,
              text: decryptedText,
              author: msg.author,
              timestamp: msg.timestamp
            });
          }
        } catch (e) {
          console.error("Failed to decrypt P2P message", e);
        }
      }
    });

    // Return the unmounting function
    return () => {
      roomNode.off();
    };
  }
}

// Singleton instance
export const p2pChat = new P2PChatService();
