ALLOW_NET = false -- allows to do web requests

sta_config = wifi.sta.getconfig(true);
print(string.format("\nCurrent wifi config, mode: %d\n\tssid:\"%s\"\tpassword:\"%s\"\n\tbssid:\"%s\"\tbssid_set:%s", wifi.getmode(nil), tostring(sta_config.ssid), tostring(sta_config.pwd), sta_config.bssid, (sta_config.bssid_set and "true" or "false")))

local URI_FNAME = "uri"
if file.open(URI_FNAME, "r") then
	uri = file.read()
	print("\nRead uri from file:  "..uri)
	file.close()
else
	print("\nWARN! Can't read uri from file!")
	uri = FALLBACK_URI
end

local conf_server
-- if STA requires manual configuration
if not sta_config.pwd and #tostring(sta_config.ssid) == 0 then
	ALLOW_NET = false
	sta_config = {}
else
	tmr.create():alarm(60000, tmr.ALARM_SINGLE, function()
		if ALLOW_NET and conf_server then
			conf_server.stop()
			conf_server = nil
			package.loaded["config_server"] = nil
			server_loader = nil
		end
	end)
end

local alarm = tmr.create()
local function server_loader()
	print("trying to load config server, heap="..node.heap())
	if pcall(function() conf_server = require("config_server") end) then
		print("success loading server")
		alarm:unregister()
		conf_server.start(function (ssid, pwd, new_uri)
			if conf_server then
				conf_server.stop()
				conf_server = nil
				package.loaded["config_server"] = nil
				server_loader = nil
			end
			sta_config.ssid = ssid
			sta_config.pwd = pwd
			wifi.sta.config(sta_config)
			uri = new_uri
			if file.open(URI_FNAME, "w") then
				file.write(uri)
				file.close()
			end
		end)
	else
		print("failed to load server")
		alarm:start()
	end
end
alarm:register(1000, tmr.ALARM_SEMI, server_loader)
alarm:start()

wifi.eventmon.register(wifi.eventmon.STA_DISCONNECTED, function(T)
	print("\nSTA - DISCONNECTED".."\nSSID: "..T.SSID.."\nBSSID: "..T.BSSID.."\nreason: "..T.reason)
	ALLOW_NET = false -- disconnected from internet :(
end)
wifi.eventmon.register(wifi.eventmon.STA_CONNECTED, function(T)
	print("\nSTA - CONNECTED".."\nSSID: "..T.SSID.."\nBSSID: "..T.BSSID.."\nChannel: "..T.channel)
end)
wifi.eventmon.register(wifi.eventmon.STA_GOT_IP, function(T)
	print("\nSTA - GOT IP".."\nStation IP: "..T.IP.."\nSubnet mask: "..T.netmask.."\nGateway IP: "..T.gateway)
	ALLOW_NET = true -- connected to internet now
end)
