# esp8266 NodeMCU lua controller
### Problem description
+ store settings
+ every N time send GET request to server with settings sum, if server answers with new settings, change them
+ every M time send POST request to server with data (temp, humidity etc)
+ continuously check for certain conditions (specified in settings) and switch GPIO if needed

### NodeMCU
Firmware should include modules: `adc bme280_math file gpio http i2c net node ow pwm2 rtctime sjson sntp tmr uart wifi`

### Flash files description

Don't forget to compile files once you flash them !

| filename            | description                                                          |
|---------------------|----------------------------------------------------------------------|
| `config.lua`        | ! most important file, see Config section                            |
| `bme280.lua`        | module for bme280 sensor (from nodemcu repo)                         |
| `config_server.lua` | module for wifi AP and settings html server                          |
| `index.html`        | html for for changing uri and wifi sta settings                      |
| `ds18b20.lua`       | my own simple module for operating ds18b20 sensors on ow bus         |
| `init.lua`          | entry point, sets up repeating routines                              |
| `internet.lua`      | module for communication with world (also owns global settings var)  |
| `sensors.lua`       | module that provides data readout from sensors                       |
| `controls.lua`      | module that does main work by switching gpio's based on sensors data |

### Config

Some permanent settings should be stored in devices flash memory, its done inside a `config.lua` file. Mandatory config variables are:
+ `AUTH_KEY` - a key for data/events api
+ `FALLBACK_URI` - fallback api url, used if failed to read one from `uri` file
+ `DS18B20_PIN` - pin where ds18b20 sensors are located
+ `DS18B20_DEV_ADDR` - a table associating ds18b20 unique addresses with their roles for distinguishing sensors locations. Should contain `st1`, `st2`, `wt1`, `wt2` properties.

Example of `config.lua`:
```lua
AUTH_KEY = "xxxxxx"
FALLBACK_URI = "http://ip:port/heart"
DS18B20_PIN = 3
DS18B20_DEV_ADDR = {
	st1 = "0xffxxxxxxxxx",
	st2 = "0xffxxxxxxxxx",
	wt1 = "0xffxxxxxxxxx",
	wt2 = "0xffxxxxxxxxx",
}
```
