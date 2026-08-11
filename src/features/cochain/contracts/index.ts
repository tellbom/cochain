export interface Result<T> {
    code: number
    msg: string
    data: T
    time?: number
}

export interface PageData<T> {
    records: T[]
    total: number
    current: number
    size: number
    pages: number
}

export interface PageQuery {
    pageNum?: number
    pageSize?: number
    keyword?: string
}

export type EntityId = string
export type BatchStatus = 'DRAFT' | 'DATA_READY' | 'PACKAGED' | 'RECOMMENDED' | 'COMPLETED'
export type RecommendSource = 'HISTORY' | 'QUALITY_ROUND' | 'NORMAL_ROUND' | 'ALL_CATEGORY'
export type QualityLevel = '优质' | '普通'
export type PartType = '小型' | '中型' | '大型' | '超大型' | '其他'
export type SizeLogic = 'AND' | 'OR'
export type SpecialType = 'COMPOSITE' | 'REINFORCEMENT'
export type RecommendRule = 'ALL_SUPPLIERS' | 'ROUND_ROBIN'

export interface BaseEntity {
    id: EntityId
    createdTime?: string
    updatedTime?: string
}

export interface BatchVO extends BaseEntity {
    batchNo: string
    flowNo: string
    batchStatus: BatchStatus
    uploadFileName: string
    totalPartCount: number
    totalPackageCount: number
    operator: string
}
export interface BatchQuery extends PageQuery {
    batchNo?: string
    flowNo?: string
    batchStatus?: BatchStatus
    operator?: string
}

export interface BatchPartVO extends BaseEntity {
    batchId: EntityId
    seqNo: number
    partDrawingNo: string
    aircraftModel: string
    partName: string
    materialType: string
    lengthValue: number
    widthValue: number
    nestingInfo: string
    historySupplier1?: string
    historySupplier2?: string
    historySupplier3?: string
    supplierCountNeeded: number
    thirdCategory: string
    thirdCategoryId: EntityId
    partType: PartType
    packageId?: EntityId
    recommendSupplier1?: string
    recommendSupplier2?: string
    recommendSupplier3?: string
    recommendSupplier4?: string
    recommendSupplier5?: string
    recommendSupplier6?: string
    recommendSupplier7?: string
}
export interface BatchPartQuery extends PageQuery {
    batchId?: EntityId
    partDrawingNo?: string
    aircraftModel?: string
    thirdCategoryId?: EntityId
}

export interface PackageVO extends BaseEntity {
    batchId: EntityId
    packageNo: string
    categoryId: EntityId
    supplierCountNeeded: number
    recommendCount: number
    partCount: number
    partType: PartType
    maxPartLimit: number
    hasHistorySupplier: 0 | 1
    isSpecialCategory: 0 | 1
    specialType?: SpecialType
    recommendationStatus?: string
}
export interface PackageQuery extends PageQuery {
    batchId?: EntityId
    packageNo?: string
    categoryId?: EntityId
    recommendationStatus?: string
}

export interface PackagePartVO extends BaseEntity {
    packageId: EntityId
    partId: EntityId
    partDrawingNo: string
}
export interface PackagePartQuery extends PageQuery {
    packageId?: EntityId
    partId?: EntityId
    partDrawingNo?: string
}

export interface SupplierVO extends BaseEntity {
    supplierName: string
    enabled: 0 | 1
    remark: string
}
export interface SupplierQuery extends PageQuery {
    supplierName?: string
    enabled?: 0 | 1
}

export interface SupplierPerformanceVO extends BaseEntity {
    supplierId: EntityId
    supplierName?: string
    performanceYear: number
    performanceMonth: number
    score: number
    halfYearAvg: number
    lastMonthScore: number
    comprehensiveScore: number
}
export interface SupplierPerformanceQuery extends PageQuery {
    supplierId?: EntityId
    performanceYear?: number
    performanceMonth?: number
}

export interface SupplierCategoryVO extends BaseEntity {
    supplierId: EntityId
    supplierName?: string
    categoryId: EntityId
    categoryName?: string
}
export interface SupplierCategoryQuery extends PageQuery {
    supplierId?: EntityId
    categoryId?: EntityId
}

export interface CategoryMasterVO extends BaseEntity {
    categoryName: string
    materialType: string
    lengthMin: number
    lengthMax: number
    widthMin: number
    widthMax: number
    sizeLogic: SizeLogic
    partType: PartType
}
export interface CategoryMasterQuery extends PageQuery {
    categoryName?: string
    materialType?: string
    partType?: PartType
}

export interface SpecialCategoryConfigVO extends BaseEntity {
    categoryId: EntityId
    categoryName?: string
    specialType: SpecialType
    recommendRule: RecommendRule
    ignoreQuality: 0 | 1
}
export interface SpecialCategoryConfigQuery extends PageQuery {
    categoryId?: EntityId
    specialType?: SpecialType
}

export interface RankingSnapshotVO extends BaseEntity {
    supplierId: EntityId
    supplierName?: string
    categoryId: EntityId
    categoryName?: string
    rankingYear: number
    rankingMonth: number
    comprehensiveScore: number
    rankInCategory: number
    qualityLevel: QualityLevel
    totalSupplierCount: number
}
export interface RankingSnapshotQuery extends PageQuery {
    supplierId?: EntityId
    categoryId?: EntityId
    rankingYear?: number
    rankingMonth?: number
    qualityLevel?: QualityLevel
}

export interface RoundRobinCursorVO extends BaseEntity {
    categoryId: EntityId
    categoryName?: string
    qualityLevel: QualityLevel
    rankingYear: number
    rankingMonth: number
    cursorPosition: number
    supplierCount: number
}
export interface RoundRobinCursorQuery extends PageQuery {
    categoryId?: EntityId
    qualityLevel?: QualityLevel
    rankingYear?: number
    rankingMonth?: number
}

export interface SupplierRecommendationVO extends BaseEntity {
    packageId: EntityId
    batchId: EntityId
    supplierId: EntityId
    supplierName: string
    recommendOrder: number
    recommendSource: RecommendSource
    qualityLevel: QualityLevel
    performanceScore: number
}
export interface SupplierRecommendationQuery extends PageQuery {
    packageId?: EntityId
    batchId?: EntityId
    supplierId?: EntityId
    recommendSource?: RecommendSource
    qualityLevel?: QualityLevel
}

export interface HistorySupplierVO extends BaseEntity {
    partDrawingNo: string
    supplierId: EntityId
    supplierName: string
    cooperationCount: number
    lastCooperationTime?: string
}
export interface HistorySupplierQuery extends PageQuery {
    partDrawingNo?: string
    supplierId?: EntityId
}

export interface LeftRightRuleVO extends BaseEntity {
    aircraftModel: string
    leftSuffix: string
    rightSuffix: string
    enabled: 0 | 1
    remark: string
}
export interface LeftRightRuleQuery extends PageQuery {
    aircraftModel?: string
    enabled?: 0 | 1
}

export interface LeftRightManualVO extends BaseEntity {
    aircraftModel: string
    leftPartDrawingNo: string
    rightPartDrawingNo: string
    remark: string
}
export interface LeftRightManualQuery extends PageQuery {
    aircraftModel?: string
    partDrawingNo?: string
}

export interface TypePackageConfigVO extends BaseEntity {
    partType: PartType
    maxPartLimit: number
    enabled: 0 | 1
    remark: string
}
export interface TypePackageConfigQuery extends PageQuery {
    partType?: PartType
    enabled?: 0 | 1
}

export interface OperationLogVO extends BaseEntity {
    batchId?: EntityId
    operationType: string
    operationResult: 'SUCCESS' | 'FAILED'
    operator: string
    detail: string
    operationTime: string
}
export interface OperationLogQuery extends PageQuery {
    batchId?: EntityId
    operationType?: string
    operationResult?: 'SUCCESS' | 'FAILED'
    operator?: string
}

export interface SystemOperateLogVO extends BaseEntity {
    userid: string
    username: string
    permissionCode: string
    httpMethod: string
    requestPath: string
    responseStatus: number
    loginIp: string
    operateTime: string
}
export interface SystemOperateLogQuery extends PageQuery {
    userid?: string
    permissionCode?: string
    httpMethod?: string
    responseStatus?: number
}

export interface ImportErrorItem {
    rowNo: number
    message: string
}

export interface BatchImportResultVO {
    batchId: EntityId
    batchNo: string
    totalRows: number
    successCount: number
    errorCount: number
    errors: ImportErrorItem[]
}

export interface OrchestrationResultVO {
    batchId: EntityId
    batchNo: string
    batchStatus: BatchStatus
    packageCount: number
    recommendationCount: number
}

export interface PerformanceUploadResultVO {
    totalRows: number
    successCount: number
    errorCount: number
    errors: ImportErrorItem[]
}

export type ResourceKey =
    | 'batches'
    | 'batchParts'
    | 'packages'
    | 'packageParts'
    | 'suppliers'
    | 'performances'
    | 'supplierCategories'
    | 'categories'
    | 'specialCategories'
    | 'rankingSnapshots'
    | 'roundRobinCursors'
    | 'recommendations'
    | 'historySuppliers'
    | 'leftRightRules'
    | 'leftRightManuals'
    | 'typePackageConfigs'
    | 'operationLogs'
    | 'systemOperateLogs'

export interface ResourceTypeMap {
    batches: BatchVO
    batchParts: BatchPartVO
    packages: PackageVO
    packageParts: PackagePartVO
    suppliers: SupplierVO
    performances: SupplierPerformanceVO
    supplierCategories: SupplierCategoryVO
    categories: CategoryMasterVO
    specialCategories: SpecialCategoryConfigVO
    rankingSnapshots: RankingSnapshotVO
    roundRobinCursors: RoundRobinCursorVO
    recommendations: SupplierRecommendationVO
    historySuppliers: HistorySupplierVO
    leftRightRules: LeftRightRuleVO
    leftRightManuals: LeftRightManualVO
    typePackageConfigs: TypePackageConfigVO
    operationLogs: OperationLogVO
    systemOperateLogs: SystemOperateLogVO
}
