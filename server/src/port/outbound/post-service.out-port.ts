import { Post } from '@/domain/entity/post.entity';
import { PostCategory } from '@/domain/enum/post-category.enum';
import { UserType } from '@/domain/enum/user-type.enum';

export interface CreatePostFromDiaryData {
    userId: number;
    diaryId: number;
    content: string;
    category: PostCategory;
    isAnonymous: boolean;
    authorNickname: string;
}

export abstract class PostServiceOutPort {
    abstract findById(postId: number): Promise<Post | null>;
    abstract findAll(options: {
        userType?: UserType;
        category?: PostCategory;
        sortBy?: 'latest' | 'comments';
        page: number;
        limit: number;
    }): Promise<{ items: Post[]; total: number }>;
    abstract save(post: Post): Promise<Post>;
    abstract delete(post: Post): Promise<void>;
    abstract createFromDiary(data: CreatePostFromDiaryData): Promise<Post>;
    abstract incrementCommentCount(postId: number): Promise<void>;
    abstract decrementCommentCount(postId: number): Promise<void>;
}
