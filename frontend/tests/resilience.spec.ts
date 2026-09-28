import { test, expect } from '@playwright/test'

test('corrupted saved history does not crash or silently overwrite stored data', async ({
  page,
}) => {
  const corrupted = JSON.stringify([
    {
      id: 'broken',
      savedAt: '2026-09-29',
      result: {
        schema_version: '1',
        issues: [],
        candidates: [],
        scenario: { commodity: 'broccoli' },
      },
    },
  ])
  await page.addInitScript((raw) => localStorage.setItem('packora.plans.v1', raw), corrupted)
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /Your harvest/ })).toBeVisible()
  await expect(page.getByRole('status')).toContainText('unsupported saved snapshots')
  expect(await page.evaluate(() => localStorage.getItem('packora.plans.v1'))).toBe(corrupted)
})

test('failed browser storage never claims a successful save', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('Test quota exceeded', 'QuotaExceededError')
    }
  })
  await page.goto('/')
  await page.getByRole('button', { name: /Broccoli, kept cool/ }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByRole('button', { name: 'Build my packaging plan' }).click()
  await page.getByRole('button', { name: 'Save plan', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('storage is unavailable or full')
  await expect(page.getByRole('button', { name: 'Save plan', exact: true })).toBeEnabled()
})

test('photo helper rejects active image formats and clearly requires manual confirmation', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Start with a produce photo' }).click()
  await expect(page.getByText(/does not automatically identify foods/)).toBeVisible()
  await page.getByLabel('Choose produce photo').setInputFiles({
    name: 'test.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'),
  })
  await expect(page.getByRole('alert')).toContainText('JPEG, PNG or WebP')
  await expect(page.locator('.photo-preview')).toHaveCount(0)
  await page.getByLabel('Confirm what is in your photo').selectOption('broccoli')
  await page.getByRole('button', { name: 'Continue with confirmed food' }).click()
  await expect(page.getByLabel('Weight in one pack')).toHaveValue('')
})

test('no speech API still permits typed input', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'SpeechRecognition', { value: undefined, configurable: true })
    Object.defineProperty(window, 'webkitSpeechRecognition', {
      value: undefined,
      configurable: true,
    })
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'Speak your requirements' }).click()
  await page.getByRole('button', { name: 'Use microphone' }).click()
  await expect(page.getByRole('alert')).toContainText('unavailable in this browser')
  await page.getByLabel('Your description').fill('50 kg broccoli, 8 hours at 5 degrees')
  await page.getByRole('button', { name: 'Review these details' }).click()
  await expect(page.getByLabel('Total shipment weight')).toHaveValue('50')
})

test('local-service startup failure can recover without a full page reload', async ({ page }) => {
  await page.route('**/api/catalog', (route) => route.abort())
  await page.goto('/')
  await expect(page.getByRole('heading', { name: "Let's connect your workspace." })).toBeVisible()
  await page.unroute('**/api/catalog')
  await page.getByRole('button', { name: 'Retry connection' }).click()
  await expect(page.getByRole('heading', { name: /Your harvest/ })).toBeVisible()
})

test('narrow viewport and reduced motion remain usable', async ({ page }, info) => {
  test.skip(info.project.name === 'mobile', 'Additional 320px desktop-engine viewport check')
  await page.setViewportSize({ width: 320, height: 740 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /Your harvest/ })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
  await page.getByRole('button', { name: 'More navigation' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  expect(
    await page
      .locator('.orbit-destination')
      .first()
      .evaluate((el) => getComputedStyle(el).transitionDuration),
  ).toBe('0s')
  await page.getByRole('button', { name: 'Close navigation' }).click()
  await page.getByRole('button', { name: /Tomatoes to the market/ }).click()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
})
