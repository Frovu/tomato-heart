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
	}
	return html;
}

function showModal() { // eslint-disable-line
	const newSettings = readSettings();
	// validate input
	let flagInvalid = false;
	for(const i of [0, 1]) {
		for(const dt of ['Day', 'Night']) {
			for(const lh of ['Low', 'High']) {
				const tv = newSettings[i][conv[dt]][conv[lh]];
				if(isNaN(tv) || tv < ranges.temp[0] || tv > ranges.temp[1]) {
					$(`#t${dt}${lh}${i+1}`).addClass('is-invalid');
					flagInvalid = true;
				} else {
					$(`#t${dt}${lh}${i+1}`).removeClass('is-invalid');
				}
			}
		}
		const wr = newSettings[i].wire;
		if(isNaN(wr) || wr < ranges.wireTemp[0] || wr > ranges.wireTemp[1]) {
			flagInvalid = true;
			$(`#tWire${i+1}`).addClass('is-invalid');
		} else {
			$(`#tWire${i+1}`).removeClass('is-invalid');
		}
	}
	if(!flagInvalid) {
		const diff = diffSettings(newSettings);
		if(diff) {
			$('#modalBody').html(diff);
			$('#settingsModal').modal('show');
		} else {
			$('#settingsAlert').addClass('show');
			setTimeout(()=>{$('#settingsAlert').removeClass('show');}, 3000);
		}
	}
}

async function submitSettings(event) {
	event.preventDefault();
	event.stopPropagation();
	const secret = $('#secret').val();
	const req = {settings: readSettings()};
	req.secret = secret;
	const resp = await fetch('user', {
		method: 'POST',
		headers: {'content-type': 'application/json'},
		body: JSON.stringify(req)
	});
	console.log(resp.status);
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

	$('#settingsForm').on('submit', submitSettings);
};
