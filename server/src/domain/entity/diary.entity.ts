import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity()
export class Diary extends BaseEntity {
    @PrimaryKey()
    id!: number;

    @ManyToOne(() => User)
    user!: User;

    @Property({ columnType: 'text' })
    content!: string;

    @Property({ default: 0 })
    emotionScore: number = 0;

    @Property({ type: 'json', nullable: true })
    emotionKeywords: string[] = [];

    @Property({ columnType: 'text', nullable: true })
    comfortMessage?: string;

    @Property({ default: false })
    isShared: boolean = false;

    @Property({ nullable: true })
    postId?: number;
}
