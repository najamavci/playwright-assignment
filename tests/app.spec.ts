import { test, expect, Page, Locator } from '@playwright/test';

test.beforeEach(async ({ page }: { page: Page }) => {
  await page.goto('https://lejonmanen.github.io/timer-vue/');
});

test('homepage shows main actions and theme choices', async ({ page }) => {
  const buttons = [
    'Add timer',
    'Add note',
    'Light',
    'Dark',
    'Forest',
    'Orange',
    'Christmas',
  ];

  for (const name of buttons) {
    await expect(
      page.getByRole('button', { name })
    ).toBeVisible();
  }

  await expect(page.getByText('Select theme')).toBeVisible();
});

test('user can add a timer widget', async ({ page }: { page: Page }) => {
  await page.getByRole('button', { name: 'Add timer' }).click();

  const timer: Locator = page.locator('.timer').first();

  await expect(timer).toBeVisible();
  await expect(timer.locator('.time')).toBeVisible();
  await expect(timer.getByRole('button', { name: 'Start' })).toBeVisible();
  await expect(timer.getByRole('button', { name: 'Reset' })).toBeVisible();
});

test('user can start, pause, and reset a timer', async ({ page }: { page: Page }) => {
  await page.getByRole('button', { name: 'Add timer' }).click();

  const timer: Locator = page.locator('.timer').first();
  const timeDisplay: Locator = timer.locator('.time');

  const originalTime: string = await timeDisplay.innerText();

  await timer.getByRole('button', { name: 'Start' }).click();
  await expect(timer.getByRole('button', { name: 'Pause' })).toBeVisible();

  await page.waitForTimeout(1000);

  await timer.getByRole('button', { name: 'Pause' }).click();
  await expect(timer.getByRole('button', { name: 'Start' })).toBeVisible();

  await timer.getByRole('button', { name: 'Reset' }).click();

  await expect(timeDisplay).toHaveText(originalTime.trim());
});

test('user can open timer settings', async ({ page }: { page: Page }) => {
  await page.getByRole('button', { name: 'Add timer' }).click();

  const timer: Locator = page.locator('.timer').first();

  await timer.locator('.settings').click();

  await expect(timer.locator('.settings-menu')).toBeVisible();
});

test('user can add and edit a note widget', async ({ page }: { page: Page }) => {
  await page.getByRole('button', { name: 'Add note' }).click();

  const note: Locator = page.locator('.note').first();

  await expect(note).toBeVisible();

  await note.getByText('Click to change text').click();

  const input: Locator = note.locator('input[type="text"]').first();

  await expect(input).toBeVisible();

  await input.fill('Updated note');
  await input.press('Enter');

  await expect(note.getByText('Updated note')).toBeVisible();
});

test('user can delete a timer widget', async ({ page }: { page: Page }) => {
  await page.getByRole('button', { name: 'Add timer' }).click();

  const timer: Locator = page.locator('.timer').first();

  await expect(timer).toBeVisible();

  const widget: Locator = page
    .locator('.widget')
    .filter({ has: timer })
    .first();

  await widget.locator('.close').click({ force: true });

  await expect(page.locator('.timer')).toHaveCount(0);
});

test('user can move widgets up', async ({ page }: { page: Page }) => {
  await page.getByRole('button', { name: 'Add timer' }).click();
  await page.getByRole('button', { name: 'Add note' }).click();

  await expect(page.locator('.timer')).toHaveCount(1);
  await expect(page.locator('.note')).toHaveCount(1);

  const noteWidget: Locator = page
    .locator('.widget')
    .filter({ has: page.locator('.note') })
    .first();

  await noteWidget.locator('.up').click({ force: true });

  const firstWidgetType: 'note' | 'timer' = await page.evaluate(() => {
    const widgets = [...document.querySelectorAll('.widget')];

    const visibleWidgets = widgets.filter(
      (widget) =>
        widget.querySelector('.timer') ||
        widget.querySelector('.note')
    );

    return visibleWidgets[0].querySelector('.note')
      ? 'note'
      : 'timer';
  });

  expect(firstWidgetType).toBe('note');
});

test('user can change theme color', async ({ page }: { page: Page }) => {
  const before: string = await page.evaluate(() => {
    const body = getComputedStyle(document.body);
    const html = getComputedStyle(document.documentElement);

    return `${body.backgroundColor}|${html.backgroundColor}|${body.color}|${html.color}`;
  });

  await page.getByRole('button', { name: 'Dark' }).click();

  const after: string = await page.evaluate(() => {
    const body = getComputedStyle(document.body);
    const html = getComputedStyle(document.documentElement);

    return `${body.backgroundColor}|${html.backgroundColor}|${body.color}|${html.color}`;
  });

  expect(after).not.toBe(before);
});

test('user can add more than one widget', async ({ page }: { page: Page }) => {
  await page.getByRole('button', { name: 'Add timer' }).click();
  await page.getByRole('button', { name: 'Add note' }).click();

  await expect(page.locator('.timer')).toHaveCount(1);
  await expect(page.locator('.note')).toHaveCount(1);
});