var colorizer = require('colorizer').create('Colorizer');
var casper = require('casper').create(options);

// cli options
var siteRoot;
var authUser;
var authPassword;
var crawlUrls = [];
var borked = [];

var options = {
  pageSettings : {
    userName : authUser,
    password : authPassword,
    loadImages: false
  }
}

function getLinks() {
  var els = document.querySelectorAll('a');
  return Array.prototype.map.call(els, function(e) {
    var attr = e.getAttribute('href');
    return attr;
  });
}

function getImages(){
  var els = document.querySelectorAll('img');
  return Array.prototype.map.call(els, function(e) {
    return e.getAttribute('src');
  });
}

function getCss(){
  var els = document.querySelectorAll('link');
  return Array.prototype.map.call(els, function(e) {
    return e.getAttribute('href');
  });
}

function getJs(){
  var els = document.querySelectorAll('script');
  return Array.prototype.map.call(els, function(e) {
    return e.getAttribute('src');
  });
}

if(casper.cli.has(0)){
  siteRoot = casper.cli.get(0);
  if(siteRoot.charAt(siteRoot.length -1) === '/'){
    siteRoot = siteRoot.substring(0,siteRoot.length -1);
  }
  crawlUrls.push(siteRoot);
  authUser = casper.cli.has('httpUser') ? casper.cli.get('httpUser') : '';
  authPassword = casper.cli.has('httpPassword') ? casper.cli.get('httpPassword') : '';
  arr = casper.cli.has('pages') 
  ? casper.cli.get('pages').split(',').map(
    function(cur,index,arr){
      var str = cur.indexOf('/') === 0 ? siteRoot + cur : siteRoot + '/' + cur;
      return str;
    }) 
  : [];
  crawlUrls.concat(arr);
}else{
  casper.die('No url specified : usage = casperjs crawl.js http://url-to-crawl.com --pages=one/,two/,three/ --httpUser=User --httpPassword=Password',1);
  casper.exit();
}

casper.start().eachThen(crawlUrls, function(response) {
  this.thenOpen(response.data, function(response) {
    console.log('Opened', response.url,response.status);
    if(response.status === 200){
      // get the links
      var links = this.evaluate(getLinks);
      casper.each(links,function(self,link){
        if(link && link.indexOf('#') !== 0){
          if(link.indexOf('http') !== 0){
            link = link.indexOf('/') === 0 ? siteRoot + link : response.data + link;
          }
          crawlUrls.push(link);
        }
      });
      // get the images
      links = this.evaluate(getImages);
      casper.each(links,function(self,link){
        if(link){
          if(link.indexOf('http') !== 0){
            link = link.indexOf('/') === 0 ? siteRoot + link : response.data + link;
          }
          crawlUrls.push(link);
        }
      });
      // get the css
      links = this.evaluate(getCss);
      casper.each(links,function(self,link){
        if(link){
          if(link.indexOf('http') !== 0){
            link = link.indexOf('/') === 0 ? siteRoot + link : response.data + link;
          }
          crawlUrls.push(link);
        }
      });
      // get the js
      links = this.evaluate(getJs);
      casper.each(links,function(self,link){
        if(link){
          if(link.indexOf('http') !== 0){
            link = link.indexOf('/') === 0 ? siteRoot + link : response.data + link;
          }
          crawlUrls.push(link);
        }
      });
    }else{
      casper.echo(response.data + ' returned ' + response.status ,'WARNING');
    }
  });
});

casper.then(function(){
  crawlUrls = crawlUrls.filter(function(item, pos) {
    return crawlUrls.indexOf(item) == pos;
  });
});

casper.then(function(){
  casper.each(crawlUrls,function(self,link){
    self.thenOpen(link,function(){
      var msg = this.status().currentHTTPStatus + ": " + link;
      var color = "INFO";
      if(this.status().currentHTTPStatus !== 200){
        color = "WARNING";
        borked.push(link);
      }
      casper.echo(msg,color);
    });
  });
});

casper.run(function() {
  var color = "GREEN_BAR";
  var len = borked.length;
  if(len > 0){
    color = "RED_BAR";
  }
  this.echo('------------------------------------------',color);
  this.echo("Finished with "+ len+ " broken urls found.",color);
  for(var ii = 0; ii < len; ii++){
    var cur = borked[ii];
    this.echo(cur,'WARNING');
  }
  this.exit();
});