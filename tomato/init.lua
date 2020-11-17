dofile("sensors.lua")
dofile("http.lua")

local LED_PIN = 4
local HEARTBEAT_RATE = 5000
local DATA_RATE = 6
local counter = DATA_RATE - 2

if adc.force_init_mode(adc.INIT_ADC) then
	node.restart()
	return
end

gpio.mode(LED_PIN, gpio.OUTPUT)
gpio.write(LED_PIN, gpio.HIGH)

-- main event
tmr.create():alarm(HEARTBEAT_RATE, tmr.ALARM_AUTO, function()
	-- blink if ok reverse blink if settings server running
	gpio.write(LED_PIN, server and gpio.HIGH or gpio.LOW)
	heartbeat()
	gpio.write(LED_PIN, server and gpio.LOW or gpio.HIGH)
	counter = counter + 1
	if counter >= DATA_RATE then
		counter = 0
		measureAndSend()
	end
end)
