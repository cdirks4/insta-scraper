import { InstagramScraper } from "../scraper";
import { TEST_CONFIG } from "./config";

describe("InstagramScraper", () => {
  let scraper: InstagramScraper;
  jest.setTimeout(60000); // Increase timeout for real scraping tests

  beforeEach(() => {
    scraper = new InstagramScraper();
  });

  it("should scrape a public Instagram profile", async () => {
    const profile = await scraper.scrapeProfile(TEST_CONFIG.TEST_ACCOUNT, {
      maxScrolls: 1,
      maxPosts: 5,
      headless: true,
    });

    expect(profile).not.toBeNull();
    if (profile) {
      expect(profile.username).toBe(TEST_CONFIG.TEST_ACCOUNT);
      expect(Array.isArray(profile.posts)).toBeTruthy();
      expect(profile.posts.length).toBeLessThanOrEqual(5);

      // Check post structure
      if (profile.posts.length > 0) {
        const firstPost = profile.posts[0];
        expect(firstPost).toHaveProperty("imageUrl");
        expect(firstPost.imageUrl).toMatch(/^https?:\/\//);
      }
    }
  });

  it("should return null for non-existent profile", async () => {
    const profile = await scraper.scrapeProfile(
      "this_account_definitely_does_not_exist_123456789"
    );
    expect(profile).toBeNull();
  }, 30000);

  it("should respect maxPosts option", async () => {
    const maxPosts = 10;
    const profile = await scraper.scrapeProfile("instagram", {
      maxScrolls: 1,
      maxPosts,
    });

    expect(profile).not.toBeNull();
    if (profile) {
      expect(profile.posts.length).toBeLessThanOrEqual(maxPosts);
    }
  }, 30000);

  test("should scrape 12 posts from a profile", async () => {
    const scraper = new InstagramScraper();
    const profile = await scraper.scrapeProfile("instagram", { maxPosts: 12 });

    expect(profile).not.toBeNull();
    expect(profile?.posts).toBeDefined();
    expect(profile?.posts.length).toBe(12);

    // Verify each post has the required data
    profile?.posts.forEach((post) => {
      expect(post).toMatchObject({
        imageUrl: expect.any(String),
        caption: expect.any(String),
        likeCount: expect.any(String),
        commentCount: expect.any(String),
        timestamp: expect.any(String),
      });

      // Verify imageUrl is a valid URL
      expect(post.imageUrl).toMatch(/^https?:\/\/.+/);

      // Verify timestamp is a valid ISO date string
      expect(new Date(post.timestamp).toString()).not.toBe("Invalid Date");
    });
  }, 30000);

  test("should scrape more than 12 posts from a profile", async () => {
    const scraper = new InstagramScraper();
    const profile = await scraper.scrapeProfile("instagram", { maxPosts: 24 });

    expect(profile).not.toBeNull();
    expect(profile?.posts).toBeDefined();
    expect(profile?.posts.length).toBeGreaterThan(12);

    // Verify each post has the required data
    profile?.posts.forEach((post) => {
      expect(post).toMatchObject({
        imageUrl: expect.any(String),
        caption: expect.any(String),
        likeCount: expect.any(String),
        commentCount: expect.any(String),
        timestamp: expect.any(String),
      });

      // Verify imageUrl is a valid URL
      expect(post.imageUrl).toMatch(/^https?:\/\/.+/);

      // Verify timestamp is a valid ISO date string
      expect(new Date(post.timestamp).toString()).not.toBe("Invalid Date");
    });
  }, 45000); // Increased timeout for scrolling
});
