import { describe, it, expect } from "vitest";
import { serviceDueByMileage } from "./fleet-analytics";

const asset = (odometer: number, interval = 15000) => ({ id: "a", name: "Van", odometer, service_interval_km: interval, status: "active" });
const done = (odometer: number) => ({ asset_id: "a", type: "scheduled", status: "completed", odometer });

describe("serviceDueByMileage", () => {
  it("due at last service + interval", () => {
    const [r] = serviceDueByMileage([asset(20000)], [done(10000)]);
    expect(r.dueAtKm).toBe(25000);
    expect(r.remainingKm).toBe(5000);
    expect(r.severity).toBe("ok");
  });
  it("soon within 1000 km", () => {
    expect(serviceDueByMileage([asset(24500)], [done(10000)])[0].severity).toBe("soon");
  });
  it("overdue past due km", () => {
    expect(serviceDueByMileage([asset(26000)], [done(10000)])[0].severity).toBe("overdue");
  });
  it("no prior service counts from 0", () => {
    expect(serviceDueByMileage([asset(16000)], [])[0].severity).toBe("overdue");
  });
});
