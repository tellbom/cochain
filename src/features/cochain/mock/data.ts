import type { ResourceKey, ResourceTypeMap } from '../contracts'
import * as design from '../../../../figma/Design RBAC Menu Interface/src/mock'

const now = '2026-08-14 09:32:15'

/**
 * The approved Figma Make download is the canonical fixture for mock mode.
 * Adapters below only remove presentation-only fields or fill fields that exist
 * in the production API contract but are intentionally absent from the mockup.
 */
export const mockData: { [K in ResourceKey]: ResourceTypeMap[K][] } = {
    batches: design.BATCHES.map((row) => ({ ...row })),
    batchParts: design.BATCH_PARTS.map(({ packageNo: _packageNo, ...row }) => ({ ...row })) as ResourceTypeMap['batchParts'][],
    packages: design.PACKAGES.map(({ categoryName: _categoryName, ...row }) => ({ ...row })) as ResourceTypeMap['packages'][],
    packageParts: design.BATCH_PARTS.filter((row) => row.packageId).map((row) => ({
        id: `pp-${row.id}`,
        packageId: row.packageId,
        partId: row.id,
        partDrawingNo: row.partDrawingNo,
    })),
    suppliers: design.SUPPLIERS.map((row) => ({ ...row })) as ResourceTypeMap['suppliers'][],
    performances: design.PERFORMANCES.map((row) => ({ ...row })),
    supplierCategories: design.SUPPLIER_CATEGORIES.map((row) => ({
        ...row,
        supplierName: design.SUPPLIERS.find((supplier) => supplier.id === row.supplierId)?.supplierName,
    })),
    categories: design.CATEGORY_MASTERS.map((row) => ({ ...row })) as ResourceTypeMap['categories'][],
    specialCategories: design.CATEGORY_CONFIGS.map((row) => ({ ...row })) as ResourceTypeMap['specialCategories'][],
    rankingSnapshots: design.RANKINGS.map((row) => ({ ...row })) as ResourceTypeMap['rankingSnapshots'][],
    roundRobinCursors: design.CATEGORY_MASTERS.slice(0, 3).map((category, index) => ({
        id: `cursor-${category.id}`,
        categoryId: category.id,
        categoryName: category.categoryName,
        qualityLevel: index === 2 ? ('普通' as const) : ('优质' as const),
        rankingYear: 2026,
        rankingMonth: 7,
        cursorPosition: index + 1,
        supplierCount: design.SUPPLIER_CATEGORIES.filter((row) => row.categoryId === category.id).length,
    })),
    recommendations: design.RECOMMENDATIONS.map((row) => ({ ...row })) as ResourceTypeMap['recommendations'][],
    historySuppliers: design.BATCH_PARTS.filter((row) => row.historySupplier1).map((row, index) => {
        const supplier = design.SUPPLIERS[index % design.SUPPLIERS.length]
        return {
            id: `history-${row.id}`,
            partDrawingNo: row.partDrawingNo,
            supplierId: supplier.id,
            supplierName: row.historySupplier1,
            cooperationCount: Math.max(1, 5 - index),
            lastCooperationTime: '2026-07-18',
        }
    }),
    leftRightRules: design.RIGHT_RULES.map((row) => ({ ...row, enabled: 1 as const, remark: '设计定稿规则' })),
    leftRightManuals: design.RIGHT_MANUALS.map((row) => ({ ...row, aircraftModel: row.leftPartDrawingNo.split('-')[0], remark: '人工确认关系' })),
    typePackageConfigs: design.TYPE_CONFIGS.map(({ typeLabel, maxPartCount, ...row }) => ({
        ...row,
        maxPartLimit: maxPartCount,
        enabled: 1 as const,
        remark: typeLabel,
    })) as ResourceTypeMap['typePackageConfigs'][],
    operationLogs: design.OPERATION_LOGS.map((row) => ({
        id: row.id,
        batchId: row.targetObject.startsWith('SUB-') ? row.targetObject : undefined,
        operationType: row.operationType,
        operationResult: row.result === '成功' ? ('SUCCESS' as const) : ('FAILED' as const),
        operator: row.operator,
        detail: `${row.targetModule} · ${row.targetObject}${row.remark ? ` · ${row.remark}` : ''}`,
        operationTime: row.operateTime,
    })),
    systemOperateLogs: design.SYSTEM_LOGS.map((row) => ({
        id: row.id,
        userid: row.operator,
        username: row.operator,
        permissionCode: row.operationType,
        httpMethod: row.result === '成功' ? 'POST' : 'GET',
        requestPath: row.targetObject,
        responseStatus: row.result === '成功' ? 200 : 401,
        loginIp: row.operatorIp,
        operateTime: row.operateTime,
    })),
}

void now
