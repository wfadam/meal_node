const holidays = [
	'2017-01-27',
	'2017-01-28',
	'2017-01-29',
	'2017-01-30',
	'2017-01-31',
];


function isWeekend(theDate) {
	return theDate.getDay() == 6 
		|| theDate.getDay() == 0;
}

exports.isHoliday = (theDate) => {
	return isWeekend(theDate) 
		|| holidays.includes(theDate.toISOString().slice(0,10));
};
