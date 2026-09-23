import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

test('records, saves, reloads, and summarizes a workout', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Exercises', exact: true })).toBeVisible()
  await page.getByLabel('Barbell Squat, set 1, weight').fill('40')
  await page.getByLabel('Barbell Squat, set 1, repetitions').fill('8')
  await page.getByTitle('Mark set complete').first().click()
  await expect(page.getByText('1/4 sets')).toBeVisible()

  await page.getByRole('button', { name: 'Save workout' }).click()
  await expect(page.getByRole('status')).toHaveText('Workout saved')
  await page.reload()
  await expect(page.getByText('1/4 sets')).toBeVisible()

  await page.getByRole('button', { name: 'Weekly summary' }).click()
  await expect(page.getByText('Barbell Squat')).toBeVisible()
  await expect(page.getByText('320 kg')).toBeVisible()
})

test('keeps set rows inside the viewport at 320px', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-320')
  const rows = page.locator('.set-row')
  const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth)
  const boxes = await rows.evaluateAll((elements) =>
    elements.map((element) => element.getBoundingClientRect()),
  )
  expect(boxes.every((box) => box.left >= 0 && box.right <= viewportWidth)).toBe(true)
})
