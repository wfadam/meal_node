const httpntlm = require('httpntlm');
const ntlmAuth = require("./ntlmAuth.js").options;
const spasAuth = require("./spasAuth.js").options;
const isHoliday = require('./holidays.js').isHoliday;

const MEAL_DATE = daysAhead(1);
const MEAL_TIME = 'M1:午餐';//or 'M2:晚餐'

const commonFormData = {
	__EVENTARGUMENT: '',
	__LASTFOCUS: '',
	cmbTheDate: toDateString(MEAL_DATE),
	cmbMealCode: MEAL_TIME,
	cmbDateOfActualOrder: toDateString(daysAhead(0)),
	cmbCodeOfActualOrder: 'M1:午餐',
	txtQtyOfActualOrder: 0
}

function summary(badgeID, response) {
	let lines = response.body.split('\r\n');
	for(let record of lines) {
		if(record.includes(badgeID)) {
			let row = [toDateString(MEAL_DATE), spasAuth.txtBadgeID];
			let nextPos = 0;
			let found = undefined;
			while(found = record.substr(nextPos).match(/[^\u0000-\u007F]+/)) {
				row.push(found[0]);
				nextPos += found[0].length + found['index'];
			}
			console.log(row);
		}
	}
}

function sendData(method, params) {
	return (resolve, reject) => {
		httpntlm[method](params, (err, res) => {
			if(err) reject(err);
			resolve(res);
		});
	};
}

function submitMeal(response) {
	let paramOfMealSubmit = Object.assign({
		__EVENTTARGET: '',
		cmdSubmit: '本人订餐',
		cmbMealName: 'F1:米饭',
	}, commonFormData);

	let dateStr = toDateString(MEAL_DATE);
	return sendData('post', 
		Object.assign({url: `http://cvppasip02/SPAS/Meal/Meal.aspx?d=${dateStr}`}, ntlmAuth,
			{cookies:COOKIE},
			{parameters: Object.assign(viewStats(response.body), paramOfMealSubmit)}));
}

function setMealTime(response) {
	let paramOfMealTime = Object.assign({
		__EVENTTARGET: 'cmbMealCode',
		cmbMealName: '',
	}, commonFormData);

	return sendData('post', 
		Object.assign({url: `http://cvppasip02/SPAS/Meal/Meal.aspx`}, ntlmAuth,
			{cookies:COOKIE},
			{parameters: Object.assign(viewStats(response.body), paramOfMealTime)}));
}

function setMealDate(response) {
	let dateStr = toDateString(MEAL_DATE);
	return sendData('get', 
		Object.assign({url: `http://cvppasip02/SPAS/Meal/Meal.aspx?d=${dateStr}`}, ntlmAuth,
			{cookies:COOKIE}));
}

function loginSPAS(response) {
	return sendData('post', 
		Object.assign({url: 'http://cvppasip02/SPAS/FormLeft.aspx'}, ntlmAuth,
			{parameters: Object.assign(viewStats(response.body), spasAuth)}));
}

function openSPAS() {
	return sendData('get',
		Object.assign({url: 'http://cvppasip02/SPAS/FormLeft.aspx'}, ntlmAuth));
}

function viewStats(html) {
	let view = {};
	let lines = html.split('\r\n');
	for (let line of lines) {
		if (line.includes('__VIEWSTATE') 
			|| line.includes('__VIEWSTATEGENERATOR')
				|| line.includes('__EVENTVALIDATION')) {

					let name = line.match(/id="(\w+)"/)[1]
					let value = line.match(/value="([^\"]+)"/)[1]
					view[name] = value;
				}
	}
	return view;
}

function daysAhead(numOfDay) {
	let date = new Date();
	date.setDate(date.getDate()+numOfDay); 
	return date;
}

function toDateString(theDate) {
	return theDate.toISOString().slice(0,10);
}

if(isHoliday(MEAL_DATE)) {
	console.log(`${toDateString(MEAL_DATE)} is skipped`);
	return;
}

var COOKIE = undefined;

new Promise(openSPAS())
	.then((response) => {
		return new Promise(loginSPAS(response));
	})
	.then((response) => {
		COOKIE = response.cookies;
		return new Promise(setMealDate(response));
	})
	.then((response) => {
		return new Promise(setMealTime(response));
	})
	.then((response) => {
		return new Promise(submitMeal(response));
	})
	.then((response) => {
		summary(spasAuth.txtBadgeID, response);
	})
	.catch((err) => {
		console.log(err);
	});

