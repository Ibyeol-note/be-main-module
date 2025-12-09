import { Diary } from '@/domain/entity/diary.entity';
import { User } from '@/domain/entity/user.entity';

export abstract class DiaryServiceOutPort {
    abstract findByIdAndUser(diaryId: number, userId: number): Promise<Diary | null>;
    abstract findAllByUser(userId: number, page: number, limit: number): Promise<{ items: Diary[]; total: number }>;
    abstract save(diary: Diary): Promise<Diary>;
    abstract update(diary: Diary): Promise<Diary>;
    abstract delete(diary: Diary): Promise<void>;
    abstract getAverageEmotionScore(userId: number): Promise<number>;
    abstract findUserById(userId: number): Promise<User | null>;
}
