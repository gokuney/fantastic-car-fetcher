const puppeteer = require("puppeteer")
const cheerio = require("cheerio")
const fs = require("fs")
const path = require("path")
const shortid = require("shortid")
const logger = require('./logger')(module)

module.exports = class Crawler {
  
  constructor(url, id){
    
    logger.info(`Crawler inited`)
    
    //Create outpur dir if not there 
    if( !fs.existsSync(path.join(__dirname, `../output`)) )
      fs.mkdirSync( path.join(__dirname, `../output`) )
    
    // Check if this is new session or existing one 
    if(!url)
       throw new Error(`Missing URL to crawl`)
    
    this.url = url
    
    // Get the crawl task id 
    this.id = id || shortid.generate();
    
    // Get/Create the config
    if( fs.existsSync(path.join(__dirname, `../output/${this.id}`)) ){
      logger.info(`ID ${this.id} exists`)
      this.config = JSON.parse( fs.readFileSync( path.join(__dirname, `../output/${this.id}/config.json`) ).toString() )
    } else{
      logger.info(`Creating new project with id ${this.id}`)
      fs.mkdirSync( path.join(__dirname, `../output/${this.id}/` ) )
      fs.writeFileSync( path.join(__dirname, `../output/${this.id}/config.json`), JSON.stringify( {id: this.id}, null, 4 ) )
      this.config = {id: this.id}
    }
    
    this.projectDir = path.join(__dirname, `../output/${this.id}/` )
    
  }
  
  saveData(){
    fs.writeFileSync( path.join(__dirname, `../output/${this.id}/config.json`), JSON.stringify( this.config, null, 4 ) )
    logger.info(`Data saved`)
  }
  
  crawl(){
    
    let self = this
    logger.info(`Crawling....`);
    (async () => {
      
      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      await page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
      });
      
      // Open page
      logger.info(`Opening page ${self.url}`)
      await page.goto(self.url);
      
//       const content = await page.content();
      
//       const $ = cheerio.load(content);

      // Click on new Car
      // DOMREF: document.querySelectorAll('input[name="newcar"]')[1].click()
      
      logger.info(`Clicking on new car radio button`)
      await page.evaluate( () => {
        let ele = document.querySelectorAll('input[name="newcar"]')[1];
        ele.click();
      })
      
      await page.waitFor(1000);
      
      // Click on cars drop down
      // DOMREF: #bmvBrand
      logger.info(`Clicking on car brands's drop down`)
      await page.evaluate( () => {
        let ele = document.querySelector('#bmvBrand');
        ele.click();
      });
      
      await page.waitFor(1000);
      
      // Get the list of cars
      // DOMREF: .gs_ta_results .gs_ta_group-child
      logger.info(`Making list of car brands`)
      let nBrands = await page.evaluate( () => { 
        let ele = document.querySelectorAll(".gs_ta_results .gs_ta_group-child")
        let arr = [];
        for( let i=0; i < ele.length; i++ ){
          let d = typeof ele[i].getAttribute("data-gs-ta-val") == "string" ? JSON.parse(ele[i].getAttribute("data-gs-ta-val")) : ele[i].getAttribute("data-gs-ta-val");
          d["models"] = [];
          arr.push( d )
        }
        return arr;
      } )
      
      // Save this 
      self.config["data"] = nBrands;
      
      self.saveData();
      
      //---- Click brand
      
      
      logger.info(`Re-selecting brand drop down `)
      var j = 0;
      while( j < self.config["data"].length){
        
        try{
        
         // Click on new Car
      // DOMREF: document.querySelectorAll('input[name="newcar"]')[1].click()
      try{
      logger.info(`Clicking on new car radio button`)
      await page.evaluate( () => {
        let ele = document.querySelectorAll('input[name="newcar"]')[1];
        ele.click();
      })
      }catch(e){
        logger.error(`Error ${e}`);
//         await page.screenshot({path: `${self.projectDir}error-debug.png`});
      }
        
        // Click on cars drop down
          // DOMREF: #bmvBrand
          await page.evaluate( () => {
            let ele = document.querySelector('#bmvBrand');
            ele.click();
          });
        
        logger.info(`Clicked ${self.config["data"][j].name}`)
        await page.waitFor(1000);
        // Click on brand 
        await page.evaluate( async (j) => {
          try{
          let brandEle = document.querySelectorAll(".gs_ta_results .gs_ta_group-child")[j]
          brandEle.click();
          }catch(e){
            logger.error(`Error in clicking item ${j}. Error: `, e)
          }
        }, j);
        
        
       logger.info(`Clicking on models' drop down`)
       // Click on models drop down
          // DOMREF: #bmvModel
          await page.evaluate( () => {
            let ele = document.querySelector('#bmvModel');
            ele.click();
          });
        
        await page.waitFor(1000);
        
        
        let nModels = await page.evaluate( () => {
        let ele = document.querySelectorAll(".gs_ta_results .gs_ta_group-child")
        let arr = [];
        for( let i=0; i < ele.length; i++ ){
          let m = typeof ele[i].getAttribute("data-gs-ta-val") == "string" ? JSON.parse(ele[i].getAttribute("data-gs-ta-val")) : ele[i].getAttribute("data-gs-ta-val");
          arr.push( m )
        }
        return arr;
      } )
        
        self.config["data"][j]["models"] = nModels;
        self.saveData();
        
        
        
        //Click on the model
        logger.info(`Iterating each model`)
        let jj = 0;
        while (jj < nModels.length){
          
           // Click on cars drop down
          // DOMREF: #bmvBrand
          await page.evaluate( () => {
            let ele = document.querySelector('#bmvBrand');
            ele.click();
          });
        
        await page.waitFor(1000);
        // Click on brand 
        await page.evaluate( async (j) => {
          try{
          let brandEle = document.querySelectorAll(".gs_ta_results .gs_ta_group-child")[j]
          brandEle.click();
          }catch(e){
            logger.error(`Error in clicking item ${j}. Error: `, e)
          }
        }, j);
        
        
       logger.info(`Clicking on models' drop down`)
       // Click on models drop down
          // DOMREF: #bmvModel
          await page.evaluate( () => {
            let ele = document.querySelector('#bmvModel');
            ele.click();
          });
        
        await page.waitFor(1000);
              
          logger.info(`Clicking on particular model ${self.config["data"][j].models[jj].name}`) 
          // Click on model
            await page.evaluate( async (jj) => {
              try{
              let modelsEle = document.querySelectorAll(".gs_ta_results .gs_ta_group-child")[jj]
              modelsEle.click();
              }catch(e){
                logger.error(`Error in clicking item ${jj}. Error: `, e)
              }
            }, jj);
          
          await page.waitFor(1000);
          
          //Submit the form
          logger.info(`Submitting the form....`)
          await page.evaluate( () => {
              let ele = document.querySelectorAll('#new_brand button')[0];
              ele.click();
            });

          //wait for 2.5 seconds
          await page.waitFor(2500);
          

//           console.log(`Took screenshot 1-${j}.png`)
//           await page.screenshot({path: `${self.projectDir}1-${j}.png`});
          logger.info(`Done Models  ${jj+1} of ${self.config["data"][j]["models"].length}`)
          
          let _url = await page.url();
          
          self.config["data"][j]["models"][jj]["url"] = _url;
          self.saveData();
          
          
//           await page.goBack();
          await page.goto(self.url);
          await page.waitFor(2500);
//           await page.screenshot({path: `${self.projectDir}debug-jj-is${jj}.png`});
        jj++;
        }//child loop for models
        await page.waitFor(2500);
//         await page.screenshot({path: `${self.projectDir}debug.png`});
//         console.log(`Done Brands  ${j+1} of ${self.config["data"].length}`)
//         await page.screenshot({path: `${self.projectDir}debug-j-is${j}.png`});
        j++; //parent loop for car brands
          
          }catch(e){
        logger.error(`Errored j ${j} jj ${jj}`)
      }
        
      }
      
      
      //---- ./Click brand 
      
      await page.waitFor(4000);
      
      // Take screenshot
//       await page.screenshot({path: `${self.projectDir}1.png`});

      await browser.close();
      logger.info(`All Done`)
     })();
    
  }
  
  
  spiderURL(){
    
    (async () => {
      
    let self = this
    let deviceConfig = self.config.data
    
    logger.info(`Spidering with ID ${self.id}'s config file ${deviceConfig.length}`)
    
    let j = 0;
    while( j < deviceConfig.length){
      let k = 0;
      while(k < deviceConfig[j].models.length){
          let url = deviceConfig[j].models[k].url;
          logger.info(`Processed Brand ${j+1}/${deviceConfig.length} | Model ${k+1}/${ deviceConfig[j].models.length }`)
          let data = await self.fetchFromURL(url)
          self.config.data[j].models[k].data = data;
          self.saveData();
        
        k++;
      }
      j++;
    }
    })();
  }
  
  fetchFromURL(url){
    logger.info(`Processing ${url}`)
    let self = this
    return new Promise( (resolve, reject) => {
      (async () => {
        
         const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      })
      let page = await browser.newPage()
      await page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
      })
      
      // Open page
      logger.info(`Opening page ${url}`)
      await page.goto(url)
        
//       await page.waitFor(4000);
      
      const contentMain = await page.content()
      
      const $ = cheerio.load(contentMain)
      
      let data = contentMain.match(new RegExp( "window.__INITIAL_STATE__" + "(.*?)" + "};"))[0].trim().replace(/(\r\n|\n|\r)/gm, "");
      data = JSON.parse( data.substring( data.indexOf('{'), data.lastIndexOf(";") ) )
        
      //Goto specs URL
      let specURL = `${self.url}/${data.modelNav[3].link}`
      
      await page.goto(specURL)
      
      const contentSpecs = await page.content()
      
      let dataSpecs = contentSpecs.match(new RegExp( "window.__INITIAL_STATE__" + "(.*?)" + "};"))[0].trim().replace(/(\r\n|\n|\r)/gm, "");
          dataSpecs = JSON.parse( dataSpecs.substring( dataSpecs.indexOf('{'), dataSpecs.lastIndexOf(";") ) )
        
      await browser.close()
        
      //Prepare car data
      let carData = {};
        
      carData.specs = dataSpecs.specsTechnicalJson
      carData.overview = {
        id: data.overView.id,
        priceRange: data.overView.priceRange,
        image: data.overView.image,
        gallery: data.overView.images,
        mileage:  {"heading": data.mileageTable.heading, "childs": data.mileageTable.childs},
        variant: {"heading": data.variantTable.heading, "childs": data.variantTable.childs}
      }
        
      resolve(carData)
        
      })();
    })
    
  }
  
}

