const fs = require("fs")
const path = require("path")
const logger = require('./logger')

// User libs
const Crawler = require('./crawler')

//---- Config 
const siteURL = "https://www.cardekho.com"
const config = `${__dirname}/config.json`
const id = '36eDFYK_' // old id to resume
//---- ./Config


//---- App

  // Create instance of Crawler
  const crawler = new Crawler(siteURL, id)

  //   crawler.crawl()
  crawler.spiderURL()
  
  

//---- ./App