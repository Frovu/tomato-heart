const conv = {
	Day: 'day',
	Night: 'night',
	Low: 0,
	High: 1
};

window.onload = async () => {
	const resp = await fetch('user');
	const settings = await resp.json();
	console.log('settings', settings);
	// set settings form to retrieved values
	for(const i of [0, 1]) {
		for(const dt of ['Day', 'Night'])
			for(const lh of ['Low', 'High'])
				$(`#t${dt}${lh}${i+1}`).val(settings[i][conv[dt]][conv[lh]]);
		$(`#tWire${i+1}`).val(settings[i].wire);
	}
};
