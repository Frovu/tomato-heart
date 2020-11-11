local URI = "192.168.1.113:3050/heart"

settings = {}

heartbeat = function()
	http.get(string.format("http://%s?s=%s", URI, settings.sum or ""), nil, function(code, data)
		if (code < 0) then
			print("HTTP request failed")
			return false
		else
			print(code)
			if (code == 205) then
				settings = data
				print("Settings updated")
			end
		end
	end)
end
