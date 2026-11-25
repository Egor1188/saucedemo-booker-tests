import { type APIRequestContext, type APIResponse, expect } from '@playwright/test';

export interface Booking {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: { checkin: string; checkout: string };
  additionalneeds?: string;
}

export interface CreatedBooking {
  bookingid: number;
  booking: Booking;
}

// Дефолтні облікові дані з офіційної документації restful-booker — не секрет.
export const ADMIN = {
  username: process.env.BOOKER_USER ?? 'admin',
  password: process.env.BOOKER_PASSWORD ?? 'password123',
};

export function makeBooking(overrides: Partial<Booking> = {}): Booking {
  const suffix = Date.now().toString(36);
  return {
    firstname: `Egor_${suffix}`,
    lastname: 'Tester',
    totalprice: 150,
    depositpaid: true,
    bookingdates: { checkin: '2026-12-01', checkout: '2026-12-05' },
    additionalneeds: 'Breakfast',
    ...overrides,
  };
}

/** Тонка обгортка над APIRequestContext: тести читаються як флоу, а не як набір URL. */
export class BookingClient {
  constructor(private readonly request: APIRequestContext) {}

  auth(username = ADMIN.username, password = ADMIN.password): Promise<APIResponse> {
    return this.request.post('/auth', { data: { username, password } });
  }

  async getToken(): Promise<string> {
    const res = await this.auth();
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.token, 'auth response must contain token').toEqual(expect.any(String));
    return body.token;
  }

  create(data: unknown): Promise<APIResponse> {
    return this.request.post('/booking', { data });
  }

  get(id: number): Promise<APIResponse> {
    return this.request.get(`/booking/${id}`);
  }

  update(id: number, data: unknown, token?: string): Promise<APIResponse> {
    return this.request.put(`/booking/${id}`, { data, headers: token ? { Cookie: `token=${token}` } : {} });
  }

  partialUpdate(id: number, data: unknown, token?: string): Promise<APIResponse> {
    return this.request.patch(`/booking/${id}`, { data, headers: token ? { Cookie: `token=${token}` } : {} });
  }

  delete(id: number, token?: string): Promise<APIResponse> {
    return this.request.delete(`/booking/${id}`, { headers: token ? { Cookie: `token=${token}` } : {} });
  }
}
