// node --test src/lib/orderStats.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { bucketByDay, ordersInRange, statusBreakdown, summarise, topProducts, trend } from './orderStats.js';

const NOW = new Date('2026-09-07T12:00:00');
const daysAgo = (n, h = 10) => {
  const d = new Date(NOW);
  d.setDate(d.getDate() - n);
  d.setHours(h, 0, 0, 0);
  return d.toISOString();
};

const orders = [
  { id: 'A', orderDate: daysAgo(0), total: 1000, status: 'Delivered', items: [{ id: 'p1', name: 'Serum', price: 500, quantity: 2 }] },
  { id: 'B', orderDate: daysAgo(0, 23), total: 500, status: 'Shipped', items: [{ id: 'p2', name: 'Oil', price: 500, quantity: 1 }] },
  { id: 'C', orderDate: daysAgo(2), total: 9999, status: 'Cancelled', items: [{ id: 'p1', name: 'Serum', price: 9999, quantity: 1 }] },
  { id: 'D', orderDate: daysAgo(20), total: 300, status: 'Delivered', items: [{ id: 'p2', name: 'Oil', price: 300, quantity: 1 }] }
];

test('bucketByDay zero-fills every day in the window', () => {
  const rows = bucketByDay(orders, 7, NOW);
  assert.equal(rows.length, 7, 'one row per day even when nothing was ordered');
  assert.equal(rows.at(-1).orders, 2, 'both of today\'s orders land in today\'s bucket');
  assert.equal(rows.at(-1).revenue, 1500);
});

test('cancelled orders count as orders but never as revenue', () => {
  const rows = bucketByDay(orders, 7, NOW);
  const cancelDay = rows.find((r) => r.orders === 1 && r.revenue === 0);
  assert.ok(cancelDay, 'the cancelled order is charted but contributes 0 revenue');

  const s = summarise(orders);
  assert.equal(s.orders, 4);
  assert.equal(s.cancelled, 1);
  assert.equal(s.revenue, 1800, '9999 cancelled must not inflate revenue');
  assert.equal(s.aov, 600, 'AOV divides by revenue-bearing orders only');
  assert.equal(s.units, 5);
});

test('ordersInRange uses local calendar days, inclusive of today', () => {
  assert.equal(ordersInRange(orders, 7, NOW).length, 3);
  assert.equal(ordersInRange(orders, 1, NOW).length, 2);
  assert.equal(ordersInRange(orders, 30, NOW).length, 4);
});

test('statusBreakdown returns every status in pipeline order', () => {
  const rows = statusBreakdown(orders);
  assert.equal(rows.length, 8);
  assert.equal(rows[0].status, 'Order Placed');
  assert.equal(rows.at(-1).status, 'Cancelled');
  assert.equal(rows.at(-1).count, 1);
  assert.equal(rows.find((r) => r.status === 'Delivered').count, 2);
});

test('topProducts ranks by revenue and skips cancelled orders', () => {
  const top = topProducts(orders);
  assert.equal(top[0].id, 'p1');
  assert.equal(top[0].revenue, 1000, 'the 9999 cancelled line is excluded');
  assert.equal(top[1].revenue, 800);
});

test('trend returns null when there is no baseline to compare against', () => {
  assert.equal(trend(orders, 1, (s) => s.revenue, NOW), null, 'yesterday had no orders');
  assert.equal(trend([], 7, (s) => s.revenue, NOW), 0, 'no data at all is flat, not a crash');
});

test('malformed order dates are dropped, not charted as epoch', () => {
  const dirty = [...orders, { id: 'X', orderDate: null, total: 5, status: 'Confirmed', items: [] }];
  assert.equal(bucketByDay(dirty, 7, NOW).reduce((n, r) => n + r.orders, 0), 3);
});
