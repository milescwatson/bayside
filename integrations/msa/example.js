var orders = './examples/orders.html';
var redirToLogin = './examples/redirected-to-login.html';
const { DataSync, FileSystemCredentials } = require('aws-sdk');
const { setDefaultResultOrder } = require('dns');
var fs = require('fs');
var jsdom = require("jsdom");
const { DefaultSerializer } = require('v8');
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

console.log(isLoggedIn(fs.readFileSync(redirToLogin, {encoding: 'utf8'})))