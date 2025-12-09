import { CreateCommentDto } from '@/adapter/inbound/dto/request/comment/create-comment.dto';
import { CommentResponseDto, CommentListResponseDto } from '@/adapter/inbound/dto/response/comment/comment-response.dto';

export abstract class CommentServiceInPort {
    abstract create(userId: number, postId: number, dto: CreateCommentDto): Promise<CommentResponseDto>;
    abstract findByPostId(postId: number): Promise<CommentListResponseDto>;
    abstract delete(userId: number, commentId: number): Promise<void>;
}
