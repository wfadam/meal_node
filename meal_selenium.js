const {Builder, By, Key} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const bookMeal = async (nl_d, nc_m) => {
    let driver = new Builder().forBrowser('chrome')
//m8w4db    .setChromeOptions(new chrome.Options().headless())
    .build();
    try {
        // login
        await driver.get('http://cvppasip02/SPAS');
        driver.switchTo().frame(1);
        await driver.findElement(By.css('#txtPassword'))
        .sendKeys('password', Key.ENTER);

        // goto meal page
        await driver.switchTo().parentFrame();
        await driver.switchTo().frame(2); await new Promise((resolve, reject) => setTimeout(_ => resolve(), 3000));
        await driver.findElement(By.css('#linkMeal')).click();
        await driver.switchTo().parentFrame();
        await driver.switchTo().frame(2); await new Promise((resolve, reject) => setTimeout(_ => resolve(), 3000));

        // today and next meal
        await driver.findElement(By.css(`#cmbTheDate>option:nth-last-child(${nl_d})`)).click();
        await driver.findElement(By.css(`#cmbMealCode>option:nth-child(${nc_m})`)).click();
        await driver.findElement(By.css('#cmbMealName>option:nth-child(3)')).click();
        await driver.findElement(By.css('#cmdSubmit')).click();
    } catch(e) {
        console.error(e);
    } finally {
//m8w4db        driver.quit();
    }
};


const batchBook = async _ => {
        console.time('batchBook');
        try {
            await bookMeal(1, 2); // tomorrow, first meal
            await bookMeal(1, 3); // tomorrow, second meal
            //await bookMeal(2, 2); // today, first meal
            //await bookMeal(2, 3); // today, second meal
        } catch(e) {
            console.error(e);
        }
        console.timeEnd('batchBook');
        console.log(new Date().toLocaleString());
}

if(require.main === module) {
        batchBook();
        setInterval(batchBook, 24 * 3600 * 1000);
}
