import { Property } from '@mikro-orm/core';

export abstract class BaseEntity {
    @Property({ onCreate: () => new Date() })
    createdAt: Date = new Date();

    @Property({ onUpdate: () => new Date(), onCreate: () => new Date() })
    updatedAt: Date = new Date();
}
