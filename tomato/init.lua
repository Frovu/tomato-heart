-- Pin definition 
local pin = 4            --  GPIO13
local status = gpio.LOW
local duration = 1000    -- 1 second duration for timer

-- Initialising pin
gpio.mode(pin, gpio.OUTPUT)
gpio.write(pin, status)

-- Init timer
tmr.create():alarm(duration, tmr.ALARM_AUTO, function()
  status = status==gpio.LOW and gpio.HIGH or gpio.LOW
  gpio.write(pin, status)
end)
