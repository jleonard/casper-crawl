
var colorizer = require('colorizer').create('Colorizer');
var casper = require('casper').create(options);

var siteRoot,
    authUser,
    authPassword;

if(casper.cli.has(0)){
    siteRoot = casper.cli.get(0);
    if(siteRoot.charAt(siteRoot.length -1) == "/"){
        siteRoot = siteRoot.substring(0,siteRoot.length -1);
    }
    authUser = casper.cli.has("httpUser") ? casper.cli.get("httpUser") : "";
    authPassword = casper.cli.has("httpPassword") ? casper.cli.get("httpPassword") : "";
}else{
    casper.echo("No url specified : usage = casperjs crawl.js http://url-to-crawl.com --httpUser=User --httpPassword=Password","WARNING");
    casper.exit();
}

var options = {
  pageSettings : {
    userName : authUser,
    password : authPassword,
    loadImages: false
  }
}

var links = [];
var status;
var borked = 0;

function getLinks() {
    var flyouts = document.querySelectorAll('a');
    return Array.prototype.map.call(flyouts, function(e) {
        return e.getAttribute('href')
    });
}

casper.start(siteRoot, function() {
    this.echo("Scanning "+siteRoot,"GREEN_BAR");
    status = this.status().currentHTTPStatus;
});

casper.then(function() {
    links = this.evaluate(getLinks);
    var i = 0;
    casper.each(links,function(self,link){
        i++;
        if(link.length >= 2 && link.indexOf("javascript") != 0 && link.indexOf("#") != 0){
            if(link.indexOf("/") == 0){
                link = siteRoot + link;
            }
            self.thenOpen(link,function(){
                var msg = this.status().currentHTTPStatus + ": " + link;
                var color = "INFO";
                if(this.status().currentHTTPStatus > 400){
                    color = "WARNING";
                    borked++;
                }
                casper.echo(msg,color);
            });
        }
    });
});

casper.run(function() {
    // echo results in some pretty fashion
    var color = "GREEN_BAR";
    if(borked > 0){
        color = "RED_BAR";
    }
    this.echo("Finished "+ borked+ " broken pages found.",color);
});
