function enableSection(i, value) {
	for(const dt of ['Day', 'Night'])
		for(const lh of ['Low', 'High'])
			$(`#t${dt}${lh}${i}`).prop('disabled', !value);
	$(`#tWire${i}`).prop('disabled', !value);
}

function checkSwitch(ev, num) {
	enableSection(num, ev.target.checked);
}

function initsw(settings) { // eslint-disable-line
	$('#switch1').click(ev=>checkSwitch(ev, 1));
	$('#switch2').click(ev=>checkSwitch(ev, 2));
	for(const i of [1, 2])
		$(`#switch${i}`).prop('checked', !!settings[i-1].on).click().click(); // idk but this works
}
