import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PDP = "/products/loop-hoodie";

const selectedColour = (page: Page) => page.getByRole("radiogroup", { name: "Colour" }).getByRole("radio", { checked: true });

test.describe("product page", () => {
  test("health endpoint responds", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok()).toBe(true);
    expect((await res.json()).status).toBe("ok");
  });

  test("arrow keys move the carousel and update panel and URL", async ({ page }) => {
    await page.goto(PDP);
    await expect(selectedColour(page)).toHaveAccessibleName("Concrete");
    await page.getByTestId("carousel-stage").focus();
    await page.keyboard.press("ArrowRight");
    await expect(selectedColour(page)).toHaveAccessibleName("Rust");
    await expect(page).toHaveURL(/color=rust/);
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await expect(selectedColour(page)).toHaveAccessibleName("Deep navy");
    await expect(page).toHaveURL(/color=deep-navy/);
  });

  test("dragging or swiping the stage changes colour", async ({ page }, info) => {
    await page.goto(PDP);
    await expect(page.getByTestId("carousel-stage")).toHaveAttribute("data-ready", "true");
    const box = (await page.getByTestId("carousel-stage").boundingBox())!;
    const y = box.y + box.height * 0.75;
    const startX = box.x + box.width * 0.75;
    await page.mouse.move(startX, y);
    await page.mouse.down();
    for (let i = 1; i <= 12; i++) await page.mouse.move(startX - (box.width * 0.45 * i) / 12, y);
    await page.mouse.up();
    await expect(selectedColour(page)).not.toHaveAccessibleName("Concrete");
    await expect(page).not.toHaveURL(/color=concrete/);
    info.annotations.push({ type: "colour after drag", description: page.url() });
  });

  test("clicking a swatch moves the carousel", async ({ page }) => {
    await page.goto(PDP);
    await page.getByRole("radio", { name: "Moss" }).click();
    await expect(page).toHaveURL(/color=moss/);
    await expect(page.getByRole("button", { name: "Moss, current" })).toBeVisible();
    // Moss is on sale
    await expect(page.getByRole("complementary", { name: "Purchase options" }).getByText("Sale price")).toBeAttached();
  });

  test("deep link opens the right colour and model", async ({ page }) => {
    await page.goto(`${PDP}?color=bone&model=women`);
    await expect(selectedColour(page)).toHaveAccessibleName("Bone");
    await expect(page.getByRole("radio", { name: "Women" })).toBeChecked();
  });

  test("add to bag asks for a size, then adds the right variant and persists", async ({ page }) => {
    await page.goto(`${PDP}?color=washed-black`);
    await page.getByTestId("add-to-bag").click();
    await expect(page.getByText("Choose a size to add this to your bag.")).toHaveAttribute("role", "alert");
    await page.getByTestId("size-selector").getByRole("radio", { name: "M", exact: true }).click();
    await page.getByTestId("add-to-bag").click();
    const drawer = page.getByRole("dialog", { name: /Your bag/ });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText("Washed black, size M")).toBeVisible();
    await expect(page.getByTestId("cart-subtotal")).toHaveText("$128");
    await page.keyboard.press("Escape");
    await page.reload();
    await expect(page.getByTestId("bag-button")).toHaveAccessibleName("Bag, 1 item");
  });

  test("full look adds all pieces with the bundle discount", async ({ page }) => {
    await page.goto(PDP);
    await page.getByTestId("add-look").click();
    await expect(page.getByText(/to add the full look/)).toHaveAttribute("role", "alert");
    await page.getByTestId("size-selector").getByRole("radio", { name: "L", exact: true }).click();
    await page.getByLabel("Size for Heavy Tee").selectOption("M");
    await page.getByLabel("Size for Utility Cargo").selectOption("32");
    await page.getByTestId("add-look").click();
    const drawer = page.getByRole("dialog", { name: /Your bag \(3\)/ });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText("Bundle savings")).toBeVisible();
    // (128 + 58 + 142) * 0.9
    await expect(page.getByTestId("cart-subtotal")).toHaveText("$295.20");
  });

  test("model photos load for the visible colours", async ({ page }) => {
    await page.goto(PDP);
    const img = page.getByRole("img", { name: /Loop Hoodie in Concrete/ });
    await expect(img).toBeVisible();
    // The browser picks the 360 px or 600 px file depending on the slot and screen
    // (naturalWidth is density-adjusted, so only check that it loaded).
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth)).toBeGreaterThan(0);
    // The other colours load once the centre photo is in.
    await expect(page.getByTestId("carousel-stage").locator("img")).toHaveCount(6);
  });

  test("no horizontal scroll and no serious accessibility issues", async ({ page }) => {
    await page.goto(PDP);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    // @axe-core/playwright is typed against its own playwright-core copy.
    const results = await new AxeBuilder({ page: page as unknown as ConstructorParameters<typeof AxeBuilder>[0]["page"] }).analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
  });

  test("sticky buy bar appears on mobile after scrolling past the button", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile only");
    await page.goto(PDP);
    const bar = page.getByTestId("sticky-buy-bar");
    await expect(bar).toHaveAttribute("aria-hidden", "true");
    await page.getByRole("heading", { name: "You may also like" }).scrollIntoViewIfNeeded();
    await expect(bar).toHaveAttribute("aria-hidden", "false");
  });

  test("other products use the same template", async ({ page }) => {
    for (const slug of ["heavy-tee", "utility-cargo"]) {
      await page.goto(`/products/${slug}`);
      await expect(page.getByRole("radiogroup", { name: "Colour" })).toBeVisible();
      await expect(page.getByTestId("carousel-stage")).toBeVisible();
    }
    expect((await page.goto("/products/does-not-exist"))?.status()).toBe(404);
  });
});

test("screenshots at key widths", async ({ browser }) => {
  for (const width of [375, 768, 1024, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: width < 800 ? 844 : 900 }, reducedMotion: "reduce" });
    await page.goto(PDP);
    await page.screenshot({ path: `test-results/screens/pdp-${width}.png`, fullPage: true });
    await page.close();
  }
});
