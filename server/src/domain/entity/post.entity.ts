import { Entity, PrimaryKey, Property, ManyToOne, Enum } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { PostCategory } from '../enum/post-category.enum';

@Entity()
export class Post extends BaseEntity {
    @PrimaryKey()
    id!: number;

    @ManyToOne(() => User)
    user!: User;

    @Property({ nullable: true })
    diaryId?: number;

    @Enum(() => PostCategory)
    category!: PostCategory;

    @Property({ length: 200, nullable: true })
    title?: string;

    @Property({ columnType: 'text' })
    content!: string;

    @Property({ default: false })
    isAnonymous: boolean = false;

    @Property({ length: 100 })
    authorNickname!: string;

    @Property({ default: 0 })
    commentCount: number = 0;
}
