# Crawl for CasperJS

A [CasperJS](http://casperjs.org/) script that crawls one or more pages on your site and tests for broken anchor, link, script and image links.

## Basic Usage : Testing a single page
```bash
casperjs crawl.js http://my-website.com
```

## Testing multiple pages on a website 
```bash
casperjs crawl.js http://my-website.com --pages=about,contact,careers/apply
```  
This will iterate over ``http://my-website.com/about``, ``http://my-website.com/contact`` and ``http://my-website.com/careers/apply`` and test for broken links on each page.  

## Passing in http authentication variables
```bash
casperjs crawl.js http://my-website.com --httpUser=username --httpPassword=password
```