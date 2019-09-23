var puppeteer = require('/usr/local/lib/node_modules/puppeteer')
const download = require('image-downloader')
const path = require('path');
//var puppeteer = require('puppeteer')
var headless = false

let getPictures = async() => {
	try{
		const browser = await puppeteer.launch({headless: headless});
		const page = await browser.newPage()
		await page.goto('https://dallas.craigslist.org/mdf/wan/6975410254.html')
		const imgDiv = '#thumbs'
		await page.waitForSelector(imgDiv)
		// await page.waitFor(2000);




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
	}
}
//getPictures()

  // 'https://images.craigslist.org/00e0e_jYBjAhsGgZO_600x450.jpg',
  // 'https://images.craigslist.org/00707_7PNdDoFpEhg_600x450.jpg',
  // 'https://images.craigslist.org/00808_3NTKb4XMF7I_600x450.jpg',
  // 'https://images.craigslist.org/00F0F_jEuIJy8bmQN_600x450.jpg',
  // 'https://images.craigslist.org/00A0A_jM5zgZiEl1X_600x450.jpg',
  // 'https://images.craigslist.org/00q0q_iLEvft6wV6O_600x450.jpg'


let uploadPic = async() => {
	const url = 'https://accounts.craigslist.org'
	const email = 'toby@forwardven.com'
	// const password = 'gfurfgryu4343'
	const password = 'Alpha123@!make123'
	const browser = await puppeteer.launch({headless: headless});
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


	await page.goto('https://post.craigslist.org/k/tFfB6ije6RGzvxC6kZ8_7Q?s=editimage')


	await page.waitForSelector('#classic')
	await page.waitFor(2000);
	const linkHandlers = await page.$x("//*[contains(text(), 'Use classic image uploader')]");
	// console.log(linkHandlers[0])
	await linkHandlers[0].click();


	const imgAdress = 'https://images.craigslist.org/00e0e_jYBjAhsGgZO_600x450.jpg'
	const fileInputSelector = '#uploader > form > input[type=file]:nth-child(3)'
	await page.waitForSelector(fileInputSelector)
	await page.waitFor(2000);
	const input = await page.$(fileInputSelector);
	await input.uploadFile(imgAdress);

	// const doneImgSelector = 'body > article > section > form > button'
	// await page.waitForSelector(doneImgSelector)
	// await page.click(doneImgSelector)



}
///uploadPic()
let downloadPictures = async(picturesURL) => {
	let pictures = []

	for(var i in picturesURL) {
		const options = {
		  url: picturesURL[i],
		  dest: path.join(__dirname + '/pictures'),             // Save to /path/to/dest/image.jpg
		  extractFilename: true
		}
	 
		await download.image(options)
		  .then(({ filename, image }) => {
		    console.log('Saved to', filename)  // Saved to /path/to/dest/image.jpg
		    pictures.push(filename)
		  })
		  .catch((err) => console.error(err))
		}
		return pictures
}

// let savedPictures = downloadPictures(['https://images.craigslist.org/00e0e_jYBjAhsGgZO_600x450.jpg', 'https://images.craigslist.org/00707_7PNdDoFpEhg_600x450.jpg', 'https://images.craigslist.org/00808_3NTKb4XMF7I_600x450.jpg']).then(function(res) {

// })


 getPictures().then(function(res) {
 	downloadPictures(res).then(function(pictures) {
 		console.log(pictures)
 	})
 })






