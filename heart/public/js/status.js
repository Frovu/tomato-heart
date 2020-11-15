let data;
let events;
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
		const elem = $(`#${i}`);
		elem.text(data[i].toFixed(1) + units(i));
		if(i.includes('soil') || i.includes('wire')) {
			elem.removeClass('text-danger text-warning');
			const split = i.split('_');
			const r = settings[parseInt(split[2])-1]; // eslint-disable-line
			if(i.includes('wire')) {
				if(data[i] - r.wire > 0)
					elem.addClass('text-danger');
				else if(data[i] - r.wire > -10)
					elem.addClass('text-warning');
			} else if(i.includes('temp')) {
				// TODO: diffirentiate day and night
				if(r.day[0] - data[i] > 0 || data[i] - r.day[1] > 0)
					elem.addClass('text-danger');
				else if(data[i] - r.day[0] < 1 || r.day[1] - data[i] < 1)
					elem.addClass('text-warning');
			}
			// TODO: moisture ranges
		}
	}
}

function updateEvents(arr) {
	events = arr;
	const div = $('#eventsBox');
	div.empty();
	for(const ev of arr) {
		const text = ev.msg;
		const time = ev.at.toLocaleString('en-GB').replace(/\/\d{4},|:\d\d$/g, '');
		const al = $(`<div role="alert">${text}<span class="float-right">${time}</span></div>`)
			.addClass('mt-3 alert alert-light fade').appendTo(div);
		setTimeout(()=>{al.addClass('show');}, 100);
	}
}

async function updateStatus() {
	if(!events) { // first call
		events = [];
		$('#noEvents').addClass('show');
	}
	const resp = await fetch('user/status');
	if(resp.status != 200)
		return console.log('can\'t fetch status');
	const body = await resp.json();
	if(!Object.keys(body).length) return;
	if(!device) device = Object.keys(body)[0];
	if(body[device].data && (!data || data.at !== body[device].data.at))
		updateData(body[device].data);
	if(body[device].event && (events.length < body[device].event.length || events[0].at !== body[device].event[0].at))
		updateEvents(body[device].event);
	const dataAge = (Date.now() - new Date(data.at)) / 1000;
	$('#dataUpdated').text(dataAge.toFixed(0));
}

setInterval(updateStatus, 1000);
