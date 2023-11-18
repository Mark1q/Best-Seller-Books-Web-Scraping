const puppeteer = require('puppeteer-extra')
const fs = require('fs');

const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

puppeteer.launch({ headless: false }).then(async (browser) => {
  const page = await browser.newPage()

  let arr = [];

  const delay = async (ms) => new Promise(r => setTimeout(r, ms));

  for(let i = 1 ; i <= 1 ; i ++){

    await delay(5000)

    await page.goto(`https://bookshop.org/categories/m/popular-books?page=${i}`);

    const booksLinks = await page.evaluate(() =>{
        let ok = Array.from(document.getElementsByClassName('cover-wrapper'))

        ok = ok.map((el) => el.getElementsByTagName('a')[0].href)

        return ok;
    })

    const booksLinksLength = await page.evaluate(() =>{
        return Array.from(document.getElementsByClassName('cover-wrapper')).length
    })

    
    for(let j = 0 ; j < booksLinksLength ; j ++){
        await delay(2000);
        await page.goto(booksLinks[j]);

        const data = await page.evaluate(() =>{
           
            const name = document.querySelector('[itemprop=name]').innerText;
            const author = document.querySelector('[itemprop=author]').innerText;
            const imageLink = document.querySelector('[itemprop=image]').getAttribute('src');

            let status = null;

            if(document.getElementsByClassName('text-accent').length != 0){
                status = document.getElementsByClassName('text-accent')[1].innerText;
            }

            let variantStatus = document.getElementById('variant-availability-label').innerText;
            if(variantStatus == status){
                variantStatus = null;
            }
           

            const textDescription = document.querySelector('[itemprop=description]').innerText;
            const description = textDescription.slice(textDescription.indexOf('\n') + 2);

            const bisacText = document.getElementById("taxon-crumbs").innerText;
            const bisacTextParsed = bisacText.slice(bisacText.indexOf('\n') + 1);
            const bisacCategoriesArray = bisacTextParsed.split('\n');

            let aboutAuthor = null;

            if( document.getElementsByClassName("space-y-4 show-lists").length != 0){
                aboutAuthor = document.getElementsByClassName("space-y-4 show-lists")[0].innerText;
            }
            
            let reviews = null;
            let reviewsArray = [];

            if(document.getElementsByClassName("reviews-list").length != 0){
                reviews = document.getElementsByClassName("reviews-list")[0].innerText.split('\n');
                for (let i = 0; i < reviews.length; i += 3) {
                  if (reviews[i]&& reviews[i + 1]) {
                    reviewsArray.push(reviews[i] + reviews[i + 1]);
                  }
                }
            }


            return {
                Price : [],
                Author : author,
                Book_Name : name,
                Book_Image : imageLink,
                Availability_Status : status,
                VariantStatus : variantStatus,
                Description : description,
                BISAC_Categories : bisacCategoriesArray,
                About_Author : aboutAuthor,
                Reviews : reviews
            }
            
        })

        arr.push(data);

        const productDetails = await page.evaluate(() =>{
            const numberFormats = document.getElementsByClassName("grid-cols-3 gap-4 hidden lg:grid mb-4 whitespace-no-wrap")[0].querySelectorAll('a').length;

            let details = [];

    
        })
  }

  await browser.close();

  fs.writeFile('books.json', JSON.stringify(arr,null,2), 'utf-8', () => {
        console.log("Done.");
  });

  return arr;
}}).then(console.log)