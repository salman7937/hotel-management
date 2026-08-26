import http from "k6/http";
import { check, group, sleep } from "k6";

// Run: k6 run k6/hotel-load-test.js
// Override targets: k6 run -e WEB_URL=http://localhost:3000 -e API_URL=http://localhost:5000/api k6/hotel-load-test.js
const WEB_URL = __ENV.WEB_URL || "http://localhost:3000";
const API_URL = __ENV.API_URL || "http://localhost:5000/api";

export const options = {
  stages: [
    { duration: "30s", target: 10 }, // ramp-up: users trickling in
    { duration: "1m", target: 10 },  // steady state: normal traffic
    { duration: "30s", target: 0 },  // ramp-down
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<800"],
    "http_req_duration{endpoint:home}": ["p(95)<500"],
    "http_req_duration{endpoint:rooms_api}": ["p(95)<500"],
  },
};

function uniqueEmail() {
  return `loadtest_${__VU}_${__ITER}_${Date.now()}@example.com`;
}

// Ensures at least a few rooms exist so the load test has real data to browse/book.
// Uses the seeded admin account (see server/src/utils/seed.ts) — override via env if different.
export function setup() {
  const existing = http.get(`${API_URL}/rooms`);
  if (existing.status === 200 && JSON.parse(existing.body).data.length > 0) {
    return;
  }

  const adminEmail = __ENV.ADMIN_EMAIL || "admin@grandstay.com";
  const adminPassword = __ENV.ADMIN_PASSWORD || "Password123!";
  const loginRes = http.post(
    `${API_URL}/auth/login`,
    JSON.stringify({ email: adminEmail, password: adminPassword }),
    { headers: { "Content-Type": "application/json" } }
  );
  if (loginRes.status !== 200) {
    throw new Error(
      `setup: admin login failed (${loginRes.status}) - no rooms exist and can't seed any. Seed the DB or set ADMIN_EMAIL/ADMIN_PASSWORD.`
    );
  }
  const token = JSON.parse(loginRes.body).data.accessToken;

  const rooms = [
    { roomNumber: "101", roomType: "Standard", description: "Cozy standard room", pricePerNight: 80, maxGuests: 2, bedType: "Queen" },
    { roomNumber: "102", roomType: "Deluxe", description: "Spacious deluxe room", pricePerNight: 140, maxGuests: 3, bedType: "King" },
    { roomNumber: "103", roomType: "Suite", description: "Luxury suite with lounge", pricePerNight: 260, maxGuests: 4, bedType: "King" },
  ];
  for (const room of rooms) {
    http.post(`${API_URL}/rooms`, JSON.stringify(room), {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
  }
}

export default function () {
  let accessToken = null;
  let roomId = null;

  group("1. Homepage", function () {
    const res = http.get(WEB_URL, { tags: { endpoint: "home" } });
    check(res, { "homepage loaded": (r) => r.status === 200 });
  });

  sleep(Math.random() * 2 + 1); // real user reads the page for 1-3s

  group("2. Browse Rooms", function () {
    const page = http.get(`${WEB_URL}/rooms`, { tags: { endpoint: "rooms_page" } });
    check(page, { "rooms page loaded": (r) => r.status === 200 });

    const api = http.get(`${API_URL}/rooms`, { tags: { endpoint: "rooms_api" } });
    const ok = check(api, {
      "rooms api 200": (r) => r.status === 200,
      "rooms list not empty": (r) => {
        try {
          return JSON.parse(r.body).data.length > 0;
        } catch (e) {
          return false;
        }
      },
    });
    if (ok) {
      const rooms = JSON.parse(api.body).data;
      roomId = rooms[0]._id;
    }
  });

  sleep(Math.random() * 3 + 2); // browsing/filtering rooms 2-5s

  if (roomId) {
    group("3. View Room Details", function () {
      const page = http.get(`${WEB_URL}/rooms/${roomId}`, { tags: { endpoint: "room_detail_page" } });
      check(page, { "room detail page loaded": (r) => r.status === 200 });

      const api = http.get(`${API_URL}/rooms/${roomId}`, { tags: { endpoint: "room_detail_api" } });
      check(api, { "room detail api 200": (r) => r.status === 200 });
    });
  }

  sleep(Math.random() * 3 + 2); // deciding whether to book 2-5s

  group("4. Register & Login", function () {
    const payload = JSON.stringify({
      name: "Load Test User",
      email: uniqueEmail(),
      password: "Password123",
      phone: "03001234567",
    });
    const res = http.post(`${API_URL}/auth/register`, payload, {
      headers: { "Content-Type": "application/json" },
      tags: { endpoint: "register" },
    });
    const ok = check(res, { "registered": (r) => r.status === 201 });
    if (ok) {
      accessToken = JSON.parse(res.body).data.accessToken;
    }
  });

  sleep(Math.random() * 1 + 0.5); // form fill/submit pause

  if (roomId) {
    group("5. Book Room", function () {
      const checkIn = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const checkOut = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
      const payload = JSON.stringify({
        guestName: "Load Test User",
        email: uniqueEmail(),
        phone: "03001234567",
        room: roomId,
        checkInDate: checkIn.toISOString(),
        checkOutDate: checkOut.toISOString(),
        numberOfGuests: 2,
      });
      const headers = { "Content-Type": "application/json" };
      if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

      const res = http.post(`${API_URL}/reservations`, payload, {
        headers,
        tags: { endpoint: "create_reservation" },
      });
      check(res, { "reservation created": (r) => r.status === 201 });
    });
  }

  sleep(Math.random() * 2 + 1); // confirmation page read 1-3s

  if (accessToken) {
    group("6. My Bookings", function () {
      const res = http.get(`${API_URL}/reservations/my`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        tags: { endpoint: "my_bookings" },
      });
      check(res, { "my bookings 200": (r) => r.status === 200 });
    });
  }

  sleep(Math.random() * 2 + 1);
}
