import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  formatClinicTime,
  parseTimeToMinutes,
  sortByTime,
} from "../time-utils.ts";

describe("time-utils", () => {
  it("parses mixed clinic time strings and decimal hours consistently", () => {
    assert.equal(parseTimeToMinutes("09:30"), 570);
    assert.equal(parseTimeToMinutes("9:30"), 570);
    assert.equal(parseTimeToMinutes("9:30 AM"), 570);
    assert.equal(parseTimeToMinutes(9.5), 570);
    assert.equal(parseTimeToMinutes("1:00"), 780);
    assert.equal(parseTimeToMinutes("1:00 PM"), 780);
    assert.equal(parseTimeToMinutes("14:30"), 870);
    assert.equal(parseTimeToMinutes("2:30 PM"), 870);
  });

  it("formats consistently in 12h AM/PM and 24h modes", () => {
    assert.equal(formatClinicTime("09:30", "12h"), "9:30 AM");
    assert.equal(formatClinicTime("12:00", "12h"), "12:00 PM");
    assert.equal(formatClinicTime(14.5, "12h"), "2:30 PM");
    assert.equal(formatClinicTime("1:00", "12h"), "1:00 PM");
    assert.equal(formatClinicTime("2:30 PM", "24h"), "14:30");
    assert.equal(formatClinicTime(9.5, "24h"), "09:30");
  });

  it("sorts mixed-format appointments chronologically", () => {
    const items = [
      { id: "c", time: "2:30 PM" },
      { id: "a", time: "09:30" },
      { id: "d", time: "16:00" },
      { id: "b", time: "10:15 AM" },
    ];
    const sorted = sortByTime(items, (i) => i.time);
    assert.deepEqual(
      sorted.map((i) => i.id),
      ["a", "b", "c", "d"],
    );
  });
});
