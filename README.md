![Logo](admin/husqvarna-automower.png)
# ioBroker.husqvarna-automower

[![NPM version](https://img.shields.io/npm/v/iobroker.husqvarna-automower.svg)](https://www.npmjs.com/package/iobroker.husqvarna-automower)
[![Downloads](https://img.shields.io/npm/dm/iobroker.husqvarna-automower.svg)](https://www.npmjs.com/package/iobroker.husqvarna-automower)
![Number of Installations](https://iobroker.live/badges/husqvarna-automower-installed.svg)
<!-- ![Current version in stable repository](https://iobroker.live/badges/husqvarna-automower-stable.svg) -->
![Current version in stable repository](https://img.shields.io/badge/stable-not%20published-%23264777)
<!-- [![Dependency Status](https://img.shields.io/david/ice987987/iobroker.husqvarna-automower.svg)](https://david-dm.org/ice987987/iobroker.husqvarna-automower) -->

[![NPM](https://nodei.co/npm/iobroker.husqvarna-automower.png?downloads=true)](https://nodei.co/npm/iobroker.husqvarna-automower/)

![Test and Release](https://github.com/ice987987/ioBroker.husqvarna-automower/workflows/Test%20and%20Release/badge.svg)

[![Donate](https://img.shields.io/badge/donate-paypal-blue?style=flat)](https://paypal.me/ice987987)

## husqvarna-automower adapter for ioBroker

This adapter fetches data from your Husqvarna lawn mower from [https://developer.husqvarnagroup.cloud](https://developer.husqvarnagroup.cloud/) via a WebSocket connection.

## Installation requirements

* at least node.js >=12.0 is required
* js-controller >=3.0 is required
* This adapter uses the Husqvarna API-Key to request data (via WebSocket) for your Husqvarna lawn mower. You must sign up at [https://developer.husqvarnagroup.cloud](https://developer.husqvarnagroup.cloud/) to get an API-Key.

## Control

You can send the following values to your Husqvarna lawn mower:
* `.ACTIONS.PAUSE`: pause mower
* `.ACTIONS.PARKUNTILNEXTSCHEDULE`: park mower until next scheduled run
* `.ACTIONS.PARKUNTILFURTHERNOTICE`: park mower until further notice, overriding schedule
* `.ACTIONS.park.PARK`: park mower for a duration of time `.ACTIONS.park.parkTime` (in minutes), overriding schedule
* `.ACTIONS.RESUMESCHEDULE`: resume mower according to schedule
* `.ACTIONS.start.START`: start mower and cut for a duration of time `.ACTIONS.start.startTime` (in minutes), overriding schedule
* `.ACTIONS.CUTTINGHEIGHT`: Update cuttingHeight
* `.ACTIONS.HEADLIGHT`: Update headlight
* `.ACTIONS.schedule.SET`: Update mower schedule with `.ACTIONS.schedule.[0-3].start` (minutes after midnight), `.ACTIONS.schedule.[0-3].duration` (in minutes), `.ACTIONS.schedule.[0-3].monday`, `.ACTIONS.schedule.[0-3].tuesday`, `.ACTIONS.schedule.[0-3].wednesday`, `.ACTIONS.schedule.[0-3].thursday`, `.ACTIONS.schedule.[0-3].friday`, `.ACTIONS.schedule.[0-3].saturday` and `.ACTIONS.schedule.[0-3].sunday`. 

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
* `.mower.errorTimestamp`: Timestamp for the last error code in milliseconds since 1970-01-01T00:00:00 in local time. NOTE! This timestamp is in local time for the mower and is coming directly from the mower.
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

* maximum 4 schedules are available

## Changelog

<!-- ### **WORK IN PROGRESS** -->

### **WORK IN PROGRESS**
* (ice987987) update dependencies
* (ice978987) add section "Available values" in changelog

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
