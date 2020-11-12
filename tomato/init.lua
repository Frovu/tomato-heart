dofile("http.lua")

local LED_PIN = 4
local HEARTBEAT_RATE = 5000

gpio.mode(LED_PIN, gpio.OUTPUT)
gpio.write(LED_PIN, gpio.HIGH)

-- main event
tmr.create():alarm(HEARTBEAT_RATE, tmr.ALARM_AUTO, function()
	-- blink if ok reverse blink if settings server running
	gpio.write(LED_PIN, server and gpio.HIGH or gpio.LOW)
	heartbeat()
	gpio.write(LED_PIN, server and gpio.LOW or gpio.HIGH)
end)
