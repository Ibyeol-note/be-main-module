import { CreatePostDto } from '@/adapter/inbound/dto/request/post/create-post.dto';
import { PostResponseDto, PostListPaginatedResponseDto } from '@/adapter/inbound/dto/response/post/post-response.dto';
import { PostCategory } from '@/domain/enum/post-category.enum';

export abstract class PostServiceInPort {
    abstract create(userId: number, dto: CreatePostDto): Promise<PostResponseDto>;
    abstract findAll(options: {
        userId: number;
        category?: PostCategory;
        sortBy?: 'latest' | 'comments';
        page: number;
        limit: number;
    }): Promise<PostListPaginatedResponseDto>;
    abstract findById(postId: number): Promise<PostResponseDto>;
    abstract delete(userId: number, postId: number): Promise<void>;
}
