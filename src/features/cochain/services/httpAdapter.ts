import axios, { type AxiosInstance } from 'axios'
import { useAdminInfo } from '/@/stores/adminInfo'
import type { BaseEntity, EntityId, PageData, PageQuery, ResourceKey, ResourceTypeMap, Result } from '../contracts'
import { resourceBasePaths } from './resourceCatalog'
import type { ResourceService } from './types'

const client: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_AXIOS_BASE_URL || '',
    timeout: 20_000,
})

client.interceptors.request.use((config) => {
    const token = useAdminInfo().token
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

const unwrap = <T>(result: Result<T>): T => {
    if (result.code !== 0) throw new Error(result.msg || `业务错误 ${result.code}`)
    return result.data
}

export const createHttpResourceService = <K extends ResourceKey>(key: K): ResourceService<ResourceTypeMap[K]> => {
    const basePath = resourceBasePaths[key]
    return {
        async page(query: PageQuery = {}) {
            return unwrap((await client.get<Result<PageData<ResourceTypeMap[K]>>>(`${basePath}/page`, { params: query })).data)
        },
        async list(query: PageQuery = {}) {
            return unwrap((await client.get<Result<ResourceTypeMap[K][]>>(`${basePath}/list`, { params: query })).data)
        },
        async get(id: EntityId) {
            return unwrap((await client.get<Result<ResourceTypeMap[K]>>(`${basePath}/${encodeURIComponent(id)}`)).data)
        },
        async create(input: Omit<ResourceTypeMap[K], 'id'>) {
            return unwrap((await client.post<Result<EntityId>>(basePath, input)).data)
        },
        async update(input: ResourceTypeMap[K]) {
            return unwrap((await client.put<Result<boolean>>(basePath, input)).data)
        },
        async remove(id: EntityId) {
            return unwrap((await client.delete<Result<boolean>>(`${basePath}/${encodeURIComponent(id)}`)).data)
        },
        async removeMany(ids: EntityId[]) {
            return unwrap((await client.delete<Result<boolean>>(basePath, { data: ids })).data)
        },
    } as ResourceService<ResourceTypeMap[K] & BaseEntity>
}
