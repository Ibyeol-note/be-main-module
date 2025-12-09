import { Injectable } from '@nestjs/common';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { InjectRepository } from '@mikro-orm/nestjs';

import { User } from '@/domain/entity/user.entity';
import { UserStatus } from '@/domain/enum/user-status.enum';
import { UserServiceOutPort, UserStats, EmotionDataPoint } from '@/port/outbound/user-service.out-port';

@Injectable()
export class UserRepository implements UserServiceOutPort {
    constructor(
        private readonly em: EntityManager,
        @InjectRepository(User)
        private readonly userRepo: EntityRepository<User>,
    ) { }

    async findById(id: number): Promise<User | null> {
        return this.userRepo.findOne({ id, status: { $ne: UserStatus.DELETED } });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepo.findOne({ email, status: { $ne: UserStatus.DELETED } });
    }

    async save(user: User): Promise<User> {
        this.em.persist(user);
        await this.em.flush();
        return user;
    }

    async update(id: number, data: Partial<User>): Promise<User> {
        const user = await this.userRepo.findOneOrFail({ id });
        this.em.assign(user, data);
        await this.em.flush();
        return user;
    }

    async updateStatus(id: number, status: UserStatus): Promise<void> {
        const user = await this.userRepo.findOneOrFail({ id });
        user.status = status;
        await this.em.flush();
    }

    async getStats(userId: number): Promise<UserStats> {
        const [diaryResult, postResult, commentResult] = await Promise.all([
            this.em.execute(`SELECT COUNT(*) as count FROM diary WHERE user_id = ?`, [userId]),
            this.em.execute(`SELECT COUNT(*) as count FROM post WHERE user_id = ?`, [userId]),
            this.em.execute(`SELECT COUNT(*) as count FROM comment WHERE user_id = ?`, [userId]),
        ]);

        return {
            diaryCount: parseInt(diaryResult[0]?.count || '0', 10),
            postCount: parseInt(postResult[0]?.count || '0', 10),
            commentCount: parseInt(commentResult[0]?.count || '0', 10),
        };
    }

    async getEmotionDataPoints(userId: number, startDate: Date): Promise<EmotionDataPoint[]> {
        const results = await this.em.execute(
            `SELECT created_at as date, emotion_score as "emotionScore" 
             FROM diary 
             WHERE user_id = ? AND created_at >= ?
             ORDER BY created_at ASC`,
            [userId, startDate],
        );

        return results.map((row: any) => ({
            date: new Date(row.date),
            emotionScore: row.emotionScore,
        }));
    }
}
