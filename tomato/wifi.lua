local ssid = "mitro"
local pwd = "06122001"
uri = "http://192.168.1.113:3050/heart"
local server = nil
local index = ""
if file.open("index.html", "r") then
	index = file.read()
	file.close()
end

function wifiConfig()
	wifi.setmode(wifi.STATION)
	cfg = {}
	cfg.ssid = SSID
	cfg.pwd = PWD
	return wifi.sta.config(cfg)
end

function receiver(sck, data)
	if string.find(data, "POST") then
		print(data)
	else
		print("http get")
		sck:send(string.format(index, ssid, pwd, uri))
	end
	sck:on("sent", function(conn) conn:close() end)
end

function startConfServer()
	if not server then
		server = net.createServer(net.TCP, 5)
		server:listen(80, function(conn)
			conn:on("receive", receiver)
		end)
		local port, ip = server:getaddr()
		print("Listening to "..ip..":"..port)
	end
end

function stopConfServer()
	if server then server:close() server = nil end
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