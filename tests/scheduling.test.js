import test from "node:test";
import assert from "node:assert/strict";
import { eligibleTransmission, isActiveWindow, selectTransmissions } from "../src/domain/scheduling.js";

const base = { id: "one", status: "published", startAt: "2026-01-01T00:00:00Z", endAt: "2027-01-01T00:00:00Z", mobileEligible: true, desktopEligible: true, routes: ["desktop"], frequency: { maxDisplays: 1 }, priority: 10 };
const context = { now: new Date("2026-07-11T10:00:00Z"), timezone: "UTC", mobile: false, route: "desktop", dismissals: {}, displayCounts: {} };

test("active windows respect publication and expiry", () => {
  assert.equal(isActiveWindow(base, context.now), true);
  assert.equal(isActiveWindow({ ...base, status: "draft" }, context.now), false);
  assert.equal(isActiveWindow({ ...base, endAt: "2026-01-02T00:00:00Z" }, context.now), false);
});

test("eligibility respects dismissal, route, device and frequency", () => {
  assert.equal(eligibleTransmission(base, context), true);
  assert.equal(eligibleTransmission(base, { ...context, displayCounts: { one: 1 } }), false);
  assert.equal(eligibleTransmission(base, { ...context, dismissals: { one: { dismissed: true } } }), false);
  assert.equal(eligibleTransmission(base, { ...context, route: "admin" }), false);
});

test("selection prioritizes and limits windows", () => {
  const result = selectTransmissions([base, { ...base, id: "two", priority: 40 }], context, 1);
  assert.equal(result[0].id, "two");
});
