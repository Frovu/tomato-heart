let settings;
let ranges;

const conv = {
	Day: 'day',
	Night: 'night',
	Low: 0,
	High: 1
};

function readSettings() {
	const res = {};
	for(const i of [0, 1]) {
		res[i] = {};
		for(const dt of ['Day', 'Night']) {
			res[i][conv[dt]] = [];
			for(const lh of ['Low', 'High'])
				res[i][conv[dt]][conv[lh]] = parseFloat($(`#t${dt}${lh}${i+1}`).val());
		}
		res[i].wire = parseFloat($(`#tWire${i+1}`).val());
		res[i].on = $(`#switch${i+1}`).prop('checked');
		res.heartbeat = parseInt($('#rateBeat').val());
		res.datarate = parseInt($('#rateData').val());
		res.day = [$('#dayStart').val(), $('#dayEnd').val()];
	}
	return res;
}

function diffSettings(newSettings) {
	let html = '';
	for(const i of [0, 1]) {
		for(const dt of ['Day', 'Night']) {
			for(const lh of ['Low', 'High']) {
				const olds = settings[i][conv[dt]][conv[lh]];
				const news = newSettings[i][conv[dt]][conv[lh]];
				if(olds != news)
					html += `section #${i+1} Temperature ${dt} ${lh} <b>from ${olds} to <span class="v">${news}</span></b><br>`;
			}
		}
		const olds = settings[i].wire;
		const news = newSettings[i].wire;
		if(olds != news)
			html += `<p>section #${i+1} Max Wire Temperature <b>from ${olds} to <span class="v">${news}</span></b></p>`;
		if(settings[i].on !== newSettings[i].on)
			html += `<p><span class="text-danger">WARNING!</span> turning section #${i+1} active controls <span class="v ${newSettings[i].on?'':'text-danger'}">${newSettings[i].on?'ON':'OFF'}</span></b></p>`;
	}
	for(const i of ['heartbeat', 'datarate'])
		if(settings[i] !== newSettings[i])
			html += `<p>${i} <b>from ${settings[i]} to <span class="v">${newSettings[i]}</span></b></p>`;
	for(const i of [0, 1])
		if(settings.day[i] !== newSettings.day[i])
			html += `<p> Light day ${i==0?'start':'end'} time <b>from ${settings.day[i]} to <span class="v">${newSettings.day[i]}</span></b></p>`;

	return html;
}

function validateSettings(obj) {
	let isValid = true;
	for(const i of [0, 1]) {
		for(const dt of ['Day', 'Night']) {
			for(const lh of ['Low', 'High']) {
				const tv = obj[i][conv[dt]][conv[lh]];
				if(isNaN(tv) || tv < ranges.temp[0] || tv > ranges.temp[1]) {
					$(`#t${dt}${lh}${i+1}`).addClass('is-invalid');
					isValid = false;
				} else {
					$(`#t${dt}${lh}${i+1}`).removeClass('is-invalid');
				}
			}
		}
		const wr = obj[i].wire;
		if(isNaN(wr) || wr < ranges.wireTemp[0] || wr > ranges.wireTemp[1]) {
			isValid = false;
			$(`#tWire${i+1}`).addClass('is-invalid');
		} else {
			$(`#tWire${i+1}`).removeClass('is-invalid');
		}
	}

	const ncnv = {heartbeat: 'rateBeat', datarate: 'rateData'};
	for(const i of ['heartbeat', 'datarate']) {
		const val = obj[i];
		if(!val || isNaN(val) || val<ranges[i][0] || val>ranges[i][1]) {
			isValid = false;
			$(`#${ncnv[i]}`).addClass('is-invalid');
		} else {
			$(`#${ncnv[i]}`).removeClass('is-invalid');
		}
	}

	const dncnv = ['Start', 'End'];
	let isValidDay = true;
	for(const i of [0, 1]) {
		const val = obj.day[i];
		if(!val || !val.match(/^[0-2]?\d:[0-5]\d$/)) {
			isValid = false; isValidDay = false;
			$(`#day${dncnv[i]}`).addClass('is-invalid');
		} else {
			$(`#day${dncnv[i]}`).removeClass('is-invalid');
		}
	}
	// check that start is before end
	const gd = s => parseInt(s.split(':')[0]) * 60 + parseInt(s.slice(3));
	if(isValidDay && gd(obj.day[0]) >= gd(obj.day[1])) {
		isValid = false;
		$('#dayFeedback').text('Must be more or equal than start');
		$('#dayEnd').addClass('is-invalid');
	} else {
		$('#dayFeedback').text('Invalid input');
		isValidDay && $('#dayEnd').removeClass('is-invalid');
	}

	return isValid;
}

function showModal() { // eslint-disable-line
	const newSettings = readSettings();
	// if input valid
	if(validateSettings(newSettings)) {
		const diff = diffSettings(newSettings);
		if(diff) {
			$('#modalBody').html(diff);
			$('#settingsModal').modal('show');
		} else {
			const alert = $('#settingsAlert');
			alert.html('Nothing to change!');
			alert.addClass('show');
			setTimeout(()=>{alert.removeClass('show');}, 1700);
		}
	}
}

async function submitSettings(event) {
	event.preventDefault();
	event.stopPropagation();
	const secret = $('#secret');
	const feedback = $('#settingsFeedback');
	const err = msg => {
		secret.addClass('is-invalid');
		feedback.text(msg);
	};
	try {
		const news = readSettings();
		const req = {settings: news};
		req.secret = secret.val();
		const resp = await fetch('user', {
			method: 'POST',
			headers: {'content-type': 'application/json'},
			body: JSON.stringify(req)
		});
		if(resp.status === 200) {
			settings = news; // update global settings state
			$('#settingsModal').modal('hide');
			secret.removeClass('is-invalid');
			const alert = $('#settingsAlert');
			alert.html('<strong>Settings updated!</strong>');
			alert.addClass('show');
			setTimeout(()=>{alert.removeClass('show');}, 4000);
		} else if(resp.status === 400) {
			err('Invalid settings');
		} else if(resp.status === 401) {
			err('Invalid secret');
		} else {
			err('Error on server');
		}
	} catch (e) {
		console.error(e);
		err('Error occured');
	}
}

window.onload = async () => {
	let resp = await fetch('ranges.json');
	ranges = await resp.json();
	console.log('ranges', ranges);
	resp = await fetch('user');
	settings = await resp.json();
	console.log('settings', settings);
	// set settings form to retrieved values
	for(const i of [0, 1]) {
		for(const dt of ['Day', 'Night'])
			for(const lh of ['Low', 'High'])
				$(`#t${dt}${lh}${i+1}`).val(settings[i][conv[dt]][conv[lh]]);
		$(`#tWire${i+1}`).val(settings[i].wire);
	}
	$('#rateBeat').val(settings.heartbeat);
	$('#rateData').val(settings.datarate);
	$('#dayStart').val(settings.day[0]);
	$('#dayEnd').val(settings.day[1]);

	updateStatus(); // eslint-disable-line
	$('#settingsForm').on('submit', submitSettings);
	initsw(settings) // eslint-disable-line
};
