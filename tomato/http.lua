dofile("wifi.lua")

settings = nil
local hashsum = ""

function heartbeat()
	if not ALLOW_NET then return false end
	http.get(string.format("%s?s=%s", uri, hashsum), nil, function(code, data)
		if (code < 0) then
			print("HTTP request failed")
		else
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
		end
	end)
end

function send(type, data)
	if not ALLOW_NET then return false end
	local body = sjson.encode(data)
	print("sending "..type..": "..body)
	http.post(string.format("%s/%s", uri, type=="data" and "data" or "event"),
		"Content-Type: application/json\r\n", body, function(code, data)
		if (code < 0) then
			print("HTTP request failed ()", type)
		else
			if (code == 400) then
				print("Invalid "..type)
			else
				if (code ~= 200) then
					print("Failed to send ", type)
				end
			end
		end
	end)
end
