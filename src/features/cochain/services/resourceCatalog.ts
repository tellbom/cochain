import type { ResourceKey } from '../contracts'

export const resourceBasePaths: Record<ResourceKey, string> = {
    batches: '/api/subcontract/batch',
    batchParts: '/api/part/batch-part',
    packages: '/api/work/package',
    packageParts: '/api/package/part',
    suppliers: '/api/supplier',
    performances: '/api/supplier/performance',
    supplierCategories: '/api/supplier/category',
    categories: '/api/part/category-master',
    specialCategories: '/api/special/category-config',
    rankingSnapshots: '/api/supplier/ranking-snapshot',
    roundRobinCursors: '/api/round/robin-cursor',
    recommendations: '/api/package/supplier-recommendation',
    historySuppliers: '/api/part/history-supplier',
    leftRightRules: '/api/left/right-rule',
    leftRightManuals: '/api/left/right-manual',
    typePackageConfigs: '/api/part/type-package-config',
    operationLogs: '/api/operation/log',
    systemOperateLogs: '/api/system/operate-log',
}
