const puppeteer = require('puppeteer');
const DAY = 24 * 3600 * 1000;
const dstr = (msec = Date.now()) => new Date(msec).toISOString().substr(0, 10);

async function doNavi(fn, selector, value, navi = false) {
    await this['waitFor'](selector, {visible: true});
    await this[fn](selector, value);
    if(navi) await this['waitForNavigation']({waitUntil: 'networkidle0'});
}

async function submitMeal(mealTime) {
    await doNavi.call(this, 'type', '#cmbMealCode', mealTime, true); 
    await doNavi.call(this, 'type', '#cmbMealName', 'F1:米饭');
    await doNavi.call(this, 'click', '#cmdSubmit', true);
}

async function displayResult(uid = '') {
    let arr = await this['evaluate'](badgeId => {
        let trs = document.querySelectorAll('tr[align][style]');
        return [].filter.call(trs, e => e.innerText.includes(badgeId))
                         .map(e => e.innerText.replace(/[\t]+/g, ' '));
    }, uid);
    console.log(arr);
}

async function bookMeal(msec = Date.now()) {
    let browser;
    try {
        browser = await puppeteer.launch({headless: false});
        const [page] = await browser.pages();
        await page.goto('http://cvppasip02/SPAS');
        const frames = await page.frames();
        await doNavi.call(frames[2], 'type', '#txtPassword', 'password');
        await doNavi.call(frames[2], 'click', '#cmdLogin', true);
        await doNavi.call(frames[3], 'click', '#linkMeal');
        await doNavi.call(frames[3], 'type', '#cmbTheDate', dstr(msec), true);
        await submitMeal.call(frames[3], 'M1:午餐');
        await submitMeal.call(frames[3], 'M2:晚餐');
        const badgeId = await frames[2].$eval('#lblUserInfo', e => e.title);
        await displayResult.call(frames[3], badgeId);
    } catch(e) {
        console.error(e);
    } finally {
        browser.close();
    }
};

async function batchBook() {
    const t0 = Date.now();
    await bookMeal(Date.now() + DAY);
    console.log(new Date().toLocaleString(), '>', (Date.now() - t0), 'mS');
    setTimeout(batchBook, DAY);
}

if(require.main === module) {
    batchBook();
}
