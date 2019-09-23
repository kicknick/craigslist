var puppeteer = require('/usr/local/lib/node_modules/puppeteer')
//var puppeteer = require('puppeteer')
// const router = express.Router();
var xl = require('excel4node');
var express = require('express');
const path = require('path');

var app = express();

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.post('/', function(req, res) {
  const url = req.param('url')
  parsePage(url)
  res.sendStatus(200).end();
  //res.status(400).send('Error in retrieving user from database');
});

// app.listen(2222, function () {
//   console.log('Example app listening on port 2222!');
// });





let parsePage = async(url) => {
	  // console.log(url)
		try{
		const browser = await puppeteer.launch({headless: false});
		const page = await browser.newPage()
		await page.goto(url)

		const titleSelector = '#titletextonly'
		const cityOrNSelector = 'body > section > section > h2 > span > small'
		const descriptionSelector = '#postingbody'
		await page.waitForSelector(titleSelector)
		await page.waitForSelector(cityOrNSelector)
		await page.waitForSelector(descriptionSelector)


		const result = await page.evaluate((titleSelector, cityOrNSelector, descriptionSelector) => {
		  let title = document.querySelector(titleSelector).innerText
		  let cityOrN = document.querySelector(cityOrNSelector).innerText
		  let description = document.querySelector(descriptionSelector).innerText
		  return {
		  	title, 
		  	cityOrN,
		  	description
		  }
		}, titleSelector, cityOrNSelector, descriptionSelector);
		// console.log(result.title)
		// console.log(result.cityOrN)
		// console.log(result.description)
		Login(result.title, result.cityOrN, result.description)


	} catch(e) {
		console.log("Error:", e)
	}
}




parsePage('https://dallas.craigslist.org/mdf/wan/6975410254.html?lang=ru')



let Login = async(postingTitle, cityOrN, description) => {
	const url = 'https://accounts.craigslist.org'
	const email = 'toby@forwardven.com'
	// const password = 'gfurfgryu4343'
	const password = 'Alpha123@!make123'
	try{
		const browser = await puppeteer.launch({headless: false});
		// const browser = await puppeteer.launch();
	  const page = await browser.newPage()
		await page.goto(url)
		const emailSelector = '#inputEmailHandle'
		const passSelector = '#inputPassword'

		await page.waitForSelector(emailSelector)
		await page.waitForSelector(passSelector)

		await page.type(emailSelector, email)

		await page.type(passSelector, password)

		const loginSelector = '#login'
		await page.click(loginSelector)

		const goSelector = 'body > article > section > form.new_posting_thing > select'
		const goSelector2 = 'body > article > section > form.new_posting_thing > button'
		// await page.tap(goSelector2)

		// await page.waitFor(2000);
		await page.waitForSelector(goSelector)
		await page.select('select[name="areaabb"]', 'dal');

		await page.waitForSelector(goSelector2)
		await page.click(goSelector2)


		const locationSelector = 'body > article > section > form > ul > li:nth-child(1) > label > input[type=radio]'
		await page.waitForSelector(locationSelector)
		await page.click(locationSelector)

		const continueButton = 'body > article > section > form > button'
		await page.waitForSelector(continueButton)
		await page.click(continueButton)


		const typeOfPosting = 'body > article > section > form > ul > li:nth-child(5) > label > span.right-side'
		await page.waitForSelector(typeOfPosting)
		await page.click(typeOfPosting)


		const continueButton2 = 'body > article > section > form > button'
		await page.waitForSelector(continueButton2)
		await page.click(continueButton2)


		const realEstate = '#new-edit > div > label > label:nth-child(11) > div > span'
		await page.waitForSelector(realEstate)
		await page.click(realEstate)


		const continueButton3 = '#new-edit > div > div.json-form-group.json-form-group-container.button > div > button'
		await page.waitForSelector(continueButton3)
		await page.click(continueButton3)

		// POSTING
		// const postingTitle = "We purchase any house under $350,000"
		const titleSelector = '#PostingTitle'
		await page.waitForSelector(titleSelector)
		await page.type(titleSelector, postingTitle)

		// const cityOrN = 'Anywhere in Dallas or Fort Worth Area'
		const cityOrNSelector = '#GeographicArea'
		await page.waitForSelector(cityOrNSelector)
		await page.type(cityOrNSelector, cityOrN)


		//const description = "We buy houses throughout North Texas. We offer fair prices and work with every situation. We have helped people who: just want to sell, don't want to deal with realtor fees, have a house that needs a bunch of work, inherited a property, never got a will, never probated, just probated, etc, etc. If we can't help for some odd reason, we will point you in the right direction!"
		const descriptionSelector = '#PostingBody'
		await page.waitForSelector(descriptionSelector)
		await page.type(descriptionSelector, description)


		const continueButton4 = '#new-edit > div > div.json-form-group.json-form-group-container.submit-buttons > div > button'
		await page.waitForSelector(continueButton4)
		await page.click(continueButton4)



		//POSTING IMAGE
		await page.waitForSelector('#classic')
		await page.waitFor(2000);
		const linkHandlers = await page.$x("//*[contains(text(), 'Use classic image uploader')]");
		// console.log(linkHandlers[0])
		await linkHandlers[0].click();


		const imgAdress = './m17nh03blkm.jpg'
		const fileInputSelector = '#uploader > form > input[type=file]:nth-child(3)'
		await page.waitForSelector(fileInputSelector)
		await page.waitFor(2000);
		const input = await page.$(fileInputSelector);
		await input.uploadFile(imgAdress);

		const doneImgSelector = 'body > article > section > form > button'
		await page.waitForSelector(doneImgSelector)
		await page.click(doneImgSelector)


		//PUBLISH
		const publishSelector = '#publish_top > button'
		await page.waitForSelector(publishSelector)
		await page.click(publishSelector)


		const resultUrlSelector = '#new-edit > div > div > ul > li:nth-child(1) > a'


	}	catch(e) {
		console.log(e)
	}

	//browser.close();
}


//Login()

