import { UpdateUserDto } from '@/adapter/inbound/dto/request/user/update-user.dto';
import { UserResponseDto } from '@/adapter/inbound/dto/response/user/user-response.dto';
import { UserStatsResponseDto } from '@/adapter/inbound/dto/response/user/user-stats-response.dto';
import { EmotionGraphResponseDto } from '@/adapter/inbound/dto/response/user/emotion-graph-response.dto';

export abstract class UserServiceInPort {
    abstract findById(id: number): Promise<UserResponseDto>;
    abstract update(id: number, dto: UpdateUserDto): Promise<UserResponseDto>;
    abstract getStats(userId: number): Promise<UserStatsResponseDto>;
    abstract getEmotionGraph(userId: number, period: '7d' | '30d' | '90d' | 'all'): Promise<EmotionGraphResponseDto>;
}
