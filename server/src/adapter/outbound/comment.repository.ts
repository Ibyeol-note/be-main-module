import { Injectable } from '@nestjs/common';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { InjectRepository } from '@mikro-orm/nestjs';

import { Comment } from '@/domain/entity/comment.entity';
import { CommentServiceOutPort } from '@/port/outbound/comment-service.out-port';

@Injectable()
export class CommentRepository implements CommentServiceOutPort {
    constructor(
        private readonly em: EntityManager,
        @InjectRepository(Comment)
        private readonly commentRepo: EntityRepository<Comment>,
    ) { }

    async findById(commentId: number): Promise<Comment | null> {
        return this.commentRepo.findOne({ id: commentId }, { populate: ['user', 'post'] });
    }

    async findByPostId(postId: number): Promise<Comment[]> {
        return this.commentRepo.find(
            { post: { id: postId } },
            {
                orderBy: { createdAt: 'ASC' },
                populate: ['user'],
            },
        );
    }

    async save(comment: Comment): Promise<Comment> {
        this.em.persist(comment);
        await this.em.flush();
        return comment;
    }

    async delete(comment: Comment): Promise<void> {
        this.em.remove(comment);
        await this.em.flush();
    }
}
