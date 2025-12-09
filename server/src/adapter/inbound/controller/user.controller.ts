import { Body, Controller, Get, Put, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { UserServiceInPort } from '@/port/inbound/user-service.in-port';
import { UpdateUserDto } from '@/adapter/inbound/dto/request/user/update-user.dto';
import { UserResponseDto } from '@/adapter/inbound/dto/response/user/user-response.dto';
import { UserStatsResponseDto } from '@/adapter/inbound/dto/response/user/user-stats-response.dto';
import { EmotionGraphResponseDto } from '@/adapter/inbound/dto/response/user/emotion-graph-response.dto';
import { JwtAuthGuard } from '@/adapter/inbound/auth/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '@/adapter/inbound/auth/current-user.decorator';

@ApiTags('마이페이지')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
    constructor(private readonly userService: UserServiceInPort) { }

    @Get('me')
    @ApiOperation({ summary: '내 프로필 조회' })
    @ApiResponse({ status: 200, description: '조회 성공', type: UserResponseDto })
    async getMe(@CurrentUser() user: CurrentUserPayload): Promise<UserResponseDto> {
        return this.userService.findById(user.userId);
    }

    @Put('me')
    @ApiOperation({ summary: '프로필 수정', description: '닉네임, 프로필 이미지, 사용자 타입 수정' })
    @ApiResponse({ status: 200, description: '수정 성공', type: UserResponseDto })
    async updateMe(
        @CurrentUser() user: CurrentUserPayload,
        @Body() dto: UpdateUserDto,
    ): Promise<UserResponseDto> {
        return this.userService.update(user.userId, dto);
    }

    @Get('me/stats')
    @ApiOperation({ summary: '활동 통계 조회', description: '일기, 게시물, 댓글 수 통계' })
    @ApiResponse({ status: 200, description: '조회 성공', type: UserStatsResponseDto })
    async getStats(@CurrentUser() user: CurrentUserPayload): Promise<UserStatsResponseDto> {
        return this.userService.getStats(user.userId);
    }

    @Get('me/emotion-graph')
    @ApiOperation({ summary: '감정 변화 그래프 데이터', description: '기간별 감정 점수 추이' })
    @ApiQuery({ name: 'period', required: false, enum: ['7d', '30d', '90d', 'all'], description: '조회 기간' })
    @ApiResponse({ status: 200, description: '조회 성공', type: EmotionGraphResponseDto })
    async getEmotionGraph(
        @CurrentUser() user: CurrentUserPayload,
        @Query('period') period: '7d' | '30d' | '90d' | 'all' = '30d',
    ): Promise<EmotionGraphResponseDto> {
        return this.userService.getEmotionGraph(user.userId, period);
    }
}
