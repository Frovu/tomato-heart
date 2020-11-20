ALLOW_NET = false -- allows to do web requests

local sta_config = wifi.sta.getconfig(true);
print(string.format("\nCurrent wifi config, mode: %d\n\tssid:\"%s\"\tpassword:\"%s\"\n\tbssid:\"%s\"\tbssid_set:%s", wifi.getmode(nil), tostring(sta_config.ssid), tostring(sta_config.pwd), sta_config.bssid, (sta_config.bssid_set and "true" or "false")))

local URI_FNAME = "uri"
if file.open(URI_FNAME, "r") then
	uri = file.read()
	print("\nRead uri from file:  "..uri)
	file.close()
else
	for i = 1, 3 do
		print("\nPANIC! Can't read uri from file!")
	end
end

function finish_settings(ssid, pwd, new_uri)
	conf_server.stop()
	conf_server = nil
	package.loaded["config_server"] = nil
	sta_config.ssid = ssid
	sta_config.pwd = pwd
	wifi.sta.config(sta_config)
	uri = new_uri
	if file.open(URI_FNAME, "w") then
		file.write(uri)
		file.close()
	end
	wifi.setmode(wifi.STATION)
end

-- if STA requires manual configuration
local conf_server = require("config_server")
if not sta_config.pwd and #tostring(sta_config.ssid) == 0 then
	ALLOW_NET = false
	sta_config = {}
else
	tmr.create():alarm(60000, tmr.ALARM_SINGLE, function()
		if ALLOW_NET then
			conf_server.stop()
			conf_server = nil
			package.loaded["config_server"] = nil
		end
	end)
end
conf_server.start(finish_settings)

wifi.eventmon.register(wifi.eventmon.STA_DISCONNECTED, function(T)
	print("\nSTA - DISCONNECTED".."\nSSID: "..T.SSID.."\nBSSID: "..T.BSSID.."\nreason: "..T.reason)
	ALLOW_NET = false
end)
wifi.eventmon.register(wifi.eventmon.AP_STACONNECTED, function(T)
	print("\n\tAP - STATION CONNECTED".."\n\tMAC: "..T.MAC.."\n\tAID: "..T.AID)
end)
wifi.eventmon.register(wifi.eventmon.STA_GOT_IP, function(T)
	print("\nSTA - GOT IP".."\nStation IP: "..T.IP.."\nSubnet mask: "..T.netmask.."\nGateway IP: "..T.gateway)
	ALLOW_NET = true -- connected to internet now
end)
