# tomato-heart
IOT (esp8266, lua) system with server side logic

## API
### heart (esp8266)
#### GET /heart
params: `?s=\<settings hash sum\>`<br>
response:
+ `200` - all up to date (empty body)
+ `400` - no sum provided
+ `205` - settings update, body: `{new: <settings>, sum: <hashsum>}`

#### POST /heart/data
body: `{key: "", msg: "", val: ""}`<br>
response:
+ `200` - data saved
+ `400` - bad data
+ `401` - bad authority information

#### POST /heart/event
body: `{key: "", ...}`<br>
see `const FIELDS` in `heart/modules/database` for keys dictionary (all are float)
response:
+ `200` - data saved
+ `400` - bad data
+ `401` - bad authority information

### user (front end)
#### GET /user
get current settings
#### GET /user/default
get default settings
#### GET /user/status
get last devices event and data

#### POST /user
update settings
body: `{settings: {new settings}, secert: "secret"}`<br>
response:
+ `200` - settings saved
+ `400` - bad settings
+ `401` - invalid secret
