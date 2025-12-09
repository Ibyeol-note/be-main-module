import { Injectable } from '@nestjs/common';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { InjectRepository } from '@mikro-orm/nestjs';

import { Diary } from '@/domain/entity/diary.entity';
import { User } from '@/domain/entity/user.entity';
import { DiaryServiceOutPort } from '@/port/outbound/diary-service.out-port';

@Injectable()
export class DiaryRepository implements DiaryServiceOutPort {
    constructor(
        private readonly em: EntityManager,
        @InjectRepository(Diary)
        private readonly diaryRepo: EntityRepository<Diary>,
        @InjectRepository(User)
        private readonly userRepo: EntityRepository<User>,
    ) { }

    async findByIdAndUser(diaryId: number, userId: number): Promise<Diary | null> {
        return this.diaryRepo.findOne({ id: diaryId, user: { id: userId } });
    }

    async findAllByUser(userId: number, page: number, limit: number): Promise<{ items: Diary[]; total: number }> {
        const [items, total] = await this.diaryRepo.findAndCount(
            { user: { id: userId } },
            {
                orderBy: { createdAt: 'DESC' },
                offset: (page - 1) * limit,
                limit,
            },
        );
        return { items, total };
    }

    async save(diary: Diary): Promise<Diary> {
        this.em.persist(diary);
        await this.em.flush();
        return diary;
    }

    async update(diary: Diary): Promise<Diary> {
        await this.em.flush();
        return diary;
    }

    async delete(diary: Diary): Promise<void> {
        this.em.remove(diary);
        await this.em.flush();
    }

    async getAverageEmotionScore(userId: number): Promise<number> {
        const result = await this.em.execute(
            `SELECT AVG(emotion_score) as avg FROM diary WHERE user_id = ?`,
            [userId],
        );
        return result[0]?.avg || 0;
    }

    async findUserById(userId: number): Promise<User | null> {
        return this.userRepo.findOne({ id: userId });
    }
}
