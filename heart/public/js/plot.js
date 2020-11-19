let plot;

const FIELDS = {
	t: 'temperature',
	p: 'pressure',
	h: 'humidity'
};

const COLORS = {
	t: 'cyan',
	p: 'blue',
	h: 'yellow'
};

function updatePlot(data, fields) {
	if(!plot) {
		plot = new Chart($('#plot'), { // eslint-disable-line
			type: 'line',
			data: { },
			options: {
				legend: {
					display: true,
					position: 'top'
				},
				scales: {
					xAxes: [{
						display: true,
						type: 'time',
						distribution: 'series'
					}]
				}
			}
		});
	}
	plot.data.datasets = fields.map(f => {return {
		label: FIELDS[f],
		data: data[f],
		borderColor: COLORS[f],
		fill: false,
		yAxisID: `${f}-y-axis`
	};});
	plot.options.scales.yAxes = fields.map(f => {return {
		id: `${f}-y-axis`,
		type: 'linear',
		display: false
	};});
	plot.update({
		duration: 800
	});

}

function encodeParams(obj) {
	const keys = Object.keys(obj);
	return keys.length ? '?' + keys.map(k => `${k}=${obj[k]}`).join('&') : '';
}

async function update() {
	const fields = ['t', 'p', 'h'];
	const params = {
		fields: fields.join(','),
		from: Math.floor(Date.now()/1000 - 3600)
	};
	const resp = await fetch(`user/data${encodeParams(params)}`, { method: 'GET' });
	if (resp.status !== 200)
		return console.log('Failed to fetch data', resp.status);
	const data = await resp.json();
	const plotData = {}; const idx = {};
	for(const f of fields) {
		plotData[f] = [];
		idx[f] = data.fields.indexOf(FIELDS[f]);
	}
	for(const r of data.rows) {
		for(const f of fields) {
			plotData[f].push({t: r[0], y: r[idx[f]]});
		}
	}
	updatePlot(plotData, fields);
}

update();
