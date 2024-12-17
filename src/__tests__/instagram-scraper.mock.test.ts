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

  test("should handle scraping 12 posts from a profile", async () => {
    const mockPosts = Array(12)
      .fill(null)
      .map((_, index) => ({
        imageUrl: `https://instagram.com/p/mock-image-${index}`,
        caption: `Mock caption ${index}`,
        likeCount: String(1000 + index),
        commentCount: String(100 + index),
        timestamp: new Date(2024, 0, index + 1).toISOString(),
      }));

    const mockProfileData: InstagramProfile = {
      username: "mockuser",
      bio: "Mock bio",
      fullName: "Mock User",
      isVerified: true,
      posts: mockPosts,
      interests: [],
      followerCount: "1000000",
      followingCount: "1000",
      postCount: "500",
    };

    // Mock the page.evaluate call
    const page = {
      evaluate: jest.fn().mockResolvedValue(mockProfileData),
      setViewport: jest.fn().mockResolvedValue(undefined),
      setUserAgent: jest.fn().mockResolvedValue(undefined),
      goto: jest.fn().mockResolvedValue(undefined),
      waitForSelector: jest.fn().mockResolvedValue(undefined),
    };

    const browser = {
      newPage: jest.fn().mockResolvedValue(page),
      close: jest.fn(),
    };

    jest.spyOn(puppeteer, "launch").mockResolvedValue(browser as any);

    const scraper = new InstagramScraper();
    const profile = await scraper.scrapeProfile("mockuser", { maxPosts: 12 });

    expect(profile).not.toBeNull();
    expect(profile?.posts).toHaveLength(12);
    expect(profile?.posts[0]).toMatchObject({
      imageUrl: expect.stringContaining("mock-image-0"),
      caption: expect.stringContaining("Mock caption 0"),
      likeCount: "1000",
      commentCount: "100",
      timestamp: expect.any(String),
    });
  });

  test("should handle scraping more than 12 posts from a profile", async () => {
    const mockPosts = Array(24)
      .fill(null)
      .map((_, index) => ({
        imageUrl: `https://instagram.com/p/mock-image-${index}`,
        caption: `Mock caption ${index}`,
        likeCount: String(1000 + index),
        commentCount: String(100 + index),
        timestamp: new Date(2024, 0, index + 1).toISOString(),
      }));

    const mockProfileData: InstagramProfile = {
      username: "mockuser",
      bio: "Mock bio",
      fullName: "Mock User",
      isVerified: true,
      posts: mockPosts,
      interests: [],
      followerCount: "1000000",
      followingCount: "1000",
      postCount: "500",
    };

    const page = {
      evaluate: jest.fn().mockResolvedValue(mockProfileData),
      setViewport: jest.fn().mockResolvedValue(undefined),
      setUserAgent: jest.fn().mockResolvedValue(undefined),
      goto: jest.fn().mockResolvedValue(undefined),
      waitForSelector: jest.fn().mockResolvedValue(undefined),
    };

    const browser = {
      newPage: jest.fn().mockResolvedValue(page),
      close: jest.fn(),
    };

    jest.spyOn(puppeteer, "launch").mockResolvedValue(browser as any);

    const scraper = new InstagramScraper();
    const profile = await scraper.scrapeProfile("mockuser", { maxPosts: 24 });

    expect(profile).not.toBeNull();
    expect(profile?.posts).toHaveLength(24);
    expect(profile?.posts[0]).toMatchObject({
      imageUrl: expect.stringContaining("mock-image-0"),
      caption: expect.stringContaining("Mock caption 0"),
      likeCount: "1000",
      commentCount: "100",
      timestamp: expect.any(String),
    });
  });
});
