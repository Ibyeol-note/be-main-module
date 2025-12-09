import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { PostServiceInPort } from '@/port/inbound/post-service.in-port';
import { CreatePostDto } from '@/adapter/inbound/dto/request/post/create-post.dto';
import { PostResponseDto, PostListPaginatedResponseDto } from '@/adapter/inbound/dto/response/post/post-response.dto';
import { PostCategory } from '@/domain/enum/post-category.enum';
import { JwtAuthGuard } from '@/adapter/inbound/auth/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '@/adapter/inbound/auth/current-user.decorator';

@ApiTags('커뮤니티 (게시판)')
@Controller('posts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PostController {
    constructor(private readonly postService: PostServiceInPort) { }

    @Post()
    @ApiOperation({ summary: '게시물 작성', description: '새 게시물을 직접 작성합니다.' })
    @ApiResponse({ status: 201, description: '작성 성공', type: PostResponseDto })
    async create(
        @CurrentUser() user: CurrentUserPayload,
        @Body() dto: CreatePostDto,
    ): Promise<PostResponseDto> {
        return this.postService.create(user.userId, dto);
    }

    @Get()
    @ApiOperation({ summary: '게시물 목록 조회', description: '게시물 목록을 조회합니다. 사용자 타입에 맞는 카테고리가 우선 표시됩니다.' })
    @ApiQuery({ name: 'category', required: false, enum: PostCategory, description: '카테고리 필터' })
    @ApiQuery({ name: 'sortBy', required: false, enum: ['latest', 'comments'], description: '정렬 방식' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({ status: 200, description: '조회 성공', type: PostListPaginatedResponseDto })
    async findAll(
        @CurrentUser() user: CurrentUserPayload,
        @Query('category') category?: PostCategory,
        @Query('sortBy') sortBy?: 'latest' | 'comments',
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
    ): Promise<PostListPaginatedResponseDto> {
        return this.postService.findAll({
            userId: user.userId,
            category,
            sortBy,
            page: Number(page),
            limit: Number(limit),
        });
    }

    @Get(':id')
    @ApiOperation({ summary: '게시물 상세 조회' })
    @ApiResponse({ status: 200, description: '조회 성공', type: PostResponseDto })
    @ApiResponse({ status: 404, description: '게시물을 찾을 수 없음' })
    async findById(@Param('id', ParseIntPipe) id: number): Promise<PostResponseDto> {
        return this.postService.findById(id);
    }

    @Delete(':id')
    @ApiOperation({ summary: '게시물 삭제', description: '본인의 게시물만 삭제할 수 있습니다.' })
    @ApiResponse({ status: 200, description: '삭제 성공' })
    @ApiResponse({ status: 403, description: '권한 없음' })
    @ApiResponse({ status: 404, description: '게시물을 찾을 수 없음' })
    async delete(
        @CurrentUser() user: CurrentUserPayload,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<{ message: string }> {
        await this.postService.delete(user.userId, id);
        return { message: '게시물이 삭제되었습니다.' };
    }
}
