if adc.force_init_mode(adc.INIT_ADC) then
	node.restart()
	return
end

dofile("config.lua")
dofile("wifi.lc")

do
   settings = nil
   hashsum = ""
   if file.open("settings.json", "r") then
        local tmp = sjson.decode(file.read(4096))
        file.close()
        if tmp.sum and tmp.settings then
            settings = tmp.settings
            hashsum = tmp.sum
            print("successfuly read from settings.json")
        else
            print("settings.json seems invalid")
        end
    else
        print("failed to read settings.json")
    end
end

local controls = require("controls")
controls.init()

local LED_PIN = 4
local HEARTBEAT_RATE = 5 -- seconds
local DATA_RATE = 60 -- seconds

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
	local internet = require("internet")
	-- blink if ok reverse blink if settings server running
	print("beat, heap="..node.heap())
	gpio.write(LED_PIN, ALLOW_NET and gpio.LOW or gpio.HIGH)
	local internet = require("internet")
	print("heap="..node.heap())
	internet.heartbeat()
	package.loaded["internet"] = nil
	internet = nil
	print("heap="..node.heap())
	gpio.write(LED_PIN, ALLOW_NET and gpio.HIGH or gpio.LOW)
	counter = counter + 1
	if counter >= data_rate_cycles then
		counter = 0
		print("heap="..node.heap())
		local sensors = require("sensors")
		sensors.measure_all(function (data)
			package.loaded["sensors"] = nil
			sensors = nil
			print("heap="..node.heap())
			local internet = require("internet")
			print("heap="..node.heap())
			internet = require("internet")
			internet.send("data", data)
			package.loaded["internet"] = nil
			internet = nil
			print("heap="..node.heap())
		end)
	end
end

initAlarms(settings and settings.heartbeat or HEARTBEAT_RATE,
	settings and settings.datarate or DATA_RATE)
