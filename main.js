'use strict';

/*
 * Created with @iobroker/create-adapter v2.0.2
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require('@iobroker/adapter-core');

// Load your modules here, e.g.:
const axios = require('axios').default;
const WebSocket = require('ws');

// variables
const numberOfSchedules = 4;
const isValidApplicationCredential = /[a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{12}/; // format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

class HusqvarnaAutomower extends utils.Adapter {

	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	constructor(options) {
		super({
			...options,
			name: 'husqvarna-automower',
		});
		this.on('ready', this.onReady.bind(this));
		this.on('stateChange', this.onStateChange.bind(this));
		this.on('unload', this.onUnload.bind(this));

		this.access_token = null;
		this.mowerData = null;

		this.firstStart = true;

		this.autoRestartTimeout = null;
		this.ping = null;
		this.pingTimeout = null;
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	async onReady() {
		// Initialize your adapter here
		this.log.info('starting adapter "husqvarna-automower"...');

		// Reset the connection indicator during startup
		this.setState('info.connection', false, true);

		// The adapters config (in the instance object everything under the attribute "native") is accessible via this.config:
		this.log.debug(`config.applicationKey: ${this.config.applicationKey}`);
		this.log.debug(`config.applicationSecret: ${this.config.applicationSecret}`);

		// check applicationKey
		if (!isValidApplicationCredential.test(this.config.applicationKey)) {
			this.log.error('"Application Key" is not valid (allowed format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx) (ERR_#001)');
			return;
		}
		// check applicationSecret
		if (!isValidApplicationCredential.test(this.config.applicationSecret)) {
			this.log.error('"Application Secret" is not valid (allowed format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx) (ERR_#002)');
			return;
		}

		this.log.debug('The configuration has been checked successfully. Trying to connect "Automower Connect API"...');

		try {
			// get Husqvarna access_token
			await this.getAccessToken();

			// get data from husqvarna API
			await this.getMowerData();

			this.setStateAsync('info.connection', true, true);

			// create objects
			await this.createObjects(this.mowerData);

			// fill in objects
			await this.fillObjects(this.mowerData);

			// establish WebSocket connection
			await this.connectToWS();

		} catch (error) {
			this.log.error(error);
		}
	}

	// https://developer.husqvarnagroup.cloud/apis/authentication-api#readme
	async getAccessToken() {
		await axios({
			method: 'POST',
			url: 'https://api.authentication.husqvarnagroup.dev/v1/oauth2/token',
			data: `grant_type=client_credentials&client_id=${this.config.applicationKey}&client_secret=${this.config.applicationSecret}`
		})
			.then((response) => {
				this.log.debug(`[getAccessToken]: HTTP status response: ${response.status} ${response.statusText}; config: ${JSON.stringify(response.config)}; headers: ${JSON.stringify(response.headers)}; data: ${JSON.stringify(response.data)}`);

				this.access_token = response.data.access_token;

				if (this.firstStart === true) {
					this.log.info('"Husqvarna Authentication API Access token" received.');
				} else {
					this.log.debug('"Husqvarna Authentication API Access token" received.');
				}
			})
			.catch((error) => {
				if (error.response) {
					// The request was made and the server responded with a status code that falls out of the range of 2xx
					this.log.debug(`[getAccessToken]: HTTP status response: ${error.response.status}; headers: ${JSON.stringify(error.response.headers)}; data: ${JSON.stringify(error.response.data)}`);
				} else if (error.request) {
					// The request was made but no response was received `error.request` is an instance of XMLHttpRequest in the browser and an instance of http.ClientRequest in node.js
					this.log.debug(`[getAccessToken]: error request: ${error}`);
				} else {
					// Something happened in setting up the request that triggered an Error
					this.log.debug(`[getAccessToken]: error message: ${error.message}`);
				}
				this.log.debug(`[getAccessToken]: error.config: ${JSON.stringify(error.config)}`);
				throw new Error ('"Automower Connect API" not reachable. (ERR_#003)');
			});
	}

	// https://developer.husqvarnagroup.cloud/apis/automower-connect-api#readme
	async getMowerData() {
		await axios({
			method: 'GET',
			url: 'https://api.amc.husqvarna.dev/v1/mowers',
			headers: {
				'Authorization': `Bearer ${this.access_token}`,
				'X-Api-Key': this.config.applicationKey,
				'Authorization-Provider': 'husqvarna'
			}
		})
			.then((response) => {
				this.log.debug(`[getMowerData]: HTTP status response: ${response.status} ${response.statusText}; config: ${JSON.stringify(response.config)}; headers: ${JSON.stringify(response.headers)}; data: ${JSON.stringify(response.data)}`);

				this.mowerData = response.data.data;
			})
			.catch((error) => {
				if (error.response) {
					// The request was made and the server responded with a status code that falls out of the range of 2xx
					this.log.debug(`[getMowerData]: HTTP status response: ${error.response.status}; headers: ${JSON.stringify(error.response.headers)}; data: ${JSON.stringify(error.response.data)}`);
				} else if (error.request) {
					// The request was made but no response was received `error.request` is an instance of XMLHttpRequest in the browser and an instance of http.ClientRequest in node.js
					this.log.debug(`[getMowerData]: error request: ${error}`);
				} else {
					// Something happened in setting up the request that triggered an Error
					this.log.debug(`[getMowerData]: error message: ${error.message}`);
				}
				this.log.debug(`[getMowerData]: error.config: ${JSON.stringify(error.config)}`);
				throw new Error ('"Automower Connect API" not reachable. (ERR_#004)');
			});
	}

	// https://github.com/ioBroker/ioBroker.docs/blob/master/docs/en/dev/objectsschema.md
	// https://github.com/ioBroker/ioBroker/blob/master/doc/STATE_ROLES.md#state-roles
	async createObjects(mowerData) {
		// this.log.debug(`[createObjects]: listMowers: ${JSON.stringify(listMowers)}`);

		this.log.debug(`[createObjects]: start objects creation for ${mowerData.length} device${(mowerData.length > 1 ? 's' : '')}...`);
		if (mowerData.length !== 0) {
			for (let i = 0; i < mowerData.length; i++) {
				if (mowerData[i].type === 'mower') {
					// create device
					await this.setObjectNotExistsAsync(mowerData[i].id, {
						type: 'device',
						common: {
							name: mowerData[i].attributes.system.model,
							// icon: deviceIcon
						},
						native: {}
					});

					// create channel "system"
					await this.setObjectNotExistsAsync(mowerData[i].id + '.system', {
						type: 'channel',
						common: {
							name: 'system',
							desc: 'system',
						},
						native: {}
					});
					await this.setObjectNotExistsAsync(mowerData[i].id + '.system.type', {
						type: 'state',
						common: {
							name: 'Device type',
							desc: 'Device type',
							type: 'string',
							role: 'info.type',
							read: true,
							write: false
						},
						native: {}
					});
					await this.setObjectNotExistsAsync(mowerData[i].id + '.system.id', {
						type: 'state',
						common: {
							name: 'Device ID',
							desc: 'Device ID',
							type: 'string',
							role: 'info.id',
							read: true,
							write: false
						},
						native: {}
					});
					await this.setObjectNotExistsAsync(mowerData[i].id + '.system.name', {
						type: 'state',
						common: {
							name: 'Device name',
							desc: 'Device name',
							type: 'string',
							role: 'info.name',
							read: true,
							write: false
						},
						native: {}
					});
					await this.setObjectNotExistsAsync(mowerData[i].id + '.system.model', {
						type: 'state',
						common: {
							name: 'Device model',
							desc: 'Device model',
							type: 'string',
							role: 'info.model',
							read: true,
							write: false
						},
						native: {}
					});
					await this.setObjectNotExistsAsync(mowerData[i].id + '.system.serialNumber', {
						type: 'state',
						common: {
							name: 'Device serialnumber',
							desc: 'Device serialnumber',
							type: 'number', // acc. API it should be 'string'
							role: 'info.serialnumber',
							read: true,
							write: false
						},
						native: {}
					});

					// create channel "battery"
					await this.setObjectNotExistsAsync(mowerData[i].id + '.battery', {
						type: 'channel',
						common: {
							name: 'Battery information',
							desc: 'Battery information'
						},
						native: {}
					});
					await this.setObjectNotExistsAsync(mowerData[i].id + '.battery.batteryPercent', {
						type: 'state',
						common: {
							name: 'The current battery level percentage',
							desc: 'The current battery level percentage',
							type: 'number',
							role: 'value.battery',
							min: 0,
							max: 100,
							unit: '%',
							read: true,
							write: false
						},
						native: {}
					});

					// create channel "mower", see https://developer.husqvarnagroup.cloud/apis/Automower+Connect+API#/status%20description%20and%20error%20codes for descriptions of status and error codes
					await this.setObjectNotExistsAsync(mowerData[i].id + '.mower', {
						type: 'channel',
						common: {
							name: 'General information about the mower',
							desc: 'General information about the mower'
						},
						native: {}
					});
					await this.setObjectNotExistsAsync(mowerData[i].id + '.mower.mode', {
						type: 'state',
						common: {
							desc: 'Information about the mowers current mode',
							name: 'Information about the mowers current mode',
							type: 'string',
							role: 'state',
							states: {'MAIN_AREA': 'Mower will mow until low battery. Go home and charge. Leave and continue mowing. Week schedule is used. Schedule can be overridden with forced park or forced mowing.', 'DEMO': 'No blade operation - Mower will mow until low battery. Go home and charge. Leave and continue mowing. Week schedule is used. Schedule can be overridden with forced park or forced mowing.', 'SECONDARY_AREA': 'Mower is in secondary area. Schedule is overridden with forced park or forced mowing. Mower will mow for request time or untill the battery runs out.', 'HOME': 'Mower goes home and parks forever. Week schedule is not used. Cannot be overridden with forced mowing.', 'UNKNOWN': 'Unknown mode'},
							read: true,
							write: false
						},
						native: {}
					});
					await this.setObjectNotExistsAsync(mowerData[i].id + '.mower.activity', {
						type: 'state',
						common: {
							name: 'Information about the mowers current activity',
							desc: 'Information about the mowers current activity',
							type: 'string',
							role: 'state',
							states: {'UNKNOWN': 'Unknown activity', 'NOT_APPLICABLE': 'Manual start required in mower.', 'MOWING': 'Mower is mowing lawn. If in demo mode the blades are not in operation.', 'GOING_HOME': 'Mower is going home to the charging station.', 'CHARGING': 'Mower is charging in station due to low battery.', 'LEAVING': 'Mower is leaving the charging station.', 'PARKED_IN_CS': 'Mower is parked in charging station.', 'STOPPED_IN_GARDEN': 'Mower has stopped. Needs manual action to resume.'},
							read: true,
							write: false
						},
						native: {}
					});
					await this.setObjectNotExistsAsync(mowerData[i].id + '.mower.state', {
						type: 'state',
						common: {
							name: 'Information about the mowers current status',
							desc: 'Information about the mowers current status',
							type: 'string',
							role: 'state',
							states: {'UNKNOWN': 'Unknown state', 'NOT_APPLICABLE': 'Not Applicable', 'PAUSED': 'Mower has been paused by user.', 'IN_OPERATION': 'See value in activity for status.', 'WAIT_UPDATING': 'Mower is downloading new firmware.', 'WAIT_POWER_UP': 'Mower is performing power up tests.', 'RESTRICTED': 'Mower can currently not mow due to week calender, or override park.', 'OFF': 'Mower is turned off.', 'STOPPED': 'Mower is stopped, requires manual action.', 'ERROR': 'An error has occurred. Check errorCode. Mower requires manual action.', 'FATAL_ERROR': 'An fatal error has occurred. Check errorCode. Mower requires manual action.', 'ERROR_AT_POWER_UP': 'An error at power up has occurred. Check errorCode. Mower requires manual action.'},
							read: true,
							write: false
						},
						native: {}
					});
					await this.setObjectNotExistsAsync(mowerData[i].id + '.mower.errorCode', {
						type: 'state',
						common: {
							name: 'Information about the mowers current error status',
							desc: 'Information about the mowers current error status',
							type: 'number',
							role: 'state',
							states: {0: 'Unexpected error', 1: 'Outside working area', 2: 'No loop signal', 3: 'Wrong loop signal', 4: 'Loop sensor problem, front', 5: 'Loop sensor problem, rear', 6: 'Loop sensor problem, left', 7: 'Loop sensor problem, right', 8: 'Wrong PIN code', 9: 'Trapped', 10: 'Upside down', 11: 'Low battery', 12: 'Empty battery', 13: 'No drive', 14: 'Mower lifted', 15: 'Lifted', 16: 'Stuck in charging station', 17: 'Charging station blocked', 18: 'Collision sensor problem, rear', 19: 'Collision sensor problem, front', 20: 'Wheel motor blocked, right', 21: 'Wheel motor blocked, left', 22: 'Wheel drive problem, right', 23: 'Wheel drive problem, left', 24: 'Cutting system blocked', 25: 'Cutting system blocked', 26: 'Invalid sub-device combination', 27: 'Settings restored', 28: 'Memory circuit problem', 29: 'Slope too steep', 30: 'Charging system problem', 31: 'STOP button problem', 32: 'Tilt sensor problem', 33: 'Mower tilted', 34: 'Cutting stopped - slope too steep', 35: 'Wheel motor overloaded, right', 36: 'Wheel motor overloaded, left', 37: 'Charging current too high', 38: 'Electronic problem', 39: 'Cutting motor problem', 40: 'Limited cutting height range', 41: 'Unexpected cutting height adj', 42: 'Limited cutting height range', 43: 'Cutting height problem, drive', 44: 'Cutting height problem, curr', 45: 'Cutting height problem, dir', 46: 'Cutting height blocked', 47: 'Cutting height problem', 48: 'No response from charger', 49: 'Ultrasonic problem', 50: 'Guide 1 not found', 51: 'Guide 2 not found', 52: 'Guide 3 not found', 53: 'GPS navigation problem', 54: 'Weak GPS signal', 55: 'Difficult finding home', 56: 'Guide calibration accomplished', 57: 'Guide calibration failed', 58: 'Temporary battery problem', 59: 'Temporary battery problem', 60: 'Temporary battery problem', 61: 'Temporary battery problem', 62: 'Temporary battery problem', 63: 'Temporary battery problem', 64: 'Temporary battery problem', 65: 'Temporary battery problem', 66: 'Battery problem', 67: 'Battery problem', 68: 'Temporary battery problem', 69: 'Alarm! Mower switched off', 70: 'Alarm! Mower stopped', 71: 'Alarm! Mower lifted', 72: 'Alarm! Mower tilted', 73: 'Alarm! Mower in motion', 74: 'Alarm! Outside geofence', 75: 'Connection changed', 76: 'Connection NOT changed', 77: 'Com board not available', 78: 'Slipped - Mower has Slipped. Situation not solved with moving pattern', 79: 'Invalid battery combination - Invalid combination of different battery types', 80: 'Cutting system imbalance --Warning--', 81: 'Safety function faulty', 82: 'Wheel motor blocked, rear right', 83: 'Wheel motor blocked, rear left', 84: 'Wheel drive problem, rear right', 85: 'Wheel drive problem, rear left', 86: 'Wheel motor overloaded, rear right', 87: 'Wheel motor overloaded, rear left', 88: 'Angular sensor problem', 89: 'Invalid system configuration', 90: 'No power in charging station', 91: 'Switch cord problem', 92: 'Work area not valid', 93: 'No accurate position from satellites', 94: 'Reference station communication problem', 95: 'Folding sensor activated', 96: 'Right brush motor overloaded', 97: 'Left brush motor overloaded', 98: 'Ultrasonic Sensor 1 defect', 99: 'Ultrasonic Sensor 2 defect', 100: 'Ultrasonic Sensor 3 defect', 101: 'Ultrasonic Sensor 4 defect', 102: 'Cutting drive motor 1 defect', 103: 'Cutting drive motor 2 defect', 104: 'Cutting drive motor 3 defect', 105: 'Lift Sensor defect', 106: 'Collision sensor defect', 107: 'Docking sensor defect', 108: 'Folding cutting deck sensor defect', 109: 'Loop sensor defect', 110: 'Collision sensor error', 111: 'No confirmed position', 112: 'Cutting system major imbalance', 113: 'Complex working area', 114: 'Too high discharge current', 115: 'Too high internal current', 116: 'High charging power loss', 117: 'High internal power loss', 118: 'Charging system problem', 119: 'Zone generator problem', 120: 'Internal voltage error', 121: 'High internal temerature', 122: 'CAN error', 123: 'Destination not reachable'},
							min: 0,
							max: 123,
							read: true,
							write: false
						},
						native: {}
					});
					await this.setObjectNotExistsAsync(mowerData[i].id + '.mower.errorCodeTimestamp', {
						type: 'state',
						common: {
							name: 'Timestamp for the last error code in milliseconds since 1970-01-01T00:00:00 in local time. NOTE! This timestamp is in local time for the mower and is coming directly from the mower.',
							desc: 'Timestamp for the last error code in milliseconds since 1970-01-01T00:00:00 in local time. NOTE! This timestamp is in local time for the mower and is coming directly from the mower.',
							type: 'number',
							role: 'value.time',
							read: true,
							write: false
						},
						native: {}
					});

					// create channel "calendar"
					await this.setObjectNotExistsAsync(mowerData[i].id + '.calendar', {
						type: 'channel',
						common: {
							name: 'Calendar Tasks',
							desc: 'Calendar Tasks'
						},
						native: {}
					});
					for (let j = 0; j < numberOfSchedules; j++) {
						await this.setObjectNotExistsAsync(mowerData[i].id + '.calendar.' + j, {
							type: 'channel',
							common: {
								name: 'Calendar Task ' + j
							},
							native: {}
						});
						await this.setObjectNotExistsAsync(mowerData[i].id + '.calendar.' + j + '.start', {
							type: 'state',
							common: {
								name: 'Start time expressed in minutes after midnight',
								desc: 'Start time expressed in minutes after midnight',
								type: 'number',
								role: 'value',
								min: 0,
								max: 1439,
								unit: 'min',
								read: true,
								write: false
							},
							native: {}
						});
						await this.setObjectNotExistsAsync(mowerData[i].id + '.calendar.' + j + '.duration', {
							type: 'state',
							common: {
								name: 'Duration time expressed in minutes',
								desc: 'Duration time expressed in minutes',
								type: 'number',
								role: 'value',
								min: 0,
								max: 1440,
								unit: 'min',
								read: true,
								write: false
							},
							native: {}
						});
						await this.setObjectNotExistsAsync(mowerData[i].id + '.calendar.' + j + '.monday', {
							type: 'state',
							common: {
								name: 'Enabled on Mondays',
								desc: 'Enabled on Mondays',
								type: 'boolean',
								role: 'indicator',
								read: true,
								write: false
							},
							native: {}
						});
						await this.setObjectNotExistsAsync(mowerData[i].id + '.calendar.' + j + '.tuesday', {
							type: 'state',
							common: {
								name: 'Enabled on Tuesdays',
								desc: 'Enabled on Tuesdays',
								type: 'boolean',
								role: 'indicator',
								read: true,
								write: false
							},
							native: {}
						});
						await this.setObjectNotExistsAsync(mowerData[i].id + '.calendar.' + j + '.wednesday', {
							type: 'state',
							common: {
								name: 'Enabled on Wednesdays',
								desc: 'Enabled on Wednesdays',
								type: 'boolean',
								role: 'indicator',
								read: true,
								write: false
							},
							native: {}
						});
						await this.setObjectNotExistsAsync(mowerData[i].id + '.calendar.' + j + '.thursday', {
							type: 'state',
							common: {
								name: 'Enabled on Thursdays',
								desc: 'Enabled on Thursdays',
								type: 'boolean',
								role: 'indicator',
								read: true,
								write: false
							},
							native: {}
						});
						await this.setObjectNotExistsAsync(mowerData[i].id + '.calendar.' + j + '.friday', {
							type: 'state',
							common: {
								name: 'Enabled on Fridays',
								desc: 'Enabled on Fridays',
								type: 'boolean',
								role: 'indicator',
								read: true,
								write: false
							},
							native: {}
						});
						await this.setObjectNotExistsAsync(mowerData[i].id + '.calendar.' + j + '.saturday', {
							type: 'state',
							common: {
								name: 'Enabled on Saturdays',
								desc: 'Enabled on Saturdays',
								type: 'boolean',
								role: 'indicator',
								read: true,
								write: false
							},
							native: {}
						});
						await this.setObjectNotExistsAsync(mowerData[i].id + '.calendar.' + j + '.sunday', {
							type: 'state',
							common: {
								name: 'Enabled on Sundays',
								desc: 'Enabled on Sundays',
								type: 'boolean',
								role: 'indicator',
								read: true,
								write: false
							},
							native: {}
						});
					}

					// create channel "planner"
					await this.setObjectNotExistsAsync(mowerData[i].id + '.planner', {
						type: 'channel',
						common: {
							name: 'Actions which are available for this device',
							desc: 'Actions which are available for this device'
						},
						native: {}
					});
					await this.setObjectNotExistsAsync(mowerData[i].id + '.planner.nextStartTimestamp', {
						type: 'state',
						common: {
							name: 'Timestamp for the next auto start in milliseconds since 1970-01-01T00:00:00 in local time. If the mower is charging then the value is the estimated time when it will be leaving the charging station. If the value is 0 then the mower should start now. NOTE! This timestamp is in local time for the mower and is coming directly from the mower.',
							desc: 'Timestamp for the next auto start in milliseconds since 1970-01-01T00:00:00 in local time. If the mower is charging then the value is the estimated time when it will be leaving the charging station. If the value is 0 then the mower should start now. NOTE! This timestamp is in local time for the mower and is coming directly from the mower.',
							type: 'number',
							role: 'value.time',
							read: true,
							write: false
						},
						native: {}
					});
					await this.setObjectNotExistsAsync(mowerData[i].id + '.planner.action', {
						type: 'state',
						common: {
							name: 'TODO',
							desc: 'TODO',
							type: 'string',
							role: 'state',
							states: {'NOT_ACTIVE': 'Not active', 'FORCE_PARK': 'Force park', 'FORCE_MOW ': 'Force mow'},
							read: true,
							write: false
						},
						native: {}
					});
					await this.setObjectNotExistsAsync(mowerData[i].id + '.planner.restrictedReason', {
						type: 'state',
						common: {
							name: 'restrictedReason',
							desc: 'restrictedReason',
							type: 'string',
							role: 'state',
							states: {'NONE': 'None', 'WEEK_SCHEDULE': 'Week schedule', 'PARK_OVERRIDE': 'Park Override', 'SENSOR': 'Sensor', 'DAILY_LIMIT': 'Daily limit', 'FOTA': 'Fota', 'FROST': 'Frost', 'NOT_APPLICABLE': 'Not Applicable'},
							read: true,
							write: false
						},
						native: {}
					});

					// create channel "metadata"
					await this.setObjectNotExistsAsync(mowerData[i].id + '.metadata', {
						type: 'channel',
						common: {
							name: 'Metadata',
							desc: 'Metadata'
						},
						native: {}
					});
					await this.setObjectNotExistsAsync(mowerData[i].id + '.metadata.connected', {
						type: 'state',
						common: {
							name: 'Is the mower currently connected',
							desc: 'Is the mower currently connected',
							type: 'boolean',
							role: 'indicator.connected',
							read: true,
							write: false
						},
						native: {}
					});
					await this.setObjectNotExistsAsync(mowerData[i].id + '.metadata.statusTimestamp', {
						type: 'state',
						common: {
							name: 'Is the mower currently connected',
							desc: 'Is the mower currently connected',
							type: 'number',
							role: 'value.time',
							read: true,
							write: false
						},
						native: {}
					});

					// create channel GPS-"positions"
					await this.setObjectNotExistsAsync(mowerData[i].id + '.positions', {
						type: 'channel',
						common: {
							name: 'Positions',
							desc: 'Positions'
						},
						native: {}
					});
					await this.setObjectNotExistsAsync(mowerData[i].id + '.positions.latitude', {
						type: 'state',
						common: {
							name: 'Position latitude',
							desc: 'Position latitude',
							type: 'number',
							role: 'value.gps.latitude',
							unit: '°',
							read: true,
							write: false
						},
						native: {}
					});
					await this.setObjectNotExistsAsync(mowerData[i].id + '.positions.longitude', {
						type: 'state',
						common: {
							name: 'Position longitude',
							desc: 'Position longitude',
							type: 'number',
							role: 'value.gps.longitude',
							unit: '°',
							read: true,
							write: false
						},
						native: {}
					});
					await this.setObjectNotExistsAsync(mowerData[i].id + '.positions.latlong', {
						type: 'state',
						common: {
							name: 'Position "latitude;longitude"',
							desc: 'Position "latitude;longitude"',
							type: 'string',
							role: 'value.gps',
							read: true,
							write: false
						},
						native: {}
					});

					// create channel "settings"
					await this.setObjectNotExistsAsync(mowerData[i].id + '.settings', {
						type: 'channel',
						common: {
							name: 'Settings',
							desc: 'Settings'
						},
						native: {}
					});
					await this.setObjectNotExistsAsync(mowerData[i].id + '.settings.cuttingHeight', {
						type: 'state',
						common: {
							name: 'Prescaled cutting height, Range: 1...9',
							desc: 'Prescaled cutting height, Range: 1...9',
							type: 'number',
							role: 'state',
							min: 1,
							max: 9,
							read: true,
							write: false
						},
						native: {}
					});
					await this.setObjectNotExistsAsync(mowerData[i].id + '.settings.headlight', {
						type: 'state',
						common: {
							name: 'Headlight status',
							desc: 'Headlight status',
							type: 'string',
							role: 'state',
							states: {'ALWAYS_ON': 'ALWAYS ON', 'ALWAYS_OFF': 'ALWAYS OFF', 'EVENING_ONLY': 'EVENING ONLY', 'EVENING_AND_NIGHT': 'EVENING AND NIGHT'},
							read: true,
							write: false
						},
						native: {}
					});

					// create channel "ACTIONS"
					await this.setObjectNotExistsAsync(mowerData[i].id + '.ACTIONS', {
						type: 'channel',
						common: {
							name: 'Action Commands'
						},
						native: {}
					});
					await this.setObjectNotExistsAsync(mowerData[i].id + '.ACTIONS.PAUSE', {
						type: 'state',
						common: {
							name: 'Pause mower',
							desc: 'Pause mower',
							type: 'boolean',
							def: false,
							role: 'button',
							read: true,
							write: true
						},
						native: {}
					});
					await this.setObjectNotExistsAsync(mowerData[i].id + '.ACTIONS.PARKUNTILNEXTSCHEDULE', {
						type: 'state',
						common: {
							name: 'Park mower until next scheduled run',
							desc: 'Park mower until next scheduled run',
							type: 'boolean',
							def: false,
							role: 'button',
							read: true,
							write: true
						},
						native: {}
					});
					await this.setObjectNotExistsAsync(mowerData[i].id + '.ACTIONS.PARKUNTILFURTHERNOTICE', {
						type: 'state',
						common: {
							name: 'Park mower until further notice, overriding schedule',
							desc: 'Park mower until further notice, overriding schedule',
							type: 'boolean',
							def: false,
							role: 'button',
							read: true,
							write: true
						},
						native: {}
					});

					// create channel "ACTIONS.park"
					await this.setObjectNotExistsAsync(mowerData[i].id + '.ACTIONS.park', {
						type: 'channel',
						common: {
							name: 'Action Command for park'
						},
						native: {}
					});
					await this.setObjectNotExistsAsync(mowerData[i].id + '.ACTIONS.park.PARK', {
						type: 'state',
						common: {
							name: 'Park mower for a duration of time, overriding schedule',
							desc: 'Park mower for a duration of time, overriding schedule',
							type: 'boolean',
							def: false,
							role: 'button',
							read: true,
							write: true
						},
						native: {}
					});
					await this.setObjectNotExistsAsync(mowerData[i].id + '.ACTIONS.park.parkTime', {
						type: 'state',
						common: {
							name: 'Park mower for a duration of time, overriding schedule: Time',
							desc: 'Park mower for a duration of time, overriding schedule: Time',
							type: 'number',
							def: 15,
							role: 'state',
							unit: 'min',
							min: 1,
							read: true,
							write: true
						},
						native: {}
					});
					await this.setObjectNotExistsAsync(mowerData[i].id + '.ACTIONS.RESUMESCHEDULE', {
						type: 'state',
						common: {
							name: 'Resume mower according to schedule',
							desc: 'Resume mower according to schedule',
							type: 'boolean',
							def: false,
							role: 'button',
							read: true,
							write: true
						},
						native: {}
					});

					// create channel "ACTIONS.start"
					await this.setObjectNotExistsAsync(mowerData[i].id + '.ACTIONS.start', {
						type: 'channel',
						common: {
							name: 'Action Command for start'
						},
						native: {}
					});
					await this.setObjectNotExistsAsync(mowerData[i].id + '.ACTIONS.start.START', {
						type: 'state',
						common: {
							name: 'Start mower and cut for a duration of time, overriding schedule',
							desc: 'Start mower and cut for a duration of time, overriding schedule',
							type: 'boolean',
							def: false,
							role: 'button',
							read: true,
							write: true
						},
						native: {}
					});
					await this.setObjectNotExistsAsync(mowerData[i].id + '.ACTIONS.start.startTime', {
						type: 'state',
						common: {
							name: 'Start mower and cut for a duration of time, overriding schedule: Time',
							desc: 'Start mower and cut for a duration of time, overriding schedule: Time',
							type: 'number',
							def: 15,
							role: 'state',
							unit: 'min',
							min: 1,
							read: true,
							write: true
						},
						native: {}
					});
					await this.setObjectNotExistsAsync(mowerData[i].id + '.ACTIONS.CUTTINGHEIGHT', {
						type: 'state',
						common: {
							name: 'Adjust cutting height, Range: 1...9',
							desc: 'Adjust cutting height, Range: 1...9',
							type: 'number',
							role: 'state',
							min: 1,
							max: 9,
							read: true,
							write: true
						},
						native: {}
					});
					await this.setObjectNotExistsAsync(mowerData[i].id + '.ACTIONS.HEADLIGHT', {
						type: 'state',
						common: {
							name: 'Set headlight status',
							desc: 'Set headlight status',
							type: 'string',
							role: 'value',
							states: {'ALWAYS_ON': 'ALWAYS ON', 'ALWAYS_OFF': 'ALWAYS OFF', 'EVENING_ONLY': 'EVENING ONLY', 'EVENING_AND_NIGHT': 'EVENING AND NIGHT'},
							read: true,
							write: true
						},
						native: {}
					});

					// create channel "ACTIONS.schedule"
					await this.setObjectNotExistsAsync(mowerData[i].id + '.ACTIONS.schedule', {
						type: 'channel',
						common: {
							name: 'Update mower schedule'
						},
						native: {}
					});
					await this.setObjectNotExistsAsync(mowerData[i].id + '.ACTIONS.schedule.SET', {
						type: 'state',
						common: {
							name: 'Save all schedules',
							desc: 'Save all schedules',
							type: 'boolean',
							role: 'button',
							def: false,
							read: true,
							write: true
						},
						native: {}
					});

					for (let j = 0; j < numberOfSchedules; j++) {
						await this.setObjectNotExistsAsync(mowerData[i].id + '.ACTIONS.schedule.' + j, {
							type: 'channel',
							common: {
								name: 'Scheduled Task ' + j
							},
							native: {}
						});
						await this.setObjectNotExistsAsync(mowerData[i].id + '.ACTIONS.schedule.' + j + '.start', {
							type: 'state',
							common: {
								name: 'Start time expressed in minutes after midnight',
								desc: 'Start time expressed in minutes after midnight',
								type: 'number',
								role: 'value',
								min: 0,
								max: 1439,
								unit: 'min',
								def: 720,
								read: true,
								write: true
							},
							native: {}
						});
						await this.setObjectNotExistsAsync(mowerData[i].id + '.ACTIONS.schedule.' + j + '.duration', {
							type: 'state',
							common: {
								name: 'Duration time expressed in minutes',
								desc: 'Duration time expressed in minutes',
								type: 'number',
								role: 'value',
								min: 1,
								max: 1440,
								unit: 'min',
								def: 30,
								read: true,
								write: true
							},
							native: {}
						});
						await this.setObjectNotExistsAsync(mowerData[i].id + '.ACTIONS.schedule.' + j + '.monday', {
							type: 'state',
							common: {
								name: 'Enabled on Mondays',
								desc: 'Enabled on Mondays',
								type: 'boolean',
								role: 'value',
								def: false,
								read: true,
								write: true
							},
							native: {}
						});
						await this.setObjectNotExistsAsync(mowerData[i].id + '.ACTIONS.schedule.' + j + '.tuesday', {
							type: 'state',
							common: {
								name: 'Enabled on Tuesdays',
								desc: 'Enabled on Tuesdays',
								type: 'boolean',
								role: 'value',
								def: false,
								read: true,
								write: true
							},
							native: {}
						});
						await this.setObjectNotExistsAsync(mowerData[i].id + '.ACTIONS.schedule.' + j + '.wednesday', {
							type: 'state',
							common: {
								name: 'Enabled on Wednesdays',
								desc: 'Enabled on Wednesdays',
								type: 'boolean',
								role: 'value',
								def: false,
								read: true,
								write: true
							},
							native: {}
						});
						await this.setObjectNotExistsAsync(mowerData[i].id + '.ACTIONS.schedule.' + j + '.thursday', {
							type: 'state',
							common: {
								name: 'Enabled on Thursdays',
								desc: 'Enabled on Thursdays',
								type: 'boolean',
								role: 'value',
								def: false,
								read: true,
								write: true
							},
							native: {}
						});
						await this.setObjectNotExistsAsync(mowerData[i].id + '.ACTIONS.schedule.' + j + '.friday', {
							type: 'state',
							common: {
								name: 'Enabled on Fridays',
								desc: 'Enabled on Fridays',
								type: 'boolean',
								role: 'value',
								def: false,
								read: true,
								write: true
							},
							native: {}
						});
						await this.setObjectNotExistsAsync(mowerData[i].id + '.ACTIONS.schedule.' + j + '.saturday', {
							type: 'state',
							common: {
								name: 'Enabled on Saturdays',
								desc: 'Enabled on Saturdays',
								type: 'boolean',
								role: 'value',
								def: false,
								read: true,
								write: true
							},
							native: {}
						});
						await this.setObjectNotExistsAsync(mowerData[i].id + '.ACTIONS.schedule.' + j + '.sunday', {
							type: 'state',
							common: {
								name: 'Enabled on Sundays',
								desc: 'Enabled on Sundays',
								type: 'boolean',
								role: 'value',
								def: false,
								read: true,
								write: true
							},
							native: {}
						});
					}

					// subscribeStates
					this.subscribeStates(mowerData[i].id + '.ACTIONS.PAUSE');
					this.subscribeStates(mowerData[i].id + '.ACTIONS.PARKUNTILNEXTSCHEDULE');
					this.subscribeStates(mowerData[i].id + '.ACTIONS.PARKUNTILFURTHERNOTICE');
					this.subscribeStates(mowerData[i].id + '.ACTIONS.park.PARK');
					this.subscribeStates(mowerData[i].id + '.ACTIONS.RESUMESCHEDULE');
					this.subscribeStates(mowerData[i].id + '.ACTIONS.start.START');
					this.subscribeStates(mowerData[i].id + '.ACTIONS.CUTTINGHEIGHT');
					this.subscribeStates(mowerData[i].id + '.ACTIONS.HEADLIGHT');
					this.subscribeStates(mowerData[i].id + '.ACTIONS.schedule.SET');

				} else {
					throw new Error ('No mower found, no Objects created. Check API (ERR_#005).');
				}
			}
			this.log.debug('[createObjects]: Objects created...');
		} else {
			throw new Error ('No Objects found, no Objects created. Check API (ERR_#006).');
		}
	}

	async fillObjects(mowerData) {
		for (let i = 0; i < mowerData.length; i++) {
			this.setStateAsync(mowerData[i].id + '.system.type', {val: mowerData[i].type, ack: true});
			this.setStateAsync(mowerData[i].id + '.system.id', {val:mowerData[i].id, ack: true});

			this.setStateAsync(mowerData[i].id + '.system.name', {val: mowerData[i].attributes.system.name, ack: true});
			this.setStateAsync(mowerData[i].id + '.system.model', {val: mowerData[i].attributes.system.model, ack: true});
			this.setStateAsync(mowerData[i].id + '.system.serialNumber', {val: mowerData[i].attributes.system.serialNumber, ack: true});

			this.setStateAsync(mowerData[i].id + '.battery.batteryPercent', {val: mowerData[i].attributes.battery.batteryPercent, ack: true});

			this.setStateAsync(mowerData[i].id + '.mower.mode', {val: mowerData[i].attributes.mower.mode, ack: true});
			this.setStateAsync(mowerData[i].id + '.mower.activity', {val: mowerData[i].attributes.mower.activity, ack: true});
			this.setStateAsync(mowerData[i].id + '.mower.state', {val: mowerData[i].attributes.mower.state, ack: true});
			this.setStateAsync(mowerData[i].id + '.mower.errorCode', {val: mowerData[i].attributes.mower.errorCode, ack: true});
			this.setStateAsync(mowerData[i].id + '.mower.errorCodeTimestamp', {val: mowerData[i].attributes.mower.errorCodeTimestamp, ack: true});

			// set all values in "calendar"
			for (let j = 0; j < Math.min(Object.keys(mowerData[i].attributes.calendar.tasks).length, numberOfSchedules); j++) {
				this.setStateAsync(mowerData[i].id + '.calendar.' + [j] + '.start', {val: mowerData[i].attributes.calendar.tasks[j].start, ack: true});
				this.setStateAsync(mowerData[i].id + '.calendar.' + [j] + '.duration', {val: mowerData[i].attributes.calendar.tasks[j].duration, ack: true});
				this.setStateAsync(mowerData[i].id + '.calendar.' + [j] + '.monday', {val: mowerData[i].attributes.calendar.tasks[j].monday, ack: true});
				this.setStateAsync(mowerData[i].id + '.calendar.' + [j] + '.tuesday', {val: mowerData[i].attributes.calendar.tasks[j].tuesday, ack: true});
				this.setStateAsync(mowerData[i].id + '.calendar.' + [j] + '.wednesday', {val: mowerData[i].attributes.calendar.tasks[j].wednesday, ack: true});
				this.setStateAsync(mowerData[i].id + '.calendar.' + [j] + '.thursday', {val: mowerData[i].attributes.calendar.tasks[j].thursday, ack: true});
				this.setStateAsync(mowerData[i].id + '.calendar.' + [j] + '.friday', {val: mowerData[i].attributes.calendar.tasks[j].friday, ack: true});
				this.setStateAsync(mowerData[i].id + '.calendar.' + [j] + '.saturday', {val: mowerData[i].attributes.calendar.tasks[j].saturday, ack: true});
				this.setStateAsync(mowerData[i].id + '.calendar.' + [j] + '.sunday', {val: mowerData[i].attributes.calendar.tasks[j].sunday, ack: true});
			}

			if (mowerData[i].attributes.planner.nextStartTimestamp) {
				if (mowerData[i].attributes.planner.nextStartTimestamp !== 0) {
					this.setStateAsync(mowerData[i].id + '.planner.nextStartTimestamp', {val: mowerData[i].attributes.planner.nextStartTimestamp + (new Date().getTimezoneOffset() * 60000), ack: true});
				} else {
					this.setStateAsync(mowerData[i].id + '.planner.nextStartTimestamp', {val: mowerData[i].attributes.planner.nextStartTimestamp, ack: true});
				}
			}
			this.setStateAsync(mowerData[i].id + '.planner.action', {val: mowerData[i].attributes.planner.override.action, ack: true});
			this.setStateAsync(mowerData[i].id + '.planner.restrictedReason', {val: mowerData[i].attributes.planner.restrictedReason, ack: true});

			this.setStateAsync(mowerData[i].id + '.metadata.connected', {val: mowerData[i].attributes.metadata.connected, ack: true});
			this.setStateAsync(mowerData[i].id + '.metadata.statusTimestamp', {val: mowerData[i].attributes.metadata.statusTimestamp, ack: true});

			this.setStateAsync(mowerData[i].id + '.positions.latitude', {val: mowerData[i].attributes.positions[0].latitude, ack: true});
			this.setStateAsync(mowerData[i].id + '.positions.longitude', {val: mowerData[i].attributes.positions[0].longitude, ack: true});
			this.setStateAsync(mowerData[i].id + '.positions.latlong', {val: mowerData[i].attributes.positions[0].latitude + ';' + mowerData[i].attributes.positions[0].longitude, ack: true});

			this.setStateAsync(mowerData[i].id + '.settings.cuttingHeight', {val: mowerData[i].attributes.settings.cuttingHeight, ack: true});
			this.setStateAsync(mowerData[i].id + '.settings.headlight', {val: mowerData[i].attributes.settings.headlight.mode, ack: true});
		}
		this.log.info('Mowerdata initially saved...');
	}

	// https://javascript.info/websocket
	// https://developer.husqvarnagroup.cloud/apis/automower-connect-api#websocket
	async connectToWS() {

		if (this.wss) {
			this.wss.close();
		}

		this.wss = new WebSocket('wss://ws.openapi.husqvarna.dev/v1', {
			headers: {
				'Authorization': `Bearer ${this.access_token}`,
			}
		});

		this.wss.on('open', () => {

			if (this.firstStart === true) {
				this.log.info('Connection to "Husqvarna WebSocket" established. Ready to get data...');
				this.firstStart = false;
			} else {
				this.log.debug('[wss.on - open]: Connection to "Husqvarna WebSocket" re-established. Ready to get data...');
				this.setStateAsync('info.connection', true, true);
			}

			// Send ping to server
			this.sendPingToServer();

			// Start Heartbeat
			this.wsHeartbeat();
		});

		this.wss.on('message', async (message) => {
			this.log.debug(`[wss.on - message]: ${message}`);
			// https://stackoverflow.com/questions/30621802/why-does-json-parse-fail-with-the-empty-string
			try {
				const jsonMessage = JSON.parse(message);
				// this.log.debug(`[wss.on - message]: jsonMessage: ${JSON.stringify(jsonMessage)}`);

				if ('attributes' in jsonMessage) {
					if ('cuttingHeight' in jsonMessage.attributes) {
						this.setStateAsync(jsonMessage.id + '.settings.cuttingHeight', {val: jsonMessage.attributes.cuttingHeight, ack: true});
						// this.log.debug(`[wss.on - message]: jsonMessage.attributes.cuttingHeight: ${jsonMessage.attributes.cuttingHeight}`);
					}
					if ('headlight' in jsonMessage.attributes) {
						this.setStateAsync(jsonMessage.id + '.settings.headlight', {val: jsonMessage.attributes.headlight.mode, ack: true});
						// this.log.debug(`[wss.on - message]: jsonMessage.attributes.headlight.mode: ${jsonMessage.attributes.headlight.mode}`);
					}
					if ('calendar' in jsonMessage.attributes) {
						if (Object.keys(jsonMessage.attributes.calendar.tasks).length > 0) {

							// set values in "calendar"
							for (let i = 0; i < Math.min(Object.keys(jsonMessage.attributes.calendar.tasks).length, numberOfSchedules); i++) {
								this.setStateAsync(jsonMessage.id + '.calendar.' + [i] + '.start', {val: jsonMessage.attributes.calendar.tasks[i].start, ack: true});
								this.setStateAsync(jsonMessage.id + '.calendar.' + [i] + '.duration', {val: jsonMessage.attributes.calendar.tasks[i].duration, ack: true});
								this.setStateAsync(jsonMessage.id + '.calendar.' + [i] + '.monday', {val: jsonMessage.attributes.calendar.tasks[i].monday, ack: true});
								this.setStateAsync(jsonMessage.id + '.calendar.' + [i] + '.tuesday', {val: jsonMessage.attributes.calendar.tasks[i].tuesday, ack: true});
								this.setStateAsync(jsonMessage.id + '.calendar.' + [i] + '.wednesday', {val: jsonMessage.attributes.calendar.tasks[i].wednesday, ack: true});
								this.setStateAsync(jsonMessage.id + '.calendar.' + [i] + '.thursday', {val: jsonMessage.attributes.calendar.tasks[i].thursday, ack: true});
								this.setStateAsync(jsonMessage.id + '.calendar.' + [i] + '.friday', {val: jsonMessage.attributes.calendar.tasks[i].friday, ack: true});
								this.setStateAsync(jsonMessage.id + '.calendar.' + [i] + '.saturday', {val: jsonMessage.attributes.calendar.tasks[i].saturday, ack: true});
								this.setStateAsync(jsonMessage.id + '.calendar.' + [i] + '.sunday', {val: jsonMessage.attributes.calendar.tasks[i].sunday, ack: true});
							}

							// reset values in "calendar" which are not in use
							for (let i = Object.keys(jsonMessage.attributes.calendar.tasks).length; i < numberOfSchedules; i++) {
								this.setStateAsync(jsonMessage.id + '.calendar.' + [i] + '.start', {val: 0, ack: true});
								this.setStateAsync(jsonMessage.id + '.calendar.' + [i] + '.duration', {val: 0, ack: true});
								this.setStateAsync(jsonMessage.id + '.calendar.' + [i] + '.monday', {val: false, ack: true});
								this.setStateAsync(jsonMessage.id + '.calendar.' + [i] + '.tuesday', {val: false, ack: true});
								this.setStateAsync(jsonMessage.id + '.calendar.' + [i] + '.wednesday', {val: false, ack: true});
								this.setStateAsync(jsonMessage.id + '.calendar.' + [i] + '.thursday', {val: false, ack: true});
								this.setStateAsync(jsonMessage.id + '.calendar.' + [i] + '.friday', {val: false, ack: true});
								this.setStateAsync(jsonMessage.id + '.calendar.' + [i] + '.saturday', {val: false, ack: true});
								this.setStateAsync(jsonMessage.id + '.calendar.' + [i] + '.sunday', {val: false, ack: true});
							}
						}
						// this.log.debug(`[wss.on - message]: jsonMessage.attributes.calendar: ${JSON.stringify(jsonMessage.attributes.calendar)}`);
					}
					if ('positions' in jsonMessage.attributes) {
						if (Object.keys(jsonMessage.attributes.positions).length > 0) {
							for (let i = 0; i < Object.keys(jsonMessage.attributes.positions).length; i++) {
								this.setStateAsync(jsonMessage.id + '.positions.latitude', {val: jsonMessage.attributes.positions[i].latitude, ack: true});
								this.setStateAsync(jsonMessage.id + '.positions.longitude', {val: jsonMessage.attributes.positions[i].longitude, ack: true});
								this.setStateAsync(jsonMessage.id + '.positions.latlong', {val: jsonMessage.attributes.positions[i].latitude + ';' + jsonMessage.attributes.positions[i].longitude, ack: true});
								await this.delay(500);
							}
							// this.log.debug(`[wss.on - message]: jsonMessage.attributes.positions: ${JSON.stringify(jsonMessage.attributes.positions)}`);
						}
					}
					if ('battery' in jsonMessage.attributes) {
						this.setStateAsync(jsonMessage.id + '.battery.batteryPercent', {val: jsonMessage.attributes.battery.batteryPercent, ack: true});
						// this.log.debug(`[wss.on - message]: jsonMessage.attributes.battery: ${JSON.stringify(jsonMessage.attributes.battery)}`);
					}
					if ('mower' in jsonMessage.attributes) {
						this.setStateAsync(jsonMessage.id + '.mower.mode', {val: jsonMessage.attributes.mower.mode, ack: true});
						this.setStateAsync(jsonMessage.id + '.mower.activity', {val: jsonMessage.attributes.mower.activity, ack: true});
						this.setStateAsync(jsonMessage.id + '.mower.state', {val: jsonMessage.attributes.mower.state, ack: true});
						this.setStateAsync(jsonMessage.id + '.mower.errorCode', {val: jsonMessage.attributes.mower.errorCode, ack: true});
						this.setStateAsync(jsonMessage.id + '.mower.errorCodeTimestamp', {val: jsonMessage.attributes.mower.errorCodeTimestamp, ack: true});
						// this.log.debug(`[wss.on - message]: jsonMessage.attributes.mower: ${JSON.stringify(jsonMessage.attributes.mower)}`);
					}
					if ('planner' in jsonMessage.attributes) {
						if (jsonMessage.attributes.planner.nextStartTimestamp !== 0) {
							this.setStateAsync(jsonMessage.id + '.planner.nextStartTimestamp', {val: jsonMessage.attributes.planner.nextStartTimestamp + (new Date().getTimezoneOffset() * 60000), ack: true});
						} else {
							this.setStateAsync(jsonMessage.id + '.planner.nextStartTimestamp', {val: jsonMessage.attributes.planner.nextStartTimestamp, ack: true});
						}
						this.setStateAsync(jsonMessage.id + '.planner.action', {val: jsonMessage.attributes.planner.override.action, ack: true});
						this.setStateAsync(jsonMessage.id + '.planner.restrictedReason', {val: jsonMessage.attributes.planner.restrictedReason, ack: true});
						// this.log.debug(`[wss.on - message]: jsonMessage.attributes.planner: ${JSON.stringify(jsonMessage.attributes.planner)}`);
					}
					if ('metadata' in jsonMessage.attributes) {
						this.setStateAsync(jsonMessage.id + '.metadata.connected', {val: jsonMessage.attributes.metadata.connected, ack: true});
						this.setStateAsync(jsonMessage.id + '.metadata.statusTimestamp', {val: jsonMessage.attributes.metadata.statusTimestamp, ack: true});
						// this.log.debug(`[wss.on - message]: jsonMessage.attributes.metadata: ${JSON.stringify(jsonMessage.attributes.metadata)}`);
					}
				}
			} catch (error) {
				// do nothing
			}
		});

		this.wss.on('close', async (data) => {

			this.ping && clearTimeout(this.ping);
			this.pingTimeout && clearTimeout(this.pingTimeout);

			this.log.debug(`[wss.on - close]: this.wss.readyState: ${this.wss.readyState}`); // value: 3
			this.log.debug(`[wss.on - close]: data: ${data}`); // value: 1001

			this.setStateAsync('info.connection', false, true);

			try {
				if (data === 1001 && this.wss.readyState === 3) {
					await this.autoRestart();
				} else if (data === 1006 && this.wss.readyState === 3) {
					await this.getAccessToken();
					await this.autoRestart();
				} else if (data.wasClean) {
					this.log.info('Connection closed cleanly');
				} else {
					throw new Error ('Unknown WebSocket error. (ERR_#007)');
				}
			} catch (error) {
				this.log.error(error);
			}
		});

		// Pong from Server
		this.wss.on('pong', () => {
			this.log.debug('[wss.on - pong]: WebSocket receives pong from server.');
			this.wsHeartbeat();
		});

		this.wss.on('error', (error) => {
			this.log.debug(`[wss.on - error]: ${error}`);
		});
	}

	async sendPingToServer() {
		this.log.debug('[sendPingToServer]: WebSocket sends ping to server...');
		this.wss.ping('ping');
		this.ping = setTimeout(() => {
			this.sendPingToServer();
		}, 570000); // default: 10min = 600000ms / 9min30s = 570000ms
	}

	async wsHeartbeat() {
		this.pingTimeout && clearTimeout(this.pingTimeout);
		this.pingTimeout = setTimeout(() => {
			this.log.debug('[wsHeartbeat]: WebSocket connection timed out.');
			this.wss.terminate();
		}, 570000 + 1000);
	}

	async autoRestart() {
		this.log.debug('[autoRestart]: WebSocket connection terminated by Husqvarna-Server. Reconnect again in 5 seconds...');
		this.autoRestartTimeout = setTimeout(() => {
			this.connectToWS();
		}, 5000); // min. 5s = 5000ms
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 * @param {() => void} callback
	 */
	async onUnload(callback) {
		try {
			// Here you must clear all timeouts or intervals that may still be active

			// invalidating Token
			await axios({
				url: `https://api.authentication.husqvarnagroup.dev/v1/token/${this.access_token}`,
				method: 'DELETE',
				headers: {
					'X-Api-Key': this.access_token,
					'Authorization-Provider': 'husqvarna'
				}
			})
				.then((response) => {
					this.log.debug(`[onUnload]: HTTP status response: ${response.status} ${response.statusText}; config: ${JSON.stringify(response.config)}; headers: ${JSON.stringify(response.headers)}; data: ${JSON.stringify(response.data)}`);
				})
				.catch((error) => {
					if (error.response) {
						// The request was made and the server responded with a status code that falls out of the range of 2xx
						this.log.debug(`[onUnload]: HTTP status response: ${error.response.status}; headers: ${JSON.stringify(error.response.headers)}; data: ${JSON.stringify(error.response.data)}`);
						if (error.response.status === 403) {
							this.log.info('"Husqvarna Authentication API Access token" successful invalidated.');
						}
					} else if (error.request) {
						// The request was made but no response was received `error.request` is an instance of XMLHttpRequest in the browser and an instance of http.ClientRequest in node.js
						this.log.debug(`[getMowerData]: error request: ${error}`);
					} else {
						// Something happened in setting up the request that triggered an Error
						this.log.debug(`[getMowerData]: error message: ${error.message}`);
					}
					this.log.debug(`[getMowerData]: error.config: ${JSON.stringify(error.config)}`);
				});

			this.autoRestartTimeout && clearTimeout(this.autoRestartTimeout);
			this.ping && clearTimeout(this.ping);
			this.pingTimeout && clearTimeout(this.pingTimeout);

			this.setState('info.connection', false, true);

			callback();
			this.log.info('cleaned everything up... (#1)');
		} catch (e) {
			callback();
			this.log.info('cleaned everything up... (#2)');
		}
	}

	/**
	 * Is called if a subscribed state changes
	 * @param {string} id
	 * @param {ioBroker.State | null | undefined} state
	 */
	async onStateChange(id, state) {
		if (state !== null && state !== undefined) {
			if (state.ack === false) {

				// https://developer.husqvarnagroup.cloud/apis/Automower+Connect+API#/readme
				this.log.debug(`[onStateChange]: id: ${id}; state: ${JSON.stringify(state)}`);
				const idSplit = id.split('.');
				this.log.debug(`[onStateChange]: idSplit.length: ${idSplit.length}`);
				const mowerId = idSplit[2];
				this.log.debug(`[onStateChange]: mowerId: ${mowerId}`);

				let command = null;
				let parentPath = null;
				if (idSplit.length === 5) {
					command = idSplit[4];
					parentPath = idSplit.slice(0, idSplit.length - 1).join('.');
				} else if (idSplit.length === 6) {
					command = idSplit[5];
					parentPath = idSplit.slice(0, idSplit.length - 2).join('.');
				}
				this.log.debug(`[onStateChange]: command: ${command}`);
				this.log.debug(`[onStateChange]: parentPath : ${parentPath}`);

				let data = {};
				let url = '';

				if (command === 'PAUSE') { // Pause mower
					data = {
						data: {
							type: 'Pause'
						}
					};
					url = 'actions';
				} else if (command === 'PARKUNTILNEXTSCHEDULE') { // Park mower until next scheduled run
					data = {
						data: {
							type: 'ParkUntilNextSchedule'
						}
					};
					url = 'actions';
				} else if (command === 'PARKUNTILFURTHERNOTICE') { // Park mower until further notice, overriding schedule
					data = {
						data: {
							type: 'ParkUntilFurtherNotice'
						}
					};
					url = 'actions';
				} else if (command === 'PARK') { // Park mower for a duration of time, overriding schedule
					const parkTime = await this.getStateAsync(parentPath + '.park.parkTime');
					if (!parkTime) {
						this.log.error('Missing "parkTime". Nothing Set. (ERR_#008');
						return;
					}
					data = {
						data: {
							type: 'Park',
							attributes: {
								duration: parkTime.val
							}
						}
					};
					url = 'actions';
				} else if (command === 'RESUMESCHEDULE') { // Park mower for a duration of time, overriding schedule
					data = {
						data: {
							type: 'ResumeSchedule'
						}
					};
					url = 'actions';
				} else if (command === 'START') { // Park mower for a duration of time, overriding schedule
					const startTime = await this.getStateAsync(parentPath + '.start.startTime');
					if (!startTime) {
						this.log.error('Missing "startTime". Nothing Set. (ERR_#009');
						return;
					}
					data = {
						data: {
							type: 'Start',
							attributes: {
								duration: startTime.val
							}
						}
					};
					url = 'actions';
				} else if (command === 'CUTTINGHEIGHT') { // Adjust cutting Height
					data = {
						data: {
							type: 'settings',
							attributes: {
								cuttingHeight: state.val
							}
						}
					};
					url = 'settings';
				} else if (command === 'HEADLIGHT') { // Update headlight
					data = {
						data: {
							type: 'settings',
							attributes: {
								headlight: {
									mode: state.val
								}
							}
						}
					};
					url = 'settings';
				} else if (command === 'SET') { // Update mower schedule

					const tasks = [];
					for (let i = 0; i < numberOfSchedules; i++) {
						// create variables and get additional values
						const scheduleStart = await this.getStateAsync(parentPath + '.schedule.' + i + '.start');
						const scheduleDuration = await this.getStateAsync(parentPath + '.schedule.' + i + '.duration');
						const scheduleMonday = await this.getStateAsync(parentPath + '.schedule.' + i + '.monday');
						const scheduleThuesday = await this.getStateAsync(parentPath + '.schedule.' + i + '.tuesday');
						const scheduleWednesday = await this.getStateAsync(parentPath + '.schedule.' + i + '.wednesday');
						const scheduleThursday = await this.getStateAsync(parentPath + '.schedule.' + i + '.thursday');
						const scheduleFriday = await this.getStateAsync(parentPath + '.schedule.' + i + '.friday');
						const scheduleSaturday = await this.getStateAsync(parentPath + '.schedule.' + i + '.saturday');
						const scheduleSunday = await this.getStateAsync(parentPath + '.schedule.' + i + '.sunday');

						if (scheduleStart && scheduleDuration && scheduleMonday && scheduleThuesday && scheduleWednesday && scheduleThursday && scheduleFriday && scheduleSaturday && scheduleSunday) {
							if (scheduleMonday.val || scheduleThuesday.val || scheduleWednesday.val || scheduleThursday.val || scheduleFriday.val || scheduleSaturday.val || scheduleSunday.val) {
								tasks.push({
									'start': scheduleStart.val,
									'duration': scheduleDuration.val,
									'monday': scheduleMonday.val,
									'tuesday': scheduleThuesday.val,
									'wednesday': scheduleWednesday.val,
									'thursday': scheduleThursday.val,
									'friday': scheduleFriday.val,
									'saturday': scheduleSaturday.val,
									'sunday': scheduleSunday.val
								});
							}
						}
					}

					data = {
						data: {
							type: 'calendar',
							attributes: {
								tasks
							}
						}
					};
					// this.log.debug(`[onStateChange]: data: ${JSON.stringify(data)}`);

					url = 'calendar';
				}

				await axios({
					method: 'POST',
					url: `https://api.amc.husqvarna.dev/v1/mowers/${mowerId}/${url}`,
					headers: {
						'Authorization': `Bearer ${this.access_token}`,
						'X-Api-Key': this.config.applicationKey,
						'Authorization-Provider': 'husqvarna',
						'Content-Type': 'application/vnd.api+json'
					},
					data: data
				})
					.then((response) => {
						this.log.debug(`[onStateChange]: HTTP status response: ${response.status} ${response.statusText}; config: ${JSON.stringify(response.config)}; headers: ${JSON.stringify(response.headers)}; data: ${JSON.stringify(response.data)}`);
						if (response.status === 202) {
							this.log.info(`${response.statusText}. Command ${command} Set.`);
						}
					})
					.catch((error) => {
						if (error.response) {
							// The request was made and the server responded with a status code that falls out of the range of 2xx
							this.log.debug(`[onStateChange]: HTTP status response: ${error.response.status}; headers: ${JSON.stringify(error.response.headers)}; data: ${JSON.stringify(error.response.data)}`);
							if (error.response.status === 400) { // Invalid schedule format in request body. Parsing message: No tasks.
								this.log.info(`${error.response.data.errors[0].detail} Nothing set`);
							} else if (error.response.status === 404) { // No connection between the cloud service and the mower.
								this.log.info(`${error.response.data.errors[0].detail} Nothing set.`);
							}
						} else if (error.request) {
							// The request was made but no response was received `error.request` is an instance of XMLHttpRequest in the browser and an instance of http.ClientRequest in node.js
							this.log.debug(`[onStateChange]: error request: ${error}`);
						} else {
							// Something happened in setting up the request that triggered an Error
							this.log.debug(`[onStateChange]: error message: ${error.message}`);
						}
						this.log.debug(`[onStateChange]: error.config: ${JSON.stringify(error.config)}`);
					});

			} else {
				// The state was changed by system
				this.log.debug(`[onStateChange]: state ${id} changed: ${state.val} (ack = ${state.ack}). NO ACTION PERFORMED.`);
			}
		} else {
			// The state was deleted
			this.log.debug(`[onStateChange]: state ${id} was changed. NO ACTION PERFORMED.`);
		}
	}
}

if (require.main !== module) {
	// Export the constructor in compact mode
	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	module.exports = (options) => new HusqvarnaAutomower(options);
} else {
	// otherwise start the instance directly
	new HusqvarnaAutomower();
}