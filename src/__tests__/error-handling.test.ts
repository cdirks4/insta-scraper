import { InstagramScraper } from "../scraper";
import { TEST_CONFIG } from "./config";

describe("InstagramScraper Error Handling", () => {
  let scraper: InstagramScraper;
  jest.setTimeout(60000);

  beforeEach(() => {
    scraper = new InstagramScraper();
  });

  it("should handle empty username", async () => {
    const profile = await scraper.scrapeProfile("");
    expect(profile).toBeNull();
  });

  it("should handle invalid username", async () => {
    const profile = await scraper.scrapeProfile(
      "this_account_definitely_does_not_exist_123456789",
      { headless: true }
    );
    expect(profile).toBeNull();
  }, 30000);

  it("should handle invalid options gracefully", async () => {
    const profile = await scraper.scrapeProfile(TEST_CONFIG.TEST_ACCOUNT, {
      maxScrolls: -1,
      maxPosts: -1,
      headless: true,
    });

    expect(profile).not.toBeNull();
    if (profile) {
      expect(Array.isArray(profile.posts)).toBeTruthy();
    }
  }, 30000);

  afterAll(async () => {
    // Add a small delay to ensure all async operations complete
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });
});
