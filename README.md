![Logo](admin/husqvarna-automower.png)
# ioBroker.husqvarna-automower

[![NPM version](https://img.shields.io/npm/v/iobroker.husqvarna-automower.svg)](https://www.npmjs.com/package/iobroker.husqvarna-automower)
[![Downloads](https://img.shields.io/npm/dm/iobroker.husqvarna-automower.svg)](https://www.npmjs.com/package/iobroker.husqvarna-automower)
![Number of Installations](https://iobroker.live/badges/husqvarna-automower-installed.svg)
![Current version in stable repository](https://img.shields.io/badge/stable-not%20published-%23264777)
<!-- ![Current version in stable repository](https://iobroker.live/badges/husqvarna-automower-stable.svg) -->
<!-- [![Dependency Status](https://img.shields.io/david/ice987987/iobroker.husqvarna-automower.svg)](https://david-dm.org/ice987987/iobroker.husqvarna-automower) -->

[![NPM](https://nodei.co/npm/iobroker.husqvarna-automower.png?downloads=true)](https://nodei.co/npm/iobroker.husqvarna-automower/)

![Test and Release](https://github.com/ice987987/ioBroker.husqvarna-automower/workflows/Test%20and%20Release/badge.svg)

[![Donate](https://img.shields.io/badge/donate-paypal-blue?style=flat)](https://paypal.me/ice987987)

## husqvarna-automower adapter for ioBroker

This adapter fetches data from your Husqvarna lawn mower from [https://developer.husqvarnagroup.cloud](https://developer.husqvarnagroup.cloud/) via the "new" WebSocket connection and works with [Automower Connect API](https://developer.husqvarnagroup.cloud/apis/Automower+Connect+API) v1.0.0.

## Installation requirements

* node.js >= v14.0 is required
* js-controller >= v3.3.19 is required
* admin >= v5.1.28 is required
* This adapter uses the Husqvarna API-Key to request data (via WebSocket) for your Husqvarna lawn mower. You must sign up at [https://developer.husqvarnagroup.cloud](https://developer.husqvarnagroup.cloud/) to get an API-Key.

**Please make sure that you have created an account, password and API-Key according to [these instructions]([https://developer.husqvarnagroup.cloud/docs/getting-started](https://developer.husqvarnagroup.cloud/docs/get-started)). "Old" logins will not work.**

## Control

You can send the following values to your Husqvarna lawn mower:
* `.ACTIONS.PAUSE`: pause mower
* `.ACTIONS.PARKUNTILNEXTSCHEDULE`: park mower until next scheduled run
* `.ACTIONS.PARKUNTILFURTHERNOTICE`: park mower until further notice, overriding schedule
* `.ACTIONS.park.PARK`: park mower for a duration of time `.ACTIONS.park.parkTime` (in minutes), overriding schedule
* `.ACTIONS.RESUMESCHEDULE`: resume mower according to schedule
* `.ACTIONS.start.START`: start mower and cut for a duration of time `.ACTIONS.start.startTime` (in minutes), overriding schedule
* `.ACTIONS.CUTTINGHEIGHT`: Update cuttingHeight [^2][^3]
* `.ACTIONS.HEADLIGHT`: Update headlight
* `.ACTIONS.schedule.SET`: Update mower schedule with `.ACTIONS.schedule.[0-3].start` (minutes after midnight), `.ACTIONS.schedule.[0-3].duration` (in minutes), `.ACTIONS.schedule.[0-3].monday`, `.ACTIONS.schedule.[0-3].tuesday`, `.ACTIONS.schedule.[0-3].wednesday`, `.ACTIONS.schedule.[0-3].thursday`, `.ACTIONS.schedule.[0-3].friday`, `.ACTIONS.schedule.[0-3].saturday` and `.ACTIONS.schedule.[0-3].sunday` [^2]
[^2]: Do not use for 550 EPOS and Ceora due to [Husqvarna's API-limitation](https://developer.husqvarnagroup.cloud/apis/Automower+Connect+API#/readme)
[^3]: not supported models: 405X, 415X and 435X AWD (you will get the error "This mower use missions and can not be updated by this endpoint")

## Available values (readonly)

You get the following values from your Husqvarna lawn mower:
* `.battery.batteryPercent`: Information about the battery in the mower
* `.calendar.[0-3].start`: Start time expressed in minutes after midnight
* `.calendar.[0-3].duration`: Duration time expressed in minutes
* `.calendar.[0-3].monday`: Enabled on Mondays
* `.calendar.[0-3].tuesday`: Enabled on Tuesdays
* `.calendar.[0-3].wednesday`: Enabled on Wednesdays
* `.calendar.[0-3].thurdsay`: Enabled on Thursdays
* `.calendar.[0-3].friday`: Enabled on Fridays
* `.calendar.[0-3].saturday`: Enabled on Saturdays
* `.calendar.[0-3].sunday`: Enabled on Sundays
* `.metadata.connected`: is the mower currently connected
* `.metadata.statusTimestamp`: is the mower currently connected, time in ms
* `.mower.activity`: Information about the mowers current activity
* `.mower.errorCode`: Information about the mowers current error status
* `.mower.errorTimestamp`: Timestamp for the last error code in milliseconds since 1970-01-01T00:00:00 in local time. NOTE! This timestamp is in local time for the mower and is coming directly from the mower
* `.mower.mode`: Information about the mowers current mode
* `.mower.state`: Information about the mowers current status
* `.planner.action`: TODO
* `.planner.nextStartTimestamp`: Timestamp for the next auto start in milliseconds since 1970-01-01T00:00:00 in local time. If the mower is charging then the value is the estimated time when it will be leaving the charging station. If the value is 0 then the mower should start now. NOTE! This timestamp is in local time for the mower and is coming directly from the mower
* `.planner.restrictedReason`: restrictedReason
* `.positions.latitude`: Position latitude
* `.positions.longitude`: Position longitude
* `.positions.latlong`: Position "latitude;longitude"
* `.settings.cuttingHeight`: Prescaled cutting height, Range: 1...9
* `.settings.headlight`: Headlight status
* `.system.id`: Device ID
* `.system.model`: Device model
* `.system.name`: Device name
* `.system.serialNumber`: Device serialnumber
* `.system.type`: Device type

## Limitation

* maximum 4 schedules are available[^1]
[^1]: If more schedules are needed, please open a [GitHub issue](https://github.com/ice987987/ioBroker.husqvarna-automower/issues/new/choose).

## ioBroker.vis bindings
the following code can be used for html-bindings in adapter [ioBroker.vis](https://github.com/ioBroker/ioBroker.vis#bindings-of-objects) to translate the [status description and error codes](https://developer.husqvarnagroup.cloud/apis/Automower+Connect+API#status%20description%20and%20error%20codes) into text for better visualization:

* Datapoint `husqvarna-automower.0.[mowerID from .system.id].mower.errorCode`:
```
{value1:husqvarna-automower.0.[mowerID from .system.id].mower.activity;value1 === "0" ? "Unexpected error" :: (value1 === "1" ? "Outside working area" :: (value1 === "2" ? "No loop signal" :: (value1 === "3" ? "Wrong loop signal" :: (value1 === "4" ? "Loop sensor problem, front" :: (value1 === "5" ? "Loop sensor problem, rear" :: (value1 === "6" ? "Loop sensor problem, left" :: (value1 === "7" ? "Loop sensor problem, right" :: (value1 === "8" ? "Wrong PIN code" :: (value1 === "9" ? "Trapped" :: (value1 === "10" ? "Upside down" :: (value1 === "11" ? "Low battery" :: (value1 === "12" ? "Empty battery" :: (value1 === "13" ? "No drive" :: (value1 === "14" ? "Mower lifted" :: (value1 === "15" ? "Lifted" :: (value1 === "16" ? "Stuck in charging station" :: (value1 === "17" ? "Charging station blocked" :: (value1 === "18" ? "Collision sensor problem, rear" :: (value1 === "19" ? "Collision sensor problem, front" :: (value1 === "20" ? "Wheel motor blocked, right" :: (value1 === "21" ? "Wheel motor blocked, left" :: (value1 === "22" ? "Wheel drive problem, right" :: (value1 === "23" ? "Wheel drive problem, left" :: (value1 === "24" ? "Cutting system blocked" :: (value1 === "25" ? "Cutting system blocked" :: (value1 === "26" ? "Invalid sub-device combination" :: (value1 === "27" ? "Settings restored" :: (value1 === "28" ? "Memory circuit problem" :: (value1 === "29" ? "Slope too steep" :: (value1 === "30" ? "Charging system problem" :: (value1 === "31" ? "STOP button problem" :: (value1 === "32" ? "Tilt sensor problem" :: (value1 === "33" ? "Mower tilted" :: (value1 === "34" ? "Cutting stopped - slope too steep" :: (value1 === "35" ? "Wheel motor overloaded, right" :: (value1 === "36" ? "Wheel motor overloaded, left" :: (value1 === "37" ? "Charging current too high" :: (value1 === "38" ? "Electronic problem" :: (value1 === "39" ? "Cutting motor problem" :: (value1 === "40" ? "Limited cutting height range" :: (value1 === "41" ? "Unexpected cutting height adj" :: (value1 === "42" ? "Limited cutting height range" :: (value1 === "43" ? "Cutting height problem, drive" :: (value1 === "44" ? "Cutting height problem, curr" :: (value1 === "45" ? "Cutting height problem, dir" :: (value1 === "46" ? "Cutting height blocked" :: (value1 === "47" ? "Cutting height problem" :: (value1 === "48" ? "No response from charger" :: (value1 === "49" ? "Ultrasonic problem" :: (value1 === "50" ? "Guide 1 not found" :: (value1 === "51" ? "Guide 2 not found" :: (value1 === "52" ? "Guide 3 not found" :: (value1 === "53" ? "GPS navigation problem" :: (value1 === "54" ? "Weak GPS signal" :: (value1 === "55" ? "Difficult finding home" :: (value1 === "56" ? "Guide calibration accomplished" :: (value1 === "57" ? "Guide calibration failed" :: (value1 === "58" ? "Temporary battery problem" :: (value1 === "59" ? "Temporary battery problem" :: (value1 === "60" ? "Temporary battery problem" :: (value1 === "61" ? "Temporary battery problem" :: (value1 === "62" ? "Temporary battery problem" :: (value1 === "63" ? "Temporary battery problem" :: (value1 === "64" ? "Temporary battery problem" :: (value1 === "65" ? "Temporary battery problem" :: (value1 === "66" ? "Battery problem" :: (value1 === "67" ? "Battery problem" :: (value1 === "68" ? "Temporary battery problem" :: (value1 === "69" ? "Alarm! Mower switched off" :: (value1 === "70" ? "Alarm! Mower stopped" :: (value1 === "71" ? "Alarm! Mower lifted" :: (value1 === "72" ? "Alarm! Mower tilted" :: (value1 === "73" ? "Alarm! Mower in motion" :: (value1 === "74" ? "Alarm! Outside geofence" :: (value1 === "75" ? "Connection changed" :: (value1 === "76" ? "Connection NOT changed" :: (value1 === "77" ? "Com board not available" :: (value1 === "78" ? "Slipped - Mower has Slipped. Situation not solved with moving pattern" :: (value1 === "79" ? "Invalid battery combination - Invalid combination of different battery types." :: (value1 === "80" ? "Cutting system imbalance --Warning--" :: (value1 === "81" ? "Safety function faulty" :: (value1 === "82" ? "Wheel motor blocked, rear right" :: (value1 === "83" ? "Wheel motor blocked, rear left" :: (value1 === "84" ? "Wheel drive problem, rear right" :: (value1 === "85" ? "Wheel drive problem, rear left" :: (value1 === "86" ? "Wheel motor overloaded, rear right" :: (value1 === "87" ? "Wheel motor overloaded, rear left" :: (value1 === "88" ? "Angular sensor problem" :: (value1 === "89" ? "Invalid system configuration" :: (value1 === "90" ? "No power in charging station" :: (value1 === "91" ? "Switch cord problem" :: (value1 === "92" ? "Work area not valid" :: (value1 === "93" ? "No accurate position from satellites" :: (value1 === "94" ? "Reference station communication problem" :: (value1 === "95" ? "Folding sensor activated" :: (value1 === "96" ? "Right brush motor overloaded" :: (value1 === "97" ? "Left brush motor overloaded" :: (value1 === "98" ? "Ultrasonic Sensor 1 defect" :: (value1 === "99" ? "Ultrasonic Sensor 2 defect" :: (value1 === "100" ? "Ultrasonic Sensor 3 defect" :: (value1 === "101" ? "Ultrasonic Sensor 4 defect" :: (value1 === "102" ? "Cutting drive motor 1 defect" :: (value1 === "103" ? "Cutting drive motor 2 defect" :: (value1 === "104" ? "Cutting drive motor 3 defect" :: (value1 === "105" ? "Lift Sensor defect" :: (value1 === "106" ? "Collision sensor defect" :: (value1 === "107" ? "Docking sensor defect" :: (value1 === "108" ? "Folding cutting deck sensor defect" :: (value1 === "109" ? "Loop sensor defect" :: (value1 === "110" ? "Collision sensor error" :: (value1 === "111" ? "No confirmed position" :: (value1 === "112" ? "Cutting system major imbalance" :: (value1 === "113" ? "Complex working area" :: (value1 === "114" ? "Too high discharge current" :: (value1 === "115" ? "Too high internal current" :: (value1 === "116" ? "High charging power loss" :: (value1 === "117" ? "High internal power loss" :: (value1 === "118" ? "Charging system problem" :: (value1 === "119" ? "Zone generator problem" :: (value1 === "120" ? "Internal voltage error" :: (value1 === "121" ? "High internal temerature" :: (value1 === "122" ? "CAN error" :: (value1 === "123" ? "Destination not reachable" :: "errorCode #" + value1 + " unknown")))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))}
```
* Datapoint `husqvarna-automower.0.[mowerID from .system.id].mower.activity`:
```
{value1:husqvarna-automower.0.[mowerID from .system.id].mower.activity;value1 === "UNKNOWN" ? "Unknown activity" :: (value1 === "NOT_APPLICABLE" ? "Manual start required in mower." :: (value1 === "MOWING" ? "Mower is mowing lawn. If in demo mode the blades are not in operation." :: (value1 === "GOING_HOME" ? "Mower is going home to the charging station." :: (value1 === "CHARGING" ? "Mower is charging in station due to low battery." :: (value1 === "LEAVING" ? "Mower is leaving the charging station." :: (value1 === "PARKED_IN_CS" ? "Mower is parked in charging station." :: (value1 === "STOPPED_IN_GARDEN" ? "Mower has stopped. Needs manual action to resume." :: "activity #" + value1 + " unknown")))))))}
```
* Datapoint `husqvarna-automower.0.[mowerID from .system.id].mower.mode`:
```
{value1:husqvarna-automower.0.[mowerID from .system.id].mower.mode;value1 === "MAIN_AREA" ? "Mower will mow until low battery. Go home and charge. Leave and continue mowing. Week schedule is used. Schedule can be overridden with forced park or forced mowing." :: (value1 === "DEMO" ? "No blade operation - Mower will mow until low battery. Go home and charge. Leave and continue mowing. Week schedule is used. Schedule can be overridden with forced park or forced mowing." :: (value1 === "SECONDARY_AREA" ? "Mower is in secondary area. Schedule is overridden with forced park or forced mowing. Mower will mow for request time or untill the battery runs out." :: (value1 === "HOME" ? "Mower goes home and parks forever. Week schedule is not used. Cannot be overridden with forced mowing." :: (value1 === "UNKNOWN" ? "Unknown mode" :: "mode #" + value1 + " unknown"))))}
```
* Datapoint `husqvarna-automower.0.[mowerID from .system.id].mower.state`:
```
{value1:husqvarna-automower.0.[mowerID from .system.id].mower.state;value1 === "UNKNOWN" ? "Unknown state" :: (value1 === "NOT_APPLICABLE" ? "Not Applicable" :: (value1 === "PAUSED" ? "Mower has been paused by user." :: (value1 === "IN_OPERATION" ? "See value in activity for status." :: (value1 === "WAIT_UPDATING" ? "Mower is downloading new firmware." :: (value1 === "WAIT_POWER_UP" ? "Mower is performing power up tests." :: (value1 === "RESTRICTED" ? "Mower can currently not mow due to week calender, or override park." :: (value1 === "OFF" ? "Mower is turned off." :: (value1 === "STOPPED" ? "Mower is stopped, requires manual action." :: (value1 === "ERROR" ? "An error has occurred. Check errorCode. Mower requires manual action." :: (value1 === "FATAL_ERROR" ? "An fatal error has occurred. Check errorCode. Mower requires manual action." :: (value1 === "ERROR_AT_POWER_UP" ? "An error at power up has occurred. Check errorCode. Mower requires manual action." :: "state #" + value1 + " unknown")))))))))))}
```

## How to report issues and feature requests

Please use [GitHub issues](https://github.com/ice987987/ioBroker.husqvarna-automower/issues/new/choose) and fill in the form.

For issues:
Set the adapter to debug log mode (Instances -> Expert mode -> Column Log level). Get the logfile from disk (subdirectory "log" in ioBroker installation directory and not from Admin because Admin cuts the lines). Check that there are no personal information before you publish your log.

## Changelog

<!-- ### **WORK IN PROGRESS** -->

### 0.1.0 (05.06.2022)
* (ice987987) password encryption added (user need to reenter the password once after update, this change requires admin >= v4.0.9)
* (ice987987) clean up code
* (ice987987) implementation of JSON config (this change requires js-controller >= v3.3.19 and admin >= v5.1.28)
* (ice987987) node.js >= v14.0 is required
* (ice987987) update dependencies

### 0.0.6 (26.05.2022)
* (ice987987) update dependencies
* (ice987987) add some more limitations in readme

### 0.0.5 (02.05.2022)
* (ice987987) fix issue [#10](https://github.com/ice987987/ioBroker.husqvarna-automower/issues/10)
* (ice987987) store all GPS-values (delay of 500ms if more than one was received)
* (ice987987) improve error handling
* (ice987987) improve debug output messages

### 0.0.4 (16.04.2022)
* (ice987987) update dependencies
* (ice978987) add section "Available values" in readme
* (ice987987) add section "ioBroker.vis bindings" in readme
* (ice987987) add section "How to report issues and feature requests" in readme
* (ice987987) fix calendar (max 4)
* (ice987987) preload values after first install
* (ice987987) fix issue [#9](https://github.com/ice987987/ioBroker.husqvarna-automower/issues/9)
* (ice987987) update `common.states` of `.mower.errorCode`

### 0.0.3 (14.03.2022)
* (ice987987) initial npm release

### 0.0.2 (11.03.2022)
* (ice987987) initial npm release

### 0.0.1 (04.03.2022)
* (ice987987) initial release

## License
MIT License

Copyright (c) 2022 ice987987 <mathias.frei1@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
