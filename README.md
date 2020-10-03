# tomato-heart
IOT (esp8266, lua) system with server side logic

## API
### heart (esp8266)
#### GET /heart
params: `?d=\<settings hash sum\>`<br>
response:
+ `200` - all up to date (empty body)
+ `205` - settings update, body: `{new: <settings>, sum: <hashsum>}`

#### POST /heart
body: `{data: <data>, auth: "key"}`<br>
response:
+ `200` - data saved
+ `400` - bad data
+ `401` - bad authority information

or

body: `{event: "<event name>", auth: "key"}`<br>
response:
+ `200` - data saved
+ `400` - bad data
+ `401` - bad authority information

### user (front end)
#### GET /user
get current settings
#### GET /user/data
get specific data
#### GET /user/heart?n=1
get timestamps of last n heartbeat events
