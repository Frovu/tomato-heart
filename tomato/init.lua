if adc.force_init_mode(adc.INIT_ADC) then
	node.restart()
	return
end

dofile("config.lua")

local sensors = require("sensors")
local controls = require("controls")
local internet = require("internet")
controls.init()

local LED_PIN = 4
local HEARTBEAT_RATE = 5 -- seconds
local DATA_RATE = 300 -- seconds

gpio.mode(LED_PIN, gpio.OUTPUT)
gpio.write(LED_PIN, gpio.HIGH)

local heart_tmr = tmr.create();
function initAlarms(h_rate, d_rate)
	data_rate_cycles = math.floor( d_rate / h_rate )
	counter = data_rate_cycles - 3
	print("\nInit timers with rates: heartbeat="..(h_rate).." data="..data_rate_cycles*h_rate)
	heart_tmr:unregister()
	heart_tmr:alarm(h_rate * 1000, tmr.ALARM_AUTO, heartbeat_callback)
end

-- main repeating event
function heartbeat_callback()
	-- blink if ok reverse blink if settings server running
	print("beat, heap="..node.heap())
	gpio.write(LED_PIN, ALLOW_NET and gpio.LOW or gpio.HIGH)
	internet.heartbeat()
	gpio.write(LED_PIN, ALLOW_NET and gpio.HIGH or gpio.LOW)
	counter = counter + 1
	if counter >= data_rate_cycles then
		counter = 0
		sensors.send(internet.send)
	end
end

initAlarms(settings and settings.heartbeat or HEARTBEAT_RATE,
	settings and settings.datarate or DATA_RATE)
