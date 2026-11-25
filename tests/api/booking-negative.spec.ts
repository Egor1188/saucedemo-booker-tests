import { test, expect } from '@playwright/test';
import { BookingClient, makeBooking } from './bookingClient';

test.describe('API negative cases', () => {
  test('auth with a wrong password does not return a token', async ({ request }) => {
    const api = new BookingClient(request);
    const res = await api.auth('admin', 'wrong_password');
    const body = await res.json();

    expect(body.token).toBeUndefined();
    expect(body.reason).toBe('Bad credentials');
    // Фактично API відповідає 200 OK — див. BUG-API-01. Перевірку коду винесено в окремий тест нижче.
  });

  test('BUG-API-01: auth with invalid credentials should return 401', async ({ request }) => {
    test.fail(true, 'BUG-API-01: /auth відповідає 200 OK на невірні облікові дані');
    const res = await new BookingClient(request).auth('admin', 'wrong_password');
    expect(res.status()).toBe(401);
  });

  test('update and delete without a token or with an invalid token are forbidden', async ({ request }) => {
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

  test('requesting a non-existent booking returns 404', async ({ request }) => {
    const res = await new BookingClient(request).get(999_999_999);
    expect(res.status()).toBe(404);
  });

  test('BUG-API-03: creating a booking without required fields should return 400, not 500', async ({ request }) => {
    test.fail(true, 'BUG-API-03: невалідне тіло запиту призводить до 500 Internal Server Error');
    const { firstname, lastname, ...withoutNames } = makeBooking();
    void firstname;
    void lastname;
    const res = await new BookingClient(request).create(withoutNames);
    expect(res.status()).toBe(400);
  });

  test('BUG-API-04: non-numeric totalprice should be rejected with 400, not stored as null', async ({ request }) => {
    test.fail(true, 'BUG-API-04: totalprice: "abc" (за apidoc — Number) приймається з 200 і зберігається як null');
    const api = new BookingClient(request);
    const res = await api.create({ ...makeBooking(), totalprice: 'abc' });

    // прибираємо за собою до перевірки: якщо бронювання створилось, воно не має лишитись на стенді
    if (res.ok()) {
      const created = await res.json();
      await api.delete(created.bookingid, await api.getToken());
    }
    expect(res.status()).toBe(400);
  });

  test('BUG-API-02: successful delete should return 200 or 204, not 201 Created', async ({ request }) => {
    test.fail(true, 'BUG-API-02: DELETE відповідає 201 Created (ресурс не створюється, а видаляється)');
    const api = new BookingClient(request);
    const token = await api.getToken();
    const created = await (await api.create(makeBooking())).json();
    const res = await api.delete(created.bookingid, token);
    expect([200, 204]).toContain(res.status());
  });
});
