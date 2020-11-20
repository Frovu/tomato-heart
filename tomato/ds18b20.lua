-- operate several ds18b20 devices on several pins
-- (without using parasite power supply)
local CMD_CONVERT_T = 0x44
local CMD_READ = 0xBE
local READ_DELAY = 750 -- 750 ms as for 12-bit res per datasheet

local devices = {}

local function init_one(pin)
	ow.setup(pin)
	ow.reset_search(pin)
	devices[pin] = {}
	local addr = ow.search(pin) -- search first
	while addr do
		if ow.crc8(addr:sub(1,7)) == addr:byte(8) then -- verify crc
			devices[pin][#devices[pin]+1] = addr
			print("found dev: "..addr)
		else
			print("wrong crc: "..addr)
		end
		addr = ow.search(pin) -- search further
	end
	print("Found "..#devices[pin].." 1-wire devices on pin "..pin)
	return devices[pin]
end

local function read(pin, callback)
	if not devices[pin] then return nil end
	ow.reset(pin)
	ow.skip(pin)
	ow.write(pin, CMD_CONVERT_T)
	tmr.create():alarm(READ_DELAY, tmr.ALARM_SINGLE, function()
		local values = {}
		for i, addr in pairs(devices[pin]) do
			ow.reset(pin)
			ow.select(pin, addr)
			ow.write(pin, CMD_READ)
			local data = ow.read_bytes(pin, 9)
			if ow.crc8(string.sub(data, 1, 8)) == data:byte(9) then
				local t = ((data:byte(1) + data:byte(2) * 256) * 625) / 10000
				values[addr] = t
			end
		end
		callback(values)
	end)
end

return {
	devices = devices,
	init_one = init_one,
	read = read
}
