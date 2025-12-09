import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { DiaryServiceInPort } from '@/port/inbound/diary-service.in-port';
import { CreateDiaryDto } from '@/adapter/inbound/dto/request/diary/create-diary.dto';
import { UpdateDiaryDto } from '@/adapter/inbound/dto/request/diary/update-diary.dto';
import { ShareDiaryDto } from '@/adapter/inbound/dto/request/diary/share-diary.dto';
import { DiaryResponseDto } from '@/adapter/inbound/dto/response/diary/diary-response.dto';
import { DiaryListPaginatedResponseDto } from '@/adapter/inbound/dto/response/diary/diary-list-response.dto';
import { DiaryTemplateResponseDto } from '@/adapter/inbound/dto/response/diary/diary-template-response.dto';
import { JwtAuthGuard } from '@/adapter/inbound/auth/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '@/adapter/inbound/auth/current-user.decorator';

@ApiTags('이별노트 (일기)')
@Controller('diaries')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DiaryController {
    constructor(private readonly diaryService: DiaryServiceInPort) { }

    @Post()
    @ApiOperation({ summary: '일기 작성', description: '새 일기를 작성하고 AI 감정 분석을 수행합니다.' })
    @ApiResponse({ status: 201, description: '일기 작성 성공', type: DiaryResponseDto })
    async create(
        @CurrentUser() user: CurrentUserPayload,
        @Body() dto: CreateDiaryDto,
    ): Promise<DiaryResponseDto> {
        return this.diaryService.create(user.userId, dto);
    }

    @Get()
    @ApiOperation({ summary: '일기 목록 조회', description: '내 일기 목록을 페이지네이션으로 조회합니다.' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호 (기본: 1)' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: '페이지당 항목 수 (기본: 10)' })
    @ApiResponse({ status: 200, description: '조회 성공', type: DiaryListPaginatedResponseDto })
    async findAll(
        @CurrentUser() user: CurrentUserPayload,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ): Promise<DiaryListPaginatedResponseDto> {
        return this.diaryService.findAll(user.userId, Number(page), Number(limit));
    }

    @Get('template')
    @ApiOperation({ summary: '일기 템플릿 조회', description: '감정 점수 평균에 따른 일기 작성 템플릿을 조회합니다.' })
    @ApiResponse({ status: 200, description: '조회 성공', type: DiaryTemplateResponseDto })
    async getTemplate(@CurrentUser() user: CurrentUserPayload): Promise<DiaryTemplateResponseDto> {
        return this.diaryService.getTemplate(user.userId);
    }

    @Get(':id')
    @ApiOperation({ summary: '일기 상세 조회', description: '특정 일기의 상세 정보를 조회합니다.' })
    @ApiResponse({ status: 200, description: '조회 성공', type: DiaryResponseDto })
    @ApiResponse({ status: 404, description: '일기를 찾을 수 없음' })
    async findById(
        @CurrentUser() user: CurrentUserPayload,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<DiaryResponseDto> {
        return this.diaryService.findById(user.userId, id);
    }

    @Put(':id')
    @ApiOperation({ summary: '일기 수정', description: '일기 내용을 수정하고 AI 감정을 재분석합니다.' })
    @ApiResponse({ status: 200, description: '수정 성공', type: DiaryResponseDto })
    @ApiResponse({ status: 404, description: '일기를 찾을 수 없음' })
    async update(
        @CurrentUser() user: CurrentUserPayload,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateDiaryDto,
    ): Promise<DiaryResponseDto> {
        return this.diaryService.update(user.userId, id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: '일기 삭제', description: '일기를 삭제합니다.' })
    @ApiResponse({ status: 200, description: '삭제 성공' })
    @ApiResponse({ status: 404, description: '일기를 찾을 수 없음' })
    async delete(
        @CurrentUser() user: CurrentUserPayload,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<{ message: string }> {
        await this.diaryService.delete(user.userId, id);
        return { message: '일기가 삭제되었습니다.' };
    }

    @Post(':id/share')
    @ApiOperation({ summary: '커뮤니티 공유', description: '일기를 커뮤니티에 게시물로 공유합니다.' })
    @ApiResponse({ status: 200, description: '공유 성공', type: DiaryResponseDto })
    @ApiResponse({ status: 404, description: '일기를 찾을 수 없음' })
    @ApiResponse({ status: 403, description: '이미 공유된 일기' })
    async share(
        @CurrentUser() user: CurrentUserPayload,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: ShareDiaryDto,
    ): Promise<DiaryResponseDto> {
        return this.diaryService.share(user.userId, id, dto);
    }
}
