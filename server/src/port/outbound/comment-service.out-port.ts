import { Comment } from '@/domain/entity/comment.entity';

export abstract class CommentServiceOutPort {
    abstract findById(commentId: number): Promise<Comment | null>;
    abstract findByPostId(postId: number): Promise<Comment[]>;
    abstract save(comment: Comment): Promise<Comment>;
    abstract delete(comment: Comment): Promise<void>;
}
