import { test, expect } from '@playwright/test';
import { BookingClient, makeBooking, type Booking } from './bookingClient';

/**
 * Основний флоу: auth -> create -> update -> delete -> перевірити, що бронювання нема.
 * Кроки залежать одне від одного, тому це один тест з test.step, а не serial-набір:
 * так кожен прогін працює зі своїм бронюванням і тест можна безпечно паралелити.
 */
test('CRUD-флоу бронювання @smoke', async ({ request }) => {
  const api = new BookingClient(request);
  const original = makeBooking();
  let token = '';
  let id = 0;

  await test.step('авторизація повертає токен', async () => {
    token = await api.getToken();
  });

  await test.step('створення бронювання', async () => {
    const res = await api.create(original);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.bookingid).toEqual(expect.any(Number));
    expect(body.booking).toEqual(original);
    id = body.bookingid;

    // перевіряємо, що дані реально збереглися, а не лише віддзеркалились у відповіді
    const stored = await api.get(id);
    expect(stored.status()).toBe(200);
    expect(await stored.json()).toEqual(original);
  });

  const updated: Booking = {
    ...original,
    lastname: 'Updated',
    totalprice: 999,
    depositpaid: false,
    bookingdates: { checkin: '2027-01-10', checkout: '2027-01-15' },
    additionalneeds: 'Late checkout',
  };

  await test.step('повне оновлення (PUT)', async () => {
    const res = await api.update(id, updated, token);
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual(updated);
    expect(await (await api.get(id)).json()).toEqual(updated);
  });

  await test.step('часткове оновлення (PATCH)', async () => {
    const res = await api.partialUpdate(id, { firstname: 'Patched' }, token);
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ ...updated, firstname: 'Patched' });
  });

  await test.step('видалення', async () => {
    const res = await api.delete(id, token);
    // Точний код не фіксуємо: фактичний 201 Created — це BUG-API-02 (окремий тест у booking-negative).
    expect(res.ok()).toBe(true);
  });

  await test.step('бронювання більше не існує', async () => {
    const res = await api.get(id);
    expect(res.status()).toBe(404);
  });
});
