document.addEventListener("DOMContentLoaded", function() {
	function getURLParameter(name) {
		return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
	}

	var cals = document.querySelectorAll('.calendar');
	var dateYear = getURLParameter('year') || (new Date()).getFullYear();
	var calInfo = [];
	var calWeekdaysLong   = ['Monday', 'Tuesday', 'Wednesday', 'Thursday',
	                         'Friday', 'Saturday', 'Sunday'];
	var calWeekdaysShort  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
	var calWeekdaysNarrow = ['Mo',  'Tu',  'We',  'Th',  'Fr',  'Sa',  'Su'];

	// Turn digit into hex or binary
	function toHex(d)    { return ("0"+(Number(d).toString(16))).slice(-2) }
	function toBinary(d) { return String("00000" + (+d).toString(2)).slice(-5); }

	// Fill the calInfo variable with info about this year
	for (var mm = 1; mm <= 12; mm++) {
		var month = (new Date(dateYear, mm-1, 1));
		var days = 32 - (new Date(dateYear, mm-1, 32)).getDate();
		calInfo[mm] = {};
		calInfo[mm]['days'] = [];
		calInfo[mm]['daysByName'] = {};

		calInfo[mm]['2-digit']     = month.toLocaleDateString('en', { month: '2-digit' });
		calInfo[mm]['numeric']     = month.toLocaleDateString('en', { month: 'numeric' });
		calInfo[mm]['name_long']   = month.toLocaleDateString('en', { month: 'long' });
		calInfo[mm]['name_short']  = month.toLocaleDateString('en', { month: 'short' });
		calInfo[mm]['name_narrow'] = month.toLocaleDateString('en', { month: 'narrow' });

		calInfo[mm]['hex']         = toHex(calInfo[mm]['numeric']);
		calInfo[mm]['binary']      = toBinary(calInfo[mm]['numeric']);

		for (var i = 0; i < calWeekdaysLong.length; i++) {
			calInfo[mm]['daysByName'][calWeekdaysLong[i]] = [];
		}

		for (var dd = 1; dd <= days; dd++) {
			var date = new Date(dateYear, mm-1, dd);
			calInfo[mm]['days'][dd] = {};

			calInfo[mm]['days'][dd]['2-digit']     = date.toLocaleDateString('en', { day: '2-digit' });
			calInfo[mm]['days'][dd]['numeric']     = date.toLocaleDateString('en', { day: 'numeric' });
			calInfo[mm]['days'][dd]['name_long']   = date.toLocaleDateString('en', { weekday: 'long' });
			calInfo[mm]['days'][dd]['name_short']  = date.toLocaleDateString('en', { weekday: 'short' });
			calInfo[mm]['days'][dd]['name_narrow'] = date.toLocaleDateString('en', { weekday: 'narrow' });

			calInfo[mm]['days'][dd]['hex']         = toHex(calInfo[mm]['days'][dd]['numeric']);
			calInfo[mm]['days'][dd]['binary']      = toBinary(calInfo[mm]['days'][dd]['numeric']);

			calInfo[mm]['daysByName'][ calInfo[mm]['days'][dd]['name_long'] ].push(dd);
		}
	}

	// Put info into calendars
	for (var i = 0; i < cals.length; i++) {

		cals[i].classList += ' ' + (getURLParameter('paper_size') || 'a4');
		cals[i].classList += ' ' + (getURLParameter('layout') || 'layout-middle-hole');

		// Create 3 extra months. This allows us to change layout easier
		for (var extraMonth = 1; extraMonth <= 3; extraMonth++) {
			var container = document.createElement("div");
			container.classList += 'cal-container cal-month cal-month-extra cal-month-extra-' + extraMonth;

			// var calYear = document.createElement("h1");
			// calMonth.classList += 'cal-month-title';
			// var calMonthName = document.createTextNode(getURLParameter('month_rep') || 'hex');


			cals[i].appendChild(container);
		}

		for (var mm = 1; mm <= 12; mm++) {
			var container = document.createElement("div");
			container.classList += 'cal-month cal-month-' + mm;

			firstHasBeen = false;

			// Create month heading and weekday names
			(function() {
				console.log(calInfo[mm]['name_long']);

				var calMonth = document.createElement("h2");
				calMonth.classList += 'cal-month-title';
				var calMonthName = document.createTextNode(calInfo[mm][ (getURLParameter('month_rep') || 'hex') ].toUpperCase());

				calMonth.appendChild(calMonthName);
				container.appendChild(calMonth);

				var column = document.createElement("ul");
				column.classList += 'cal-weekday-headings';

				for (var c = 0; c < calWeekdaysShort.length; c++) {
					var heading = document.createElement("li");

					switch (getURLParameter('weekday_rep') || 'narrow') {
						case 'long':
							weekdayName = calWeekdaysLong[c];
							break;
						case 'short':
							weekdayName = calWeekdaysShort[c];
							break;
						case 'narrow':
							weekdayName = calWeekdaysNarrow[c];
							break;
						default:
							weekdayName = calWeekdaysNarrow[c];
					}

					var dayName = document.createTextNode(weekdayName);
					heading.classList += 'cal-heading-' + calWeekdaysLong[c].toLowerCase();
					heading.appendChild(dayName);
					column.appendChild(heading);
				}
				container.appendChild(column);
			})();

			// 6 Calendar rows
			for (var r = 0; r < 6; r++) {
				var column = document.createElement("ul");

				// 7 Calendar columns
				for (var c = 0; c < calWeekdaysShort.length; c++) {
					// Get array with days (in digits) on this day (by name)
					// For example, get the digits of all Mondays in this month...
					var daysOnThisWeekday = calInfo[mm]['daysByName'][calWeekdaysLong[c]];
					var dayToShow = daysOnThisWeekday[r];
					var row = document.createElement("li");
					row.classList += 'cal-day-' + calWeekdaysLong[c].toLowerCase();

					// First day of the month
					if (daysOnThisWeekday[r] == 1) {
						firstHasBeen = true;
					}

					// The first day of the month have not been yet
					// lets move this day down to the next row then.
					if (!firstHasBeen && r == 0 && i == 0) {
						daysOnThisWeekday.unshift(0);
					}

					// If this day doesn't exsist (i.e. the 5th sunday in a month with only 4 sundays)
					// make an empty day, so things align properly
					if (!daysOnThisWeekday[r]) {
						dayToShow = '';
						row.classList += ' cal-day-empty';
					} else {
						row.classList += ' cal-day-' + daysOnThisWeekday[r];

						dayToShow = calInfo[mm]['days'][daysOnThisWeekday[r]][ (getURLParameter('day_rep') || 'hex') ];
					}

					var dayOnThisDay = document.createTextNode(dayToShow);
					row.appendChild(dayOnThisDay);
					column.appendChild(row);
				}

				container.appendChild(column);
			}
			firstHasBeen = false;

			cals[i].appendChild(container);
		}
	}
});