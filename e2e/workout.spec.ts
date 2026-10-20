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
  await expect(page.getByLabel(/reps in reserve|fatigue RER/)).toHaveCount(0)
  await page.getByLabel('Barbell Squat, set 1, repetitions').press('Tab')
  await expect(page.getByTitle('Mark set complete').first()).toBeFocused()
  await page.keyboard.press('Space')
  await expect(page.getByText('1/4 sets')).toBeVisible()

  await page.getByRole('button', { name: 'Save workout' }).click()
  await expect(page.getByRole('status')).toHaveText('Workout saved')
  await page.reload()
  await expect(page.getByText('1/4 sets')).toBeVisible()

  await page.getByRole('button', { name: 'Weekly summary' }).click()
  await expect(page.getByText('Barbell Squat')).toBeVisible()
  await expect(page.getByText('320 kg')).toBeVisible()
})

test('keeps set controls inside their rows without overlaps', async ({ page }) => {
  await page.getByRole('button', { name: 'Add set' }).click()
  const rows = page.locator('.set-row')
  const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth)
  const measurements = await rows.evaluateAll((elements) =>
    elements.map((element) => {
      const row = element.getBoundingClientRect()
      const controls = [...element.querySelectorAll('input, button')].map((control) =>
        control.getBoundingClientRect(),
      )
      return {
        left: row.left,
        right: row.right,
        controlsFit: controls.every((control) => control.left >= row.left && control.right <= row.right),
        controlsDoNotOverlap: controls.every(
          (control, index) => index === 0 || control.left >= controls[index - 1].right,
        ),
      }
    }),
  )
  expect(measurements.length).toBeGreaterThan(0)
  expect(measurements.every((row) => row.left >= 0 && row.right <= viewportWidth)).toBe(true)
  expect(measurements.every((row) => row.controlsFit && row.controlsDoNotOverlap)).toBe(true)
})

test('shows the complete leg curl and knee raise illustrations within the viewport', async ({
  page,
}, testInfo) => {
  await page.getByRole('button', { name: /Day 3/ }).click()
  for (const exercise of [
    { id: 'leg-curl', name: 'Seated leg curl exercise demonstration' },
    { id: 'leg-raises', name: 'Hanging knee raise exercise demonstration' },
  ]) {
    await page.locator(`#exercise-${exercise.id} .accordion-trigger`).click()
    const visual = page.getByRole('img', { name: exercise.name, exact: true })
    await expect(visual).toBeVisible()
    await visual.evaluate(async (element) => {
      const source = element.querySelector('image')!.getAttribute('href')!
      const image = new Image()
      image.src = source
      await image.decode()
    })
    const bounds = await visual.boundingBox()
    expect(bounds!.x).toBeGreaterThanOrEqual(0)
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width)
    await visual.screenshot({ path: testInfo.outputPath(`${exercise.id}.png`) })
  }
})
