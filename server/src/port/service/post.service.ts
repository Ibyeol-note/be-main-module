import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { CreatePostDto } from '@/adapter/inbound/dto/request/post/create-post.dto';
import { PostResponseDto, PostListPaginatedResponseDto, PostListResponseDto } from '@/adapter/inbound/dto/response/post/post-response.dto';
import { Post } from '@/domain/entity/post.entity';
import { PostCategory } from '@/domain/enum/post-category.enum';
import { PostServiceInPort } from '@/port/inbound/post-service.in-port';
import { PostServiceOutPort } from '@/port/outbound/post-service.out-port';
import { DiaryServiceOutPort } from '@/port/outbound/diary-service.out-port';

@Injectable()
export class PostService implements PostServiceInPort {
    constructor(
        private readonly postRepository: PostServiceOutPort,
        private readonly diaryRepository: DiaryServiceOutPort,
    ) { }

    async create(userId: number, dto: CreatePostDto): Promise<PostResponseDto> {
        const user = await this.diaryRepository.findUserById(userId);
        if (!user) {
            throw new NotFoundException('사용자를 찾을 수 없습니다.');
        }

        const post = new Post();
        post.user = user;
        post.title = dto.title;
        post.content = dto.content;
        post.category = dto.category;
        post.isAnonymous = dto.isAnonymous;
        post.authorNickname = dto.isAnonymous ? '익명' : user.nickname;
        post.commentCount = 0;

        const savedPost = await this.postRepository.save(post);
        return this.toPostResponse(savedPost);
    }

    async findAll(options: {
        userId: number;
        category?: PostCategory;
        sortBy?: 'latest' | 'comments';
        page: number;
        limit: number;
    }): Promise<PostListPaginatedResponseDto> {
        const user = await this.diaryRepository.findUserById(options.userId);

        const { items, total } = await this.postRepository.findAll({
            userType: user?.userType,
            category: options.category,
            sortBy: options.sortBy || 'latest',
            page: options.page,
            limit: options.limit,
        });

        const postList: PostListResponseDto[] = items.map(post => ({
            id: post.id,
            title: post.title,
            contentPreview: post.content.substring(0, 150) + (post.content.length > 150 ? '...' : ''),
            category: post.category,
            authorNickname: post.authorNickname,
            commentCount: post.commentCount,
            createdAt: post.createdAt,
        }));

        return {
            items: postList,
            total,
            page: options.page,
            limit: options.limit,
            totalPages: Math.ceil(total / options.limit),
        };
    }

    async findById(postId: number): Promise<PostResponseDto> {
        const post = await this.postRepository.findById(postId);
        if (!post) {
            throw new NotFoundException('게시물을 찾을 수 없습니다.');
        }
        return this.toPostResponse(post);
    }

    async delete(userId: number, postId: number): Promise<void> {
        const post = await this.postRepository.findById(postId);
        if (!post) {
            throw new NotFoundException('게시물을 찾을 수 없습니다.');
        }

        if (post.user.id !== userId) {
            throw new ForbiddenException('본인의 게시물만 삭제할 수 있습니다.');
        }

        await this.postRepository.delete(post);
    }

    private toPostResponse(post: Post): PostResponseDto {
        return plainToInstance(PostResponseDto, {
            id: post.id,
            title: post.title,
            content: post.content,
            category: post.category,
            isAnonymous: post.isAnonymous,
            authorNickname: post.authorNickname,
            commentCount: post.commentCount,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
        }, { excludeExtraneousValues: true });
    }
}
