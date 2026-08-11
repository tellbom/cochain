import type { BaseEntity, EntityId, PageData, PageQuery } from '../contracts'

export interface ResourceService<T extends BaseEntity, Q extends PageQuery = PageQuery> {
    page(query?: Q): Promise<PageData<T>>
    list(query?: Q): Promise<T[]>
    get(id: EntityId): Promise<T>
    create(input: Omit<T, 'id'>): Promise<EntityId>
    update(input: T): Promise<boolean>
    remove(id: EntityId): Promise<boolean>
    removeMany(ids: EntityId[]): Promise<boolean>
}

export type MockScenario = 'normal' | 'empty' | 'error' | 'slow' | 'partial-upload'
