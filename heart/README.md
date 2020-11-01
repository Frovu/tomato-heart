## backend for both device communication and webpage + frontend

### Tasks

#### /heart (esp8266 comm)
+ listen /heart GET with settings hashsum, compare it and response with new settings (including new hashsum) if needed
+ listen /heart POST with data and write it to db. (also check device authority somehow)

#### /user (user interface)
+ require authentication (for change only probably)
+ show page with current settings and device heartbeat
+ show page with data selection

#### postgres db structure:

CREATE TABLE data (
	id SERIAL PRIMARY KEY,
	at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	temperature real,
	pressure real,
	humidity real,
	soil_temp_1 real,
	soil_temp_2 real,
	soil_moisture_1 real,
	soil_moisture_2 real,
	wire_temp_1 real,
	wire_temp_2 real
);

CREATE TABLE events (
	id SERIAL PRIMARY KEY,
	at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	message TEXT NOT NULL
);
