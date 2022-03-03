const puppeteer = require('puppeteer');
const constants = require('./constants');

async function getAndWriteUsers() {
	const browser = await puppeteer.launch({
		slowMo: 100,
		headless: false,
	});

	// sign in to Github
	const signInPage = await browser.newPage();
	const signInUrl = 'https://github.com/login';

	await signInPage.goto(signInUrl);
	await signInPage.click('#login_field');
	await signInPage.keyboard.type(constants.USERNAME);
	await signInPage.click('#password');
	await signInPage.keyboard.type(constants.PASSWORD);
	await signInPage.click('.btn.btn-primary.btn-block');

}

getAndWriteUsers();
