let plot;

function initPlot(data) {
	plot = new Chart($('#plot'), { // eslint-disable-line
		type: 'line',
		data: {
			datasets: [
				{
					label: 'tempearture',
					data: data.t,
					borderColor: 'cyan',
					fill: false,
					yAxisID: 't-y-axis'
				},
				{
					label: 'pressure',
					data: data.p,
					borderColor: 'blue',
					fill: false,
					yAxisID: 'p-y-axis'
				}
			]
		},
		options: {
			legend: {
				display: true,
				position: 'top'
			},
			scales: {
				xAxes: [{
					type: 'time',
					distribution: 'series'
				}],
				yAxes: [{
					id: 't-y-axis',
					type: 'linear',
					position: 'left'
				}, {
					id: 'p-y-axis',
					type: 'linear',
					position: 'left'
				}]
			}
		}
	});
}

function encodeParams(obj) {
	const keys = Object.keys(obj);
	return keys.length ? '?' + keys.map(k => `${k}=${obj[k]}`).join('&') : '';
}

async function update() {
	const fields = ['t', 'p'];
	const params = {
		fields: fields.join(',')
	};
	const resp = await fetch(`user/data${encodeParams(params)}`, { method: 'GET' });
	if (resp.status !== 200)
		return console.log('Failed to fetch data', resp.status);
	const data = await resp.json();
	const plotData = {t: [], p: []};
	for(const r of data.rows) {
		plotData.t.push({t: r[0], y: r[1]});
		plotData.p.push({t: r[0], y: r[2]});
	}
	if(plot) {
		console.log('exists');
	} else {
		initPlot(plotData);
	}
}

update();
