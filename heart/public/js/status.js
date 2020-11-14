let data;
let events = [];
let device; // this is bad

function units(name) {
	return name.includes('temp') ? ' °C'
		: name.includes('press') ? ' hPa'
			: name.includes('humid') || name.includes('moist') ? ' %' : '';
}

function updateData(obj) {
	data = obj;
	for(const i in data) {
		if(i == 'at') continue;
		$(`#${i}`).text(data[i].toFixed(1) + units(i));
	}
}

function updateEvents(arr) {

}

async function updateStatus() {
	const resp = await fetch('user/status');
	if(resp.status != 200)
		return console.log('can\'t fetch status');
	const body = await resp.json();
	if(!Object.keys(body).length) return;
	if(!device) device = Object.keys(body)[0];
	if(body[device].data && (!data || data.at !== body[device].data.at))
		updateData(body[device].data);
	if(body[device].event && (!events.length || events[0].at !== body[device].event[0].at))
		updateEvents(body[device].event);
	const age = Math.floor();
	$('#dataUpdated').text('231213');
}

updateStatus();
setInterval(updateStatus, 10000);
