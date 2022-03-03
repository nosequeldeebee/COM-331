const puppeteer = require("puppeteer");
const NFT_URL = "...";
const fs = require("fs");

async function scrapeProjects() {
  let browser = await puppeteer.launch({ headless: false }); //headless:false so we can watch the browser as it works
  let page = await browser.newPage();
  let projects = [];
  await page.goto(NFT_URL); //access the nft projects page

  // give the page a second to load
  await page.waitForTimeout(1000);

  // extract number of pages to loop through them, strip out all text surrounding the page number
  const rawPageText = await page.evaluate(
    () =>
      document.querySelectorAll(
        ".styles__PagesInfo-sc-1buchb9-2.izwJeD > span"
      )[1].innerText
  );
  const numPages = rawPageText.match(/\d+/g)[0];

  // iterate through pages, add in a few timeouts to not spam server
  for (var i = 1; i < numPages; i++) {
    console.log("scraping page: " + i);
    await scrapePage();
    await page.waitForTimeout(1000);

    // the page uses some tricky svg links for the back and forward buttons, and has the same class name for each button
    // so we delete the back button, and click the remaining forward button to move onto the next page
    let remove = ".styles__Chevron-sc-1buchb9-1.cXQSjq";
    await page.evaluate((sel) => {
      var elements = document.querySelectorAll(sel);
      if (elements && elements.length > 1) {
        elements[0].parentNode.removeChild(elements[0]);
      }
    }, remove);
    await page.click(".styles__Chevron-sc-1buchb9-1.cXQSjq");
    await page.waitForTimeout(1000);

    // if it's the last page, scrape it before exiting
    if (i == numPages - 1) {
      console.log("scraping last page");
      await scrapePage();
    }
  }

  // Get row data
  async function scrapePage() {
    let projectsOnPage = await page.$$eval(
      ".styles__TableRow-sc-1buchb9-11.gxzFwa",
      (rows) => {
        return rows.map((row) => {
          const properties = {};

          // scrape table data, column by column
          const name = row.querySelector("span");
          properties.name = name ? name.innerText : "";
          const url = row.querySelector("a");
          properties.url = url ? url.href : "";
          const sdV = row.querySelector(
            ".LinkStyled__StyledLink-sc-1kn95h1-0.csolxx.styles__LinkTableCell-sc-1buchb9-13.gJYnHB > div"
          );
          properties.sdV = sdV ? sdV.innerText : "";
          const sdS = row.querySelector(
            ".LinkStyled__StyledLink-sc-1kn95h1-0.csolxx.styles__LinkTableCell-sc-1buchb9-13.kpsxyE > div"
          );
          properties.sdS = sdS ? sdS.innerText : "";
          const ATV = row.querySelectorAll(
            ".LinkStyled__StyledLink-sc-1kn95h1-0.csolxx.styles__LinkTableCell-sc-1buchb9-13.gJYnHB > div"
          )[1];
          properties.ATV = ATV ? ATV.innerText : "";
          const ATS = row.querySelectorAll(
            ".LinkStyled__StyledLink-sc-1kn95h1-0.csolxx.styles__LinkTableCell-sc-1buchb9-13.gJYnHB > div"
          )[2];
          properties.ATS = ATS ? ATS.innerText : "";

          return properties;
        });
      }
    );
    projectsOnPage.forEach((project) => projects.push(project));
  }

  await browser.close();

  fs.writeFile(
    "results.json",

    JSON.stringify(projects),

    function (err) {
      if (err) {
        console.error(err);
      }
    }
  );
}

scrapeProjects();
