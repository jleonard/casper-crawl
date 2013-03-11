# Crawl for CasperJS #
A [CasperJS](http://casperjs.org/) script that crawls all the links on a page and reports the http status of each url request.

### Usage ###
```bash
casperjs crawl.js http://url-to-crawl.com --httpUser=User --httpPassword=Password
```
#### Arguments ####
* httpUser : username for http authentication
* httpPassword : password for http authentication