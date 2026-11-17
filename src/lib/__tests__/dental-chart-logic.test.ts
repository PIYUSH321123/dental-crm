import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  applyConditionToTooth,
  computeChartSummary,
  createHealthyTooth,
  createSeedDentalChart,
  diffCharts,
  formatToothNumber,
  getAllToothConditions,
  getPrimaryToothCondition,
  getSurfaceLayout,
  getToothCategory,
  PERMANENT_TO_PRIMARY_PREDECESSOR,
  PRIMARY_TO_PERMANENT_SUCCESSOR,
  removeConditionFromTooth,
  setToothEruptionState,
  toggleSurfaceCondition,
} from "../dental-chart-logic.ts";

describe("Dental chart state logic — multi-condition", () => {
  it("supports multiple simultaneous conditions on surfaces and whole tooth", () => {
    let tooth = createHealthyTooth(36);
    tooth = toggleSurfaceCondition(tooth, "D", "caries", "Dr. Sneha");
    tooth = toggleSurfaceCondition(tooth, "O", "filled", "Dr. Sneha");
    tooth = applyConditionToTooth(tooth, "root_canal", "Dr. Sneha");

    assert.equal(tooth.surfaceConditions.D, "caries");
    assert.equal(tooth.surfaceConditions.O, "filled");
    assert.ok(tooth.conditions.includes("root_canal"));
    assert.equal(tooth.rootFlags?.rctObturation, true);

    const all = getAllToothConditions(tooth);
    assert.ok(all.includes("caries"));
    assert.ok(all.includes("filled"));
    assert.ok(all.includes("root_canal"));
    assert.equal(getPrimaryToothCondition(tooth), "caries");
  });

  it("toggles off a surface condition when painted with the same condition again", () => {
    let tooth = createHealthyTooth(16);
    tooth = toggleSurfaceCondition(tooth, "O", "caries");
    assert.equal(tooth.surfaceConditions.O, "caries");
    tooth = toggleSurfaceCondition(tooth, "O", "caries");
    assert.equal(tooth.surfaceConditions.O, undefined);
  });

  it("removes a single condition without disturbing other conditions on the same tooth", () => {
    let tooth = createHealthyTooth(26);
    tooth = toggleSurfaceCondition(tooth, "D", "caries");
    tooth = toggleSurfaceCondition(tooth, "O", "filled");
    tooth = removeConditionFromTooth(tooth, "caries");

    assert.equal(tooth.surfaceConditions.D, undefined);
    assert.equal(tooth.surfaceConditions.O, "filled");
  });

  it("clears all conditions when applying healthy", () => {
    let tooth = createHealthyTooth(36);
    tooth = toggleSurfaceCondition(tooth, "D", "caries");
    tooth = applyConditionToTooth(tooth, "root_canal");
    tooth = applyConditionToTooth(tooth, "healthy");

    assert.deepEqual(getAllToothConditions(tooth), []);
    assert.equal(getPrimaryToothCondition(tooth), "healthy");
  });
});

describe("Dental chart geometry & surface mirroring", () => {
  it("mirrors Mesial toward the midline for left vs right quadrants", () => {
    // Upper Right (16) sits on chart LEFT -> midline is on RIGHT -> Mesial = right, Distal = left
    const ur = getSurfaceLayout(16);
    assert.equal(ur.right, "M");
    assert.equal(ur.left, "D");
    assert.equal(ur.top, "B");
    assert.equal(ur.bottom, "L");
    assert.equal(ur.centerLabel, "O");

    // Upper Left (26) sits on chart RIGHT -> midline is on LEFT -> Mesial = left, Distal = right
    const ul = getSurfaceLayout(26);
    assert.equal(ul.left, "M");
    assert.equal(ul.right, "D");
    assert.equal(ul.top, "B");
    assert.equal(ul.bottom, "L");

    // Lower Right (46) sits on chart LEFT -> Buccal on BOTTOM, Lingual on TOP, Mesial on RIGHT
    const lr = getSurfaceLayout(46);
    assert.equal(lr.top, "L");
    assert.equal(lr.bottom, "B");
    assert.equal(lr.right, "M");
    assert.equal(lr.left, "D");

    // Lower Left (36) sits on chart RIGHT -> Buccal on BOTTOM, Lingual on TOP, Mesial on LEFT
    const ll = getSurfaceLayout(36);
    assert.equal(ll.top, "L");
    assert.equal(ll.bottom, "B");
    assert.equal(ll.left, "M");
    assert.equal(ll.right, "D");
  });

  it("labels center edge as Incisal (I) on anteriors and Occlusal (O) on posteriors", () => {
    assert.equal(getSurfaceLayout(11).centerLabel, "I");
    assert.equal(getSurfaceLayout(23).centerLabel, "I");
    assert.equal(getSurfaceLayout(51).centerLabel, "I");
    assert.equal(getSurfaceLayout(14).centerLabel, "O");
    assert.equal(getSurfaceLayout(36).centerLabel, "O");
    assert.equal(getSurfaceLayout(75).centerLabel, "O");
  });

  it("classifies tooth anatomical categories correctly", () => {
    assert.equal(getToothCategory(11), "incisor");
    assert.equal(getToothCategory(23), "canine");
    assert.equal(getToothCategory(14), "premolar");
    assert.equal(getToothCategory(36), "molar");
    assert.equal(getToothCategory(55), "molar");
    assert.equal(getToothCategory(63), "canine");
  });
});

describe("Mixed dentition & eruption states", () => {
  it("maps every primary tooth (51-85) to its exact permanent successor (11-45)", () => {
    assert.equal(Object.keys(PRIMARY_TO_PERMANENT_SUCCESSOR).length, 20);
    assert.equal(PRIMARY_TO_PERMANENT_SUCCESSOR[55], 15);
    assert.equal(PRIMARY_TO_PERMANENT_SUCCESSOR[51], 11);
    assert.equal(PRIMARY_TO_PERMANENT_SUCCESSOR[61], 21);
    assert.equal(PRIMARY_TO_PERMANENT_SUCCESSOR[65], 25);
    assert.equal(PRIMARY_TO_PERMANENT_SUCCESSOR[85], 45);
    assert.equal(PRIMARY_TO_PERMANENT_SUCCESSOR[75], 35);
    assert.equal(PERMANENT_TO_PRIMARY_PREDECESSOR[35], 75);
  });

  it("tracks erupted, unerupted, and partially_erupted states per tooth", () => {
    let perm = createHealthyTooth(15);
    assert.equal(perm.eruptionState, "erupted");
    perm = setToothEruptionState(perm, "unerupted", "Dr. Sneha");
    assert.equal(perm.eruptionState, "unerupted");
    perm = setToothEruptionState(perm, "partially_erupted", "Dr. Sneha");
    assert.equal(perm.eruptionState, "partially_erupted");
  });
});

describe("Dental numbering conversion (FDI / Universal / Palmer)", () => {
  it("converts permanent FDI teeth to Universal (1-32)", () => {
    assert.equal(formatToothNumber(18, "Universal"), "1");
    assert.equal(formatToothNumber(11, "Universal"), "8");
    assert.equal(formatToothNumber(21, "Universal"), "9");
    assert.equal(formatToothNumber(28, "Universal"), "16");
    assert.equal(formatToothNumber(38, "Universal"), "17");
    assert.equal(formatToothNumber(36, "Universal"), "19");
    assert.equal(formatToothNumber(31, "Universal"), "24");
    assert.equal(formatToothNumber(41, "Universal"), "25");
    assert.equal(formatToothNumber(48, "Universal"), "32");
  });

  it("converts primary FDI teeth to Universal (A-T)", () => {
    assert.equal(formatToothNumber(55, "Universal"), "A");
    assert.equal(formatToothNumber(51, "Universal"), "E");
    assert.equal(formatToothNumber(61, "Universal"), "F");
    assert.equal(formatToothNumber(65, "Universal"), "J");
    assert.equal(formatToothNumber(75, "Universal"), "K");
    assert.equal(formatToothNumber(71, "Universal"), "O");
    assert.equal(formatToothNumber(81, "Universal"), "P");
    assert.equal(formatToothNumber(85, "Universal"), "T");
  });

  it("converts permanent and primary FDI teeth to Palmer quadrant notation", () => {
    assert.equal(formatToothNumber(16, "Palmer"), "6┘");
    assert.equal(formatToothNumber(21, "Palmer"), "└1");
    assert.equal(formatToothNumber(36, "Palmer"), "┌6");
    assert.equal(formatToothNumber(48, "Palmer"), "8┐");
    assert.equal(formatToothNumber(55, "Palmer"), "E┘");
    assert.equal(formatToothNumber(61, "Palmer"), "└A");
    assert.equal(formatToothNumber(75, "Palmer"), "┌E");
    assert.equal(formatToothNumber(81, "Palmer"), "A┐");
  });
});

describe("Summary counts & history comparison", () => {
  it("computes condition counts and planned procedure totals accurately", () => {
    const chart = createSeedDentalChart("pat-priya", 34);
    const summary = computeChartSummary(chart.teeth, "adult");
    assert.equal(summary.byCondition.missing, 4);
    assert.equal(summary.byCondition.caries, 2); // 14 + 36
    assert.equal(summary.plannedProceduresCount, 3); // 1 on 14 + 2 on 36
    assert.equal(summary.plannedProceduresTotalFee, 24300);
  });

  it("diffs baseline snapshot against current chart", () => {
    const chart = createSeedDentalChart("pat-priya", 34);
    const diffs = diffCharts(chart.history[0].teeth, chart.teeth);
    const fdis = diffs.map((d) => d.fdi);
    assert.ok(fdis.includes(14));
    assert.ok(fdis.includes(36));
    const diff36 = diffs.find((d) => d.fdi === 36)!;
    assert.ok(diff36.added.includes("planned"));
    assert.ok(diff36.surfaceChanges.some((s) => s.startsWith("O:")));
  });
});
