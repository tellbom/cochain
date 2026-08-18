import { chromium } from 'playwright-core'
import process from 'node:process'

const password = process.env.COCHAIN_TEST_PASSWORD
if (!password) throw new Error('COCHAIN_TEST_PASSWORD is required')

const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--disable-gpu'],
})

const viewport = { width: 1440, height: 960 }
const reference = await browser.newPage({ viewport })
const app = await browser.newPage({ viewport })
const consoleErrors = []
const failedRequests = []
const navigationHistory = []
const httpErrors = []
app.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
})
app.on('requestfailed', (request) => failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText || ''}`))
app.on('framenavigated', (frame) => {
    if (frame === app.mainFrame()) navigationHistory.push(frame.url())
})
app.on('response', (response) => {
    if (response.status() >= 400) httpErrors.push(`${response.status()} ${response.url()}`)
})

const designMenus = ['分包中心', '供应商中心', '品类供方大盘', '供应商绩效与排名', '规则配置', '日志记录']
const expectedMenus = [...designMenus, '权限中心', '接口权限映射', '项目授权', '菜单规则', '管理员', '权限组']
const routes = [
    ['/cochain/subcontract/batch', '分包批次列表'],
    ['/cochain/supplier/supplier', '供应商中心'],
    ['/cochain/supplier/category', '品类供应商明细'],
    ['/cochain/supplier/performance', '供应商绩效与排名'],
    ['/cochain/part/category-master', '规则配置'],
    ['/cochain/operation/log', '日志记录'],
]
const permissionRoutes = [
    ['/cochain/auth/apiMap', '.rbac-apimap-page'],
    ['/cochain/auth/projectGrant', '.rbac-grant-page'],
    ['/cochain/auth/rule', '.rbac-rule-page'],
    ['/cochain/auth/admin', '.rbac-admin-page'],
    ['/cochain/auth/group', '.rbac-group-page'],
]

try {
    await reference.goto('http://127.0.0.1:8443/', { waitUntil: 'domcontentloaded', timeout: 30_000 })
    await reference.getByRole('heading', { name: '分包批次列表' }).waitFor()
    const referenceMenus = await reference.locator('aside button').allTextContents()
    const referenceGeometry = await reference.evaluate(() => ({
        headerHeight: Math.round(document.querySelector('header')?.getBoundingClientRect().height || 0),
        sidebarWidth: Math.round(document.querySelector('aside')?.getBoundingClientRect().width || 0),
        bodyBackground: getComputedStyle(document.body).backgroundColor,
    }))
    await app.goto('http://127.0.0.1:1919/', { waitUntil: 'domcontentloaded', timeout: 30_000 })
    await app.waitForURL((url) => url.hostname === '192.168.124.2' && url.port === '18085', { timeout: 30_000 })
    if (/192\.168\.124\.2:18085/.test(app.url())) {
        const username = app.locator('input[name="username"], input[autocomplete="username"], input[type="text"]').first()
        const loginState = await Promise.race([
            username.waitFor({ state: 'visible', timeout: 30_000 }).then(() => 'form'),
            app.waitForURL((url) => url.hostname === '127.0.0.1' && url.port === '1919', { timeout: 30_000 }).then(() => 'authenticated'),
        ])
        if (loginState === 'form') {
            await username.fill('196045')
            await app.locator('input[name="password"], input[type="password"]').first().fill(password)
            await app.locator('#kc-login, button[type="submit"], input[type="submit"]').first().click()
        }
    }
    await app.waitForURL((url) => url.hostname === '127.0.0.1' && url.port === '1919', { timeout: 30_000 })
    await app.locator('.layouts-menu-vertical').waitFor({ timeout: 30_000 })
    await app.waitForURL((url) => url.pathname === '/cochain/subcontract/batch', { timeout: 30_000 })
    const postLoginPath = new URL(app.url()).pathname
    await app.screenshot({ path: 'C:\\web\\cochain\\.tmp\\cochain-login-result.png', animations: 'disabled' })
    await app.goto('http://127.0.0.1:1919/cochain/subcontract/batch', { waitUntil: 'domcontentloaded', timeout: 30_000 })
    await app.getByRole('heading', { name: '分包批次列表' }).waitFor({ timeout: 30_000 })
    await app.locator('.block-loading').waitFor({ state: 'hidden', timeout: 15_000 })

    const appMenus = (await app.locator('.layouts-menu-vertical .menu-title').allTextContents()).map((item) => item.trim())
    const appGeometry = await app.evaluate(() => ({
        headerHeight: Math.round(document.querySelector('.co-header')?.getBoundingClientRect().height || 0),
        sidebarWidth: Math.round(document.querySelector('.layout-aside-Classic')?.getBoundingClientRect().width || 0),
        mainBackground: getComputedStyle(document.querySelector('.layout-main')).backgroundColor,
        horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    }))
    await app.screenshot({ path: 'C:\\web\\cochain\\.tmp\\cochain-reviewed-desktop.png', animations: 'disabled' })

    const pageResults = []
    for (const [path, heading] of routes) {
        await app.goto(`http://127.0.0.1:1919${path}`, { waitUntil: 'domcontentloaded', timeout: 30_000 })
        await app.getByRole('heading', { name: heading, exact: true }).waitFor({ timeout: 30_000 })
        await app.locator('.block-loading').waitFor({ state: 'hidden', timeout: 15_000 })
        pageResults.push({ path, heading, loaded: true })
    }

    await app.goto('http://127.0.0.1:1919/cochain/subcontract/batch', { waitUntil: 'domcontentloaded', timeout: 30_000 })
    await app.getByRole('heading', { name: '分包批次列表', exact: true }).waitFor({ timeout: 30_000 })
    await app.locator('.block-loading').waitFor({ state: 'hidden', timeout: 15_000 })
    const reviewedBatchRow = app.locator('.el-table__row').filter({ hasText: 'SUB-20260810-002' })
    await reviewedBatchRow.getByRole('button', { name: '进入工作台' }).click()
    await app.locator('.batch-workbench').waitFor({ timeout: 30_000 })
    await app.locator('.package-card').first().waitFor({ timeout: 30_000 })
    const workbenchParts = await app.evaluate(() => ({
        packageCount: document.querySelectorAll('.package-card').length,
        activePackages: document.querySelectorAll('.package-card.is-active').length,
        overviewVisible: !!document.querySelector('.package-overview'),
        lockNoticeVisible: !!document.querySelector('.package-lock-notice'),
        partRows: document.querySelectorAll('.workbench-table-card .el-table__row').length,
        horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    }))
    await app.screenshot({ path: 'C:\\web\\cochain\\.tmp\\cochain-batch-workbench-parts.png', fullPage: true, animations: 'disabled' })
    await app.getByRole('button', { name: /推荐结果/ }).click()
    await app.locator('.recommend-order').first().waitFor({ timeout: 30_000 })
    const workbenchRecommendations = await app.evaluate(() => ({
        recommendationRows: document.querySelectorAll('.recommend-order').length,
        sourceTags: document.querySelectorAll('.recommend-source').length,
        qualityValues: document.querySelectorAll('.recommend-quality').length,
        manualAddVisible: !!document.querySelector('.manual-add'),
    }))
    await app.screenshot({ path: 'C:\\web\\cochain\\.tmp\\cochain-batch-workbench-recommendations.png', fullPage: true, animations: 'disabled' })

    const permissionPageResults = []
    for (const [path, selector] of permissionRoutes) {
        await app.goto(`http://127.0.0.1:1919${path}`, { waitUntil: 'domcontentloaded', timeout: 30_000 })
        await app.locator(selector).waitFor({ timeout: 30_000 })
        permissionPageResults.push({ path, loaded: true })
    }

    await app.goto('http://127.0.0.1:1919/cochain/supplier/performance', { waitUntil: 'domcontentloaded', timeout: 30_000 })
    await app.getByRole('heading', { name: '供应商绩效与排名', exact: true }).waitFor({ timeout: 30_000 })
    await app.getByRole('button', { name: '排名快照', exact: true }).click()
    await app.locator('.rank').first().waitFor({ timeout: 30_000 })
    const rankingLayout = await app.locator('.rank').evaluateAll((items) => ({
        count: items.length,
        singleLine: items.every((item) => {
            const style = getComputedStyle(item)
            return style.whiteSpace === 'nowrap' && item.getBoundingClientRect().height <= 30
        }),
    }))
    await app.screenshot({ path: 'C:\\web\\cochain\\.tmp\\cochain-performance-ranking-layout.png', fullPage: true, animations: 'disabled' })

    await app.goto('http://127.0.0.1:1919/cochain/part/category-master', { waitUntil: 'domcontentloaded', timeout: 30_000 })
    await app.getByRole('heading', { name: '规则配置', exact: true }).waitFor({ timeout: 30_000 })
    await app.locator('.block-loading').waitFor({ state: 'hidden', timeout: 15_000 })
    await app.locator('.rule-value-tag[data-kind="logic"]').first().waitFor({ timeout: 30_000 })
    const ruleTabsLayout = await app.locator('.rule-tabs').evaluate((item) => ({
        tabCount: item.querySelectorAll('.figma-tab').length,
        noVerticalOverflow: item.scrollHeight <= item.clientHeight + 1,
    }))
    const logicTagCount = await app.locator('.rule-value-tag[data-kind="logic"]').count()
    await app.screenshot({ path: 'C:\\web\\cochain\\.tmp\\cochain-rule-config-tags.png', fullPage: true, animations: 'disabled' })
    await app.getByRole('button', { name: '特殊品类配置', exact: true }).click()
    await app.locator('.rule-value-tag[data-kind="special"]').first().waitFor({ timeout: 30_000 })
    const specialTagCount = await app.locator('.rule-value-tag[data-kind="special"]').count()
    await app.getByRole('button', { name: '左右识别规则', exact: true }).click()
    await app.locator('.rule-code[data-kind="left"]').first().waitFor({ timeout: 30_000 })
    const suffixTagCount = await app.locator('.rule-code[data-kind="left"], .rule-code[data-kind="right"]').count()
    await app.getByRole('button', { name: '左右件人工关系', exact: true }).click()
    await app.locator('.rule-code[data-kind="drawing"]').first().waitFor({ timeout: 30_000 })
    const drawingCodeCount = await app.locator('.rule-code[data-kind="drawing"]').count()
    await app.getByRole('button', { name: '工作包容量', exact: true }).click()
    await app.locator('.rule-metric').first().waitFor({ timeout: 30_000 })
    const capacityMetricCount = await app.locator('.rule-metric').count()
    const ruleConfigDesign = {
        ...ruleTabsLayout,
        logicTagCount,
        specialTagCount,
        suffixTagCount,
        drawingCodeCount,
        capacityMetricCount,
    }

    await app.goto('http://127.0.0.1:1919/cochain/supplier/supplier', { waitUntil: 'domcontentloaded', timeout: 30_000 })
    const categoryTrigger = app.locator('.category-count-trigger').first()
    await categoryTrigger.waitFor({ timeout: 30_000 })
    await categoryTrigger.hover()
    const categoryPopover = app.locator('.supplier-category-popover[aria-hidden="false"]')
    await categoryPopover.waitFor({ state: 'visible', timeout: 10_000 })
    const categoryPopoverText = await categoryPopover.innerText()
    await app.screenshot({ path: 'C:\\web\\cochain\\.tmp\\cochain-supplier-category-popover.png', animations: 'disabled' })

    await app.goto('http://127.0.0.1:1919/cochain/supplier/category', { waitUntil: 'domcontentloaded', timeout: 30_000 })
    await app.getByRole('heading', { name: '品类供应商明细', exact: true }).waitFor({ timeout: 30_000 })
    await app.locator('.block-loading').waitFor({ state: 'hidden', timeout: 15_000 })
    const categoryDesign = await app.evaluate(() => ({
        navItems: document.querySelectorAll('.category-nav-item').length,
        activeItems: document.querySelectorAll('.category-nav-item.is-active').length,
        overviewVisible: !!document.querySelector('.category-overview-card'),
        rankingVisible: !!document.querySelector('.supplier-ranking-card'),
        horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    }))
    await app.screenshot({ path: 'C:\\web\\cochain\\.tmp\\cochain-category-supplier-redesign.png', fullPage: true, animations: 'disabled' })
    const initialCategoryTitle = await app.locator('.category-title-row h2').innerText()
    const initialSupplierName = await app.locator('.supplier-name').first().innerText()
    const supplierSearch = app.getByRole('textbox', { name: '搜索当前品类下的供应商名称' })
    await supplierSearch.fill('不存在的供应商')
    await app.getByRole('button', { name: '查询', exact: true }).click()
    await app.getByText('当前品类暂无符合条件的供应商', { exact: true }).waitFor()
    await app.getByRole('button', { name: '重置', exact: true }).click()
    await app.locator('.supplier-name').first().waitFor()
    const supplierSearchWorks = (await app.locator('.supplier-name').first().innerText()) === initialSupplierName
    await app.locator('.category-nav-item').nth(1).click()
    const switchedCategoryTitle = await app.locator('.category-title-row h2').innerText()
    const categorySwitchWorks = switchedCategoryTitle !== initialCategoryTitle

    await app.goto('http://127.0.0.1:1919/cochain/subcontract/batch', { waitUntil: 'domcontentloaded', timeout: 30_000 })
    await app.getByRole('heading', { name: '分包批次列表' }).waitFor()
    await app.locator('.block-loading').waitFor({ state: 'hidden', timeout: 15_000 })
    await app.setViewportSize({ width: 390, height: 844 })
    await app.reload({ waitUntil: 'domcontentloaded' })
    await app.getByRole('heading', { name: '分包批次列表' }).waitFor()
    await app.locator('.block-loading').waitFor({ state: 'hidden', timeout: 15_000 })
    const mobile = await app.evaluate(() => ({
        horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        menuButtonVisible: !!document.querySelector('button[aria-label="打开导航菜单"],button[aria-label="收起导航菜单"]'),
    }))
    await app.screenshot({ path: 'C:\\web\\cochain\\.tmp\\cochain-reviewed-mobile.png', animations: 'disabled' })

    const assertions = {
        referenceMenus: designMenus.every((item) => referenceMenus.some((value) => value.includes(item))),
        appMenus: JSON.stringify(appMenus) === JSON.stringify(expectedMenus),
        headerHeight: referenceGeometry.headerHeight === 52 && appGeometry.headerHeight === 52,
        sidebarWidth: referenceGeometry.sidebarWidth === 220 && appGeometry.sidebarWidth === 220,
        desktopNoOverflow: !appGeometry.horizontalOverflow,
        mobileNoOverflow: !mobile.horizontalOverflow,
        sixRoutes: pageResults.length === 6 && pageResults.every((item) => item.loaded),
        batchWorkbenchDesign:
            workbenchParts.packageCount === 5 &&
            workbenchParts.activePackages === 1 &&
            workbenchParts.overviewVisible &&
            workbenchParts.lockNoticeVisible &&
            workbenchParts.partRows === 5 &&
            !workbenchParts.horizontalOverflow &&
            workbenchRecommendations.recommendationRows === 6 &&
            workbenchRecommendations.sourceTags === 6 &&
            workbenchRecommendations.qualityValues === 6 &&
            workbenchRecommendations.manualAddVisible,
        permissionRoutes: permissionPageResults.length === 5 && permissionPageResults.every((item) => item.loaded),
        performanceRankingLayout: rankingLayout.count > 0 && rankingLayout.singleLine,
        ruleConfigDesign:
            ruleConfigDesign.tabCount === 5 &&
            ruleConfigDesign.noVerticalOverflow &&
            ruleConfigDesign.logicTagCount > 0 &&
            ruleConfigDesign.specialTagCount > 0 &&
            ruleConfigDesign.suffixTagCount > 0 &&
            ruleConfigDesign.drawingCodeCount > 0 &&
            ruleConfigDesign.capacityMetricCount > 0,
        supplierCategoryPopover:
            categoryPopoverText.includes('可承制品类主数据明细') &&
            categoryPopoverText.includes('材料类型') &&
            categoryPopoverText.includes('尺寸逻辑'),
        categorySupplierDesign:
            categoryDesign.navItems > 0 &&
            categoryDesign.activeItems === 1 &&
            categoryDesign.overviewVisible &&
            categoryDesign.rankingVisible &&
            !categoryDesign.horizontalOverflow,
        categorySupplierInteractions: supplierSearchWorks && categorySwitchWorks,
        defaultLanding: postLoginPath === '/cochain/subcontract/batch',
        cleanRuntime: consoleErrors.length === 0 && failedRequests.length === 0 && httpErrors.length === 0,
    }
    const passed = Object.values(assertions).every(Boolean)
    process.stdout.write(
        JSON.stringify(
            {
                passed,
                assertions,
                postLoginPath,
                referenceMenus,
                appMenus,
                referenceGeometry,
                appGeometry,
                pageResults,
                batchWorkbench: { parts: workbenchParts, recommendations: workbenchRecommendations },
                permissionPageResults,
                rankingLayout,
                ruleConfigDesign,
                categoryDesign,
                categoryInteractions: { supplierSearchWorks, categorySwitchWorks },
                mobile,
                consoleErrors,
                failedRequests,
                httpErrors,
            },
            null,
            2
        )
    )
    if (!passed) process.exitCode = 1
} finally {
    await browser.close()
}
