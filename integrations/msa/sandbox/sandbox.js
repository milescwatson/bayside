var fs = require('fs'),
    exampleSubPage = './examples/msa-order-children.html',
    jsdom = require("jsdom"),
    htmlparser2 = require("htmlparser2");

var diffObjects = function(prev, next){
  // go through next. Anything in prev that is undefined add +
  // For now, don't worry about things present in prev that are not present in next. E.g. deleted planned order date
  var changeList = [];

  var isDefined = (input)=>{
    try{
      if(typeof(input()) !== 'undefined'){
        return true
      }else{
        return false
      }
    }catch{
      return false
    }
  }

  var isEqual = (a, b)=>{
    try{
      if(a === b){
        return true
      }else{
        return false
      }
    }catch{
      return false
    }
  }

  for(var i = 0; i < next.length; i++){
    var orderID = next[i]['Order Number']
    var isFound = false;

    for(var j = 0; j < prev.length; j++){
      // New order: Does not exist in old
      // Changed order: Order Date changed
      // Changed order: Anything else changed

      if(prev[j]['Order Number'] === orderID){
        isFound = true;

        var changeObject = {...next[i]}
        
        // go through each subOrder. See if anything has changed

        Object.keys(next[i].subOrders).forEach((soKey)=>{
          var subOrderFromNext = next[i].subOrders[soKey];
          var subOrderFromPrev = prev[i].subOrders[soKey];
          if(subOrderFromNext.rawHTML !== subOrderFromPrev.rawHTML){
            // this is a pretty good guess at if something changed.
            // Figure out what changed
            if(!isEqual(subOrderFromNext.status['planned-ship-date'], subOrderFromPrev.status[['planned-ship-date']])){
              changeList.push({...changeObject, changeType: 'shipDate'})
            }else if(!isEqual(subOrderFromNext.status['status'], subOrderFromPrev.status[['status']])){
              changeList.push({...changeObject, changeType: 'status'})
            }else{
              changeList.push({...changeObject, changeType: 'other'})
            }
          }

        })

      }
    }

    if(!isFound){
      changeList.push({...next[i], changeType: 'new'})
    }
  }
  return changeList
}


diffObjects(JSON.parse(fs.readFileSync('./data1.json', {encoding: 'utf8'})).stored,  JSON.parse(fs.readFileSync('./data2.json', {encoding: 'utf8'})).stored)
