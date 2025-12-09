import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Post } from './post.entity';

@Entity()
export class Comment extends BaseEntity {
    @PrimaryKey()
    id!: number;

    @ManyToOne(() => Post)
    post!: Post;

    @ManyToOne(() => User)
    user!: User;

    @Property({ columnType: 'text' })
    content!: string;

    @Property({ default: false })
    isAnonymous: boolean = false;

    @Property({ length: 100 })
    authorNickname!: string;
}
