![Logo](admin/husqvarna-automower.svg)

# ioBroker.husqvarna-automower

[![NPM version](https://img.shields.io/npm/v/iobroker.husqvarna-automower.svg)](https://www.npmjs.com/package/iobroker.husqvarna-automower)
[![Downloads](https://img.shields.io/npm/dm/iobroker.husqvarna-automower.svg)](https://www.npmjs.com/package/iobroker.husqvarna-automower)
![Number of Installations](https://iobroker.live/badges/husqvarna-automower-installed.svg)
![Current version in stable repository](https://img.shields.io/badge/stable-not%20published-%23264777)

<!-- ![Current version in stable repository](https://iobroker.live/badges/husqvarna-automower-stable.svg) -->
<!-- [![Dependency Status](https://img.shields.io/david/ice987987/iobroker.husqvarna-automower.svg)](https://david-dm.org/ice987987/iobroker.husqvarna-automower) -->

[![NPM](https://nodei.co/npm/iobroker.husqvarna-automower.svg?downloads=true)](https://nodei.co/npm/iobroker.husqvarna-automower/)

![Test and Release](https://github.com/ice987987/ioBroker.husqvarna-automower/workflows/Test%20and%20Release/badge.svg)

[![Donate](https://img.shields.io/badge/donate-paypal-blue?style=flat)](https://paypal.me/ice987987)

## husqvarna-automower adapter for ioBroker

This adapter fetches data from your Husqvarna lawn mower from [https://developer.husqvarnagroup.cloud](https://developer.husqvarnagroup.cloud/) via the "new" WebSocket connection and works with [Automower Connect API](https://developer.husqvarnagroup.cloud/apis/Automower+Connect+API) v1.0.0.

## Disclaimer

All product and company names or logos are trademarks™ or registered® trademarks of their respective holders. Use of them does not imply any affiliation with or endorsement by them or any associated subsidiaries! This personal project is maintained in spare time and has no business goal. Husqvarna Automower is a trademark of Husqvarna Group.

## Installation requirements

-   node.js >= v16.4 is required
-   js-controller >= v4.0.24 is required
-   admin >= v6.3.5 is required
-   This adapter uses the Husqvarna API-Key to request data (via WebSocket) for your Husqvarna lawn mower. You must sign up at [https://developer.husqvarnagroup.cloud](https://developer.husqvarnagroup.cloud/) to get an API-Key.

**Please make sure that you have created an account, password and API-Key according to [these instructions](https://developer.husqvarnagroup.cloud/docs/get-started). "OLD" logins will not work.**

## Control

You can send the following values to your Husqvarna lawn mower:

-   `.ACTIONS.PAUSE`: pause mower
-   `.ACTIONS.PARKUNTILNEXTSCHEDULE`: park mower until next scheduled run
-   `.ACTIONS.PARKUNTILFURTHERNOTICE`: park mower until further notice, overriding schedule
-   `.ACTIONS.park.PARK`: park mower for a duration of time `.ACTIONS.park.parkTime` (in minutes), overriding schedule
-   `.ACTIONS.RESUMESCHEDULE`: resume mower according to schedule
-   `.ACTIONS.start.START`: start mower and cut for a duration of time `.ACTIONS.start.startTime` (in minutes), overriding schedule
-   `.ACTIONS.CUTTINGHEIGHT`: Update cuttingHeight and get current status[^2][^3]
-   `.ACTIONS.HEADLIGHT`: Update headlight and get current status
-   `.ACTIONS.schedule.SET`: Update mower schedule with `.ACTIONS.schedule.[0-3].start` (minutes after midnight), `.ACTIONS.schedule.[0-3].duration` (in minutes), `.ACTIONS.schedule.[0-3].monday`, `.ACTIONS.schedule.[0-3].tuesday`, `.ACTIONS.schedule.[0-3].wednesday`, `.ACTIONS.schedule.[0-3].thursday`, `.ACTIONS.schedule.[0-3].friday`, `.ACTIONS.schedule.[0-3].saturday` and `.ACTIONS.schedule.[0-3].sunday` and get current status [^2]
    [^2]: Do not use for 550 EPOS and Ceora due to [Husqvarna's API-limitation](https://developer.husqvarnagroup.cloud/apis/Automower+Connect+API#/readme)
    [^3]: not supported models: 405X, 415X and 435X AWD (you will get the error "This mower use missions and can not be updated by this endpoint")

## Available values (readonly)

You get the following values from your Husqvarna lawn mower:

-   `.battery.batteryPercent`: Information about the battery in the mower
-   `.metadata.connected`: is the mower currently connected
-   `.metadata.statusTimestamp`: is the mower currently connected, time in ms
-   `.mower.activity`: Information about the mowers current activity
-   `.mower.errorCode`: Information about the mowers current error status
-   `.mower.errorTimestamp`: Timestamp for the last error code in milliseconds since 1970-01-01T00:00:00 in local time. NOTE! This timestamp is in local time for the mower and is coming directly from the mower
-   `.mower.mode`: Information about the mowers current mode
-   `.mower.state`: Information about the mowers current status
-   `.planner.action`: TODO
-   `.planner.nextStartTimestamp`: Timestamp for the next auto start in milliseconds since 1970-01-01T00:00:00 in local time. If the mower is charging then the value is the estimated time when it will be leaving the charging station. If the value is 0 then the mower should start now. NOTE! This timestamp is in local time for the mower and is coming directly from the mower
-   `.planner.restrictedReason`: restrictedReason
-   `.positions.latitude`: Position latitude[^5]
-   `.positions.longitude`: Position longitude[^5]
-   `.positions.latlong`: Position "latitude;longitude"[^5]
-   `.statistics.cuttingBladeUsageTime`: Cutting blade usage time, time in s[^4]
-   `.statistics.numberOfChargingCycles`: Numbers of charging cycles, time in s[^4]
-   `.statistics.numberOfCollisions`: Numbers of collisions, time in s[^4]
-   `.statistics.totalChargingTime`: Total charging time, time in s[^4]
-   `.statistics.totalCuttingTime`: Total cutting time, time in s[^4]
-   `.statistics.totalRunningTime`: Total running time, time in s[^4]
-   `.statistics.totalSearchingTime`: Total searching time, time in s[^4]
-   `.system.id`: Device ID
-   `.system.model`: Device model
-   `.system.name`: Device name
-   `.system.serialNumber`: Device serialnumber
-   `.system.type`: Device type
    [^4]: If a value is missing or zero (0) the mower does not support the value
    [^5]: If no GPS-Signal is available, those values are not updated

## Limitation

-   maximum 4 schedules are available[^1]
    [^1]: If more schedules are needed, please open a [GitHub issue](https://github.com/ice987987/ioBroker.husqvarna-automower/issues/new/choose).

## ioBroker.vis bindings

the following code can be used for html-bindings in adapter [ioBroker.vis](https://github.com/ioBroker/ioBroker.vis#bindings-of-objects) to translate the [status description and error codes](https://developer.husqvarnagroup.cloud/apis/Automower+Connect+API#status%20description%20and%20error%20codes) into text for better visualization:

-   Datapoint `husqvarna-automower.0.[mowerID from DP .system.id].mower.errorCode`:

    (EN)

    ```
    {value1:husqvarna-automower.0.[mowerID from DP .system.id].mower.errorCode;value1 === "0" ? "Unexpected error" :: (value1 === "1" ? "Outside working area" :: (value1 === "2" ? "No loop signal" :: (value1 === "3" ? "Wrong loop signal" :: (value1 === "4" ? "Loop sensor problem, front" :: (value1 === "5" ? "Loop sensor problem, rear" :: (value1 === "6" ? "Loop sensor problem, left" :: (value1 === "7" ? "Loop sensor problem, right" :: (value1 === "8" ? "Wrong PIN code" :: (value1 === "9" ? "Trapped" :: (value1 === "10" ? "Upside down" :: (value1 === "11" ? "Low battery" :: (value1 === "12" ? "Empty battery" :: (value1 === "13" ? "No drive" :: (value1 === "14" ? "Mower lifted" :: (value1 === "15" ? "Lifted" :: (value1 === "16" ? "Stuck in charging station" :: (value1 === "17" ? "Charging station blocked" :: (value1 === "18" ? "Collision sensor problem, rear" :: (value1 === "19" ? "Collision sensor problem, front" :: (value1 === "20" ? "Wheel motor blocked, right" :: (value1 === "21" ? "Wheel motor blocked, left" :: (value1 === "22" ? "Wheel drive problem, right" :: (value1 === "23" ? "Wheel drive problem, left" :: (value1 === "24" ? "Cutting system blocked" :: (value1 === "25" ? "Cutting system blocked" :: (value1 === "26" ? "Invalid sub-device combination" :: (value1 === "27" ? "Settings restored" :: (value1 === "28" ? "Memory circuit problem" :: (value1 === "29" ? "Slope too steep" :: (value1 === "30" ? "Charging system problem" :: (value1 === "31" ? "STOP button problem" :: (value1 === "32" ? "Tilt sensor problem" :: (value1 === "33" ? "Mower tilted" :: (value1 === "34" ? "Cutting stopped - slope too steep" :: (value1 === "35" ? "Wheel motor overloaded, right" :: (value1 === "36" ? "Wheel motor overloaded, left" :: (value1 === "37" ? "Charging current too high" :: (value1 === "38" ? "Electronic problem" :: (value1 === "39" ? "Cutting motor problem" :: (value1 === "40" ? "Limited cutting height range" :: (value1 === "41" ? "Unexpected cutting height adj" :: (value1 === "42" ? "Limited cutting height range" :: (value1 === "43" ? "Cutting height problem, drive" :: (value1 === "44" ? "Cutting height problem, curr" :: (value1 === "45" ? "Cutting height problem, dir" :: (value1 === "46" ? "Cutting height blocked" :: (value1 === "47" ? "Cutting height problem" :: (value1 === "48" ? "No response from charger" :: (value1 === "49" ? "Ultrasonic problem" :: (value1 === "50" ? "Guide 1 not found" :: (value1 === "51" ? "Guide 2 not found" :: (value1 === "52" ? "Guide 3 not found" :: (value1 === "53" ? "GPS navigation problem" :: (value1 === "54" ? "Weak GPS signal" :: (value1 === "55" ? "Difficult finding home" :: (value1 === "56" ? "Guide calibration accomplished" :: (value1 === "57" ? "Guide calibration failed" :: (value1 === "58" ? "Temporary battery problem" :: (value1 === "59" ? "Temporary battery problem" :: (value1 === "60" ? "Temporary battery problem" :: (value1 === "61" ? "Temporary battery problem" :: (value1 === "62" ? "Temporary battery problem" :: (value1 === "63" ? "Temporary battery problem" :: (value1 === "64" ? "Temporary battery problem" :: (value1 === "65" ? "Temporary battery problem" :: (value1 === "66" ? "Battery problem" :: (value1 === "67" ? "Battery problem" :: (value1 === "68" ? "Temporary battery problem" :: (value1 === "69" ? "Alarm! Mower switched off" :: (value1 === "70" ? "Alarm! Mower stopped" :: (value1 === "71" ? "Alarm! Mower lifted" :: (value1 === "72" ? "Alarm! Mower tilted" :: (value1 === "73" ? "Alarm! Mower in motion" :: (value1 === "74" ? "Alarm! Outside geofence" :: (value1 === "75" ? "Connection changed" :: (value1 === "76" ? "Connection NOT changed" :: (value1 === "77" ? "Com board not available" :: (value1 === "78" ? "Slipped - Mower has Slipped. Situation not solved with moving pattern" :: (value1 === "79" ? "Invalid battery combination - Invalid combination of different battery types." :: (value1 === "80" ? "Cutting system imbalance --Warning--" :: (value1 === "81" ? "Safety function faulty" :: (value1 === "82" ? "Wheel motor blocked, rear right" :: (value1 === "83" ? "Wheel motor blocked, rear left" :: (value1 === "84" ? "Wheel drive problem, rear right" :: (value1 === "85" ? "Wheel drive problem, rear left" :: (value1 === "86" ? "Wheel motor overloaded, rear right" :: (value1 === "87" ? "Wheel motor overloaded, rear left" :: (value1 === "88" ? "Angular sensor problem" :: (value1 === "89" ? "Invalid system configuration" :: (value1 === "90" ? "No power in charging station" :: (value1 === "91" ? "Switch cord problem" :: (value1 === "92" ? "Work area not valid" :: (value1 === "93" ? "No accurate position from satellites" :: (value1 === "94" ? "Reference station communication problem" :: (value1 === "95" ? "Folding sensor activated" :: (value1 === "96" ? "Right brush motor overloaded" :: (value1 === "97" ? "Left brush motor overloaded" :: (value1 === "98" ? "Ultrasonic Sensor 1 defect" :: (value1 === "99" ? "Ultrasonic Sensor 2 defect" :: (value1 === "100" ? "Ultrasonic Sensor 3 defect" :: (value1 === "101" ? "Ultrasonic Sensor 4 defect" :: (value1 === "102" ? "Cutting drive motor 1 defect" :: (value1 === "103" ? "Cutting drive motor 2 defect" :: (value1 === "104" ? "Cutting drive motor 3 defect" :: (value1 === "105" ? "Lift Sensor defect" :: (value1 === "106" ? "Collision sensor defect" :: (value1 === "107" ? "Docking sensor defect" :: (value1 === "108" ? "Folding cutting deck sensor defect" :: (value1 === "109" ? "Loop sensor defect" :: (value1 === "110" ? "Collision sensor error" :: (value1 === "111" ? "No confirmed position" :: (value1 === "112" ? "Cutting system major imbalance" :: (value1 === "113" ? "Complex working area" :: (value1 === "114" ? "Too high discharge current" :: (value1 === "115" ? "Too high internal current" :: (value1 === "116" ? "High charging power loss" :: (value1 === "117" ? "High internal power loss" :: (value1 === "118" ? "Charging system problem" :: (value1 === "119" ? "Zone generator problem" :: (value1 === "120" ? "Internal voltage error" :: (value1 === "121" ? "High internal temerature" :: (value1 === "122" ? "CAN error" :: (value1 === "123" ? "Destination not reachable" :: (value1 === "124" ? "Destination blocked" :: (value1 === "125" ? "Battery needs replacement" :: (value1 === "126" ? "Battery near end of life" :: (value1 === "127" ? "Battery problem" :: (value1 === "701" ? "Connectivity problem" :: (value1 === "702" ? "Connectivity settings restored" :: (value1 === "703" ? "Connectivity problem" :: (value1 === "704" ? "Connectivity problem" :: (value1 === "705" ? "Connectivity problem" :: (value1 === "706" ? "Poor signal quality" :: (value1 === "707" ? "SIM card requires PIN" :: (value1 === "708" ? "SIM card locked" :: (value1 === "709" ? "SIM card not found" :: (value1 === "710" ? "SIM card locked" :: (value1 === "711" ? "SIM card locked" :: (value1 === "712" ? "SIM card locked" :: (value1 === "713" ? "Geofence problem" :: (value1 === "714" ? "Geofence problem" :: (value1 === "715" ? "Connectivity problem" :: (value1 === "716" ? "Connectivity problem" :: (value1 === "717" ? "SMS could not be sent" :: (value1 === "724" ? "Communication circuit board SW must be updated" :: "errorCode #" + value1 + " unknown")))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))}
    ```

    (DE)

    ```
    {value1:husqvarna-automower.0.[mowerID vom DP .system.id].mower.errorCode;value1 === "0" ? "unerwarteter Fehler" :: (value1 === "1" ? "Außerhalb des Arbeitsbereichs" :: (value1 === "2" ? "Kein Schleifensignal" :: (value1 === "3" ? "Falsches Schleifensignal" :: (value1 === "4" ? "Problem mit dem Schleifensensor, vorne" :: (value1 === "5" ? "Problem mit dem Schleifensensor, hinten" :: (value1 === "6" ? "Schleifensensorproblem, links" :: (value1 === "7" ? "Schleifen-Sensorproblem, rechts" :: (value1 === "8" ? "Falscher PIN-Code" :: (value1 === "9" ? "Eingeklemmt" :: (value1 === "10" ? "Umgekippt" :: (value1 === "11" ? "Schwache Batterie" :: (value1 === "12" ? "Leerer Akku" :: (value1 === "13" ? "Kein Antrieb" :: (value1 === "14" ? "Mäher angehoben" :: (value1 === "15" ? "Angehoben" :: (value1 === "16" ? "Festgefahren in der Ladestation" :: (value1 === "17" ? "Ladestation blockiert" :: (value1 === "18" ? "Problem mit dem Auffahrsensor, hinten" :: (value1 === "19" ? "Problem mit dem Auffahrsensor, vorne" :: (value1 === "20" ? "Radmotor blockiert, rechts" :: (value1 === "21" ? "Radmotor blockiert, links" :: (value1 === "22" ? "Problem mit dem Radantrieb, rechts" :: (value1 === "23" ? "Problem mit dem Radantrieb, links" :: (value1 === "24" ? "Schneidsystem blockiert" :: (value1 === "25" ? "Schneidesystem blockiert" :: (value1 === "26" ? "Ungültige Untergerätekombination" :: (value1 === "27" ? "Einstellungen wiederhergestellt" :: (value1 === "28" ? "Problem mit der Speicherschaltung" :: (value1 === "29" ? "Steigung zu steil" :: (value1 === "30" ? "Problem mit dem Ladesystem" :: (value1 === "31" ? "Problem mit der STOP-Taste" :: (value1 === "32" ? "Problem mit dem Neigungssensor" :: (value1 === "33" ? "Mäher gekippt" :: (value1 === "34" ? "Mähen gestoppt - Hang zu steil" :: (value1 === "35" ? "Radmotor überlastet, rechts" :: (value1 === "36" ? "Radmotor überlastet, links" :: (value1 === "37" ? "Ladestrom zu hoch" :: (value1 === "38" ? "Elektronisches Problem" :: (value1 === "39" ? "Problem mit dem Schneidemotor" :: (value1 === "40" ? "Begrenzter Schnitthöhenbereich" :: (value1 === "41" ? "Unerwartete Schnitthöheneinstellung" :: (value1 === "42" ? "Begrenzter Schnitthöhenbereich" :: (value1 === "43" ? "Problem mit der Schnitthöhe, Antrieb" :: (value1 === "44" ? "Problem mit der Schnitthöhe, Strom" :: (value1 === "45" ? "Schnitthöhenproblem, dir" :: (value1 === "46" ? "Schnitthöhe blockiert" :: (value1 === "47" ? "Problem mit der Schnitthöhe" :: (value1 === "48" ? "Keine Reaktion vom Ladegerät" :: (value1 === "49" ? "Ultraschallproblem" :: (value1 === "50" ? "Führung 1 nicht gefunden" :: (value1 === "51" ? "Führung 2 nicht gefunden" :: (value1 === "52" ? "Führung 3 nicht gefunden" :: (value1 === "53" ? "GPS-Navigationsproblem" :: (value1 === "54" ? "Schwaches GPS-Signal" :: (value1 === "55" ? "Schwierig, nach Hause zu finden" :: (value1 === "56" ? "Leitfaden-Kalibrierung durchgeführt" :: (value1 === "57" ? "Leitfaden-Kalibrierung fehlgeschlagen" :: (value1 === "58" ? "Vorübergehendes Batterieproblem" :: (value1 === "59" ? "Vorübergehendes Batterieproblem" :: (value1 === "60" ? "Vorübergehendes Batterieproblem" :: (value1 === "61" ? "Vorübergehendes Batterieproblem" :: (value1 === "62" ? "Vorübergehendes Batterieproblem" :: (value1 === "63" ? "Vorübergehendes Batterieproblem" :: (value1 === "64" ? "Vorübergehendes Batterieproblem" :: (value1 === "65" ? "Vorübergehendes Batterieproblem" :: (value1 === "66" ? "Problem mit der Batterie" :: (value1 === "67" ? "Problem mit der Batterie" :: (value1 === "68" ? "Vorübergehendes Batterieproblem" :: (value1 === "69" ? "Alarm! Mäher ausgeschaltet" :: (value1 === "70" ? "Alarm! Mäher gestoppt" :: (value1 === "71" ? "Alarm! Mäher angehoben" :: (value1 === "72" ? "Alarm! Mäher gekippt" :: (value1 === "73" ? "Alarm! Mähwerk in Bewegung" :: (value1 === "74" ? "Alarm! Außerhalb des Geofence" :: (value1 === "75" ? "Verbindung geändert" :: (value1 === "76" ? "Verbindung NICHT geändert" :: (value1 === "77" ? "COM-Board nicht verfügbar" :: (value1 === "78" ? "Verrutscht - Mäher ist verrutscht. Situation nicht mit Bewegungsmuster gelöst" :: (value1 === "79" ? "Ungültige Batteriekombination - Ungültige Kombination von verschiedenen Batterietypen." :: (value1 === "80" ? "Ungleichgewicht des Schneidsystems --Warnung--" :: (value1 === "81" ? "Sicherheitsfunktion defekt" :: (value1 === "82" ? "Radmotor blockiert, hinten rechts" :: (value1 === "83" ? "Radmotor blockiert, hinten links" :: (value1 === "84" ? "Problem mit dem Radantrieb, hinten rechts" :: (value1 === "85" ? "Problem mit dem Radantrieb, hinten links" :: (value1 === "86" ? "Radmotor überlastet, hinten rechts" :: (value1 === "87" ? "Radmotor überlastet, hinten links" :: (value1 === "88" ? "Problem mit dem Winkelsensor" :: (value1 === "89" ? "Ungültige Systemkonfiguration" :: (value1 === "90" ? "Kein Strom in der Ladestation" :: (value1 === "91" ? "Problem mit dem Schaltkabel" :: (value1 === "92" ? "Arbeitsbereich nicht gültig" :: (value1 === "93" ? "Keine genaue Position von den Satelliten" :: (value1 === "94" ? "Kommunikationsproblem mit der Referenzstation" :: (value1 === "95" ? "Klappsensor aktiviert" :: (value1 === "96" ? "Rechter Bürstenmotor überlastet" :: (value1 === "97" ? "Linker Bürstenmotor überlastet" :: (value1 === "98" ? "Ultraschall-Sensor 1 defekt" :: (value1 === "99" ? "Ultraschall-Sensor 2 defekt" :: (value1 === "100" ? "Ultraschall-Sensor 3 defekt" :: (value1 === "101" ? "Ultraschall-Sensor 4 defekt" :: (value1 === "102" ? "Schneidantriebmotor 1 defekt" :: (value1 === "103" ? "Schneidantriebmotor 2 defekt" :: (value1 === "104" ? "Schneidantriebmotor 3 defekt" :: (value1 === "105" ? "Hebesensor defekt" :: (value1 === "106" ? "Kollisionssensor defekt" :: (value1 === "107" ? "Andocksensor defekt" :: (value1 === "108" ? "Sensor für klappbares Schneidwerk defekt" :: (value1 === "109" ? "Schleifensensor defekt" :: (value1 === "110" ? "Kollisionssensor defekt" :: (value1 === "111" ? "Keine bestätigte Position" :: (value1 === "112" ? "Große Unwucht des Schneidsystems" :: (value1 === "113" ? "Komplexer Arbeitsbereich" :: (value1 === "114" ? "Zu hoher Entladestrom" :: (value1 === "115" ? "Zu hoher interner Strom" :: (value1 === "116" ? "Hohe Ladeverlustleistung" :: (value1 === "117" ? "Hoher interner Leistungsverlust" :: (value1 === "118" ? "Problem mit dem Aufladesystem" :: (value1 === "119" ? "Problem mit dem Zonengenerator" :: (value1 === "120" ? "Interner Spannungsfehler" :: (value1 === "121" ? "Hohe interne Temperatur" :: (value1 === "122" ? "CAN-Fehler" :: (value1 === "123" ? "Ziel nicht erreichbar" :: (value1 === "124" ? "Ziel blockiert" :: (value1 === "125" ? "Batterie muss ausgetauscht werden" :: (value1 === "126" ? "Batterie hat bald das Ende ihrer Lebensdauer erreicht" :: (value1 === "127" ? "Problem mit der Batterie" :: (value1 === "701" ? "Problem mit der Konnektivität" :: (value1 === "702" ? "Konnektivitätseinstellungen wiederhergestellt" :: (value1 === "703" ? "Konnektivitätsproblem" :: (value1 === "704" ? "Konnektivitätsproblem" :: (value1 === "705" ? "Konnektivitätsproblem" :: (value1 === "706" ? "Schlechte Signalqualität" :: (value1 === "707" ? "SIM-Karte erfordert PIN" :: (value1 === "708" ? "SIM-Karte gesperrt" :: (value1 === "709" ? "SIM-Karte nicht gefunden" :: (value1 === "710" ? "SIM-Karte gesperrt" :: (value1 === "711" ? "SIM-Karte gesperrt" :: (value1 === "712" ? "SIM-Karte gesperrt" :: (value1 === "713" ? "Geofence-Problem" :: (value1 === "714" ? "Geofence-Problem" :: (value1 === "715" ? "Konnektivitätsproblem" :: (value1 === "716" ? "Konnektivitätsproblem" :: (value1 === "717" ? "SMS können nicht gesendet werden" :: (value1 === "724" ? "Kommunikationsplatine SW muss aktualisiert werden" :: "Aktivität #" + value1 + " unbekannt")))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))}
    ```

-   Datapoint `husqvarna-automower.0.[mowerID from DP .system.id].mower.activity`:

    (EN)

    ```
    {value1:husqvarna-automower.0.[mowerID from DP .system.id].mower.activity;value1 === "UNKNOWN" ? "Unknown activity" :: (value1 === "NOT_APPLICABLE" ? "Manual start required in mower." :: (value1 === "MOWING" ? "Mower is mowing lawn. If in demo mode the blades are not in operation." :: (value1 === "GOING_HOME" ? "Mower is going home to the charging station." :: (value1 === "CHARGING" ? "Mower is charging in station due to low battery." :: (value1 === "LEAVING" ? "Mower is leaving the charging station." :: (value1 === "PARKED_IN_CS" ? "Mower is parked in charging station." :: (value1 === "STOPPED_IN_GARDEN" ? "Mower has stopped. Needs manual action to resume." :: "activity #" + value1 + " unknown")))))))}
    ```

    (DE)

    ```
    {value1:husqvarna-automower.0.[mowerID vom DP .system.id].mower.activity;value1 === "UNKNOWN" ? "unbekannte Aktivität" :: (value1 === "NOT_APPLICABLE" ? "Manueller Start des Mähers erforderlich." :: (value1 === "MOWING" ? "Der Mäher mäht den Rasen. Im Demomodus sind die Messer nicht in Betrieb." :: (value1 === "GOING_HOME" ? "Der Mäher geht nach Hause in die Ladestation." :: (value1 === "CHARGING" ? "Der Mäher wird in der Station aufgeladen, da die Batterie leer ist." :: (value1 === "LEAVING" ? "Der Mäher verlässt die Ladestation." :: (value1 === "PARKED_IN_CS" ? "Der Mäher ist in der Ladestation geparkt." :: (value1 === "STOPPED_IN_GARDEN" ? "Der Mäher ist stehen geblieben. Erfordert einen manuellen Eingriff, um fortzufahren." :: "Aktivität #" + value1 + " unbekannt")))))))}
    ```

-   Datapoint `husqvarna-automower.0.[mowerID from DP .system.id].mower.mode`:

    (EN)

    ```
    {value1:husqvarna-automower.0.[mowerID from DP .system.id].mower.mode;value1 === "MAIN_AREA" ? "Mower will mow until low battery. Go home and charge. Leave and continue mowing. Week schedule is used. Schedule can be overridden with forced park or forced mowing." :: (value1 === "DEMO" ? "No blade operation - Mower will mow until low battery. Go home and charge. Leave and continue mowing. Week schedule is used. Schedule can be overridden with forced park or forced mowing." :: (value1 === "SECONDARY_AREA" ? "Mower is in secondary area. Schedule is overridden with forced park or forced mowing. Mower will mow for request time or untill the battery runs out." :: (value1 === "HOME" ? "Mower goes home and parks forever. Week schedule is not used. Cannot be overridden with forced mowing." :: (value1 === "UNKNOWN" ? "Unknown mode" :: "mode #" + value1 + " unknown"))))}
    ```

    (DE)

    ```
    {value1:husqvarna-automower.0.[mowerID vom DP .system.id].mower.mode;value1 === "MAIN_AREA" ? "Der Mäher mäht, bis die Batterie leer ist. Nach Hause gehen und aufladen. Abfahren und weiter mähen. Wochenplan wird verwendet. Der Zeitplan kann durch Zwangsparken oder Zwangsmähen außer Kraft gesetzt werden." :: (value1 === "DEMO" ? "Kein Messerbetrieb - Der Mäher mäht, bis die Batterie leer ist. Nach Hause gehen und aufladen. Abfahren und weiter mähen. Wochenplan wird verwendet. Der Zeitplan kann durch Zwangsparken oder Zwangsmähen außer Kraft gesetzt werden." :: (value1 === "SECONDARY_AREA" ? "Der Mäher befindet sich im Nebenbereich. Der Zeitplan wird durch Zwangsparken oder Zwangsmähen außer Kraft gesetzt. Der Mäher mäht für die angeforderte Zeit oder bis die Batterie leer ist." :: (value1 === "HOME" ? "Der Mäher fährt nach Hause und parkt für immer. Der Wochenplan wird nicht verwendet. Kann nicht durch erzwungenes Mähen außer Kraft gesetzt werden." :: (value1 === "UNKNOWN" ? "Unbekannte Betriebsart" :: "Aktivität #" + value1 + " unbekannt"))))}
    ```

-   Datapoint `husqvarna-automower.0.[mowerID from DP .system.id].mower.state`:

    (EN)

    ```
    {value1:husqvarna-automower.0.[mowerID from DP .system.id].mower.state;value1 === "UNKNOWN" ? "Unknown state" :: (value1 === "NOT_APPLICABLE" ? "Not Applicable" :: (value1 === "PAUSED" ? "Mower has been paused by user." :: (value1 === "IN_OPERATION" ? "See value in activity for status." :: (value1 === "WAIT_UPDATING" ? "Mower is downloading new firmware." :: (value1 === "WAIT_POWER_UP" ? "Mower is performing power up tests." :: (value1 === "RESTRICTED" ? "Mower can currently not mow due to week calender, or override park." :: (value1 === "OFF" ? "Mower is turned off." :: (value1 === "STOPPED" ? "Mower is stopped, requires manual action." :: (value1 === "ERROR" ? "An error has occurred. Check errorCode. Mower requires manual action." :: (value1 === "FATAL_ERROR" ? "An fatal error has occurred. Check errorCode. Mower requires manual action." :: (value1 === "ERROR_AT_POWER_UP" ? "An error at power up has occurred. Check errorCode. Mower requires manual action." :: "state #" + value1 + " unknown")))))))))))}
    ```

    (DE)

    ```
    {value1:husqvarna-automower.0.[mowerID vom DP .system.id].mower.chargingTimeToday and chargingTimeTotalstate;value1 === "UNKNOWN" ? "unbekannter Zustand" :: (value1 === "NOT_APPLICABLE" ? "nicht zutreffend" :: (value1 === "PAUSED" ? "Der Mäher wurde vom Benutzer angehalten." :: (value1 === "IN_OPERATION" ? "Siehe Wert in Aktivität für Status." :: (value1 === "WAIT_UPDATING" ? "Der Mäher lädt eine neue Firmware herunter." :: (value1 === "WAIT_POWER_UP" ? "Der Mäher führt Einschalttests durch." :: (value1 === "RESTRICTED" ? "Mäher kann derzeit nicht mähen aufgrund von Wochenkalender oder manuellem Parkieren." :: (value1 === "OFF" ? "Der Mäher ist ausgeschaltet." :: (value1 === "STOPPED" ? "Mäher ist gestoppt, erfordert manuellen Eingriff." :: (value1 === "ERROR" ? "Es ist ein Fehler aufgetreten. Prüfen Sie die Fehermeldung. Mäher erfordert manuellen Eingriff." :: (value1 === "FATAL_ERROR" ? "Es ist ein schwerwiegender Fehler aufgetreten. Prüfen Sie die Fehlermeldung. Mäher erfordert manuellen Eingriff." :: (value1 === "ERROR_AT_POWER_UP" ? "Es ist ein Fehler beim Einschalten aufgetreten. Prüfen Sie die Fehlermeldung. Mäher erfordert manuellen Eingriff." :: "Aktivität #" + value1 + " unbekannt")))))))))))}
    ```

## Script for statistics

_(initial script by @ArnoD15, modified by @ice987987)_

The following value will be calculated:

-   Charging Time Today and Charging Time Total
-   Mowing Time Today and Mowing Time Total
-   Driven Distance Today and Driven Distance Total
-   Distance between mower and charging station
-   Convert start and end time of schedules to minutes and hours
-   Create/update google maps link
-   Possibility to park mower during rain until next schedule
-   Calculation of remaining knive running time in percent

For use, copy the following code into a new [Javascript](https://github.com/ioBroker/ioBroker.javascript)-Script and fill in the following variables: `instance`, `pathLevel1`, `pathLevel2`, `mowerID`, `sID_RainSensor` and `targetBladeCuttingTime` in section `USER CONFIGURATION`.

```
//***************************************************************************************************
//++++++++++++++++++++++++++++++++++++++++ USER CONFIGURATION +++++++++++++++++++++++++++++++++++++++

const instance = '0_userdata.0';                                                    // Type your instance name
const pathLevel1 = 'husqvarna';                                                     // Type your path name
const pathLevel2 = ['statistics', 'schedules', 'general', 'blades', 'actions'];     // Type your folder names
const mowerID = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';                             // Mower ID from Husqvarna automower
const sID_RainSensor = 'hm-rpc.0.12345678901234.1.RAINING';                         // Path rain sensor (true = rain)
const targetBladeCuttingTime = 180_000_000;                                         // Which time should a set of knives run in milliseconds (180_000_000ms = 50h)

//++++++++++++++++++++++++++++++++++++++ END USER CONFIGURATION +++++++++++++++++++++++++++++++++++++
//***************************************************************************************************

// create required folders and states
createState();
async function createState() {
    for (let i = 0; i < 4; i++) {
        createStateAsync(`${instance}.${pathLevel1}.${pathLevel2[1]}.startTime_${i}`, '00:00', false, {name: `Schedule ${i} start time`, role: 'value', type: 'string', read: true, write: true, def: '00:00'});
        createStateAsync(`${instance}.${pathLevel1}.${pathLevel2[1]}.endTime_${i}`, '00:00', false, {name: `Schedule ${i} end time`, role: 'value', type: 'string', read: true, write: true, def: '00:00'});
    };
    await createStateAsync(`${instance}.${pathLevel1}.${pathLevel2[0]}.drivenDistanceToday`, 0, false, {name: 'Driven Distance Today', role: 'state', type: 'number', read: true, write: false, def: 0, unit: 'km'});
    await createStateAsync(`${instance}.${pathLevel1}.${pathLevel2[0]}.drivenDistanceTotal`, 0, false, {name: 'Driven Distance Total', role: 'state', type: 'number', read: true, write: false, def: 0, unit: 'km'});
    await createStateAsync(`${instance}.${pathLevel1}.${pathLevel2[0]}.chargingTimeToday`, 0, false, {name: 'Charging Time Today', role: 'state', type: 'number', read: true, write: false, def: 0, unit: 'ms'});
    await createStateAsync(`${instance}.${pathLevel1}.${pathLevel2[0]}.mowingTimeToday`, 0, false, {name: 'Mowing Time Total', role: 'state', type: 'number', read: true, write: false, def: 0, unit: 'ms'});
    await createStateAsync(`${instance}.${pathLevel1}.${pathLevel2[3]}.currentBladeCuttingTime`, 0, false, {name: 'Current Blade Cutting Time', desc: 'How many seconds was the current set of knives run', role: 'state', type: 'number', read: true, write: false, def: 0, unit: 'ms'});
    await createStateAsync(`${instance}.${pathLevel1}.${pathLevel2[3]}.reset`, false, false, {name: 'Reset', desc: 'Restart counter after knife change', role: 'button', type: 'boolean', read: true, write: true, def: false});
    await createStateAsync(`${instance}.${pathLevel1}.${pathLevel2[3]}.changeBlades`, false, false, {name: 'Change Blades', role: 'state', type: 'boolean', read: true, write: false, def: false});
    await createStateAsync(`${instance}.${pathLevel1}.${pathLevel2[3]}.remainingCuttingCapacity`, 100, false, {name: 'Remaining cutting Capacity', desc: 'in percent', role: 'state', type: 'number', read: true, write: false, def: 100, max: 100, unit: '%'});
    await createStateAsync(`${instance}.${pathLevel1}.${pathLevel2[0]}.distanceFromChargingStation`, 0, false, {name: 'Distance from charging station', role: 'state', type: 'number', read: true, write: false, def: 0, unit: 'm'});
    await createStateAsync(`${instance}.${pathLevel1}.${pathLevel2[2]}.GoogleMapsLink`, '', false, {name: 'Google Maps Link', role: 'value', type: 'string', read: true, write: false, def: ''});
    await createStateAsync(`${instance}.${pathLevel1}.${pathLevel2[4]}.parkAfterNextChargingCycle`, false, false, {name: 'Park after next charging cycle', role: 'state', type: 'boolean', read: true, write: true, def: false});
    log('-==== folders and states created ====-', 'debug');
};

const sID_HusqvarnaSchedules = [];
$(`state[id=husqvarna-automower.0.${mowerID}.ACTIONS.schedule.*.start]`).each(function(id) {
    sID_HusqvarnaSchedules.push(id);
});
$(`state[id=husqvarna-automower.0.${mowerID}.ACTIONS.schedule.*.duration]`).each(function(id) {
    sID_HusqvarnaSchedules.push(id);
});

let drivenDistanceToday = getState(`${instance}.${pathLevel1}.${pathLevel2[0]}.drivenDistanceToday`).val;
let drivenDistanceTotal = getState(`${instance}.${pathLevel1}.${pathLevel2[0]}.drivenDistanceTotal`).val;
let drivenDistance = 0;
let chargingTimeToday = getState(`${instance}.${pathLevel1}.${pathLevel2[0]}.chargingTimeToday`).val;
let chargingTime = 0;
let mowingTimeToday = getState(`${instance}.${pathLevel1}.${pathLevel2[0]}.mowingTimeToday`).val;
let mowingTime = 0;
let bladeCuttingTime = 0;
let remainingBladeCapacity = 0;
let chargingStationLatitude = 0;
let chargingStationLongitude = 0;
let distanceFromChargingStation = 0;

// reset variables "[...]Today" every midnight
schedule('0 0 * * *', function () {
    drivenDistanceToday = 0;
    setState(`${instance}.${pathLevel1}.${pathLevel2[0]}.drivenDistanceToday`, drivenDistanceToday, true);
    chargingTimeToday = 0;
    setState(`${instance}.${pathLevel1}.${pathLevel2[0]}.chargingTimeToday`, chargingTimeToday, true);
    mowingTimeToday = 0;
    setState(`${instance}.${pathLevel1}.${pathLevel2[0]}.mowingTimeToday`, mowingTimeToday, true);
});

// get chargingTimeToday and chargingTimeTotal
on({id: `husqvarna-automower.0.${mowerID}.mower.activity`, oldVal: 'CHARGING'}, function (obj) {
    chargingTime = obj.state.ts - obj.oldState.ts;
    log(`chargingTime: ${chargingTime / 1000}s`, 'debug');
    chargingTimeToday = chargingTime + chargingTimeToday;
    setState(`${instance}.${pathLevel1}.${pathLevel2[0]}.chargingTimeToday`, chargingTimeToday, true);
});

// get mowingTimeToday, mowingTimeTotal, bladeCuttingTime and remainingBladeCapacity
on({id: `husqvarna-automower.0.${mowerID}.mower.activity`, oldVal: 'MOWING'}, function (obj) {
    mowingTime = obj.state.ts - obj.oldState.ts;
    log(`mowingTime: ${mowingTime / 1000}s`, 'debug');
    mowingTimeToday = mowingTime + mowingTimeToday;
    setState(`${instance}.${pathLevel1}.${pathLevel2[0]}.mowingTimeToday`, mowingTimeToday, true);

    let currentBladeCuttingTime = getState(`${instance}.${pathLevel1}.${pathLevel2[3]}.currentBladeCuttingTime`).val;
    
    bladeCuttingTime = mowingTime + currentBladeCuttingTime;
    setState(`${instance}.${pathLevel1}.${pathLevel2[3]}.currentBladeCuttingTime`, bladeCuttingTime, true);

    remainingBladeCapacity = 100 - (currentBladeCuttingTime * 100) / targetBladeCuttingTime;
    setState(`${instance}.${pathLevel1}.${pathLevel2[3]}.remainingCuttingCapacity`, remainingBladeCapacity, true);
});

// reset values after blade change
on({id: `${instance}.${pathLevel1}.${pathLevel2[3]}.reset`, val: true, ack: false}, function () {
    setState(`${instance}.${pathLevel1}.${pathLevel2[3]}.remainingCuttingCapacity`, 100, true);
    setState(`${instance}.${pathLevel1}.${pathLevel2[3]}.changeBlades`, false, true);
    setState(`${instance}.${pathLevel1}.${pathLevel2[3]}.currentBladeCuttingTime`, 0, true);
});

// get distance from automower to charging station, drivenDistanceToday and drivenDistanceTotal
on({id: `husqvarna-automower.0.${mowerID}.positions.latlong`, change: 'ne'}, async function (obj) {
    if (getState(`husqvarna-automower.0.${mowerID}.mower.activity`).val === 'CHARGING' || getState(`husqvarna-automower.0.${mowerID}.mower.activity`).val === 'PARKED_IN_CS') {
        if (chargingStationLatitude !== 0 && chargingStationLongitude !== 0) {
            chargingStationLatitude = (Number(obj.state.val.split(';')[0]) + Number(chargingStationLatitude)) / 2;
            chargingStationLongitude = (Number(obj.state.val.split(';')[1]) + Number(chargingStationLongitude)) / 2;
        } else {
            chargingStationLatitude = obj.state.val.split(';')[0];
            chargingStationLongitude = obj.state.val.split(';')[1];
        };
    };
    distanceFromChargingStation = 1000 * (6378.388 * Math.acos(Math.sin(obj.state.val.split(';')[0] * (Math.PI / 180)) * Math.sin(chargingStationLatitude * (Math.PI / 180)) + Math.cos(obj.state.val.split(';')[0] * (Math.PI / 180)) * Math.cos(chargingStationLatitude * (Math.PI / 180)) * Math.cos(chargingStationLongitude * (Math.PI / 180) - obj.state.val.split(';')[1] * (Math.PI / 180)))); // reference: https://www.kompf.de/gps/distcalc.html
    log(`distanceFromChargingStation: ${round(distanceFromChargingStation, 2)}m`, 'debug');
    await setStateAsync(`${instance}.${pathLevel1}.${pathLevel2[0]}.distanceFromChargingStation`, distanceFromChargingStation, true);
    
    if (getState(`husqvarna-automower.0.${mowerID}.mower.activity`).val === 'MOWING' || getState(`husqvarna-automower.0.${mowerID}.mower.activity`).val === 'GOING_HOME' || getState(`husqvarna-automower.0.${mowerID}.mower.activity`).val === 'LEAVING') {
        drivenDistance = 6378.388 * Math.acos(Math.sin(obj.state.val.split(';')[0] * (Math.PI / 180)) * Math.sin(obj.oldState.val.split(';')[0] * (Math.PI / 180)) + Math.cos(obj.state.val.split(';')[0] * (Math.PI / 180)) * Math.cos(obj.oldState.val.split(';')[0] * (Math.PI / 180)) * Math.cos(obj.oldState.val.split(';')[1] * (Math.PI / 180) - obj.state.val.split(';')[1] * (Math.PI / 180))); // reference: https://www.kompf.de/gps/distcalc.html
        log(`distanceDriven: ${round(drivenDistance * 1000, 2)}m`, 'debug');
        drivenDistanceToday = drivenDistanceToday + drivenDistance;
        drivenDistanceTotal = drivenDistanceTotal + drivenDistance;
        await setStateAsync(`${instance}.${pathLevel1}.${pathLevel2[0]}.drivenDistanceToday`, round(drivenDistanceToday, 2), true);
        await setStateAsync(`${instance}.${pathLevel1}.${pathLevel2[0]}.drivenDistanceTotal`, round(drivenDistanceTotal, 2), true);
    };
});

// Convert start and end time to minutes
$(`state[id=${instance}.${pathLevel1}.${pathLevel2[1]}.*]`).on(async function (obj) {
    if (obj.id.split('.')[obj.id.split('.').length - 1].split('_')[0] === 'startTime') {
        let startTime = obj.state.val.split(':')[0] * 60 + Number(obj.state.val.split(':')[1]);
        setState(`husqvarna-automower.0.${mowerID}.ACTIONS.schedule.${obj.id.split('.')[obj.id.split('.').length - 1].split('_')[1]}.start`, startTime, false);
        let endTime = (await getStateAsync(`${instance}.${pathLevel1}.${pathLevel2[1]}.endTime_${obj.id.split('.')[obj.id.split('.').length - 1].split('_')[1]}`)).val;
        let duration = endTime.split(':')[0] * 60 + Number(endTime.split(':')[1]) - startTime;
        setState(`husqvarna-automower.0.${mowerID}.ACTIONS.schedule.${obj.id.split('.')[obj.id.split('.').length - 1].split('_')[1]}.duration`, duration, false);
    } else {
        let startTime = (await getStateAsync(`${instance}.${pathLevel1}.${pathLevel2[1]}.startTime_${obj.id.split('.')[obj.id.split('.').length - 1].split('_')[1]}`)).val;
        let startTimeMin = startTime.split(':')[0] * 60 + Number(startTime.split(':')[1]);
        let duration = obj.state.val.split(':')[0] * 60 + Number(obj.state.val.split(':')[1]) - startTimeMin;
        setState(`husqvarna-automower.0.${mowerID}.ACTIONS.schedule.${obj.id.split('.')[obj.id.split('.').length - 1].split('_')[1]}.duration`, duration, false);
    };
});

// Convert start and end time to hh:mm
on({id: sID_HusqvarnaSchedules, change: 'ne', ack: true}, async function (obj) {
    if (obj.id.split('.')[obj.id.split('.').length - 1] === 'start') {
        let m = obj.state.val % 60;
        let h = (obj.state.val - m) / 60;
        let HHMM = `${(h < 10 ? '0' : '')}${h.toString()}:${(m < 10 ? '0' : '')}${m.toString()}`;
        await setStateAsync(`${instance}.${pathLevel1}.${pathLevel2[1]}.startTime_${obj.id.split('.')[obj.id.split('.').length - 2]}`, HHMM, true);
        let endTime = obj.state.val + (await getStateAsync(`husqvarna-automower.0.${mowerID}.ACTIONS.schedule.${obj.id.split('.')[obj.id.split('.').length - 2]}.duration`)).val;
        let m1 = endTime % 60;
        let h1 = (endTime - m1) / 60;
        let HHMM1 = `${(h1 < 10 ? '0' : '')}${h1.toString()}:${(m1 < 10 ? '0' : '')}${m1.toString()}`;
        await setStateAsync(`${instance}.${pathLevel1}.${pathLevel2[1]}.endTime_${obj.id.split('.')[obj.id.split('.').length - 2]}`, HHMM1, true);
    } else {
        let startTime = (await getStateAsync(`husqvarna-automower.0.${mowerID}.ACTIONS.schedule.${obj.id.split('.')[obj.id.split('.').length - 2]}.start`)).val;
        let endTime = startTime + obj.state.val;
        let m = endTime % 60;
        let h = (endTime - m) / 60;
        let HHMM = `${(h < 10 ? '0' : '')}${h.toString()}:${(m < 10 ? '0' : '')}${m.toString()}`;
        await setStateAsync(`${instance}.${pathLevel1}.${pathLevel2[1]}.endTime_${obj.id.split('.')[obj.id.split('.').length - 2]}`, HHMM, true);
    };
});

// update google maps link
on({id: `husqvarna-automower.0.${mowerID}.positions.latlong`, change: 'ne'}, async function (obj) {
    let arrayLatLong = getState(obj.id).val.split(';');
    let GoogleLink = `https://www.google.com/maps/place/${arrayLatLong[0]},${arrayLatLong[1]}/@?hl=de`;
    await setStateAsync(`${instance}.${pathLevel1}.${pathLevel2[2]}.GoogleMapsLink`, GoogleLink, true);
});

// during rain, park until next schedule
on({id: sID_RainSensor, change: 'ne', val: true}, async function () {
   await setStateAsync(`husqvarna-automower.0.${mowerID}.ACTIONS.PARKUNTILNEXTSCHEDULE`, true);
   log('-==== It is raining. Mower is parked. ====-', 'info');
});

// park after next charging cycle
on({id: `husqvarna-automower.0.${mowerID}.mower.activity`, change: 'ne', val: 'CHARGING'}, function () {
    if (getState(`${instance}.${pathLevel1}.${pathLevel2[4]}.parkAfterNextChargingCycle`).val) {
        setState(`husqvarna-automower.0.${mowerID}.ACTIONS.PARKUNTILFURTHERNOTICE`, true, true);
        setState(`${instance}.${pathLevel1}.${pathLevel2[4]}.parkAfterNextChargingCycle`, false, true);
    };
});

// round
function round(digit, digits) {
    digit = (Math.round(digit * Math.pow(10, digits)) / Math.pow(10, digits));
    return digit;
};
```

## How to report issues and feature requests

-   For issues
    Please use [GitHub issues](https://github.com/ice987987/ioBroker.husqvarna-automower/issues/new/choose) -> "Bug report" and fill in the form.

    Set the adapter to debug log mode (Instances -> Expert mode -> Column Log level). Get the logfile from disk (subdirectory "log" in ioBroker installation directory and not from Admin because Admin cuts the lines). Check that there are no personal information before you publish your log.

-   For feature requests
    Please use [GitHub issues](https://github.com/ice987987/ioBroker.husqvarna-automower/issues/new/choose) -> "Feature request" and fill in the form.

## Changelog

<!-- ### **WORK IN PROGRESS** -->

### 0.4.0 (07.07.2023)

-   (ice987987) BREAKING: `.settings.cuttingHeight` and `.settings.headlight` removed [#99](https://github.com/ice987987/ioBroker.husqvarna-automower/issues/99)
-   (ice987987) BREAKING: `.calendar.[0-3].start`, `.calendar.[0-3].duration`, `.calendar.[0-3].monday`, `.calendar.[0-3].tuesday`, `.calendar.[0-3].wednesday`, `.calendar.[0-3].thurdsay`, `.calendar.[0-3].friday`, `.calendar.[0-3].saturday` and `.calendar.[0-3].sunday` removed
-   (ice987987) BREAKING: node.js >= v16.4 and js-controller >= v4.0.24
-   (ice987987) dependencies updated
-   (ice987987) adapter icon updated
-   (ice987987) script for statistics updated

### 0.3.3 (11.05.2023)

-   (MK-2001) simple check if response contains geo data added [#98](https://github.com/ice987987/ioBroker.husqvarna-automower/issues/98)
-   (ice987987) dependencies updated

### 0.3.2 (30.03.2023)

-   (ice987987) BREAKING: admin >= v6.3.5 is required
-   (ice987987) section "disclaimer" in readme added
-   (ice987987) ukrainian language added

### 0.3.1 (04.11.2022)

-   (ice987987) BREAKING: js-controller >= v4.0.23 and admin >= v6.2.19 is required
-   (ice987987) source code improvements
-   (ice987987) ability to update statistical values
-   (ice987987) update dependencies
-   (ice987987) restructure feature request form
-   (ice987987) fix issue [#65](https://github.com/ice987987/ioBroker.husqvarna-automower/issues/65)

### 0.3.0 (08.08.2022)

-   (ice987987) improved logging
-   (ice987987) update dependencies
-   (ice987987) update of vis binding `husqvarna-automower.0.[mowerID from DP .system.id].mower.errorCode`
-   (ice978987) update of `common.states` of `.mower.errorCode`
-   (ice987987) adding German translations of vis-Bindings
-   (ice987987) adding Javascript-Script for statistics (`Distance between mower and charging station`)
-   (ice987987) adding statistics values from the Automower Connect API `.statistics.cuttingBladeUsageTime`, `.statistics.numberOfChargingCycles`, `.statistics.numberOfCollisions`, `.statistics.totalChargingTime`, `.statistics.totalCuttingTime`, `.statistics.totalRunningTime` and `.statistics.totalSearchingTime`
-   (ice987987) adding feature request form

### 0.2.0 (14.06.2022)

-   (ice987987) support new login procedure to husqvarna's webservice using "Application key" and "Application secret" instead of "username (emailadress)" and "password" (issue [#33](https://github.com/ice987987/ioBroker.husqvarna-automower/issues/33))
-   (ice987987) update links to husqvarna homepage due to their updated homepage
-   (ice987987) improved bug-report form

### 0.1.0 (05.06.2022)

-   (ice987987) password encryption added (user need to reenter the password once after update, this change requires admin >= v4.0.9)
-   (ice987987) clean up code
-   (ice987987) implementation of JSON config (this change requires js-controller >= v3.3.19 and admin >= v5.1.28)
-   (ice987987) node.js >= v14.0 is required
-   (ice987987) update dependencies

### 0.0.6 (26.05.2022)

-   (ice987987) update dependencies
-   (ice987987) add some more limitations in readme

### 0.0.5 (02.05.2022)

-   (ice987987) fix issue [#10](https://github.com/ice987987/ioBroker.husqvarna-automower/issues/10)
-   (ice987987) store all GPS-values (delay of 500ms if more than one was received)
-   (ice987987) improved error handling
-   (ice987987) improved debug output messages

### 0.0.4 (16.04.2022)

-   (ice987987) update dependencies
-   (ice978987) add section "Available values" in readme
-   (ice987987) add section "ioBroker.vis bindings" in readme
-   (ice987987) add section "How to report issues and feature requests" in readme
-   (ice987987) fix calendar (max 4)
-   (ice987987) preload values after first install
-   (ice987987) fix issue [#9](https://github.com/ice987987/ioBroker.husqvarna-automower/issues/9)
-   (ice987987) update `common.states` of `.mower.errorCode`

### 0.0.3 (14.03.2022)

-   (ice987987) initial npm release

### 0.0.2 (11.03.2022)

-   (ice987987) initial npm release

### 0.0.1 (04.03.2022)

-   (ice987987) initial release

## License

MIT License

Copyright (c) 2023 ice987987 <mathias.frei1@gmail.com>

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
