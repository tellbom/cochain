import { chromium } from 'playwright-core'
import process from 'node:process'

const password = process.env.COCHAIN_TEST_PASSWORD
if (!password) throw new Error('COCHAIN_TEST_PASSWORD is required')

const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--disable-gpu'],
})

const page = await browser.newPage({ viewport: { width: 1440, height: 960 } })
const consoleErrors = []
const failedRequests = []
page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
})
page.on('requestfailed', (request) => failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText || ''}`))

try {
    await page.goto('http://127.0.0.1:1919/', { waitUntil: 'domcontentloaded', timeout: 30_000 })
    await page.waitForURL(/192\.168\.124\.2:18085/, { timeout: 20_000 })
    await page.locator('#username').fill('196045')
    await page.locator('#password').fill(password)
    await page.locator('#kc-login').click()
    await page.waitForURL(/127\.0\.0\.1:1919/, { timeout: 30_000 })
    await page.locator('.layouts-menu-vertical').waitFor({ timeout: 30_000 })
    await page.waitForURL((url) => !url.pathname.includes('/loading/'), { timeout: 20_000 })
    const defaultRoute = page.url()
    await page.goto('http://127.0.0.1:1919/cochain/subcontract/batch', { waitUntil: 'domcontentloaded', timeout: 30_000 })
    await page.getByRole('heading', { name: '分包批次管理' }).waitFor({ timeout: 30_000 })
    await page.locator('.block-loading').waitFor({ state: 'hidden', timeout: 10_000 })

    const desktop = {
        url: page.url(),
        defaultRoute,
        title: await page.title(),
        businessRootMenus: await page.locator('.layouts-menu-vertical > .el-sub-menu').count(),
        pageHeading: await page.getByRole('heading', { level: 1 }).first().textContent(),
        visibleButtons: await page.locator('button:visible').count(),
    }
    await page.screenshot({ path: '.tmp/cochain-browser-gate-desktop.png', fullPage: true })

    const routes = [
        ['/cochain/subcontract/batch', '分包批次管理'],
        ['/cochain/part/batch-part', '批次零件明细'],
        ['/cochain/work/package', '工作包管理'],
        ['/cochain/package/part', '工作包零件关联'],
        ['/cochain/package/supplier-recommendation', '供应商推荐结果'],
        ['/cochain/supplier/supplier', '供应商管理'],
        ['/cochain/supplier/performance', '供应商绩效管理'],
        ['/cochain/supplier/ranking-snapshot', '排名快照管理'],
        ['/cochain/supplier/category', '供应商品类关联'],
        ['/cochain/round/robin-cursor', '轮流选取游标'],
        ['/cochain/part/history-supplier', '零件历史供应商'],
        ['/cochain/part/category-master', '三级品类主数据'],
        ['/cochain/special/category-config', '特殊品类配置'],
        ['/cochain/left/right-rule', '左右件识别规则'],
        ['/cochain/left/right-manual', '左右件手动维护'],
        ['/cochain/part/type-package-config', '工作包容量配置'],
        ['/cochain/operation/log', '业务操作日志'],
        ['/cochain/system/operate-log', '系统操作日志'],
    ]
    const pageResults = []
    for (const [path, heading] of routes) {
        await page.goto(`http://127.0.0.1:1919${path}`, { waitUntil: 'domcontentloaded', timeout: 20_000 })
        await page.getByRole('heading', { name: heading }).waitFor({ timeout: 20_000 })
        await page.locator('.block-loading').waitFor({ state: 'hidden', timeout: 10_000 })
        pageResults.push({ path, heading, loaded: true })
    }

    await page.goto('http://127.0.0.1:1919/cochain/subcontract/batch', { waitUntil: 'domcontentloaded', timeout: 20_000 })
    await page.getByRole('heading', { name: '分包批次管理' }).waitFor({ timeout: 20_000 })

    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.getByRole('heading', { name: '分包批次管理' }).waitFor({ timeout: 20_000 })
    await page.locator('.block-loading').waitFor({ state: 'hidden', timeout: 10_000 })
    const refresh = { url: page.url(), heading: await page.getByRole('heading', { level: 1 }).first().textContent() }

    await page.setViewportSize({ width: 390, height: 844 })
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.getByRole('heading', { name: '分包批次管理' }).waitFor({ timeout: 20_000 })
    await page.locator('.block-loading').waitFor({ state: 'hidden', timeout: 10_000 })
    const menuTriggerVisible = await page.getByRole('button', { name: '打开导航菜单' }).isVisible()
    await page.getByRole('button', { name: '打开导航菜单' }).click()
    await page.locator('.layout-aside-Classic').waitFor({ state: 'visible', timeout: 5_000 })
    const mobile = {
        menuTriggerVisible,
        drawerWidth: await page.locator('.layout-aside-Classic').evaluate((element) => Math.round(element.getBoundingClientRect().width)),
        horizontalOverflow: await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth),
    }
    await page.screenshot({ path: '.tmp/cochain-browser-gate-mobile.png', fullPage: true })

    process.stdout.write(JSON.stringify({ desktop, pageResults, refresh, mobile, consoleErrors, failedRequests }, null, 2))
} finally {
    await browser.close()
}
