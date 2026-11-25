import { test, expect } from '@playwright/test';
import { BookingClient, makeBooking } from './bookingClient';

test.describe('Негативні кейси API', () => {
  test('auth з невірним паролем не видає токен', async ({ request }) => {
    const api = new BookingClient(request);
    const res = await api.auth('admin', 'wrong_password');
    const body = await res.json();

    expect(body.token).toBeUndefined();
    expect(body.reason).toBe('Bad credentials');
    // Фактично API відповідає 200 OK — див. BUG-API-01. Перевірку коду винесено в окремий тест нижче.
  });

  test('BUG-API-01: auth з невірними даними має повертати 401', async ({ request }) => {
    test.fail(true, 'BUG-API-01: /auth відповідає 200 OK на невірні облікові дані');
    const res = await new BookingClient(request).auth('admin', 'wrong_password');
    expect(res.status()).toBe(401);
  });

  test('оновлення й видалення без токена / з невалідним токеном заборонені', async ({ request }) => {
    const api = new BookingClient(request);
    const created = await (await api.create(makeBooking())).json();
    const id: number = created.bookingid;

    expect((await api.update(id, makeBooking({ lastname: 'Hacker' }))).status()).toBe(403);
    expect((await api.update(id, makeBooking({ lastname: 'Hacker' }), 'invalid-token')).status()).toBe(403);
    expect((await api.delete(id, 'invalid-token')).status()).toBe(403);

    // дані не змінились і бронювання на місці
    const stored = await api.get(id);
    expect(stored.status()).toBe(200);
    expect((await stored.json()).lastname).toBe('Tester');

    // прибираємо за собою
    const token = await api.getToken();
    await api.delete(id, token);
  });

  test('запит неіснуючого бронювання повертає 404', async ({ request }) => {
    const res = await new BookingClient(request).get(999_999_999);
    expect(res.status()).toBe(404);
  });

  test('BUG-API-03: створення без обовʼязкових полів має повертати 400, а не 500', async ({ request }) => {
    test.fail(true, 'BUG-API-03: невалідне тіло запиту призводить до 500 Internal Server Error');
    const { firstname, lastname, ...withoutNames } = makeBooking();
    void firstname;
    void lastname;
    const res = await new BookingClient(request).create(withoutNames);
    expect(res.status()).toBe(400);
  });
});
