import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PDP = "/products/loop-hoodie";

const selectedColour = (page: Page) => page.getByRole("radiogroup", { name: "Colour" }).getByRole("radio", { checked: true });

// The shooting game opens by itself on a first visit; most tests start as a returning visitor.
test.beforeEach(async ({ page }, info) => {
  if (info.title.includes("first visit")) return;
  await page.addInitScript(() =>
    localStorage.setItem("charflut-reward", JSON.stringify({ state: { discount: 0, seen: true }, version: 0 })),
  );
});

async function seriousA11yIssues(page: Page) {
  // @axe-core/playwright is typed against its own playwright-core copy.
  const results = await new AxeBuilder({ page: page as unknown as ConstructorParameters<typeof AxeBuilder>[0]["page"] }).analyze();
  return results.violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
}

test("health endpoint responds", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.ok()).toBe(true);
  expect((await res.json()).status).toBe("ok");
});

test.describe("product page", () => {
  test("clicking a swatch changes colour and URL", async ({ page }) => {
    await page.goto(PDP);
    await expect(selectedColour(page)).toHaveAccessibleName("Concrete");
    await page.getByRole("radio", { name: "Moss" }).click();
    await expect(page).toHaveURL(/color=moss/);
    await expect(page.getByText("Colour: Moss")).toBeVisible();
    // Moss is on sale
    await expect(page.getByRole("complementary", { name: "Purchase options" }).getByText("Sale price")).toBeAttached();
  });

  test("deep link opens the right colour", async ({ page }) => {
    await page.goto(`${PDP}?color=bone`);
    await expect(selectedColour(page)).toHaveAccessibleName("Bone");
  });

  test("add to cart asks for a size, then adds the right variant and persists", async ({ page }) => {
    await page.goto(`${PDP}?color=washed-black`);
    await page.getByTestId("add-to-bag").click();
    await expect(page.getByText("Choose a size to add this to your bag.")).toHaveAttribute("role", "alert");
    await page.getByTestId("size-selector").getByRole("radio", { name: "M", exact: true }).click();
    await page.getByTestId("add-to-bag").click();
    const drawer = page.getByRole("dialog", { name: /Your bag/ });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText("Washed black, size M")).toBeVisible();
    await expect(page.getByTestId("cart-subtotal")).toHaveText("$128.00");
    await page.keyboard.press("Escape");
    await page.reload();
    await expect(page.getByTestId("bag-button")).toHaveAccessibleName("Bag, 1 item");
  });

  test("other products use the same template; unknown ones 404", async ({ page }) => {
    for (const slug of ["heavy-tee", "utility-cargo"]) {
      await page.goto(`/products/${slug}`);
      await expect(page.getByRole("radiogroup", { name: "Colour" })).toBeVisible();
      await expect(page.getByTestId("size-selector")).toBeVisible();
    }
    expect((await page.goto("/products/does-not-exist"))?.status()).toBe(404);
  });
});

test.describe("runway", () => {
  test("arrow keys change the look and the panel follows", async ({ page }) => {
    await page.goto("/runway");
    const panel = page.getByRole("complementary", { name: "In this look" });
    await expect(panel.getByText("Washed black")).toBeVisible();
    await page.getByTestId("carousel-stage").focus();
    await page.keyboard.press("ArrowRight");
    await expect(panel.getByText("Bone")).toBeVisible();
  });

  test("full look adds all pieces with the bundle discount", async ({ page }) => {
    await page.goto("/runway");
    await page.getByRole("button", { name: "Add full look to bag" }).click();
    const picker = page.getByRole("dialog", { name: "Pick your sizes" });
    const selectors = picker.getByTestId("size-selector");
    await selectors.nth(0).getByRole("radio", { name: "L", exact: true }).click();
    await selectors.nth(1).getByRole("radio", { name: "M", exact: true }).click();
    await selectors.nth(2).getByRole("radio", { name: "32", exact: true }).click();
    await picker.getByRole("button", { name: "Add all to bag" }).click();
    const drawer = page.getByRole("dialog", { name: /Your bag \(3\)/ });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText("Bundle savings")).toBeVisible();
    // (128 + 58 + 142) * 0.9
    await expect(page.getByTestId("cart-subtotal")).toHaveText("$295.20");
  });
});

test.describe("home", () => {
  test("a piece on the rail opens a closer look that adds to the bag", async ({ page }) => {
    await page.goto("/");
    // The hero rail never stops drifting, so use the still rail below it.
    const rail = page.locator("section", { has: page.locator("#rail-straight-title") });
    await rail.getByRole("button", { name: "Heavy Tee in Chalk, $58. Look closer" }).click();
    const peek = page.getByRole("dialog", { name: "Heavy Tee" });
    await expect(peek).toBeVisible();
    await peek.getByRole("radio", { name: "S", exact: true }).click();
    await peek.getByRole("button", { name: "Add to bag" }).click();
    await expect(page.getByRole("dialog", { name: /Your bag \(1\)/ })).toBeVisible();
  });

  test("the orbit turns with the keyboard and offers sizes", async ({ page }) => {
    await page.goto("/orbit");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Heavy Tee");
    await page.getByRole("slider", { name: "Turn the wheel" }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Utility Cargo");
    await page.getByRole("button", { name: "32", exact: true }).click();
    await page.getByRole("button", { name: "Add 32 to bag" }).click();
    await expect(page.getByRole("dialog", { name: /Your bag \(1\)/ })).toBeVisible();
  });

  test("the game opens on a first visit and its reward reaches the bag", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("dialog", { name: /Shoot 3/ })).toBeVisible({ timeout: 8000 });
    // Pretend a game was won, then check the bag applies it.
    await page.evaluate(() =>
      localStorage.setItem("charflut-reward", JSON.stringify({ state: { discount: 0.1, seen: true }, version: 0 })),
    );
    await page.goto(`${PDP}?color=rust`);
    await page.getByTestId("size-selector").getByRole("radio", { name: "S", exact: true }).click();
    await page.getByTestId("add-to-bag").click();
    await expect(page.getByText("Game reward (CHARFLUT10)")).toBeVisible();
    await expect(page.getByTestId("cart-subtotal")).toHaveText("$115.20");
  });
});

test("collection filters and sorts", async ({ page }) => {
  await page.goto("/collections/all");
  await expect(page.getByText("17 items")).toBeVisible();
  await page.getByRole("button", { name: /^Sort/ }).click();
  await page.getByRole("option", { name: "Price, high to low" }).click();
  await expect(page.locator("main li h3").first()).toHaveText("Utility Cargo");
  await page.getByRole("button", { name: /^Availability/ }).click();
  await page.getByLabel(/^In stock/).check();
  await expect(page.getByText("17 items")).toBeVisible();
});

test("no horizontal scroll and no serious accessibility issues", async ({ page }) => {
  test.setTimeout(90_000);
  for (const path of ["/", PDP, "/runway", "/orbit", "/collections/all"]) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, path).toBeLessThanOrEqual(0);
    expect(await seriousA11yIssues(page), path).toEqual([]);
  }
});

test("screenshots at key widths", async ({ browser }) => {
  test.setTimeout(90_000);
  for (const width of [375, 768, 1024, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: width < 800 ? 844 : 900 }, reducedMotion: "reduce" });
    await page.addInitScript(() =>
      localStorage.setItem("charflut-reward", JSON.stringify({ state: { discount: 0, seen: true }, version: 0 })),
    );
    for (const [name, path] of [
      ["home", "/"],
      ["pdp", PDP],
    ] as const) {
      await page.goto(path);
      await page.screenshot({ path: `test-results/screens/${name}-${width}.png`, fullPage: true });
    }
    await page.close();
  }
});
