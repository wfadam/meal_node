const ntlmAuth = require("../dynamics_api_node/auth.js").options;
const spasAuth = require("./spasAuth.js").options;
const httpntlm = require('httpntlm');
const isHoliday = require('./holidays.js').isHoliday;

const MEAL_DATE = daysAhead(1);
const MEAL_TIME = 'M1:午餐';//or 'M2:晚餐'

if(isHoliday(MEAL_DATE)) {
	console.log(`${MEAL_DATE.toISOString().slice(0,10)} is skipped`);
	return;
}

var cookie = undefined;

new Promise(openSPAS())
	.then((response) => {
		return new Promise(loginSPAS(response));
	})
	.then((response) => {
		cookie = response.cookies;
		return new Promise(setMealDate(response));
	})
	.then((response) => {
		return new Promise(setMealTime(response));
	})
	.then((response) => {
		return new Promise(submitMeal(response));
	})
	.then((response) => {
		summary(spasAuth.txtBadgeID, response)
	})
	.catch((err) => {
		console.log(err);
	});

function summary(badgeID, response) {
	let lines = response.body.split('\r\n');
	for(let record of lines) {
		if(record.includes(badgeID)) {
			let row = [MEAL_DATE.toISOString().slice(0,10), spasAuth.txtBadgeID];
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

function submitMeal(response) {
	return (resolve, reject) => {
		let dateStr = MEAL_DATE.toISOString().slice(0,10);
		httpntlm.post(
			Object.assign({url: `http://cvppasip02/SPAS/Meal/Meal.aspx?d=${dateStr}`}, ntlmAuth,
				{cookies:cookie},
				{parameters: Object.assign(viewStats(response.body), paramOfMealSubmit)}),
			function (err, res) {
				if(err) reject(err);
				resolve(res);
			});
	}
}


function setMealTime(response) {
	return (resolve, reject) => {
		httpntlm.post(
			Object.assign({url: `http://cvppasip02/SPAS/Meal/Meal.aspx`},
				ntlmAuth,
				{cookies:cookie},
				{parameters: Object.assign(viewStats(response.body), paramOfMealTime)}),
			function (err, res) {
				if(err) reject(err);
				resolve(res);
			});
	}
}

function setMealDate(response) {
	return (resolve, reject) => {
		let dateStr = MEAL_DATE.toISOString().slice(0,10);
		httpntlm.get(
			Object.assign({url: `http://cvppasip02/SPAS/Meal/Meal.aspx?d=${dateStr}`}, ntlmAuth,
				{cookies:cookie}),
			function (err, res){
				if(err) reject(err);
				resolve(res);
			});
	};
}

function loginSPAS(response) {
	return (resolve, reject) => {
		httpntlm.post(
			Object.assign({url: 'http://cvppasip02/SPAS/FormLeft.aspx'}, ntlmAuth,
				{parameters: Object.assign(viewStats(response.body), spasAuth)}),
			function (err, res){
				if(err) reject(err);
				resolve(res);
			});
	};
}

function openSPAS() {
	return (resolve, reject) => {
		httpntlm.get(
			Object.assign({url: 'http://cvppasip02/SPAS/FormLeft.aspx'}, ntlmAuth),
			function (err, res){
				if(err) reject(err);
				resolve(res);
			});
	};
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

const paramOfMealTime = {
	__EVENTTARGET: 'cmbMealCode',
	__EVENTARGUMENT: '',
	__LASTFOCUS: '',
	cmbTheDate: MEAL_DATE.toISOString().slice(0,10),
	cmbMealName: '',
	cmbMealCode: MEAL_TIME,
	cmbDateOfActualOrder: daysAhead(0).toISOString().slice(0,10),
	cmbCodeOfActualOrder: 'M1:午餐',
	txtQtyOfActualOrder: 0
}

const paramOfMealSubmit = {
	__EVENTTARGET: '',
	__EVENTARGUMENT: '',
	__LASTFOCUS: '',
	cmbTheDate: MEAL_DATE.toISOString().slice(0,10),
	cmdSubmit: '本人订餐',
	cmbMealName: 'F1:米饭',
	cmbMealCode: MEAL_TIME,
	cmbDateOfActualOrder: daysAhead(0).toISOString().slice(0,10),
	cmbCodeOfActualOrder: 'M1:午餐',
	txtQtyOfActualOrder: 0
}

