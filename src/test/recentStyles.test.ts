import { describe, it, expect, beforeEach } from "vitest";

const STORAGE_KEY = "roc-recent-styles";

function saveRecentStyle(style: string, current: string[]): string[] {
  const updated = [style, ...current.filter((s) => s !== style)].slice(0, 5);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

function loadRecentStyles(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

describe("Recent custom styles localStorage", () => {
  beforeEach(() => localStorage.clear());

  it("saves a new style and reads it back", () => {
    saveRecentStyle("cyberpunk neon", []);
    expect(loadRecentStyles()).toEqual(["cyberpunk neon"]);
  });

  it("prepends new styles and deduplicates", () => {
    let styles = saveRecentStyle("cyberpunk neon", []);
    styles = saveRecentStyle("watercolor pastel", styles);
    styles = saveRecentStyle("cyberpunk neon", styles); // duplicate
    expect(styles).toEqual(["cyberpunk neon", "watercolor pastel"]);
  });

  it("caps at 5 recent styles", () => {
    let styles: string[] = [];
    for (let i = 1; i <= 7; i++) styles = saveRecentStyle(`style ${i}`, styles);
    expect(styles).toHaveLength(5);
    expect(styles[0]).toBe("style 7");
  });

  it("persists across simulated page refresh (re-read from localStorage)", () => {
    saveRecentStyle("cyberpunk neon", []);
    // Simulate refresh: read fresh from localStorage
    const afterRefresh = loadRecentStyles();
    expect(afterRefresh).toEqual(["cyberpunk neon"]);
  });
});
