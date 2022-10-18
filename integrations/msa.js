var fs = require('fs'),
	fetch = require('node-fetch'),
	https = require('follow-redirects').https,
	jsdom = require("jsdom"),
	HtmlTableToJson = require('html-table-to-json'),
	nodemailer = require('nodemailer'),
	email = require('./sendEmail.js'),
	DATA_PATH = './data.json',
	DEBUG_PATH = './examples/orders.html',
	DEBUG = false;

const { JSDOM } = jsdom;

class MSA {
	constructor(username, password){
		this.username = username;
		this.password = password;
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
		console.log('session text= ', text)
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
		// this.cookies = setCookies;
		return setCookies
	}

	async getOrdersPage(){
		console.log('Getting Session')
		var rawCookies = await m.getSession();
		console.log('rawCookies = ', resultingCookies)
		resultingCookies = rawCookies.substr(0, cookiesHeader.length-8);
		
		console.log('Priming Pump')
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
		console.log('Getting Orders Page')
		var ordersHTML;

		var req = https.request(options, function (res) {
			var chunks = [];
		
			res.on("data", function (chunk) {
				chunks.push(chunk);
			});
		
			res.on("end", function (chunk) {
				var body = Buffer.concat(chunks);
				ordersHTML = body.toString();
				return ordersHTML
			});
		
			res.on("error", function (error) {
				console.error(error);
			});
		});
		req.end();
	}

	async storeOrders(ordersHTML){
		var tableOfChanges = function(old, current) {
			var output = '<style>table, td, th {border: 1px solid;}</style>'
			output += '<table>'
			output += '<tr>'
			Object.keys(old).forEach((key) => {
				output += `<td>${key}</td>`
			})
			output += '</tr>'
			output += '<tr>'
			
			Object.keys(old).forEach((key) => {
				output += (old[key] !== current[key]) ? `<td style="color:red"> ${old[key]} --> ${current[key]}</td>` : `<td>${old[key]}</td>`
			})
			
			output += '</tr>'
			output += '</table>'
			return output
		}
		
		ordersHTML = await this.getOrdersPage();
		console.log('new ordersHTML = ', ordersHTML)
		// ordersHTML = fs.readFileSync(DEBUG_PATH, {encoding: 'utf8'}) // FOR TEST

		var ordersTable = new JSDOM(ordersHTML).window.document.getElementById('itemList').outerHTML;

		var ordersCurrent = HtmlTableToJson.parse(ordersTable).results[0]
		var data = JSON.parse(fs.readFileSync(DATA_PATH, {encoding: 'utf8'}))
		var htmlOutput = '';
		var isChange = false;
		if(!data.stored){
			// nothing stored yet. Just store the initial
			data.stored = ordersCurrent
		}else {
			var ordersOld = data.stored
			var changesHTML = '';
			// now we have old and current, so need to compare. For i in ordersOld, because new order alerts are handled basically
			for(var i in ordersOld){
				if(ordersOld[i] && JSON.stringify(ordersCurrent[i]) !== JSON.stringify(ordersOld[i])){
					isChange = true
					htmlOutput += tableOfChanges(ordersOld[i], ordersCurrent[i])
				}
			}

			// if there is at least 1 new order
			if(ordersCurrent.length > ordersOld.length){
				var recentOrders = []
				for(var i in ordersCurrent){
					if(JSON.stringify(ordersCurrent[i]) !== JSON.stringify(ordersOld[i])){
						recentOrders.push(ordersCurrent[i])
					}
				}
				var newOrdersHTML = '<h2>New Orders</h2>';
				newOrdersHTML += '<table>'

				//headers
				newOrdersHTML += '<th>'
				Object.keys(recentOrders[0]).forEach((key)=>{
					newOrdersHTML += `<td>${key}</td>`
				})
				newOrdersHTML += '</th>'

				recentOrders.forEach(function(value,roKey){
					newOrdersHTML += '<tr>'
					Object.keys(recentOrders[roKey]).forEach((key)=>{
						newOrdersHTML += `<td>${recentOrders[roKey][key]}</td>`
					})
					newOrdersHTML += '</tr>'
				})
				newOrdersHTML += '</table>'
				htmlOutput += newOrdersHTML
			}
			

			
			isChange ? email.send(['miles@milescwatson.com'], 'MSA Order Change Alert', htmlOutput) : email.send(['miles@milescwatson.com'], 'No Changes to MSA Orders', 'No Changes')
			// after comparing, send changes with an email
			// now, replace the old with the new in storage
			
			data.stored = ordersCurrent;
		}
		fs.writeFileSync('./data.json', JSON.stringify(data), {encoding: 'utf8'})

	}

}

var m = new MSA('username', 'password')
// m.storeOrders()
m.getSession()