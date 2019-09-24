var puppeteer = require('/usr/local/lib/node_modules/puppeteer')
//var puppeteer = require('puppeteer')
var headless = false
// const router = express.Router();
// var xl = require('excel4node');
var express = require('express');
const path = require('path');
const download = require('image-downloader')
var app = express();

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.post('/', function(req, res) {
  const url = req.param('url')
  parsePage(url, res)
  //res.status(400).send('Error in retrieving user from database');
});

app.listen(2222, function () {
  console.log('Craigslist app listening on port 2222!');
});




let getPictures = async(page, url, res) => {
	try{
		await page.goto(url)
		const imgDiv = '#thumbs'
		await page.waitForSelector(imgDiv)

		const result = await page.evaluate(() => {
			let result =  document.querySelector('#thumbs').querySelectorAll('a') //Array.from(
			let pictures = []
			result.forEach(function(element) {
				pictures.push(element.href)
			});
			return pictures
		})
		return result

		// for(let i in result){
		// 	console.log(result[i])
		// }

	} catch(e) {
		console.log(e)
		res.sendStatus(400).send('Error').end();
	}
}

/// 403
// let downloadPictures = async(picturesURL, res) => {
// 	let pictures = []

// 	for(var i in picturesURL) {
// 		const options = {
// 		  url: picturesURL[i],
// 		  dest: path.join(__dirname + '/pictures'),             // Save to /path/to/dest/image.jpg
// 		  extractFilename: true
// 		}
	 
// 		await download.image(options)
// 		  .then(({ filename, image }) => {
// 		    console.log('Saved to', filename)  // Saved to /path/to/dest/image.jpg
// 		    pictures.push(filename)
// 		  })
// 		  .catch((err) => {console.error(err); res.sendStatus(400).send('Error').end();})
// 		}
// 		return pictures
// }
var wget = require('node-wget');
let downloadPictures = (pics, i, result, callback) => {
  const url = pics[i]
  wget({url: url, dest: path.join(__dirname + '/pictures/')}, (error, response, body) => {
    console.log(response.filepath)
    result.push(response.filepath)
    i++
    if(i < pics.length) 
      downloadPictures(pics, i, result, callback)
    else {
      // console.log("END")
      callback(result)
    }
  });
}




let parsePage = async(url, res) => {
		try{
		const browser = await puppeteer.launch({headless: headless});
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
		 getPictures(page, url, res).then(function(pics) {
		 	downloadPictures(pics, 0, [], function(pictures){
			  console.log(pictures)
			  browser.close();
			  Login(result.title, result.cityOrN, result.description, pictures, res)
			})
		 	// downloadPictures(pics, res).then(function(pictures) {
		 	// 	console.log(pictures)
		 	// 	browser.close();
		 	// 	console.log()
		 	// 	Login(result.title, result.cityOrN, result.description, pictures, res)
		 	// })
		 })


	} catch(e) {
		console.log("Error:", e)
	}
}




//parsePage('https://dallas.craigslist.org/mdf/wan/6975410254.html?lang=ru')



let Login = async(postingTitle, cityOrN, description, pictures, res) => {
	const url = 'https://accounts.craigslist.org'
	const email = 'toby@forwardven.com'
	// const password = 'gfurfgryu4343'
	const password = 'Alpha123@!make123'
	try{
		const browser = await puppeteer.launch({headless: headless});
		// const browser = await puppeteer.launch();
	  const page = await browser.newPage()
		await page.goto(url)

		//LOGIN
		const emailSelector = '#inputEmailHandle'
		const passSelector = '#inputPassword'

		await page.waitForSelector(emailSelector)
		await page.waitForSelector(passSelector)

		await page.type(emailSelector, email)

		await page.type(passSelector, password)

		const loginSelector = '#login'
		await page.click(loginSelector)

		//LOGIN END

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
		// await page.waitFor(1000);
		await page.waitForSelector(titleSelector)
		await page.type(titleSelector, postingTitle)

		// const cityOrN = 'Anywhere in Dallas or Fort Worth Area'
		const cityOrNSelector = '#GeographicArea'
		// await page.waitFor(1000);
		await page.waitForSelector(cityOrNSelector)
		await page.type(cityOrNSelector, cityOrN)


		//const description = "We buy houses throughout North Texas. We offer fair prices and work with every situation. We have helped people who: just want to sell, don't want to deal with realtor fees, have a house that needs a bunch of work, inherited a property, never got a will, never probated, just probated, etc, etc. If we can't help for some odd reason, we will point you in the right direction!"
		const descriptionSelector = '#PostingBody'
		// await page.waitFor(1000);
		await page.waitForSelector(descriptionSelector)
		await page.type(descriptionSelector, description)


		const continueButton4 = '#new-edit > div > div.json-form-group.json-form-group-container.submit-buttons > div > button'
		// await page.waitFor(1000);
		await page.waitForSelector(continueButton4)
		await page.click(continueButton4)



		//POSTING IMAGE
		await page.waitForSelector('#classic')
		await page.waitFor(2000);
		const linkHandlers = await page.$x("//*[contains(text(), 'Use classic image uploader')]");
		// console.log(linkHandlers[0])
		await linkHandlers[0].click();

		for(let i in pictures) {
			const imgAdress = pictures[i]
			const fileInputSelector = '#uploader > form > input[type=file]:nth-child(3)'
			await page.waitForSelector(fileInputSelector)
			await page.waitFor(2000);
			const input = await page.$(fileInputSelector);
			await input.uploadFile(imgAdress);
		}


		const doneImgSelector = 'body > article > section > form > button'
		await page.waitForSelector(doneImgSelector)
		await page.click(doneImgSelector)


		//PUBLISH
		const publishSelector = '#publish_top > button'
		await page.waitForSelector(publishSelector)
		await page.click(publishSelector)



		const resultUrlSelector = '#new-edit > div > div > ul > li:nth-child(1) > a'
		await page.waitForSelector(resultUrlSelector)
		const resultUrl = await page.evaluate((resultUrlSelector) => {
		  return document.querySelector(resultUrlSelector).innerText
		}, resultUrlSelector);
		console.log("DONE")
		console.log(resultUrl)
		res.status(200).send(resultUrl).end();


	}	catch(e) {
		console.log(e)
		res.sendStatus(400).send('Error').end();
	}

	//browser.close();
}


