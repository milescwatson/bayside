var fs = require('fs');
var exampleSubPage = './examples/msa-order-children.html',
    jsdom = require("jsdom");

const { JSDOM } = jsdom;

var subPage = fs.readFileSync(exampleSubPage, {encoding: 'utf8'})

// .children [0] is header
var page = new JSDOM(subPage).window.document.body.children
console.log(JSON.stringify(page))


// page.forEach((v)=>{
//     console.log(v) 
// })