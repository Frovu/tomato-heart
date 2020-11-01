let settings;

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

function diffSettings() {
	const newSettings = readSettings();
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
	const diff = diffSettings();
	if(diff) {
		$('#modalBody').html(diff);
		$('#settingsModal').modal('show');
	} else {
		$('#settingsAlert').addClass('show');
		setTimeout(()=>{$('#settingsAlert').removeClass('show');}, 3000);
	}
}

window.onload = async () => {
	const resp = await fetch('user');
	settings = await resp.json();
	console.log('settings', settings);
	// set settings form to retrieved values
	for(const i of [0, 1]) {
		for(const dt of ['Day', 'Night'])
			for(const lh of ['Low', 'High'])
				$(`#t${dt}${lh}${i+1}`).val(settings[i][conv[dt]][conv[lh]]);
		$(`#tWire${i+1}`).val(settings[i].wire);
	}
};
