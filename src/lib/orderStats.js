// Pure order aggregation for the admin dashboard. No React, no Supabase — so the
// bucketing logic can be exercised by orderStats.test.js (`node --test src/lib`).

export const ORDER_STAGES = [
  'Order Placed', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'
];
export const CANCELLED = 'Cancelled';
export const ALL_STATUSES = [...ORDER_STAGES, CANCELLED];

// Cancelled orders are not revenue. Everything money-shaped routes through here
// so the KPI tiles, the chart and the table can't disagree with each other.
export const isRevenue = (o) => o.status !== CANCELLED;

// Local calendar day, not UTC — an 11pm IST order belongs to that day for the
// shop owner reading the chart.
export function dayKey(value) {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function orderDateOf(order) {
  return order.orderDate ? new Date(order.orderDate) : null;
}

/**
 * Orders placed within the last `days` calendar days (today inclusive). Both
 * bounds snap to whole local days — bounding the top at the current *instant*
 * would drop orders placed later today and make the KPI tiles contradict the
 * chart, which buckets by calendar day.
 */
export function ordersInRange(orders, days, now = new Date()) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return orders.filter((o) => {
    const d = orderDateOf(o);
    return d && d >= start && d <= end;
  });
}

/**
 * One row per calendar day across the whole window, zero-filled — a chart with
 * gaps skipped lies about the trend, so empty days have to be real rows.
 */
export function bucketByDay(orders, days, now = new Date()) {
  const buckets = new Map();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    buckets.set(dayKey(d), { date: dayKey(d), label: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), orders: 0, revenue: 0 });
  }

  for (const o of orders) {
    const d = orderDateOf(o);
    const bucket = d && buckets.get(dayKey(d));
    if (!bucket) continue;
    bucket.orders += 1;
    if (isRevenue(o)) bucket.revenue += Number(o.total) || 0;
  }
  return [...buckets.values()];
}

/** Counts per status, in pipeline order, so the bars read as a funnel. */
export function statusBreakdown(orders) {
  const counts = new Map(ALL_STATUSES.map((s) => [s, 0]));
  for (const o of orders) counts.set(o.status, (counts.get(o.status) || 0) + 1);
  return ALL_STATUSES.map((status) => ({ status, count: counts.get(status) }));
}

export function summarise(orders) {
  const paid = orders.filter(isRevenue);
  const revenue = paid.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  return {
    orders: orders.length,
    revenue,
    cancelled: orders.length - paid.length,
    delivered: orders.filter((o) => o.status === 'Delivered').length,
    // Average order value over revenue-bearing orders only; 0 orders must not divide.
    aov: paid.length ? revenue / paid.length : 0,
    units: orders.reduce((sum, o) => sum + (o.items || []).reduce((n, i) => n + (i.quantity || 0), 0), 0)
  };
}

/** Percentage change vs. the immediately preceding window of the same length. */
export function trend(orders, days, pick, now = new Date()) {
  const prevEnd = new Date(now);
  prevEnd.setHours(0, 0, 0, 0);
  prevEnd.setDate(prevEnd.getDate() - days);
  const current = pick(summarise(ordersInRange(orders, days, now)));
  const previous = pick(summarise(ordersInRange(orders, days, prevEnd)));
  if (!previous) return current ? null : 0; // null = no baseline to compare against
  return ((current - previous) / previous) * 100;
}

/** Best-selling products across the given orders, biggest revenue first. */
export function topProducts(orders, limit = 5) {
  const byProduct = new Map();
  for (const o of orders.filter(isRevenue)) {
    for (const item of o.items || []) {
      const row = byProduct.get(item.id) || { id: item.id, name: item.name, units: 0, revenue: 0 };
      row.units += item.quantity || 0;
      row.revenue += (Number(item.price) || 0) * (item.quantity || 0);
      byProduct.set(item.id, row);
    }
  }
  return [...byProduct.values()].sort((a, b) => b.revenue - a.revenue).slice(0, limit);
}
