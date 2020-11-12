ALLOW_NET = true -- allows to do web requests

local sta_config = wifi.sta.getconfig(true);
print(string.format("\nCurrent wifi config, mode: %d\n\tssid:\"%s\"\tpassword:\"%s\"\n\tbssid:\"%s\"\tbssid_set:%s", wifi.getmode(nil), tostring(sta_config.ssid), tostring(sta_config.pwd), sta_config.bssid, (sta_config.bssid_set and "true" or "false")))

wifi.ap.config({ssid = "TomatoHeart"})
print("\nCurrent SoftAP configuration:")
for k,v in pairs(wifi.ap.getconfig(true)) do
	print("  "..k.." :",v)
end
print("  IP:", wifi.ap.getip())

function startConfServer()
	if wifi.getmode() ~= wifi.STATIONAP then
		wifi.setmode(wifi.STATIONAP)
		print("Switching to STATIONAP mode")
	end
	if not server then
		print("\nStarting config server..")
		server = net.createServer(net.TCP, 5)
		server:listen(80, function(conn)
			print("incoming connection")
			conn:on("receive", receiver)
		end)
		local port, ip = server:getaddr()
		print("Listening to "..ip..":"..port)
	else
		print("Config server already running.")
	end
end

function stopConfServer()
	if server then
		print("Closing config sever")
		server:close()
		server = nil
	end
end

-- if STA requires manual configuration
if not sta_config.pwd and #tostring(sta_config.ssid) == 0 then
	ALLOW_NET = false
	sta_config = {}
	startConfServer()
end

local server = nil

local URI_FNAME = "uri"
if file.open(URI_FNAME, "r") then
	uri = file.read()
	print("\nRead uri from file:  "..uri)
	file.close()
else
	uri = "http://192.168.1.113:3050/heart"
end

local index = ""
if file.open("index.html", "r") then
	index = file.read(4096)
	file.close()
end

function receiver(sck, data)
	if string.find(data, "^POST") then
		local body = data:match("\n[^\n]*$")
		local ssid = body:match("ssid=([^\&]+)")
		local pwd = body:match("pwd=([^\&]+)")
		local new_uri = body:match("uri=([^\&]+)"):gsub("%%3A", ":"):gsub("%%2F", "/")
		if ssid and pwd and uri then
			print("\nUpdating hard settings to:\n\tssid="..ssid.." pwd="..pwd.." uri="..uri)
			sta_config.ssid = ssid
			sta_config.pwd = pwd
			uri = new_uri
			if file.open(URI_FNAME, "w") then
				file.write(uri)
				file.close()
			end
			sck:send("settings updated, changing mode");
			sck:on("sent", function(conn)
				conn:close()
				tmr.create():alarm(500, tmr.ALARM_SINGLE, function()
					stopConfServer()
					wifi.setmode(wifi.STATION)
					wifi.sta.config(sta_config)
				end)
			end)
		else
			sck:send("bad request");
		end
	else
		print("http get/?")
		sck:send(string.format(index, sta_config.ssid or "", sta_config.pwd or "", uri or ""))
		sck:on("sent", function(conn) conn:close() end)
	end
end

wifi.eventmon.register(wifi.eventmon.STA_CONNECTED, function(T)
	print("\nSTA - CONNECTED".."\nSSID: "..T.SSID.."\nBSSID: "..
	T.BSSID.."\nChannel: "..T.channel)
end)

wifi.eventmon.register(wifi.eventmon.STA_DISCONNECTED, function(T)
	print("\nSTA - DISCONNECTED".."\nSSID: "..T.SSID.."\nBSSID: "..
	T.BSSID.."\nreason: "..T.reason)
	ALLOW_NET = false
	startConfServer()
end)

wifi.eventmon.register(wifi.eventmon.STA_GOT_IP, function(T)
	print("\nSTA - GOT IP".."\nStation IP: "..T.IP.."\nSubnet mask: "..
	T.netmask.."\nGateway IP: "..T.gateway)
	ALLOW_NET = true
	stopConfServer()
end)

wifi.eventmon.register(wifi.eventmon.STA_DHCP_TIMEOUT, function()
	print("\nSTA - DHCP TIMEOUT")
end)

wifi.eventmon.register(wifi.eventmon.AP_STACONNECTED, function(T)
	print("\nAP - STATION CONNECTED".."\nMAC: "..T.MAC.."\nAID: "..T.AID)
end)

wifi.eventmon.register(wifi.eventmon.AP_STADISCONNECTED, function(T)
	print("\nAP - STATION DISCONNECTED".."\nMAC: "..T.MAC.."\nAID: "..T.AID)
end)

wifi.eventmon.register(wifi.eventmon.WIFI_MODE_CHANGED, function(T)
	print("\nSTA - WIFI MODE CHANGED".."\nold_mode: "..
	T.old_mode.."\nnew_mode: "..T.new_mode)
end)
