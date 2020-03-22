const cheerio = require('cheerio')
const fetch = require('node-fetch')

let ALZA_URL = 'https://www.alza.sk/eta-felix-1226-90000-d5689141.htm';
ALZA_URL = 'https://www.alza.sk/acer-aspire-3-shale-black-d5666679.htm';

const fn = async () => {
    const response = await fetch(ALZA_URL)
    const data = await response.text()
    
    const $ = cheerio.load(data)
    const currentPrice = $('.bigPrice','table#prices').text()
    const originalPrice = $('.crossPrice','table#prices').text()
    console.log(currentPrice);
    console.log(originalPrice)
    
    
    
    
}

fn()