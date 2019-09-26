//git fetch
//git checkout origin/master -- ./server.js
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
  console.log("NEW REQUEST: ", url)
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
		try{
			await page.waitForSelector(imgDiv, {"timeout": 3000}).then(r => {})
		} catch(e) {
			return []
			console.log(e)
		} 


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
// var wget = require('node-wget');

// let downloadPictures = (pics, i, result, callback) => {
//   const url = pics[i]
//   wget({url: url, dest: path.join(__dirname + '/pictures/')}, (error, response, body) => {
//     // console.log(response.filepath)
//     result.push(response.filepath)
//     i++
//     if(i < pics.length) 
//       downloadPictures(pics, i, result, callback)
//     else {
//       // console.log("END")
//       callback(result)
//     }
//   });
// }


const exec = require('child_process').exec;

let downloadPictures = async (pics, i, result, callback)=> {
	console.log(i, pics.length)
	if(i < pics.length) {
		try{
			const filename = pics[i].split('/')[pics[i].split('/').length-1]
			const dest = path.join(__dirname, '/pictures/')
			exec('wget -P '+ dest + ' '+ pics[i], (error, stdout, stderr) => { //wget http://download.files.com/software/files.tar.gz -O /home/yourname/Downloads
			    // console.log(stdout);
			    // console.log(stderr);
			    console.log("img downloaded ", dest+filename)
			    i++;
			    result.push(dest+filename)
			    downloadPictures(pics, i, result, callback)
			    if (error !== null) {
			        console.log(`exec error: ${error}`);
			    }
			});
		} catch(e){
			console.log(e)
		}
	}
	else {
		console.log("downloaded all images")
		callback(result)	
	}
}




let parsePage = async(url, res) => {
		try{
		const browser = await puppeteer.launch({headless: headless});
		const page = await browser.newPage()
		await page.goto(url)

		var titleSelector = '#titletextonly'
		var cityOrNSelector = 'body > section > section > h2 > span > small' 
		var descriptionSelector = '#postingbody'
		try{
			await page.waitForSelector(titleSelector)
		} catch(e) {
			titleSelector = null
		}
		try{
			await page.waitForSelector(cityOrNSelector)
		} catch(e) {
			cityOrNSelector = null
		}
		try{
			await page.waitForSelector(descriptionSelector)
		} catch(e) {
			descriptionSelector = null
		}

		const result = await page.evaluate((titleSelector, cityOrNSelector, descriptionSelector) => {
		  let title = ''
		  if(titleSelector != null){
		  	title = document.querySelector(titleSelector).innerText
		  }

		  let cityOrN = ''
		  if(cityOrNSelector != null) {
		  	cityOrN = document.querySelector(cityOrNSelector).innerText
		  }

		  let description = ''
		  if(descriptionSelector != null) {
		  	description = document.querySelector(descriptionSelector).innerText
		  }
		  return {
		  	title, 
		  	cityOrN,
		  	description
		  }
		}, titleSelector, cityOrNSelector, descriptionSelector);
		console.log(result)
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

let clickOn = async(selector, page) => {
	await page.waitForSelector(selector, {"timeout": 5000}).then(async r => {
		await page.click(selector)
	}, async e => {
		console.log(page.url())
		await page.goto(page.url())
		await clickOn(selector, page)
	})
}



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
		console.log("logged in")
		//LOGIN END

		const goSelector = 'body > article > section > form.new_posting_thing > select'
		const goSelector2 = 'body > article > section > form.new_posting_thing > button'
		// await page.tap(goSelector2)

		// await page.waitFor(2000);
		try{
			await page.waitForSelector(goSelector)
		} catch(e) {

		}

		await page.select('select[name="areaabb"]', 'dal');

		await page.waitForSelector(goSelector2)
		await page.click(goSelector2)


		const locationSelector = 'body > article > section > form > ul > li:nth-child(1) > label > input[type=radio]'
		await page.waitForSelector(locationSelector)
		await page.click(locationSelector)

		let continueButton = 'body > article > section > form > button'
		await page.waitFor(1000);
		await page.waitForSelector(continueButton)
		await page.waitFor(1000);
		await page.click(continueButton)
		await page.waitFor(2000);

		const typeOfPosting = 'body > article > section > form > ul > li:nth-child(5) > label > span.right-side'
		await page.waitFor(1000);
		await page.waitForSelector(typeOfPosting)
		await page.waitFor(1000);
		await page.click(typeOfPosting)
		await page.waitFor(2000);
		console.log("type of posting selected")

		const continueButton2 = 'body > article > section > form > button'
		// await page.waitFor(3000);
		// await page.waitForSelector(continueButton2).catch(async e => {
		// 	console.log("redirect to =hcat")
		// 	let postingUrl = page.url().split('=')[0]+'=hcat'
		// 	await page.goto(postingUrl)
		// })
		// await page.waitFor(3000);
		// await page.click(continueButton2)
		// await clickOn(continueButton2, page)
		//await page.$x("//*[contains(text(), 'continue')]")[0].click();
		// await page.evaluate((selector) => document.querySelector(selector).click(), continueButton2);
		// console.log("type of posting clicked")



															  
		const realEstateSelector = '#new-edit > div > label > label:nth-child(11) > div > span'
		await page.waitFor(1000);
		await page.waitForSelector(realEstateSelector)
		await page.waitFor(1000);
		await page.click(realEstateSelector)
		await page.waitFor(2000);
		// await page.$x("//*[contains(text(), 'wanted: real estate')]")[0].click();
		console.log("wanted: real estate selected")

		const continueButton3 = '#new-edit > div > div.json-form-group.json-form-group-container.button > div > button'
		// await page.waitFor(3000);
		// await page.waitForSelector(continueButton3).catch(async e => {
		// 	console.log("redirect to =edit")
		// 	let postingUrl = page.url().split('=')[0]+'=edit'
		// 	await page.goto(postingUrl)
		// })
		// await page.waitFor(3000);
		// await page.click(continueButton3)
		// console.log("real estate clicked")
		// await page.click(continueButton3)


		// POSTING
		// const postingTitle = "We purchase any house under $350,000"
		const titleSelector = '#PostingTitle'
		await page.waitFor(1000);
		await page.waitForSelector(titleSelector)
		await page.waitFor(1000);
		await page.type(titleSelector, postingTitle)

		// const cityOrN = 'Anywhere in Dallas or Fort Worth Area'
		const cityOrNSelector = '#GeographicArea'
		// await page.waitFor(1000);
		await page.waitForSelector(cityOrNSelector)
		// await page.waitFor(1000);
		await page.type(cityOrNSelector, cityOrN)


		//const description = "We buy houses throughout North Texas. We offer fair prices and work with every situation. We have helped people who: just want to sell, don't want to deal with realtor fees, have a house that needs a bunch of work, inherited a property, never got a will, never probated, just probated, etc, etc. If we can't help for some odd reason, we will point you in the right direction!"
		const descriptionSelector = '#PostingBody'
		// await page.waitFor(1000);
		await page.waitForSelector(descriptionSelector)
		// await page.waitFor(1000);
		await page.type(descriptionSelector, description)


		const continueButton4 = '#new-edit > div > div.json-form-group.json-form-group-container.submit-buttons > div > button'
		// await page.waitFor(1000);
		try{
			await page.waitForSelector(continueButton4)
		} catch(e) {
			console.error(e)
		}
		// await page.waitFor(1000);
		await page.click(continueButton4)



		//POSTING IMAGE
		console.log("posting images")
		await page.waitFor(3000);
		try{
			await page.waitForSelector('#classic') 	
		} catch(e) {
			try{
				await page.waitForSelector('#modern') 	
			} catch(e) {
				console.log("ERRROR no classic no modern")
			}
		}



		await page.waitFor(1000);
		const linkHandlers = await page.$x("//*[contains(text(), 'Use classic image uploader')]").then(async r => {await r[0].click()}, 
			e => {console.log(e)});
		// console.log(linkHandlers[0])
		

		for(let i in pictures) {
			const imgAdress = pictures[i]
			//const imgAdress = '/Users/admin/Documents/WEB/craigslist/qq/pictures/'+pictures[i].split('/')[pictures[i].split('/').length-1]
			// console.log(imgAdress)
			const fileInputSelector = '#uploader > form > input[type=file]:nth-child(3)'
			await page.waitForSelector(fileInputSelector)
			await page.waitFor(2000);
			const input = await page.$(fileInputSelector);
			try{
				await input.uploadFile(imgAdress);
			} catch(e) {
				console.log("uploadImgError")
				console.error(e)
			}

			console.log("posted "+imgAdress)
		}


		const doneImgSelector = 'body > article > section > form > button'
		await page.waitFor(1000);
		try{
			await page.waitForSelector(doneImgSelector)
		} catch(e) {
			console.error(e)
		}

		await page.click(doneImgSelector)


		//PUBLISH
		console.log("publishing...")
		const publishSelector = '#publish_bottom > button'
		try{
			await page.waitForSelector(publishSelector).then(async r => {
				await page.click(publishSelector)
			})
		} catch(e) {
				console.error(e)
		}





		const resultUrlSelector = '#new-edit > div > div > ul > li:nth-child(1) > a' //#publish_bottom > button
		await page.waitFor(1000);

		await page.waitForSelector(resultUrlSelector)

		const resultUrl = await page.evaluate((resultUrlSelector) => {
		  return document.querySelector(resultUrlSelector).innerText
		}, resultUrlSelector);
		console.log("DONE")
		console.log(resultUrl)
		res.status(200).send(resultUrl).end();


	}	catch(e) {
		console.error("Error: ", e)
		res.sendStatus(400).send('Error').end();
	}

	//browser.close();
}


