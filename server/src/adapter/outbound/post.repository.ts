import { Injectable } from '@nestjs/common';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { InjectRepository } from '@mikro-orm/nestjs';

import { Post } from '@/domain/entity/post.entity';
import { User } from '@/domain/entity/user.entity';
import { PostCategory } from '@/domain/enum/post-category.enum';
import { UserType } from '@/domain/enum/user-type.enum';
import { PostServiceOutPort, CreatePostFromDiaryData } from '@/port/outbound/post-service.out-port';

@Injectable()
export class PostRepository implements PostServiceOutPort {
    constructor(
        private readonly em: EntityManager,
        @InjectRepository(Post)
        private readonly postRepo: EntityRepository<Post>,
        @InjectRepository(User)
        private readonly userRepo: EntityRepository<User>,
    ) { }

    async findById(postId: number): Promise<Post | null> {
        return this.postRepo.findOne({ id: postId }, { populate: ['user'] });
    }

    async findAll(options: {
        userType?: UserType;
        category?: PostCategory;
        sortBy?: 'latest' | 'comments';
        page: number;
        limit: number;
    }): Promise<{ items: Post[]; total: number }> {
        const where: any = {};

        if (options.category) {
            where.category = options.category;
        }

        const orderBy: any = options.sortBy === 'comments'
            ? { commentCount: 'DESC', createdAt: 'DESC' }
            : { createdAt: 'DESC' };

        // 사용자 타입에 따른 우선순위 정렬 (SQL 레벨에서 처리가 복잡하므로, 간단히 처리)
        const [items, total] = await this.postRepo.findAndCount(where, {
            orderBy,
            offset: (options.page - 1) * options.limit,
            limit: options.limit,
            populate: ['user'],
        });

        // 사용자 타입과 같은 카테고리의 게시물을 우선 정렬
        if (options.userType && !options.category) {
            const userCategory = this.userTypeToCategory(options.userType);
            items.sort((a, b) => {
                if (a.category === userCategory && b.category !== userCategory) return -1;
                if (a.category !== userCategory && b.category === userCategory) return 1;
                return 0;
            });
        }

        return { items, total };
    }

    async save(post: Post): Promise<Post> {
        this.em.persist(post);
        await this.em.flush();
        return post;
    }

    async delete(post: Post): Promise<void> {
        this.em.remove(post);
        await this.em.flush();
    }

    async createFromDiary(data: CreatePostFromDiaryData): Promise<Post> {
        const user = await this.userRepo.findOneOrFail({ id: data.userId });

        const post = new Post();
        post.user = user;
        post.diaryId = data.diaryId;
        post.content = data.content;
        post.category = data.category;
        post.isAnonymous = data.isAnonymous;
        post.authorNickname = data.authorNickname;
        post.commentCount = 0;

        this.em.persist(post);
        await this.em.flush();
        return post;
    }

    async incrementCommentCount(postId: number): Promise<void> {
        const post = await this.postRepo.findOneOrFail({ id: postId });
        post.commentCount += 1;
        await this.em.flush();
    }

    async decrementCommentCount(postId: number): Promise<void> {
        const post = await this.postRepo.findOneOrFail({ id: postId });
        post.commentCount = Math.max(0, post.commentCount - 1);
        await this.em.flush();
    }

    private userTypeToCategory(userType: UserType): PostCategory {
        const mapping: Record<UserType, PostCategory> = {
            [UserType.FORGET]: PostCategory.FORGET,
            [UserType.HOLD]: PostCategory.HOLD,
            [UserType.NEUTRAL]: PostCategory.NEUTRAL,
        };
        return mapping[userType];
    }
}
