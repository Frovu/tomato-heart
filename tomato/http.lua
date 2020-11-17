dofile("wifi.lua")

settings = nil
local hashsum = ""

local auth_key = ""
if file.open("key", "r") then
	auth_key = file.readline()
	auth_key = auth_key:sub(-1,-1) == '\n' and auth_key:sub(0,-2) or auth_key
	file.close()
	print("Device auth key = "..auth_key)
else
	print("\n\nWARN! failed to read auth key\n")
	auth_key = "4N0nYM0u2"
end

function heartbeat()
	if not ALLOW_NET then return false end
	http.get(string.format("%s?s=%s", uri, hashsum), nil, function(code, data)
		if (code == 205) then
			local tmp = sjson.decode(data)
			if tmp.settings and tmp.sum then
				settings = tmp.settings
				hashsum = tmp.sum
				print("Settings updated")
			else
				print("Invalid settings body")
			end
		elseif (code == 200) then
			print(".")
		end
	end)
end

function send(type, data)
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
