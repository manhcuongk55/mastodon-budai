import Gun from 'gun';

// Local dev fallback, in production this would be multiple peer nodes
const peers = ['http://localhost:8765/gun'];

class P2PFeedService {
  constructor() {
    this.gun = Gun({ peers });
    // Root node for the public off-grid feed
    this.publicFeed = this.gun.get('makai_public_feed');
  }

  /**
   * Broadcast a new post to the decentralized network
   * @param {Object} postData
   */
  broadcastPost(postData) {
    if (!postData || !postData.content) return;

    const messageId = `post_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    
    // We store the post data structure mirroring Mastodon status loosely
    const node = {
      id: messageId,
      content: postData.content,
      account_id: postData.account_id,
      account_username: postData.account_username,
      account_display_name: postData.account_display_name,
      account_avatar: postData.account_avatar,
      created_at: new Date().toISOString(),
      spoiler_text: postData.spoiler_text || '',
    };

    // Put it into the decentralized graph
    this.publicFeed.get(messageId).put(node);
  }

  /**
   * Subscribe to the decentralized public feed
   * @param {(posts: any[]) => void} callback - Receives the array of posts
   */
  subscribeToFeed(callback) {
    const currentPosts = new Map();
    
    this.publicFeed.map().on((data, id) => {
      if (data && data.content) {
        currentPosts.set(id, data);
        
        // Convert map to array and sort by created_at descending
        const sortedPosts = Array.from(currentPosts.values())
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          
        callback(sortedPosts);
      }
    });

    return () => {
      this.publicFeed.off();
    };
  }
}

export const p2pFeed = new P2PFeedService();
