document.addEventListener("DOMContentLoaded", function() {
	function getURLParameter(name) {
		return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
	}

	var cals = document.querySelectorAll('.calendar');
	var dateYear = getURLParameter('year') || (new Date()).getFullYear();
	var calInfo = [];
	var calWeekdaysLong = ['Monday', 'Tuesday', 'Wednesday', 'Thursday',
	                       'Friday', 'Saturday', 'Sunday'];
	var calWeekdaysShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

	// Turn digit into hex or binary
	function toHex(d)    { return ("0"+(Number(d).toString(16))).slice(-2).toUpperCase() }
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

		// Create 3 extra months. This allows us to change layout easier
		for (var extraMonth = 1; extraMonth <= 3; extraMonth++) {
			var container = document.createElement("div");
			container.classList += 'cal-container cal-month cal-month-extra cal-month-extra-' + extraMonth;
			cals[i].appendChild(container);
		}

		for (var mm = 1; mm <= 12; mm++) {
			var container = document.createElement("div");
			container.classList += 'cal-month cal-month-' + mm;

			firstHasBeen = false;

			// Create weekday names
			(function() {
				var calMonth = document.createElement("h1");
				var calMonthName = document.createTextNode(mm);
				calMonth.appendChild(calMonthName);
				container.appendChild(calMonth);

				var column = document.createElement("ul");
				column.classList += 'cal-weekday-headings';

				for (var c = 0; c < calWeekdaysShort.length; c++) {
					var heading = document.createElement("li");
					var dayName = document.createTextNode(calWeekdaysShort[c]);

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
					var daysOnThisDay = calInfo[mm]['daysByName'][calWeekdaysLong[c]];
					var row = document.createElement("li");
					row.classList += 'cal-day-' + calWeekdaysLong[c].toLowerCase();

					// First day of the month
					if (daysOnThisDay[r] == 1) {
						firstHasBeen = true;
					}

					// The first day of the month have not been yet
					// lets move this day down to the next row then.
					if (!firstHasBeen && r == 0 && i == 0) {
						daysOnThisDay.unshift(0);
					}

					// If this day doesn't exsist (i.e. the 5th sunday in a month with only 4 sundays)
					// make an empty day, so things align properly
					if (!daysOnThisDay[r]) {
						daysOnThisDay[r] = '';
						row.classList += ' cal-day-empty';
					} else {
						row.classList += ' cal-day-' + daysOnThisDay[r];
					}

					var dayOnThisDay = document.createTextNode(daysOnThisDay[r]);
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