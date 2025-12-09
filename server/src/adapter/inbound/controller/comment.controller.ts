import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { CommentServiceInPort } from '@/port/inbound/comment-service.in-port';
import { CreateCommentDto } from '@/adapter/inbound/dto/request/comment/create-comment.dto';
import { CommentResponseDto, CommentListResponseDto } from '@/adapter/inbound/dto/response/comment/comment-response.dto';
import { JwtAuthGuard } from '@/adapter/inbound/auth/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '@/adapter/inbound/auth/current-user.decorator';

@ApiTags('댓글')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CommentController {
    constructor(private readonly commentService: CommentServiceInPort) { }

    @Post('posts/:postId/comments')
    @ApiOperation({ summary: '댓글 작성' })
    @ApiResponse({ status: 201, description: '작성 성공', type: CommentResponseDto })
    @ApiResponse({ status: 404, description: '게시물을 찾을 수 없음' })
    async create(
        @CurrentUser() user: CurrentUserPayload,
        @Param('postId', ParseIntPipe) postId: number,
        @Body() dto: CreateCommentDto,
    ): Promise<CommentResponseDto> {
        return this.commentService.create(user.userId, postId, dto);
    }

    @Get('posts/:postId/comments')
    @ApiOperation({ summary: '댓글 목록 조회' })
    @ApiResponse({ status: 200, description: '조회 성공', type: CommentListResponseDto })
    @ApiResponse({ status: 404, description: '게시물을 찾을 수 없음' })
    async findByPostId(@Param('postId', ParseIntPipe) postId: number): Promise<CommentListResponseDto> {
        return this.commentService.findByPostId(postId);
    }

    @Delete('comments/:id')
    @ApiOperation({ summary: '댓글 삭제', description: '본인의 댓글만 삭제할 수 있습니다.' })
    @ApiResponse({ status: 200, description: '삭제 성공' })
    @ApiResponse({ status: 403, description: '권한 없음' })
    @ApiResponse({ status: 404, description: '댓글을 찾을 수 없음' })
    async delete(
        @CurrentUser() user: CurrentUserPayload,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<{ message: string }> {
        await this.commentService.delete(user.userId, id);
        return { message: '댓글이 삭제되었습니다.' };
    }
}
