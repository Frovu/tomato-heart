local URI = "192.168.1.113:3050/heart"

settings = {}
local hashsum = ""

heartbeat = function()
	http.get(string.format("http://%s?s=%s", URI, hashsum), nil, function(code, data)
		if (code < 0) then
			print("HTTP request failed")
			return false
		else
			print(code)
			if (code == 205) then
				tmp = sjson.decode(data)
				if tmp.settings and tmp.sum then
					settings = tmp.settings
					hashsum = tmp.sum
					print("Settings updated")
				else
					print("Invalid settings body")
				end
			end
		end
	end)
end
