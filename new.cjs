const puppeteer = require('puppeteer-extra')
const fs = require('fs');

const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin())

puppeteer.launch({ headless: 'new' }).then(async (browser) => {
  const page = await browser.newPage()

  let arr = [];

  const delay = async (ms) => new Promise(r => setTimeout(r, ms));

  for(let i = 1 ; i <= 5 ; i ++){

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

            function funInnerText(element){
                if(element != null){
                    return element.innerText;
                }
                return null;
            }
           
            const name = funInnerText(document.querySelector('[itemprop=name]'));
            const author = funInnerText(document.querySelector('[itemprop=author]'));
            const imageLink = document.querySelector('[itemprop=image]').getAttribute('src');

            /*let status = null;

            if(document.getElementsByClassName('text-accent').length != 0){
                status = document.getElementsByClassName('text-accent')[1].;
            }

            let variantStatus = document.getElementById('variant-availability-label').;
            if(variantStatus == status){
                variantStatus = null;
            }*/
           

            const textDescription = funInnerText(document.querySelector('[itemprop=description]'));
            const description = textDescription.slice(textDescription.indexOf('\n') + 2);

            const bisacText = funInnerText(document.getElementById("taxon-crumbs"));
            const bisacTextParsed = bisacText.slice(bisacText.indexOf('\n') + 1);
            const bisacCategoriesArray = bisacTextParsed.split('\n');

            const aboutAuthor = funInnerText(Array.from(document.getElementsByClassName("space-y-4 show-lists"))[0]);

            /*if( document.getElementsByClassName("space-y-4 show-lists").length != 0){
                aboutAuthor = document.getElementsByClassName("space-y-4 show-lists")[0].;
            }*/
            
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
                Author : author,
                Book_Name : name,
                Book_Image : imageLink,
                Product_Details : [],
                Description : description,
                BISAC_Categories : bisacCategoriesArray,
                About_Author : aboutAuthor,
                Reviews : reviews
            }
            
        })

        arr.push(data);

        const linksLength = await page.evaluate(() =>{
            const ok = Array.from(document.getElementsByClassName("grid-cols-3 gap-4 hidden lg:grid mb-4 whitespace-no-wrap")[0].querySelectorAll('a'));
            return ok.length;
        })

        const formatLinks = await page.evaluate(() =>{
            const formatsLinks = Array.from(document.getElementsByClassName("grid-cols-3 gap-4 hidden lg:grid mb-4 whitespace-no-wrap")[0].querySelectorAll('a'));
            
            return formatsLinks.map((el) => el.href);
        })

        let details = [];

        for(let y = 0 ; y < linksLength ; y ++){
            await delay(3000);

            if(linksLength != 1){
                await page.goto(formatLinks[y]);
            }

            const money = await page.evaluate(() =>{
                function funInnerText(element){
                    if(element != null){
                        return element.innerText;
                    }
                
                    return null;
                }

                const availabilityLink = document.querySelector('[itemprop=availability]').content;
                const availabilityStatus = availabilityLink.slice(availabilityLink.lastIndexOf('/') + 1);
                

                let pricesTextArray = funInnerText(document.querySelector('[itemprop=offers]'),)
                if(pricesTextArray != null){
                    pricesTextArray = pricesTextArray.split(' ');
                }

                let prices = [];
                let primaryPrice = null;
                let discountedPrice = null;

                if(pricesTextArray.length == 1){
                    primaryPrice = pricesTextArray[0];
                }
                else{
                    primaryPrice = pricesTextArray[0];
                    discountedPrice = pricesTextArray[1];
                }

                prices.push({Primary_Price : primaryPrice,Discounted_Price : discountedPrice});

                const publisher = funInnerText(document.querySelector('[itemprop=publisher]'));
                const datePublished = funInnerText(document.querySelector('[itemprop=datePublished]'));
                const numberPages = funInnerText(document.querySelector('[itemprop=numberOfPages]'));
                const dimensions = funInnerText(document.querySelector('[itemprop=size]'));
                const language = funInnerText(document.querySelector('[itemprop=inLanguage]'));
                const bookFormat = funInnerText(document.querySelector('[itemprop=bookFormat]'));
                const ean_upcCode = funInnerText(document.querySelector('[itemprop=isbn]'));

                return{
                    Availability_Status : availabilityStatus,
                    Price : prices,
                    Publisher : publisher,
                    Date_Published : datePublished,
                    Pages : numberPages,
                    Dimensions : dimensions,
                    Language : language,
                    Format : bookFormat,
                    EAN_UPC_Code : ean_upcCode
                }
            })

            details.push(money);
        }

        arr[j]['Product_Details'] = details;
    }
  }
  
  await browser.close();

  fs.writeFile('books.json', JSON.stringify(arr,null,2), 'utf-8', () => {
        console.log("Done.");
  });

  return arr;
}).then(console.log)

/*let status = null;

            if(document.getElementsByClassName('text-accent').length != 0){
                status = document.getElementsByClassName('text-accent')[1].;
            }

            let variantStatus = document.getElementById('variant-availability-label').;
            if(variantStatus == status){
                variantStatus = null;
            }*/
