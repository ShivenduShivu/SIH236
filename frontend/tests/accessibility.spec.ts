import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('workspace, navigation, planner and results have no serious automated accessibility findings', async ({
  page,
}, info) => {
  const audit = async (name: string) => {
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    const violations = result.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    )
    await info.attach(`${name}-accessibility`, {
      body: JSON.stringify({ violations }, null, 2),
      contentType: 'application/json',
    })
    expect(
      violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
      })),
    ).toEqual([])
  }
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /Your harvest/ })).toBeVisible()
  await audit('workspace')
  if (info.project.name === 'desktop')
    await page.getByRole('button', { name: 'Open navigation menu' }).click()
  else await page.getByRole('button', { name: 'More navigation' }).click()
  await audit('navigation')
  await page.getByRole('button', { name: 'Close navigation' }).click()
  await page.getByRole('button', { name: /Broccoli, kept cool/ }).click()
  await audit('planner')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByRole('button', { name: 'Build my packaging plan' }).click()
  await expect(page.getByRole('tab', { name: 'The plan', exact: true })).toBeVisible()
  await audit('result')
})
