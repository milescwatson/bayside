const { resolve } = require('path');

var fs = require('fs'),
	fetch = require('node-fetch'),
	jsdom = require("jsdom"),
	HtmlTableToJson = require('html-table-to-json'),
	email = require('./sendEmail.js'),
	DATA_PATH = './data.json';

const { JSDOM } = jsdom;

var isLoggedIn = function(htmlstring){
    var title = '';
    try{
        title = new JSDOM(htmlstring).window.document.title;
    }catch(error){
        title = null
    }
    if(title === 'View Orders | MSA Safety | United States'){
        return true
    }else{
        return false
    }
}

var getSession = async function(username, password){
	console.log('getSession()')
	var getRequestConfirmationToken = async function(){
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
		"body": `j_username=${encodeURIComponent(username)}&j_password=${encodeURIComponent(password)}&_j_rememberme=on&_requestConfirmationToken=${getRequestConfirmationToken()}`,
		"method": "POST",
		"redirect": "manual"
	});

	var data = await response.headers;

	var setCookies = data.get('set-cookie');
	var dataStored = JSON.parse(fs.readFileSync(DATA_PATH, {encoding: 'utf8'}))
	dataStored.session =  setCookies;

	fs.writeFileSync('./data.json', JSON.stringify(dataStored), {encoding: 'utf8'})

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
	// console.log('setCookies = ', setCookies)
	return(setCookies)
}

var getOrdersPage = async function(username, password){
	// Gets orders page, if that does not work generate a new session
	var dataStored = JSON.parse(fs.readFileSync(DATA_PATH, {encoding: 'utf8'}))

	var getOrdersText = async function(session){
		var resultingCookies = '';
		if(typeof(session) !== 'undefined'){
			resultingCookies = session.substr(0, session.length-8);
		}

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
		var reqOrdersPage = await fetch('https://us.msasafety.com/my-account/orders?searchByNumber=false&searchByDate=last-six-months&inProcessOnly=false&sortVal=orderDate&asc=false', {
			"headers": {
				'authority': 'us.msasafety.com',
				'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
				'accept-language': 'en-US,en;q=0.9',
				'cache-control': 'no-cache',
				'cookie': session, // remove ending httponly cookie
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
			"body": null,
			"method:": "GET"
		});
		var ordersText = await reqOrdersPage.text();
		return ordersText;
	}

	var ordersText = await getOrdersText(typeof(dataStored.session) === 'undefined' ? '' : dataStored.session)
	if(isLoggedIn(ordersText) && typeof(dataStored.session) !== 'undefined'){
		console.log('Session valid. Returning orders page html.')
		return ordersText
	}else{
		// generate new session.
		console.log('Session invalid. Generating new session')
		var session = await getSession(username, password)
		return getOrdersText(dataStored.session)
	}
}

var processChanges = async function(username, password){
	var diffObjects = function(prev, next) {
		var changeList = []
		for(var i = 0; i < next.length; i++){
		  
		  var orderID = next[i]['Order Number']
		  var isFound = false;
		  prev.forEach(function(comparison){
			// New order: Does not exist in old
			// Changed order: Order Date changed
			// Changed order: Anything else changed
			if(comparison['Order Number'] === orderID){
			  isFound = true;
			  var isChanged = false;
			  var changeObject = {...next[i]}
			  Object.keys(next[i]).forEach((nKey)=>{
				if(next[i][nKey] === comparison[nKey]){
				  changeObject[nKey] = next[i][nKey]
				}else{
				  changeObject[nKey] = comparison[nKey] + ' --> ' + next[i][nKey]
				  if(nKey = 'Order Date'){
					changeObject.changeType = 'date'
				  }
				  isChanged = true
				}
			  })
			  if(isChanged){
				changeList.push(changeObject)
			  }
			}
		  })
		  if(!isFound){
			changeList.push({...next[i], 'changeType': 'new'})
		  }
		}
		return changeList
	  }
	
	var ordersHTML = await getOrdersPage(username, password);
	// ordersHTML = fs.readFileSync(DEBUG_PATH, {encoding: 'utf8'}) // FOR TEST
	// console.log(ordersHTML)
	
	var ordersTable = null
	
	try{
		ordersTable = new JSDOM(ordersHTML).window.document.getElementById('itemList').outerHTML;
	}catch(error){
		return {
			errorMessage: 'Error at parsing orders HTML. Likely due to sign in issue.',
			ordersTable: null,
			error: error
		}
	}

	var ordersCurrent = HtmlTableToJson.parse(ordersTable).results[0]
	var data = JSON.parse(fs.readFileSync(DATA_PATH, {encoding: 'utf8'}))
	var isChange = false;
	if(!data.stored){
		// nothing stored yet. Just store the initial
		data.stored = ordersCurrent
	}else {
		var ordersOld = data.stored
		var changesHTML = '';
		// now we have old and current, so need to compare. For i in ordersOld, because new order alerts are handled basically

		var changeList = diffObjects(ordersOld, ordersCurrent)
		console.log('changeList = ', changeList)
		changeList.forEach((changeObject)=>{
			var htmlOutput = '';
			htmlOutput += '<table style="border: 1px solid black; border-collapse: collapse" >';
			//headers
			htmlOutput += '<tr style="border: 1px solid black">';
			Object.keys(changeObject).forEach((key)=>{
				if(key !== 'changeType'){
					htmlOutput += `<td style="border: 1px solid black">${key}</td>`
				}
			})
			htmlOutput += '</tr>';
			// tds
			htmlOutput += '<tr style="border: 1px solid black">';
			Object.keys(changeObject).forEach((key) => {
				if(key !== 'changeType'){
					htmlOutput += `<td style="border: 1px solid black">${changeObject[key]}</td>`;
				}
			});
			htmlOutput += '</tr>';
			htmlOutput += '</table>';

			if(changeObject.changeType === 'new'){
				email.send(['miles@milescwatson.com'], `New MSA Order #${changeObject['Order Number']} for ${changeObject['Ship To']}`, htmlOutput);
			}else if(changeObject.changeType === 'date'){
				email.send(['miles@milescwatson.com'], `Date Change for MSA Order #${changeObject['Order Number']} from ${changeObject['Order Date']}`, htmlOutput);
			}else{
				email.send(['miles@milescwatson.com'], `Change for MSA Order #${changeObject['Order Number']}`, htmlOutput);				
			}
			
		})

		if(changeList.length === 0){
			console.log('No Changes')
		}

		// now, replace the old with the new in storage
		data.stored = ordersCurrent;
	}
	fs.writeFileSync('./data.json', JSON.stringify(data), {encoding: 'utf8'})
}

processChanges('dave@baysidehvac.com', 'Rockrock1998!msa4')
// processChanges('john@johnsoncontrols.com', 'Rockrock1998!msa4')