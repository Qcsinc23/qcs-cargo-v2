import PocketBase from 'pocketbase';

const PB_URL = process.env.VITE_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';

export type CommunicationType = 'email' | 'sms' | 'phone' | 'note';
export type CommunicationDirection = 'inbound' | 'outbound' | 'internal';

export interface Communication {
  id: string;
  user: string;
  sent_by?: string;
  type: CommunicationType;
  subject?: string;
  content: string;
  direction: CommunicationDirection;
  sent_at?: string;
  opened_at?: string;
  metadata?: Record<string, unknown>;
  created: string;
  updated: string;
  expand?: {
    user?: {
      id: string;
      name: string;
      email: string;
    };
    sent_by?: {
      id: string;
      name: string;
      email: string;
    };
  };
}

export interface CreateCommunicationParams {
  userId: string;
  type: CommunicationType;
  content: string;
  direction: CommunicationDirection;
  subject?: string;
  sentBy?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Service for managing customer communication logs
 */
class CommunicationService {
  private pb: PocketBase;

  constructor() {
    this.pb = new PocketBase(PB_URL);
  }

  /**
   * Get all communications for a specific user
   */
  async getUserCommunications(
    userId: string,
    options?: {
      type?: CommunicationType;
      direction?: CommunicationDirection;
      limit?: number;
      page?: number;
    }
  ): Promise<{ items: Communication[]; totalItems: number; totalPages: number }> {
    const filters: string[] = [`user="${userId}"`];
    
    if (options?.type) {
      filters.push(`type="${options.type}"`);
    }
    
    if (options?.direction) {
      filters.push(`direction="${options.direction}"`);
    }

    const result = await this.pb.collection('communications').getList<Communication>(
      options?.page || 1,
      options?.limit || 50,
      {
        filter: filters.join(' && '),
        sort: '-created',
        expand: 'user,sent_by'
      }
    );

    return {
      items: result.items,
      totalItems: result.totalItems,
      totalPages: result.totalPages
    };
  }

  /**
   * Create a new communication log entry
   */
  async createCommunication(params: CreateCommunicationParams): Promise<Communication> {
    const data = {
      user: params.userId,
      type: params.type,
      content: params.content,
      direction: params.direction,
      subject: params.subject,
      sent_by: params.sentBy,
      sent_at: params.direction === 'outbound' ? new Date().toISOString() : undefined,
      metadata: params.metadata
    };

    return await this.pb.collection('communications').create<Communication>(data, {
      expand: 'user,sent_by'
    });
  }

  /**
   * Mark a communication as opened
   */
  async markAsOpened(communicationId: string): Promise<Communication> {
    return await this.pb.collection('communications').update<Communication>(communicationId, {
      opened_at: new Date().toISOString()
    });
  }

  /**
   * Get communication statistics for a user
   */
  async getUserStats(userId: string): Promise<{
    total: number;
    byType: Record<CommunicationType, number>;
    byDirection: Record<CommunicationDirection, number>;
    lastContact?: string;
  }> {
    const allComms = await this.getUserCommunications(userId, { limit: 500 });
    const items = allComms.items;

    const stats = {
      total: items.length,
      byType: {
        email: items.filter(c => c.type === 'email').length,
        sms: items.filter(c => c.type === 'sms').length,
        phone: items.filter(c => c.type === 'phone').length,
        note: items.filter(c => c.type === 'note').length
      } as Record<CommunicationType, number>,
      byDirection: {
        inbound: items.filter(c => c.direction === 'inbound').length,
        outbound: items.filter(c => c.direction === 'outbound').length,
        internal: items.filter(c => c.direction === 'internal').length
      } as Record<CommunicationDirection, number>,
      lastContact: items[0]?.created
    };

    return stats;
  }

  /**
   * Search communications by content
   */
  async searchCommunications(
    userId: string,
    searchTerm: string
  ): Promise<Communication[]> {
    const result = await this.pb.collection('communications').getFullList<Communication>({
      filter: `user="${userId}" && (content~"${searchTerm}" || subject~"${searchTerm}")`,
      sort: '-created',
      expand: 'user,sent_by'
    });

    return result;
  }
}

export const communicationService = new CommunicationService();


