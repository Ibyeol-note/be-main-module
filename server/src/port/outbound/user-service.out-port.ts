import { User } from '@/domain/entity/user.entity';
import { UserStatus } from '@/domain/enum/user-status.enum';

export interface UserStats {
    diaryCount: number;
    postCount: number;
    commentCount: number;
}

export interface EmotionDataPoint {
    date: Date;
    emotionScore: number;
}

export abstract class UserServiceOutPort {
    abstract findById(id: number): Promise<User | null>;
    abstract findByEmail(email: string): Promise<User | null>;
    abstract save(user: User): Promise<User>;
    abstract update(id: number, data: Partial<User>): Promise<User>;
    abstract updateStatus(id: number, status: UserStatus): Promise<void>;
    abstract getStats(userId: number): Promise<UserStats>;
    abstract getEmotionDataPoints(userId: number, startDate: Date): Promise<EmotionDataPoint[]>;
}
