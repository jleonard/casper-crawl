var colorizer = require('colorizer').create('Colorizer');
var casper = require('casper').create(options);

// cli options
var siteRoot;
var authUser;
var authPassword;
var crawlUrls = [];
var borked = [];

var crawlCounts = {
  pages: 0,
  css : 0,
  js : 0,
  images : 0
};

var options = {
  pageSettings : {
    userName : authUser,
    password : authPassword,
    loadImages: false
  }
}

function uniqueValues(a){
   var u = {}, a = [];
   for(var i = 0, l = this.length; i < l; ++i){
      if(u.hasOwnProperty(this[i])) {
         continue;
      }
      a.push(this[i]);
      u[this[i]] = 1;
   }
   return a;
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
  //console.log('arr is',arr);
  crawlUrls = crawlUrls.concat(arr);
  //console.log('crawlUrls are ',crawlUrls);
  crawlCounts.pages = crawlUrls.length;
}else{
  casper.die('No url specified : usage = casperjs crawl.js http://url-to-crawl.com --pages=one/,two/,three/ --httpUser=User --httpPassword=Password',1);
  casper.exit();
}

casper.start().eachThen(crawlUrls, function(response) {
  this.thenOpen(response.data, function(response) {
    var color = 'INFO';
    this.echo('Inspecting '+response.url,color);
    if(response.status === 200){
      // get the links
      var links = this.evaluate(getLinks);
      
      casper.each(links,function(self,link){
        if(link && link.indexOf('#') !== 0){
          if(link.indexOf('http') !== 0){
            link = link.indexOf('/') === 0 ? siteRoot + link : response.data + link;
          }
          crawlUrls.push(link);
          crawlCounts.pages++;
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
          crawlCounts.images++;
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
          crawlCounts.css++;
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
          crawlCounts.js++;
        }
      });
    }else{
      casper.echo(response.data + ' returned ' + response.status ,'WARNING');
    }
  });
});

casper.then(function(){

  this.echo(' ',color);

  var color = 'INFO';

  this.echo('Checking '+crawlCounts.pages+' pages',color);
  this.echo('------------------------------------------',color);

  this.echo('Checking '+crawlCounts.css+' css files',color);
  this.echo('------------------------------------------',color);

  this.echo('Checking '+crawlCounts.js+' .js files',color);
  this.echo('------------------------------------------',color);

  this.echo('Checking '+crawlCounts.images+' images',color);
  this.echo('------------------------------------------',color);

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