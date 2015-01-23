# Crawl for CasperJS

A [CasperJS](http://casperjs.org/) script that crawls one or more pages on your site and tests for broken ``<a>``, ``<link>``, ``<script>`` and ``<img>`` links.

## Install Dependencies
Install [PhantomJs](http://phantomjs.org/) and [CasperJs](http://casperjs.org/)

## Installation  
```bash
npm install --save casper-crawl
```

## Basic Usage : Testing a single page
```bash
casperjs crawl.js http://my-website.com
```

## Testing multiple pages on a website 
```bash
casperjs crawl.js http://my-website.com --pages=about,contact,careers/apply
```  
This will test for broken urls on 
* ``http://my-website.com/about``  
* ``http://my-website.com/contact``  
* ``http://my-website.com/careers/apply``  

## Passing in http authentication variables
```bash
casperjs crawl.js http://my-website.com --httpUser=username --httpPassword=password
```

## Dealing with ssl issues over https

```bash
casperjs crawl.js --web-security=no --ignore-ssl-errors=true https://localhost:4000
```