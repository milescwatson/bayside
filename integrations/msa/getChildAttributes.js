var fs = require('fs'),
    exampleSubPage = './examples/msa-order-children.html',
    jsdom = require("jsdom"),
    htmlparser2 = require("htmlparser2"),
    DATA_PATH = './data.json';

const { JSDOM } = jsdom;
var subPageExample = fs.readFileSync(exampleSubPage, {encoding: 'utf8'})
var dataStored = JSON.parse(fs.readFileSync(DATA_PATH, {encoding: 'utf8'}))

var getOrderPage = async (orderNumber)=>{
    var orderPageReq = await fetch("https://us.msasafety.com/my-account/order/"+orderNumber, {
        "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "no-cache",
            'cookie': dataStored.session,
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
    var orderPageHTML = await orderPageReq.text();
    return orderPageHTML;
}

exports.parseChildAttributes = async (orderNumber)=>{
    var getHTML = (query)=>{
        try{
            return query()
        }catch{
            return null
        }

    }

    console.log('parseChildAttributes with orderNumber ', orderNumber)
    var orderPageHTML = await getOrderPage(orderNumber);
    // .children [0] is header
    var dom = new JSDOM(orderPageHTML).window.document
    // var headerLength = dom.getElementsByClassName('msa-faux-table')[0].children[0].children.length;
    var rowLength = dom.getElementsByClassName('msa-faux-table')[0].children.length

    var rows = []

    for(var i = 1; i < rowLength; i++){
        // ultimately: need to turn html tree into objects. For now just need ship date changes to work

        // foreach row we need to parse each of the following:
        // partSearchCell
        // prices--view-order
        // availability
        // orderDetailsSubtotal
        var rowObject = {}
        var rowDom = getHTML( ()=>{return dom.getElementsByClassName('msa-faux-table')[0].children[i]});
        var item = getHTML(()=>{return rowDom.getElementsByClassName('partSearchCell')[0]});
        var unitPrice = getHTML( ()=>{return rowDom.getElementsByClassName('prices--view-order')[0]});
        var status = getHTML(()=>{return rowDom.getElementsByClassName('availability')[0]});
        
        rowObject.item = {
            'msa-part-number': getHTML(()=>{return item.children[0].innerHTML.split(':')[1].trim()}),
            'item-number': getHTML(()=>{return item.children[1].innerHTML.split(':')[1].trim()}),
            'description': getHTML(()=>{return item.children[2].innerHTML})
        }

        rowObject.unitPrice = {
            'your-price': getHTML(()=>{return unitPrice.children[0].children[0].innerHTML.replace('$', '')}),
            'list-price': getHTML(()=>{return unitPrice.children[2].innerHTML.replace('$', '')})
        }

        // todo: need to get to each of the status fields, e.g. 
        rowObject.status = {
            'status': getHTML(()=>{return status.children[1].innerHTML.trim()}),
            'qty': getHTML(()=>{return status.children[2].innerHTML.trim()}),
            'planned-ship-date': getHTML(()=>{return status.getElementsByClassName('shipDetails-data shipDetails--noInfo')[0].children[0].innerHTML.split(':')[1]}),
            'actual-ship-date': getHTML(()=>{return status.getElementsByClassName('shipDetails-data shipDetails--noInfo')[0].children[1].innerHTML.split(':')[1]})
        }
        rowObject.rawHTML = rowDom.innerHTML;
        rows.push({...rowObject})
    }
    rows.rawHTML = dom.getElementsByClassName('msa-faux-table')[0].innerHTML

    return rows
}