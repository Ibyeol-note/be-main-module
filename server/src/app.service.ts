import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';

@Injectable()
export class AppService {
  constructor(private readonly em: EntityManager) { }

  async healthCheck(): Promise<{
    status: string;
    timestamp: string;
    database: string;
    error?: string;
  }> {
    try {
      // DB 연결 확인: 간단한 쿼리 실행
      await this.em.getConnection().execute('SELECT 1');

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected',
      };
    } catch (error) {
      console.error('Health check DB error:', error);
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
