import puppeteer from "puppeteer";
import { InstagramProfile, ScraperOptions } from "./types";

export class InstagramScraper {
  private defaultOptions: ScraperOptions = {
    maxScrolls: 5,
    maxPosts: 24,
    headless: true,
  };

  async scrapeProfile(
    username: string,
    options?: ScraperOptions
  ): Promise<InstagramProfile | null> {
    if (!username) {
      console.error("[Instagram Scraper] Error: Empty username provided");
      return null;
    }

    const config = { ...this.defaultOptions, ...options };
    let browser;

    try {
      console.log(`[Instagram Scraper] Starting scrape for user: ${username}`);
      console.log(`[Instagram Scraper] Options:`, {
        maxPosts: config.maxPosts,
        maxScrolls: config.maxScrolls,
        headless: config.headless,
      });

      browser = await puppeteer.launch({
        headless: config.headless ? "new" : false,
        args: ["--window-size=1920,1080"],
      });

      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
      );

      console.log(
        `[Instagram Scraper] Navigating to profile: instagram.com/${username}`
      );
      try {
        await page.goto(`https://www.instagram.com/${username}/`, {
          waitUntil: "networkidle0",
          timeout: 30000,
        });

        await page.waitForSelector("article", { timeout: 10000 });
      } catch (navigationError) {
        console.error("[Instagram Scraper] Navigation Error:", navigationError);
        return null;
      }

      await page.waitForSelector("header section", { timeout: 10000 });
      console.log("[Instagram Scraper] Found profile header");

      const headerContent = await page.evaluate(() => {
        const header = document.querySelector("header section");
        return {
          html: header?.innerHTML,
          text: header?.textContent,
        };
      });
      console.log(
        "[Instagram Scraper] Header content:",
        headerContent.text?.slice(0, 200) + "..."
      );

      const profileData = await page.evaluate(
        (profileUsername: string, maxPosts: number): InstagramProfile => {
          const header = document.querySelector("header section");

          const fullName = (() => {
            const nameElement = header?.querySelector(
              "h2._aacl._aacs._aact._aacx._aada"
            );
            if (nameElement?.textContent) return nameElement.textContent.trim();

            const headerText = header?.textContent || "";
            const followIndex = headerText.indexOf("Follow");
            if (followIndex > 0) {
              return headerText.substring(0, followIndex).trim();
            }
            return "";
          })();

          const bio = (() => {
            const bioElement = header?.querySelector("div._aa_c._add6._ac4d");
            if (bioElement?.textContent) return bioElement.textContent.trim();

            const headerText = header?.textContent || "";
            const followingIndex = headerText.indexOf("following");
            const linkIndex = headerText.indexOf("http");
            if (followingIndex > 0) {
              const bioText = headerText
                .substring(
                  followingIndex + 9,
                  linkIndex > 0 ? linkIndex : undefined
                )
                .trim();
              return bioText;
            }
            return "";
          })();

          const isVerified = !!header?.querySelector(
            'span[aria-label="Verified"]'
          );

          const countsSection = header?.querySelectorAll("ul li") || [];
          const [posts, followers, following] = Array.from(countsSection).map(
            (li) => {
              const countSpan = li?.querySelector("span span");
              const countText = countSpan?.textContent || "0";
              return countText.replace(/,/g, "");
            }
          );

          console.log("[Page] Profile details:");
          console.log(`  - Name: ${fullName}`);
          console.log(`  - Bio: ${bio}`);
          console.log(`  - Posts: ${posts}`);
          console.log(`  - Followers: ${followers}`);
          console.log(`  - Following: ${following}`);

          const articles = document.querySelectorAll("article");
          console.log(
            `[Page] Found ${articles.length} posts for ${profileUsername}`
          );

          const processedPosts = Array.from(articles)
            .slice(0, maxPosts)
            .map((article, index) => {
              const img =
                article.querySelector("img[class*='x5yr21d']") ||
                article.querySelector("img[alt*='Photo by']") ||
                article.querySelector("img:not([alt=''])");

              const captionElement = article.querySelector(
                'div[class*="_a9zs"], div[class*="x7f6e4"], div._a9zr'
              );
              const caption = captionElement?.textContent?.trim() || "";

              const likeElement = article.querySelector(
                'a[class*="_abl-"] span, span[class*="_aauw"]'
              );
              const likeCount =
                likeElement?.textContent?.replace(/[^\d,]/g, "") || "0";

              const commentElement = article.querySelector(
                'span[class*="_ae5q"], span[class*="xdj266r"]'
              );
              const commentCount =
                commentElement?.textContent?.replace(/[^\d,]/g, "") || "0";

              const timeElement = article.querySelector("time");
              const timestamp = timeElement?.getAttribute("datetime") || "";

              console.log(`[Page] Post ${index + 1} details:`);
              console.log(
                `  - Image URL: ${img?.getAttribute("src")?.slice(0, 50)}...`
              );
              console.log(`  - Caption: ${caption.slice(0, 100)}...`);
              console.log(`  - Likes: ${likeCount}`);
              console.log(`  - Comments: ${commentCount}`);
              console.log(`  - Posted: ${timestamp}`);

              return {
                imageUrl: img?.getAttribute("src") || "",
                caption,
                likeCount,
                commentCount,
                timestamp,
              };
            });

          return {
            username: profileUsername,
            bio,
            fullName,
            isVerified,
            posts: processedPosts,
            interests: [],
            followerCount: followers,
            followingCount: following,
            postCount: posts,
          };
        },
        username,
        config.maxPosts || 24
      );

      console.log(`[Instagram Scraper] Profile Summary for ${username}:`);
      console.log(`  Name: ${profileData.fullName}`);
      console.log(`  Bio: ${profileData.bio}`);
      console.log(`  Followers: ${profileData.followerCount}`);
      console.log(`  Following: ${profileData.followingCount}`);
      console.log(`  Total Posts: ${profileData.postCount}`);
      console.log(`  Verified: ${profileData.isVerified ? "Yes" : "No"}`);

      console.log(
        `\n[Instagram Scraper] Latest ${profileData.posts.length} posts:`
      );
      profileData.posts.forEach((post, index) => {
        console.log(`\nPost ${index + 1}:`);
        console.log(`  Caption: ${post.caption}`);
        console.log(`  Image: ${post.imageUrl}`);
        console.log(`  Engagement:`);
        console.log(`    - Likes: ${post.likeCount}`);
        console.log(`    - Comments: ${post.commentCount}`);
        console.log(`    - Posted: ${post.timestamp}`);
      });

      return profileData;
    } catch (error) {
      console.error("[Instagram Scraper] Error:", error);
      return null;
    } finally {
      if (browser) {
        await browser.close();
        console.log("[Instagram Scraper] Browser closed");
      }
    }
  }
}
