import fs from "node:fs";
import path from "node:path";
import { describeWeather } from "../app/lib/conditions";

const assetExists = (name: string) => fs.existsSync(path.join(process.cwd(), "public/assets", `${name}.png`));

test("describes clear weather by day and by night", () => {
  expect(describeWeather(0, true)).toMatchObject({ label: "Clear sky", icon: "sunny", theme: "clear-day" });
  expect(describeWeather(0, false)).toMatchObject({ icon: "full-moon", theme: "clear-night" });
});

test("uses a night illustration for rain after dark", () => {
  expect(describeWeather(61, true).icon).toBe("rain_sun");
  expect(describeWeather(61, false).icon).toBe("rain-night");
});

test("flags precipitation", () => {
  expect(describeWeather(63, true).precipitation).toBe("rain");
  expect(describeWeather(95, true).precipitation).toBe("rain");
  expect(describeWeather(73, true).precipitation).toBe("snow");
  expect(describeWeather(3, true).precipitation).toBe("none");
});

test("falls back gracefully for an unknown code", () => {
  expect(describeWeather(1234, true)).toMatchObject({ label: "Unknown", precipitation: "none" });
  expect(assetExists(describeWeather(1234, true).icon)).toBe(true);
  expect(assetExists(describeWeather(1234, false).icon)).toBe(true);
});

test("every WMO code maps to an illustration that exists", () => {
  for (let code = 0; code <= 99; code++) {
    for (const isDay of [true, false]) {
      const condition = describeWeather(code, isDay);
      if (condition.label !== "Unknown") {
        expect({ code, isDay, icon: condition.icon, exists: assetExists(condition.icon) }).toMatchObject({ exists: true });
      }
    }
  }
});
