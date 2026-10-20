import { expect, test } from './fixtures'

test.beforeEach(async ({ page, cloud }) => {
  void cloud
  await page.goto('/')
  await expect(page.getByLabel('Workout date', { exact: true })).toBeEnabled()
})

test('records each checked set in the cloud, reloads, and summarizes a workout', async ({ page, cloud }) => {
  await expect(page.getByRole('button', { name: 'Save workout' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Reset', exact: true })).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Exercises', exact: true })).toBeVisible()
  await page.getByLabel('Barbell Squat, set 1, weight').fill('40')
  await page.getByLabel('Barbell Squat, set 1, repetitions').fill('8')
  await expect(page.getByLabel(/reps in reserve|fatigue RER/)).toHaveCount(0)
  await page.getByLabel('Barbell Squat, set 1, repetitions').press('Tab')
  await expect(page.getByTitle('Mark set complete').first()).toBeFocused()
  await page.keyboard.press('Space')
  await expect(page.getByText('1/4 sets')).toBeVisible()

  await expect(page.getByRole('status')).toHaveText('Changes saved')
  expect(cloud.sessions.size).toBe(1)
  await page.reload()
  await expect(page.getByText('1/4 sets')).toBeVisible()

  await page.getByRole('button', { name: 'Weekly summary' }).click()
  await expect(page.getByText('Barbell Squat')).toBeVisible()
  await expect(page.getByText('320 kg')).toBeVisible()
})

test('retries a failed cloud save without falsely checking the row or creating duplicate sessions', async ({
  page,
  cloud,
}) => {
  const complete = page.getByRole('button', { name: 'Barbell Squat, set 1, mark set complete', exact: true })
  await page.getByLabel('Barbell Squat, set 1, weight').fill('40')
  await page.getByLabel('Barbell Squat, set 1, repetitions').fill('8')
  cloud.failNextSave = true
  await complete.click()
  await expect(page.getByRole('alert')).toContainText('not saved')
  await expect(complete).toHaveAttribute('aria-pressed', 'false')
  expect(cloud.sessions.size).toBe(0)
  await page.getByRole('button', { name: 'Retry', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText('Changes saved')
  const incomplete = page.getByRole('button', {
    name: 'Barbell Squat, set 1, mark set incomplete',
    exact: true,
  })
  await expect(incomplete).toHaveAttribute('aria-pressed', 'true')
  expect(cloud.sessions.size).toBe(1)
  await incomplete.click()
  await expect(complete).toHaveAttribute('aria-pressed', 'false')
  expect(cloud.sessions.size).toBe(1)
  expect([...cloud.sessions.values()][0].completedSets).toBe(0)
})

test('edits a checked row through its check and restores only confirmed values after reload', async ({
  page,
  cloud,
}) => {
  const weight = page.getByLabel('Barbell Squat, set 1, weight')
  await weight.fill('40')
  await page.getByLabel('Barbell Squat, set 1, repetitions').fill('8')
  await page.getByTitle('Mark set complete').first().click()
  await expect(page.getByTitle('Mark set incomplete').first()).toBeEnabled()
  await weight.fill('45')
  await expect(page.getByTitle('Mark set complete').first()).toHaveAttribute('aria-pressed', 'false')
  expect(cloud.writes).toHaveLength(1)
  await page.getByTitle('Mark set complete').first().click()
  await expect(page.getByTitle('Mark set incomplete').first()).toBeEnabled()
  expect(cloud.sessions.size).toBe(1)
  expect(cloud.writes.map((session) => session.exercises[0].sets[0].weight)).toEqual(['40', '45'])
  await page.reload()
  await expect(weight).toHaveValue('45')
  await expect(page.getByTitle('Mark set incomplete').first()).toHaveAttribute('aria-pressed', 'true')
})

test('requires a successful cloud load before allowing set recording', async ({ page, cloud }) => {
  cloud.failLoad = true
  await page.reload()
  await expect(page.getByRole('alert')).toContainText('could not be loaded')
  await expect(page.getByLabel('Workout date', { exact: true })).toBeDisabled()
  await expect(page.getByTitle('Mark set complete').first()).toBeDisabled()
  expect(cloud.writes).toHaveLength(0)
  cloud.failLoad = false
  await page.getByRole('button', { name: 'Retry', exact: true }).click()
  await expect(page.getByTitle('Mark set complete').first()).toBeEnabled()
  await expect(page.getByRole('alert')).toHaveCount(0)
  expect(cloud.writes).toHaveLength(0)
})

test('loads previous sets after saving on the 14th and selecting the 15th', async ({ page }) => {
  const date = page.getByLabel('Workout date', { exact: true })
  const squat = page.locator('#exercise-barbell-squat')
  await date.fill('2026-09-14')
  await page.getByLabel('Barbell Squat, set 1, weight').fill('40')
  await page.getByLabel('Barbell Squat, set 1, repetitions').fill('8')
  await page.getByTitle('Mark set complete').first().click()
  await expect(page.getByRole('status')).toHaveText('Changes saved')

  await date.fill('2026-09-15')
  await expect(squat.locator('.exercise-meta')).toContainText('2026-09-14')
  await expect(squat.locator('.previous-cell').first()).toHaveText('40 x 8')

  await page.getByRole('button', { name: /Day 2/ }).click()
  await page.getByRole('button', { name: /Day 1/ }).click()
  await expect(squat.locator('.previous-cell').first()).toHaveText('40 x 8')

  await page.reload()
  await expect(date).toBeEnabled()
  await date.fill('2026-09-15')
  await expect(squat.locator('.exercise-meta')).toContainText('2026-09-14')
  await expect(squat.locator('.previous-cell').first()).toHaveText('40 x 8')
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
