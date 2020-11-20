local data
local sensors = require('sensors')

local CHECK_RATE = 10000
local HEATER_PIN = { 5, 6 }
local HIGHER_MARGIN = 1 -- Celsius
local heaters_on = { false, false }

local function is_day_now()
	return true -- todo: implement
end

local function switch(i, on)
	gpio.write(HEATER_PIN[i], on and gpio.HIGH or gpio.LOW) -- this "ternary" may be broken if high==0
	heaters_on[i] = on
	print("turning heater "..i..(on and " on" or " off"))
end

local function logic()
	local is_day = is_day_now()
	for i = 1, 2 do
		local section = tostring(i)
		if settings[tostring(section-1)].on then
			local range = settings[tostring(section-1)][is_day and "day" or "night"]
			local temp = data["st"..section]
			if not temp or not range then
				print("no soil temp for #"..section, temp)
				switch(i, false)
			else
				print("check heap="..node.heap().." i="..i.." on="..tostring(heaters_on[i]).." val: "..range[1].." < "..tostring(temp).." < "..range[2]) -- debug
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
		tmr.create():alarm(CHECK_RATE, tmr.ALARM_AUTO, check)
	end
}
