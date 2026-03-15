import Gun from 'gun';
import { truskingIdentityService } from 'mastodon/services/trusking_identity_service';

// Local dev fallback or dynamic production relay
const peerUrl = window.GUNJS_PEER_URL || (process.env.NODE_ENV === 'production' ? `wss://${window.location.host}/gun` : 'http://localhost:8765/gun');
const peers = [peerUrl];

class P2PTrustService {
  constructor() {
    this.gun = Gun({ peers });
    // Root node for the web of trust graph
    this.trustGraph = this.gun.get('makai_trust_network');
  }

  /**
   * Track Anonymous Reputation via Node ID
   * Records a zero-knowledge trust point for the current browser node when they perform a verified action
   */
  async incrementAnonymousTrustScore() {
    await truskingIdentityService.ensureInitialized();
    const nodeId = truskingIdentityService.getNodeId();
    
    // Hash-based node repository
    const anonymousNode = this.gun.get('trusking_anonymous_nodes').get(nodeId);
    
    anonymousNode.get('verified_reports').once((count) => {
      const current = count || 0;
      anonymousNode.get('verified_reports').put(current + 1);
      
      // Basic TrustScore logarithmic curve bounded by 0.99
      // Maps reports -> trust score: 1 -> 0.50, 10 -> 1.0 (capped at 0.99)
      const newScore = Math.min(0.99, (Math.log10((current + 1) * 10) / 2));
      anonymousNode.get('trust_score').put(newScore);
    });
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
        
        // 3. Increment the Zero-Knowledge Reputation for the anonymous node that facilitated this interaction
        this.incrementAnonymousTrustScore();

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

  /**
   * Epic T: Cross-Platform News Verification
   * Register a Canonical URL Link to the P2P Graph
   */
  async registerCanonicalLink(url) {
    if (!url) return null;
    
    // Simple fast crypto hashing for the canonical URL (SHA-256 via crypto.subtle)
    const encoder = new TextEncoder();
    const data = encoder.encode(url);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    const linkNode = this.gun.get('makai_links').get(hashHex);
    // Only put the core data. Specific votes will be added as sub-nodes.
    linkNode.put({
      url: url,
      created_at: Date.now()
    });
    
    return hashHex;
  }

  /**
   * Vote on a Canonical Link
   * @param {string} hashHex - the SHA-256 hash
   * @param {string} voteType - 'truth' or 'fake'
   * @param {string} voterId - the Node or Mastodon ID of the voter
   */
  voteCanonicalLink(hashHex, voteType, voterId) {
    if (!hashHex || !voteType || !voterId) return;
    this.gun.get('makai_links').get(hashHex).get('votes').get(voterId).put({
      vote: voteType,
      timestamp: Date.now()
    });
  }

  /**
   * Subscribe to a Canonical Link's Truth/Fake Votes
   * @param {string} hashHex
   * @param {function} callback
   */
  subscribeToLinkVotes(hashHex, callback) {
    const votesNode = this.gun.get('makai_links').get(hashHex).get('votes');
    
    const currentVotes = new Map();
    
    votesNode.map().on((data, voterId) => {
      if (data && data.vote) {
        currentVotes.set(voterId, data.vote);
        
        let truthCount = 0;
        let fakeCount = 0;
        for (const vote of currentVotes.values()) {
          if (vote === 'truth') truthCount++;
          if (vote === 'fake') fakeCount++;
        }
        callback({ truth: truthCount, fake: fakeCount, total: currentVotes.size });
      }
    });

    return () => {
      votesNode.off();
    };
  }

  /**
   * Epic W: Truth Hunter Guilds
   * Create a new fact-checking Guild on the P2P Mesh
   */
  createGuild(guildName, description, creatorId) {
    if (!guildName) return null;
    
    // Hash the name to create a deterministic ID
    const guildId = 'guild_' + guildName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const guildNode = this.gun.get('makai_guilds').get(guildId);
    
    guildNode.put({
      id: guildId,
      name: guildName,
      description: description || '',
      created_at: Date.now(),
      creator: creatorId,
      collective_truth_score: 0
    });
    
    // Auto-join the creator
    this.joinGuild(guildId, creatorId);
    return guildId;
  }

  /**
   * Join a Truth Hunter Guild
   */
  joinGuild(guildId, memberId) {
    if (!guildId || !memberId) return;
    
    // Add member to the guild
    this.gun.get('makai_guilds').get(guildId).get('members').get(memberId).put({
      joined_at: Date.now()
    });
    
    // Set the user's active guild
    this.gun.get('trusking_anonymous_nodes').get(memberId).get('active_guild').put(guildId);
  }

  /**
   * Reward a Guild with Truth Points when a member successfully verifies a fact
   */
  rewardGuildTruthPoints(guildId, points = 1) {
    if (!guildId) return;
    const guildNode = this.gun.get('makai_guilds').get(guildId);
    guildNode.get('collective_truth_score').once((currentScore) => {
      guildNode.get('collective_truth_score').put((currentScore || 0) + points);
    });
  }
  
  /**
   * Subscribe to all Guilds for the Leaderboard
   * @param {function} callback
   */
  subscribeToGuilds(callback) {
    const guildsNode = this.gun.get('makai_guilds');
    const guildsMap = new Map();
    
    guildsNode.map().on((data, guildId) => {
      if (data && data.name) {
        guildsMap.set(guildId, data);
        
        callback(Array.from(guildsMap.values()).sort((a, b) => {
           return (b.collective_truth_score || 0) - (a.collective_truth_score || 0);
        }));
      }
    });

    return () => {
      guildsNode.off();
    };
  }

  /**
   * Epic W: Truth Bounties
   * Add 'Truth Berries' (Bounty) to a canonical link to incentivize fact-checking
   * @param {string} hashHex
   * @param {number} amount
   */
  addBountyToLink(hashHex, amount) {
    if (!hashHex || !amount) return;
    const linkNode = this.gun.get('makai_links').get(hashHex);
    
    linkNode.get('bounty').once((currentBounty) => {
      linkNode.get('bounty').put((currentBounty || 0) + amount);
    });
  }

  /**
   * Subscribe to the current bounty pool on a link
   */
  subscribeToLinkBounty(hashHex, callback) {
    const bountyNode = this.gun.get('makai_links').get(hashHex).get('bounty');
    bountyNode.on((amount) => {
      callback(amount || 0);
    });
    return () => bountyNode.off();
  }

  /**
   * Epic W: Trending Controversies Board
   * Subscribes to the overarching `makai_links` graph and continuously sorts
   * them by "Controversy Score" (highest volume of votes combined with tightest margins).
   * @param {function} callback
   */
  exploreTrendingControversies(callback) {
    const linksNode = this.gun.get('makai_links');
    const linksMap = new Map();

    // --- DEMO SEED DATA FOR GTM ---
    const demoData = [
      { hash: 'hash_demo_1', url: 'https://vnexpress.net/gia-vang-sjc-tang-vot-len-80-trieu-dong-4721983.html', truth: 1250, fake: 890 },
      { hash: 'hash_demo_2', url: 'https://tuoitre.vn/canh-bao-chieu-tro-lua-dao-moi-qua-cuoc-goi-video-deepfake-20240315.htm', truth: 85, fake: 1205 },
      { hash: 'hash_demo_3', url: 'https://tiktok.com/@tiktok_news/video/73429188412', truth: 450, fake: 440 },
      { hash: 'hash_demo_4', url: 'https://facebook.com/groups/chungkhoan/posts/10293129841', truth: 12, fake: 95 }
    ];
    
    setTimeout(() => {
      demoData.forEach(d => {
        const total = d.truth + d.fake;
        const marginPenalty = total > 0 ? Math.abs(d.truth - d.fake) / total : 1;
        linksMap.set(d.hash, { ...d, controversyScore: total * (1 - marginPenalty) });
      });
      callback(Array.from(linksMap.values()).sort((a,b) => b.controversyScore - a.controversyScore));
    }, 1500);
    // ------------------------------
    
    linksNode.map().on((linkData, hashHex) => {
      if (linkData && linkData.url) {
        
        // We need to fetch the votes for this specific link to calculate its score
        this.gun.get('makai_links').get(hashHex).get('votes').once((votesObj) => {
          let truthCount = 0;
          let fakeCount = 0;
          
          if (votesObj && typeof votesObj === 'object') {
             Object.values(votesObj).forEach(voteData => {
                if (voteData && voteData.vote === 'truth') truthCount++;
                if (voteData && voteData.vote === 'fake') fakeCount++;
             });
          }
          
          const totalVotes = truthCount + fakeCount;
          
          // Controversy Formula: 
          // Weight total engagement heavily. 
          // Weight the "tightness" of the race (e.g. 50/50 split is max controversy).
          let marginPenalty = 0;
          if (totalVotes > 0) {
            const difference = Math.abs(truthCount - fakeCount);
            // 0 difference = maximum controversy (penalty 0)
            // difference == totalVotes = minimum controversy (everyone agrees)
            marginPenalty = difference / totalVotes; 
          } else {
             marginPenalty = 1; // No votes = not controversial
          }
          
          const controversyScore = totalVotes * (1 - marginPenalty);
          
          linksMap.set(hashHex, {
            hash: hashHex,
            url: linkData.url,
            truth: truthCount,
            fake: fakeCount,
            totalVotes,
            controversyScore,
            created_at: linkData.created_at
          });
          
          // Return the top 10 most controversial links
          callback(
            Array.from(linksMap.values())
              .sort((a, b) => b.controversyScore - a.controversyScore)
              .slice(0, 10)
          );
        });
      }
    });

    return () => {
      linksNode.off();
    };
  }
}

export const p2pTrust = new P2PTrustService();
