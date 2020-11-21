local data
local sensors = require('sensors')

local TIMEZONE = 3600 * 3 -- UTC+3
local CHECK_RATE = 10000
local HEATER_PIN = { 5, 6 }
local HIGHER_MARGIN = 1 -- Celsius
local heaters_on = { false, false }

local function is_day_now()
	local tm = rtctime.epoch2cal(rtctime.get() + TIMEZONE)
	print(string.format("%04d/%02d/%02d %02d:%02d:%02d", tm["year"], tm["mon"], tm["day"], tm["hour"], tm["min"], tm["sec"]))
	local nowm = tm["hour"] * 60 + tm["min"]
	local rn = {}
	for i = 1, 2 do
		local h, m = settings.day[i]:match("(%d?%d):(%d%d)")
		rn[i] = h * 60 + m
	end
	return (nowm >= rn[1] and nowm <= rn[2])
end

local function switch(i, on)
	gpio.write(HEATER_PIN[i], on and gpio.HIGH or gpio.LOW) -- this "ternary" may be broken if high==0
	heaters_on[i] = on
	print("turning heater "..i..(on and " on" or " off"))
end

local function logic()
	local is_day = is_day_now()
	for i = 1, 2 do
		local section = settings[tostring(i-1)]
		if section.on then
			local range = section[is_day and "day" or "night"]
			local temp = data["st"..i]
			if not temp or not range then
				print("no soil temp for #"..i, temp)
				switch(i, false)
			else
				print("check heap="..node.heap().." day="..tostring(is_day).." i="..i.." on="..tostring(heaters_on[i]).." val: "..range[1].." < "..tostring(temp).." < "..range[2]) -- debug
				if heaters_on[i] then -- stop heating when reached (higher-margin)
					if temp > range[2]-HIGHER_MARGIN then
						switch(i, false)
					end
				else -- start heating if below lower temp
					if temp < range[1] then
						switch(i, true)
					end
				end
			end
			-- todo: wire temp treshold
		end
	end
end

local function check()
	if not settings then
		print("settings are not set, can't work")
	else
		data = {}
		sensors.measure(data, logic)
	end
end

return {
	init = function()
		for _, pin in pairs(HEATER_PIN) do
			gpio.mode(pin, gpio.OUTPUT)
			gpio.write(pin, gpio.LOW)
		end
		sntp.sync("pool.ntp.org",
			function(sec, usec, server, info)
				print('\nntp sync', sec, usec, server)
			end,
			function()
				print('ntp sync failed!')
			end,
			1 -- auto repeat
		)
		tmr.create():alarm(CHECK_RATE, tmr.ALARM_AUTO, check)
	end
}
