# esp8266 nodeMcu lua controller
### Tasks
+ store settings
+ every N time send GET request to server with settings sum, if server answers with new settings, change them
+ every M time send POST request to server with data (temp, humidity etc)
+ continuously check for certain conditions (specified in settings) and switch relays if needed

### NodeMCU
Used modules firmware list: `bme280 file gpio http i2c net node ow pwm2 rtcmem rtctime sjson sntp tmr uart wifi`
