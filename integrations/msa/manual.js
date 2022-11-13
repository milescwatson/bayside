/*
cookie from x
JSESSIONID=4921066D77CE3C7E47EB3B64620E7B21.worker3; Path=/; Secure; HttpOnly;SameSite=None;Secure, SECSESSIONID=92055898d1dfceb89e718dbc99f50174a20ca49c; Path=/; Secure; HttpOnly;SameSite=None;Secure, _hybris.tenantID_=; Max-Age=0; Expires=Thu, 01-Jan-1970 00:00:10 GMT; Path=/; HttpOnly;SameSite=None;Secure, JSESSIONID=4921066D77CE3C7E47EB3B64620E7B21.worker3; Path=/; HttpOnly;SameSite=None;Secure, acceleratorSecureGUID=c5c3e6f8ab0a437bb7831611ca3cf580fe774393; Path=/; Secure;SameSite=None;Secure, lagrange_session=97f4fb73-fbd1-4078-bf82-191663c3a83e; Path=/; Max-Age=1800; HttpOnly
*/
var setCookie = require('set-cookie-parser');


var session = async (username, password)=>{

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
  
  var rct = await getRequestConfirmationToken();
	var body = `j_username=${encodeURIComponent(username)}&j_password=${encodeURIComponent(password)}&j_rememberme=true&_j_rememberme=on&_requestConfirmationToken=${rct}`

  const response = await fetch("https://us.msasafety.com/j_spring_security_check", {
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
				"cookie": `username=dave@baysidehvac.com`,
				"Referer": "https://us.msasafety.com/login",
				"Referrer-Policy": "strict-origin-when-cross-origin"
			},
			// "body -PREV": `j_username=${encodeURIComponent(username)}&j_password=${encodeURIComponent(password)}&_j_rememberme=on&_requestConfirmationToken=fc12635f0c1b05ef608d668dc9d221308d120ab4`,
			"body": body,
			"method": "POST",
			"redirect": "manual"
	});
	var data = await response.headers;
	var setCookies = data.get('set-cookie');
	var cleanCookieString = '';

	setCookies.split(',').map((val)=>{return val.split(';')}).map((val)=>{return val[0].trim()}).map((val)=>{return val}).forEach((val)=>{cleanCookieString += val + ';'})

  console.log(cleanCookieString)

}


session('dave@bac.com', 'Rockrock1998!msa4');