import { InstagramScraper } from "../scraper";
import puppeteer from "puppeteer";

// Mock puppeteer
jest.mock("puppeteer", () => ({
  launch: jest.fn().mockRejectedValue(new Error("Browser launch failed")),
}));

describe("InstagramScraper with mocks", () => {
  let scraper: InstagramScraper;

  beforeEach(() => {
    scraper = new InstagramScraper();
    jest.clearAllMocks();
  });

  it("should handle browser launch errors", async () => {
    const profile = await scraper.scrapeProfile("someuser");
    expect(profile).toBeNull();
    expect(puppeteer.launch).toHaveBeenCalled();
  });
});
