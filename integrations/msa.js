var fs = require('fs'),
	https = require('follow-redirects').https,
	jsdom = require("jsdom"),
	HtmlTableToJson = require('html-table-to-json'),
	nodemailer = require('nodemailer'),
	DATA_PATH = './data.json'
	DEBUG_PATH = './examples/orders.html',
	DEBUG = false;

const { JSDOM } = jsdom;

class MSA {
	constructor(username, password){
		this.username = username;
		this.password = password;
		this.cookies = null;
		// this.getSession()
		// this.getOrdersPage()
	}

	async getRequestConfirmationToken(){
		var r = await fetch("https://us.msasafety.com/login", {
			"headers": {
			  "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
			  "accept-language": "en-US,en;q=0.9",
			  "cache-control": "no-cache",
			  "pragma": "no-cache",
			  "sec-ch-ua": "\"Google Chrome\";v=\"105\", \"Not)A;Brand\";v=\"8\", \"Chromium\";v=\"105\"",
			  "sec-ch-ua-mobile": "?0",
			  "sec-ch-ua-platform": "\"macOS\"",
			  "sec-fetch-dest": "document",
			  "sec-fetch-mode": "navigate",
			  "sec-fetch-site": "same-origin",
			  "sec-fetch-user": "?1",
			  "upgrade-insecure-requests": "1",
			  "Referer": "https://us.msasafety.com/",
			  "Referrer-Policy": "strict-origin-when-cross-origin"
			},
			"body": null,
			"method": "GET"
		  });
		  var text = await r.text();
		  const regex = /(name="_requestConfirmationToken" value=")+.{41}/;
		  const regex2 = /value=".+(")/;
		  return (text.match(regex)[0].match(regex2)[0].split("=")[1].replace(/"/g, ""))
	}

	async getSession(){
		// todo: Handle failure
		// convert username, password to % text format
		var response = await fetch("https://us.msasafety.com/j_spring_security_check", {
			"headers": {
			  "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
			  "accept-language": "en-US,en;q=0.9",
			  "cache-control": "no-cache",
			  "content-type": "application/x-www-form-urlencoded",
			  "pragma": "no-cache",
			  "sec-ch-ua": "\"Google Chrome\";v=\"105\", \"Not)A;Brand\";v=\"8\", \"Chromium\";v=\"105\"",
			  "sec-ch-ua-mobile": "?0",
			  "sec-ch-ua-platform": "\"macOS\"",
			  "sec-fetch-dest": "document",
			  "sec-fetch-mode": "navigate",
			  "sec-fetch-site": "same-origin",
			  "sec-fetch-user": "?1",
			  "upgrade-insecure-requests": "1",
			  "cookie": "username=",
			  "Referer": "https://us.msasafety.com/login",
			  "Referrer-Policy": "strict-origin-when-cross-origin"
			},
			"body": `j_username=kris%40baysidehvac.com&j_password=Bay%24ide2022%21&_j_rememberme=on&_requestConfirmationToken=${this.getRequestConfirmationToken()}`,
			"method": "POST",
			"redirect": "manual"
		  });
		var data = await response.headers;
		var text = await response.text();
		var setCookies = data.get('set-cookie');
		
		// var cookies =  setCookies.split(';').reduce((prev, current) => {
		// 	const [name, ...value] = current.split('=');
		// 	prev[name] = value.join('=');
		// 	return prev;
		// }, {});
	
		// return{
		// 	'JSESSIONID': cookies['JSESSIONID'],
		// 	'SECSESSIONID': cookies['Secure, SECSESSIONID'],
		// 	'lagrangeSession': cookies['Secure, lagrange_session']
		// }
		this.cookies = setCookies;
	}

	async getOrdersPage(){
		const resultingCookies = this.cookies.substr(0, cookiesHeader.length-8);

		// Prime the pump by visiting home first with this session. Neccesary to prevent redirect to home during subsequent /orders request
		var r = await fetch("https://us.msasafety.com/my-account/home/", {
			"headers": {
				"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
				"accept-language": "en-US,en;q=0.9",
				"cache-control": "no-cache",
				'cookie': resultingCookies, // remove ending httponly cookie
				"pragma": "no-cache",
				"sec-ch-ua": "\"Google Chrome\";v=\"105\", \"Not)A;Brand\";v=\"8\", \"Chromium\";v=\"105\"",
				"sec-ch-ua-mobile": "?0",
				"sec-ch-ua-platform": "\"macOS\"",
				"sec-fetch-dest": "document",
				"sec-fetch-mode": "navigate",
				"sec-fetch-site": "same-origin",
				"sec-fetch-user": "?1",
				"upgrade-insecure-requests": "1",
				"Referer": "https://us.msasafety.com/",
				"Referrer-Policy": "strict-origin-when-cross-origin"
			},
			"body": null,
			"method": "GET"
			});
		var text = await r.text();

		var options = {
			'method': 'GET',
			'hostname': 'us.msasafety.com',
			'path': '/my-account/orders?searchByNumber=false&searchByDate=last-six-months&inProcessOnly=false&sortVal=orderDate&asc=false',
			'headers': {
			'authority': 'us.msasafety.com',
			'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
			'accept-language': 'en-US,en;q=0.9',
			'cache-control': 'no-cache',
			'cookie': resultingCookies, // remove ending httponly cookie
			'pragma': 'no-cache',
			'referer': 'https://us.msasafety.com/my-account/orders',
			'sec-ch-ua': '"Google Chrome";v="105", "Not)A;Brand";v="8", "Chromium";v="105"',
			'sec-ch-ua-mobile': '?0',
			'sec-ch-ua-platform': '"macOS"',
			'sec-fetch-dest': 'document',
			'sec-fetch-mode': 'navigate',
			'sec-fetch-site': 'same-origin',
			'sec-fetch-user': '?1',
			'upgrade-insecure-requests': '1',
			'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36'
			},
			'maxRedirects': 20
		};
		
		var ordersHTML;

		var req = https.request(options, function (res) {
			var chunks = [];
		
			res.on("data", function (chunk) {
			chunks.push(chunk);
			});
		
			res.on("end", function (chunk) {
				var body = Buffer.concat(chunks);
				ordersHTML = body.toString();
			});
		
			res.on("error", function (error) {
			console.error(error);
			});
		});
		req.end();


	}

	async storeOrders(ordersHTML){
		ordersHTML = fs.readFileSync(DEBUG_PATH, {encoding: 'utf8'}) // TEST
		var ordersTable = new JSDOM(ordersHTML).window.document.getElementById('itemList').outerHTML;

		var ordersNew = HtmlTableToJson.parse(ordersTable).results[0]
		var data = JSON.parse(fs.readFileSync(DATA_PATH, {encoding: 'utf8'}))

		var changes = []

		if(!data.stored){
			// nothing stored yet. Just store the initial
			data.stored = ordersNew
		}else {
			var ordersOld = data.stored
			// now we have old and new, so need to compare. For i in new basically
			for(var i in ordersNew){
				// don't worry about "new order added" situation
				if(ordersNew[i]){
					if(ordersNew[i]['Order Date'] !== data.stored[i]['Order Date']){
						changes.push({
							old: data.stored[i]['Order Date'],
							new: ordersNew[i]['Order Date']
						})
					}
				}
			}
			console.log('Changes = ', changes)

			// after comparing, send changes with an email
			// now, replace the old with the new in storage
			data.stored = ordersNew;

			// async..await is not allowed in global scope, must use a wrapper
			async function main() {
				// Generate test SMTP service account from ethereal.email
				// Only needed if you don't have a real mail account for testing
				let testAccount = await nodemailer.createTestAccount();
			
				// create reusable transporter object using the default SMTP transport
				let transporter = nodemailer.createTransport({
				host: "localhost",
				port: 25,
				secure: false, // true for 465, false for other ports
				tls: {
					rejectUnauthorized: false
				}
				});
			
				// send mail with defined transport object
				let info = await transporter.sendMail({
				from: '"Miles Watson" <miles@milescwatson.com>', // sender address
				to: "mc.watson415@gmail.com, miles@milescwatson.com", // list of receivers
				subject: "Hello ✔", // Subject line
				text: "Hello world?", // plain text body
				html: "<b>Hello world?</b>", // html body
				});
			
				console.log("Message sent: %s", info.messageId);
				// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
			
				// Preview only available when sending through an Ethereal account
				console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
				// Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
			}
			
			main().catch(console.error);

  
		}
		fs.writeFileSync('./data.json', JSON.stringify(data), {encoding: 'utf8'})

	}

}

var m = new MSA('username', 'password')
// m.parseOrdersPage()
m.storeOrders()