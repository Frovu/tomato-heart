local SSID = "mitro"
local PWD = "06122001"

wifi_config = function()
	wifi.setmode(wifi.STATION)
	cfg = {}
	cfg.ssid = SSID
	cfg.pwd = PWD
	return wifi.sta.config(cfg)
end

wifi.eventmon.register(wifi.eventmon.STA_CONNECTED, function(T)
	print("\nSTA - CONNECTED".."\nSSID: "..T.SSID.."\nBSSID: "..
	T.BSSID.."\nChannel: "..T.channel)
end)

wifi.eventmon.register(wifi.eventmon.STA_DISCONNECTED, function(T)
	print("\nSTA - DISCONNECTED".."\nSSID: "..T.SSID.."\nBSSID: "..
	T.BSSID.."\nreason: "..T.reason)
end)

wifi.eventmon.register(wifi.eventmon.STA_GOT_IP, function(T)
	print("\nSTA - GOT IP".."\nStation IP: "..T.IP.."\nSubnet mask: "..
	T.netmask.."\nGateway IP: "..T.gateway)
end)

wifi.eventmon.register(wifi.eventmon.STA_DHCP_TIMEOUT, function()
	print("\nSTA - DHCP TIMEOUT")
end)
