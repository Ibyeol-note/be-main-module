import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { UpdateUserDto } from '@/adapter/inbound/dto/request/user/update-user.dto';
import { UserResponseDto } from '@/adapter/inbound/dto/response/user/user-response.dto';
import { UserStatsResponseDto } from '@/adapter/inbound/dto/response/user/user-stats-response.dto';
import { EmotionGraphResponseDto, EmotionGraphDataPoint } from '@/adapter/inbound/dto/response/user/emotion-graph-response.dto';
import { UserServiceInPort } from '@/port/inbound/user-service.in-port';
import { UserServiceOutPort } from '@/port/outbound/user-service.out-port';

@Injectable()
export class UserService implements UserServiceInPort {
    constructor(private readonly userRepository: UserServiceOutPort) { }

    async findById(id: number): Promise<UserResponseDto> {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new NotFoundException(`사용자를 찾을 수 없습니다.`);
        }
        return plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true });
    }

    async update(id: number, dto: UpdateUserDto): Promise<UserResponseDto> {
        const existingUser = await this.userRepository.findById(id);
        if (!existingUser) {
            throw new NotFoundException(`사용자를 찾을 수 없습니다.`);
        }
        const updatedUser = await this.userRepository.update(id, dto);
        return plainToInstance(UserResponseDto, updatedUser, { excludeExtraneousValues: true });
    }

    async getStats(userId: number): Promise<UserStatsResponseDto> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new NotFoundException(`사용자를 찾을 수 없습니다.`);
        }

        const stats = await this.userRepository.getStats(userId);
        return {
            diaryCount: stats.diaryCount,
            postCount: stats.postCount,
            commentCount: stats.commentCount,
        };
    }

    async getEmotionGraph(userId: number, period: '7d' | '30d' | '90d' | 'all'): Promise<EmotionGraphResponseDto> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new NotFoundException(`사용자를 찾을 수 없습니다.`);
        }

        const startDate = this.calculateStartDate(period);
        const dataPoints = await this.userRepository.getEmotionDataPoints(userId, startDate);

        if (dataPoints.length === 0) {
            return {
                dataPoints: [],
                averageScore: 0,
                maxScore: 0,
                minScore: 0,
                changeFromPrevious: 0,
            };
        }

        const scores = dataPoints.map(d => d.emotionScore);
        const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        const maxScore = Math.max(...scores);
        const minScore = Math.min(...scores);

        // 최고/최저 날짜 찾기
        const bestDayData = dataPoints.find(d => d.emotionScore === maxScore);
        const worstDayData = dataPoints.find(d => d.emotionScore === minScore);

        // 이전 기간 대비 변화 계산 (간단히 구현)
        const previousStartDate = this.calculateStartDate(period, true);
        const previousDataPoints = await this.userRepository.getEmotionDataPoints(userId, previousStartDate);
        const previousScores = previousDataPoints
            .filter(d => d.date < startDate)
            .map(d => d.emotionScore);
        const previousAverage = previousScores.length > 0
            ? previousScores.reduce((a, b) => a + b, 0) / previousScores.length
            : 0;
        const changeFromPrevious = Math.round(averageScore - previousAverage);

        const graphDataPoints: EmotionGraphDataPoint[] = dataPoints.map(d => ({
            date: d.date.toISOString().split('T')[0],
            emotionScore: d.emotionScore,
        }));

        return {
            dataPoints: graphDataPoints,
            averageScore: Math.round(averageScore),
            maxScore,
            minScore,
            bestDay: bestDayData?.date.toISOString().split('T')[0],
            worstDay: worstDayData?.date.toISOString().split('T')[0],
            changeFromPrevious,
        };
    }

    private calculateStartDate(period: '7d' | '30d' | '90d' | 'all', double: boolean = false): Date {
        const now = new Date();
        const multiplier = double ? 2 : 1;

        switch (period) {
            case '7d':
                return new Date(now.getTime() - 7 * multiplier * 24 * 60 * 60 * 1000);
            case '30d':
                return new Date(now.getTime() - 30 * multiplier * 24 * 60 * 60 * 1000);
            case '90d':
                return new Date(now.getTime() - 90 * multiplier * 24 * 60 * 60 * 1000);
            case 'all':
            default:
                return new Date(0); // 시작일 없음
        }
    }
}
