dofile("wifi.lc")

settings = nil
local hashsum = ""

local auth_key = AUTH_KEY or "4N0nYM0u2"
if not AUTH_KEY then
	print("\n\nWARN! failed to get auth key\n")
end

do
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

-- handle brand new settings
local function settingsUpdate()
	print("Settings updated, reiniting alarms")
	initAlarms(settings.heartbeat, settings.datarate)

	if file.open("settings.json", "w") then
		local tmp = {settings=settings, sum=hashsum}
		file.write(sjson.encode(tmp))
		file.close()
		print("saved to settings.json")
	else
		print("failed to write settings.json")
	end
end

local function heartbeat_cb(code, data)
	if (code == 205) then
		local tmp = sjson.decode(data)
		if tmp.settings and tmp.sum then
			settings = tmp.settings
			hashsum = tmp.sum
			settingsUpdate()
		else
			print("Invalid settings body")
		end
	elseif (code == 200) then
		print(".")
	end
end

local function heartbeat()
	if not ALLOW_NET then return false end
	http.get(string.format("%s?s=%s", uri, hashsum), nil, heartbeat_cb)
end

local function send_cb(code, data)
	if (code == 400) then
		print("Invalid "..type)
	elseif (code == 401) then
		print("Unauthorized for send")
	elseif (code ~= 200) then
		print("Failed to send "..type)
	else
		print("Successfuly sent "..type)
	end
end

local function send(type, data)
	if not ALLOW_NET then return false end
	data.key = auth_key
	local body = sjson.encode(data)
	print("sending "..type..": "..body)
	http.post(string.format("%s/%s", uri, type=="data" and "data" or "event"),
		"Content-Type: application/json\r\n", body, function(code, data)
		if (code == 400) then
			print("Invalid "..type)
		elseif (code == 401) then
			print("Unauthorized for send")
		elseif (code ~= 200) then
			print("Failed to send "..type)
		else
			print("Successfuly sent "..type)
		end
	end)
end

return {
	heartbeat = heartbeat,
	send = send
}
