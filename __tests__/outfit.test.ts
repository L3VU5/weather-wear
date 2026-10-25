import { getOutfit, getVibe } from "../app/lib/outfit";

const dry = { apparentTemperature: 20, rainIntensity: 0, uvIndex: 1 };
const ids = (items: { id: string }[]) => items.map((item) => item.id);

describe("getVibe", () => {
  test.each([
    [30, "hot"],
    [25.1, "hot"],
    [25, "warm"],
    [22, "warm"],
    [20, "medium"],
    [15, "chilly"],
    [10, "cold"],
    [6, "freezing"],
    [-12, "freezing"],
  ])("%s °C feels %s", (temperature, vibe) => {
    expect(getVibe(temperature)).toBe(vibe);
  });
});

describe("getOutfit", () => {
  test("dresses men for a mild day", () => {
    expect(ids(getOutfit(dry, { precipitation: "none" }, "men"))).toEqual(["t-shirt", "jeans", "sneakers"]);
  });

  test("dresses women for a mild day", () => {
    expect(ids(getOutfit(dry, { precipitation: "none" }, "women"))).toEqual(["longDress", "sneakers"]);
  });

  test("wraps up when it is freezing", () => {
    const outfit = ids(getOutfit({ ...dry, apparentTemperature: -3 }, { precipitation: "none" }, "men"));

    expect(outfit).toEqual(["scarf", "winterHat", "gloves", "winterJacket", "jeans", "winterShoes"]);
  });

  test("adds an umbrella when the weather code says rain", () => {
    expect(ids(getOutfit(dry, { precipitation: "rain" }, "men"))[0]).toBe("umbrella");
  });

  test("adds an umbrella for measurable rain even if the code does not say so", () => {
    expect(ids(getOutfit({ ...dry, rainIntensity: 0.5 }, { precipitation: "none" }, "men"))[0]).toBe("umbrella");
    expect(ids(getOutfit({ ...dry, rainIntensity: 0.4 }, { precipitation: "none" }, "men"))).not.toContain("umbrella");
  });

  test("snow alone does not call for an umbrella", () => {
    expect(ids(getOutfit(dry, { precipitation: "snow" }, "men"))).not.toContain("umbrella");
  });

  test("adds sunglasses only for a high UV index", () => {
    expect(ids(getOutfit({ ...dry, uvIndex: 6 }, { precipitation: "none" }, "men"))).toContain("glasses");
    expect(ids(getOutfit({ ...dry, uvIndex: 5 }, { precipitation: "none" }, "men"))).not.toContain("glasses");
  });

  test("gives every item a readable label", () => {
    const outfit = getOutfit({ apparentTemperature: -3, rainIntensity: 2, uvIndex: 7 }, { precipitation: "rain" }, "women");

    expect(outfit.every((item) => item.label && item.label !== item.id)).toBe(true);
  });
});
