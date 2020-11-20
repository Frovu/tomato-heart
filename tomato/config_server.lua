local M = {}
local server

wifi.ap.config({ssid = "TomatoHeart"})
print("\nCurrent SoftAP configuration:")
for k,v in pairs(wifi.ap.getconfig(true)) do
	print("  "..k.." :",v)
end
print("  IP:", wifi.ap.getip())

function M.start(callback)
	if wifi.getmode() ~= wifi.STATIONAP then
		wifi.setmode(wifi.STATIONAP)
		print("Switching to STATIONAP mode")
	end
	if not server then
		print("\nStarting config server..")
		server = net.createServer(net.TCP, 5)
		server:listen(80, function(conn)
			conn:on("receive", receiver, callback)
		end)
		local port, ip = server:getaddr()
		print("Listening to "..ip..":"..port)
	else
		print("Config server already running.")
	end
end

function M.stop()
	if server then
		print("Closing config sever")
		server:close()
		server = nil
	end
end

local function receiver(sck, data, callback)
	if string.find(data, "^POST") then
		local body = data:match("\n[^\n]*$")
		local ssid = body:match("ssid=([^\&]+)")
		local pwd = body:match("pwd=([^\&]+)")
		local new_uri = body:match("uri=([^\&]+)"):gsub("%%3A", ":"):gsub("%%2F", "/")
		if ssid and pwd and uri then
			print("\nUpdating hard settings to:\n\tssid="..ssid.." pwd="..pwd.." uri="..uri)
			sck:send("<!DOCTYPE html>\n<h1>Settings updated, changing wifi mode</h1>");
			sck:on("sent", function(conn)
				conn:close()
				tmr.create():alarm(500, tmr.ALARM_SINGLE, function()
					callback(ssid, pwd, new_uri)
				end)
			end)
		else
			sck:send("bad request");
		end
	else
		print("http get/?")
		local index = "can't read html"
		if file.open("index.html", "r") then
			index = file.read(4096)
			file.close()
		end
		sck:send(string.format(index, sta_config.ssid or "", sta_config.pwd or "", uri or ""))
		sck:on("sent", function(conn) conn:close() end)
	end
end


return M
