// This is a Node.js script that uses Puppeteer to scrape Github for a list of developers based on a specific city. It then saves the results into a SQLite database.
const puppeteer = require("puppeteer");

// define username, password and city of interest in constants.js file
const constants = require("./constants");

// a db object is created to connect to the SQLite database.
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./users.db", (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Connected to SQlite database.");
});

/* The getUsers function performs the following actions:
Launches a new instance of the Puppeteer browser with a 100ms delay to simulate a human
Logs in to Github using the credentials defined in constants
Navigates to the Github search page for the specified city
Parses the number of users (developers) returned from the search and calculates the number of pages to iterate through
Iterates through each page, scraping the full name, username, and email address of each developer
Filters out empty results and adds them to an array
Closes the browser and returns the array of developers
*/
async function getUsers() {
  const users = [];

  // start the browser and add in an artificial delay
  const browser = await puppeteer.launch({
    slowMo: 100,
    headless: false,
  });

  // sign in to Github
  const signInPage = await browser.newPage();
  const signInUrl = "https://github.com/login";

  await signInPage.goto(signInUrl);
  await signInPage.click("#login_field");
  await signInPage.keyboard.type(constants.USERNAME);
  await signInPage.click("#password");
  await signInPage.keyboard.type(constants.PASSWORD);
  await signInPage.click(".btn.btn-primary.btn-block");

  // search for developers based in city of interest
  const page = await browser.newPage();
  const url = `https://github.com/search?q=location%3A${constants.CITY}&type=Users`;

  await page.goto(url);
  await page.waitForTimeout(3000);

  // github tells you the number of results in this format "100 users" so strip out anything that's not a number
  const numUsersText = await page.evaluate(
    () =>
      document.querySelector(
        ".d-flex.flex-column.flex-md-row.flex-justify-between.border-bottom.pb-3.position-relative h3"
      ).innerText
  );
  const numUsers = numUsersText.replace(/[a-zA-Z,]/g, "");

  // set number of pages to iterate through
  let pages = Math.floor(numUsers / 10);
  if (numUsers % 10 !== 0) {
    pages++;
  }
  console.log("number of pages to scrape: " + pages);

  for (var i = 0; i < pages; i++) {
    // github only gives 100 pages of results so break after 100 pages even if there are more results than that
    if (i === 100) {
      break;
    }

    const page = await browser.newPage();
    const url = `https://github.com/search?p=${i + 1}&q=location%3A${
      constants.CITY
    }&type=Users`;
    await page.goto(url);
    await page.waitForTimeout(3000);

    // scrape results on page
    const results = await page.$$eval(".flex-auto", (rows) => {
      return rows.map((row) => {
        const properties = {};
        const userElement = row.querySelector(".mr-1");
        properties.fullName = userElement ? userElement.innerText : "";
        const usernameElement = row.querySelector(".color-fg-muted");
        properties.username = usernameElement
          ? usernameElement.getAttribute("href")
          : "";
        const mailElement = row.querySelector(".Link--muted");
        properties.email = mailElement ? mailElement.innerText : "";
        return properties;
      });
    });

    // remove empty results and add to array
    var filteredResults = results.filter(function (el) {
      return el.username != "" && el.username != null;
    });

    filteredResults.forEach((result) => users.push(result));
  }

  // close the browser and return the filled in array of users
  await browser.close();
  return users;
}

// The writeUsers function takes an array array of developers as an argument to write to the db
async function writeUsers(users) {
  await users.forEach((user) => {
    db.run(
      "INSERT INTO users(full_name,username,public_email) values(?,?,?)",
      user.fullName,
      user.username,
      user.email,
      (err, rows) => {
        if (err) {
          throw err;
        }
      }
    );
  });

  console.log(users);

  // close the db connection when we're done
  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Closed the database connection.");
  });
}

// the getUsers() function is called and the resulting array of developers is passed to writeUsers(users) to be inserted into the SQLite database.
getUsers().then((x) => {
  writeUsers(x);
});
