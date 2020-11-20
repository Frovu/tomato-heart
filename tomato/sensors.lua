local BME_RESPONSE_DELAY = 1000
local bme280sensor
do
	local sda, scl = 2, 1
	i2c.setup(0, sda, scl, i2c.SLOW)
	local temp_oss = 4 -- x8 ! for some reason it refuses to work with smaller oversampling
	local press_oss = 4 -- x8
	local humi_oss = 2 -- x2
	local sensor_mode = 0 -- sleep
	local IIR_filter = 4 -- x16
	bme280sensor = require('bme280').setup(0, nil, temp_oss, press_oss, humi_oss, sensor_mode, IIR_filter)
	print("bme: addr, isbme = ", bme280sensor and bme280sensor.addr, bme280sensor and bme280sensor._isbme)
end

local ds18b20 = require("ds18b20")
local pin = 3
ds18b20.init_one(pin)
local function read18b20()
	ds18b20.read(pin, function(res)
		for k, v in pairs(res) do
			print(k, v)
		end
	end)
end

local function measureAndSend(sender)
	if not bme280sensor then return false end
	bme280sensor:startreadout(function(T, P, H)
		if not T or not P or not H then
			print("bme280 returned", T, P, H)
			--measureAndSend()
			return
		end
		print(string.format("T=%.2f P=%.2f H=%.2f", T, P, H))
		local data = {
			t=string.format("%.2f", T),
			p=string.format("%.2f", P),
			h=string.format("%.2f", H)
		}
		sender("data", data)
	end, BME_RESPONSE_DELAY)
end

return {
	read18b20 = read18b20,
	measure = measureAndSend
}
