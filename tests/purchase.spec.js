const { test, expect } = require('@playwright/test');

const planting = (page, answer) => page.getByRole('radio', {
  name: `Planting by the Blue Tree? ${answer}`, exact: true,
});
const delivery = (page, answer) => page.getByRole('radio', {
  name: `Delivery required? ${answer}`, exact: true,
});
const amount = (page, label) => page.getByTestId('invoice')
  .getByText(label, { exact: true }).locator('..');
async function order(page, quantity = '4', height = '7', service = 'planting') {
  await page.getByLabel('Number of trees', { exact: true }).fill(quantity);
  await page.getByLabel('Tree height (whole feet)', { exact: true }).fill(height);
  await planting(page, service === 'planting' ? 'Yes' : 'No').click();
  if (service !== 'planting') await delivery(page, service === 'delivery' ? 'Yes' : 'No').click();
  await page.getByRole('button', { name: 'Calculate Invoice' }).click();
}

test.beforeEach(async ({ page }) => { await page.goto('./'); });

for (const [height, price] of [[1, 39], [2, 39], [3, 69], [5, 69], [6, 99], [8, 99], [9, 199]]) {
  test(`height ${height} selects MYR ${price}`, async ({ page }) => {
    await order(page, '1', String(height), 'carry');
    await expect(amount(page, 'Price per tree')).toContainText(`MYR ${price}.00`);
    await expect(amount(page, 'Total amount due')).toContainText(`MYR ${price}.00`);
  });
}

test('sample planting invoice includes delivery without charging twice', async ({ page }) => {
  await order(page);
  await expect(amount(page, 'Service')).toContainText('Delivery and planting');
  await expect(amount(page, '4 trees × unit price')).toContainText('MYR 396.00');
  await expect(amount(page, 'Delivery charge')).toContainText('MYR 0.00');
  await expect(amount(page, 'Planting charge')).toContainText('MYR 198.00');
  await expect(amount(page, 'Total amount due')).toContainText('MYR 594.00');
  await expect(delivery(page, 'Yes')).toHaveCount(0);
});

for (const [quantity, charge, total] of [[4, 80, 476], [5, 100, 595], [6, 100, 694]]) {
  test(`delivery cap for ${quantity} trees`, async ({ page }) => {
    await order(page, String(quantity), '7', 'delivery');
    await expect(amount(page, 'Delivery charge')).toContainText(`MYR ${charge}.00`);
    await expect(amount(page, 'Planting charge')).toContainText('MYR 0.00');
    await expect(amount(page, 'Total amount due')).toContainText(`MYR ${total}.00`);
  });
}

test('cash and carry has no service charges', async ({ page }) => {
  await order(page, '4', '7', 'carry');
  await expect(amount(page, 'Service')).toContainText('Cash and carry');
  await expect(amount(page, 'Delivery charge')).toContainText('MYR 0.00');
  await expect(amount(page, 'Planting charge')).toContainText('MYR 0.00');
  await expect(amount(page, 'Total amount due')).toContainText('MYR 396.00');
});

for (const value of ['', '0', '-1', '1.5', 'abc', '1e3', '9007199254740992']) {
  test(`reject invalid numeric input ${JSON.stringify(value)}`, async ({ page }) => {
    await order(page, value, value);
    await expect(page.getByRole('alert')).toHaveCount(2);
    await expect(page.getByTestId('invoice')).toHaveCount(0);
  });
}

test('reject a safe integer whose price would overflow', async ({ page }) => {
  await order(page, '9007199254740991');
  await expect(page.getByRole('alert')).toHaveText('This quantity is too large.');
  await expect(page.getByTestId('invoice')).toHaveCount(0);
});

test('service questions are required and planting resets delivery', async ({ page }) => {
  await page.getByLabel('Number of trees', { exact: true }).fill('4');
  await page.getByLabel('Tree height (whole feet)', { exact: true }).fill('7');
  await page.getByRole('button', { name: 'Calculate Invoice' }).click();
  await expect(page.getByRole('alert')).toHaveText('Choose Yes or No.');
  await planting(page, 'No').click();
  await page.getByRole('button', { name: 'Calculate Invoice' }).click();
  await expect(page.getByRole('alert')).toHaveText('Choose Yes or No.');
  await delivery(page, 'Yes').click();
  await planting(page, 'Yes').click();
  await planting(page, 'No').click();
  await expect(delivery(page, 'Yes')).not.toBeChecked();
  await page.getByRole('button', { name: 'Calculate Invoice' }).click();
  await expect(page.getByTestId('invoice')).toHaveCount(0);
});

test('all edits clear an old invoice', async ({ page }) => {
  for (const edit of ['quantity', 'height', 'planting', 'delivery']) {
    await order(page, '4', '7', 'delivery');
    if (edit === 'quantity') await page.getByLabel('Number of trees', { exact: true }).fill('5');
    if (edit === 'height') await page.getByLabel('Tree height (whole feet)', { exact: true }).fill('8');
    if (edit === 'planting') await planting(page, 'Yes').click();
    if (edit === 'delivery') await delivery(page, 'No').click();
    await expect(page.getByTestId('invoice')).toHaveCount(0);
  }
});

test('keyboard can complete the form', async ({ page }) => {
  await page.getByLabel('Number of trees', { exact: true }).focus();
  await page.keyboard.type('4');
  await page.keyboard.press('Tab');
  await page.keyboard.type('7');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Space');
  // Skip the unselected No radio to reach Calculate Invoice.
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(amount(page, 'Total amount due')).toContainText('MYR 594.00');
});

test('layout stays inside screen at small and desktop widths', async ({ page }) => {
  for (const width of [320, 390, 800, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await order(page);
    const overflow = await page.evaluate(() => [...document.querySelectorAll('*')]
      .some((element) => element.getBoundingClientRect().right > innerWidth + 1));
    expect(overflow).toBe(false);
    const form = await page.getByTestId('order-form').boundingBox();
    const invoice = await page.getByTestId('invoice-panel').boundingBox();
    if (width < 800) expect(form.y + form.height).toBeLessThan(invoice.y);
    else expect(form.x + form.width).toBeLessThan(invoice.x);
    await expect(page.getByTestId('invoice')).toBeVisible();
  }
});

test('page and bundle load without errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });
  await page.reload();
  await order(page);
  await expect(page.getByTestId('invoice')).toBeVisible();
  expect(errors).toEqual([]);
});
