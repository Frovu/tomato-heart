local BME_RESPONSE_DELAY = 1000
local bme280sensor

local sda, scl = 2, 1
i2c.setup(0, sda, scl, i2c.SLOW)
local temp_oss = 4 -- x8 ! for some reason it refuses to work with smaller oversampling
local press_oss = 4 -- x8
local humi_oss = 2 -- x2
local sensor_mode = 0 -- sleep
local IIR_filter = 4 -- x16
package.loaded["bme280"] = nil

local ds18b20 = require("ds18b20")
local pin = DS18B20_PIN
ds18b20.init_one(pin)

local function read_18b20(data, cb)
	ds18b20.read(pin, function(res)
		for role, addr in pairs(DS18B20_DEV_ADDR) do
			if not res[addr] then
				print("ds18b20 dev not found for "..role)
			else
				data[role] = res[addr]
			end
		end
		cb(data)
	end)
end

local function read_bme280(data, cb)
	if not pcall(function() bme280sensor = require('bme280') end) then
		print("bme280: failed to import")
		return cb(data)
	end
	bme280sensor = bme280sensor.setup(0, nil, temp_oss, press_oss, humi_oss, sensor_mode, IIR_filter)
	print("bme: addr, isbme = ", bme280sensor and bme280sensor.addr, bme280sensor and bme280sensor._isbme)
	if not bme280sensor then return cb(data) end
	bme280sensor:startreadout(function(T, P, H)
		if not T or not P or not H then
			print("bme280 returned", T, P, H)
			return cb(data)
		end
		print(string.format("BME280: T=%.2f P=%.2f H=%.2f", T, P, H))
		data.t = T
		data.p = P
		data.h = H
		package.loaded["bme280"] = nil
		bme280sensor = nil
		cb(data)
	end, BME_RESPONSE_DELAY)
end

local function measure_all(cb)
	local data = {}
	read_bme280(data, function(data)
		read_18b20(data, function(data)
			for k, v in pairs(data) do
				data[k] = string.format("%.2f", v)
			end
			cb(data)
		end)
	end)
end

return {
	measure = read_18b20,
	measure_all = measure_all
}
