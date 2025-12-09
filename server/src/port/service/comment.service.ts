import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { CreateCommentDto } from '@/adapter/inbound/dto/request/comment/create-comment.dto';
import { CommentResponseDto, CommentListResponseDto } from '@/adapter/inbound/dto/response/comment/comment-response.dto';
import { Comment } from '@/domain/entity/comment.entity';
import { CommentServiceInPort } from '@/port/inbound/comment-service.in-port';
import { CommentServiceOutPort } from '@/port/outbound/comment-service.out-port';
import { PostServiceOutPort } from '@/port/outbound/post-service.out-port';
import { DiaryServiceOutPort } from '@/port/outbound/diary-service.out-port';

@Injectable()
export class CommentService implements CommentServiceInPort {
    constructor(
        private readonly commentRepository: CommentServiceOutPort,
        private readonly postRepository: PostServiceOutPort,
        private readonly diaryRepository: DiaryServiceOutPort,
    ) { }

    async create(userId: number, postId: number, dto: CreateCommentDto): Promise<CommentResponseDto> {
        const post = await this.postRepository.findById(postId);
        if (!post) {
            throw new NotFoundException('게시물을 찾을 수 없습니다.');
        }

        const user = await this.diaryRepository.findUserById(userId);
        if (!user) {
            throw new NotFoundException('사용자를 찾을 수 없습니다.');
        }

        const comment = new Comment();
        comment.post = post;
        comment.user = user;
        comment.content = dto.content;
        comment.isAnonymous = dto.isAnonymous;
        comment.authorNickname = dto.isAnonymous ? '익명' : user.nickname;

        const savedComment = await this.commentRepository.save(comment);

        // 댓글 수 증가
        await this.postRepository.incrementCommentCount(postId);

        return this.toCommentResponse(savedComment);
    }

    async findByPostId(postId: number): Promise<CommentListResponseDto> {
        const post = await this.postRepository.findById(postId);
        if (!post) {
            throw new NotFoundException('게시물을 찾을 수 없습니다.');
        }

        const comments = await this.commentRepository.findByPostId(postId);

        return {
            items: comments.map(comment => this.toCommentResponse(comment)),
            total: comments.length,
        };
    }

    async delete(userId: number, commentId: number): Promise<void> {
        const comment = await this.commentRepository.findById(commentId);
        if (!comment) {
            throw new NotFoundException('댓글을 찾을 수 없습니다.');
        }

        if (comment.user.id !== userId) {
            throw new ForbiddenException('본인의 댓글만 삭제할 수 있습니다.');
        }

        const postId = comment.post.id;
        await this.commentRepository.delete(comment);

        // 댓글 수 감소
        await this.postRepository.decrementCommentCount(postId);
    }

    private toCommentResponse(comment: Comment): CommentResponseDto {
        return plainToInstance(CommentResponseDto, {
            id: comment.id,
            content: comment.content,
            isAnonymous: comment.isAnonymous,
            authorNickname: comment.authorNickname,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
        }, { excludeExtraneousValues: true });
    }
}
