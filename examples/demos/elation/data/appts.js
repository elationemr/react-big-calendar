const appts = {
  28716: [
    {
      '_patientDeleted': false,
      '_apptTime': '2015-04-14T16:20:00.000Z',
      '_apptEnd': '2015-04-14T17:20:00.000Z',
      '_apptTypeId': 10690064810089,
      '_duration': 60,
      '_referringProvider': '',
      '_id': 50593133887578,
      '_physicianUserId': 235,
      '_billingNote': '',
      '_patientName': 'Savannah Banana',
      '_roomId': null,
      '_statusTime': '2017-02-23T01:59:44.000Z',
      '_referringProviderState': '',
      '_patientDob': '2014-01-01T08:00:00.000Z',
      '_status': 'scheduled',
      '_description': '',
      '_copayCollected': null,
      '_statusNote': '',
      '_patientPhone': '555-555-5555',
      '_problemsNeedingXwalk': false,
      '_displayStatus': 'Scheduled',
      '_patientId': 40955633598465,
      '_modelClass': 'Appointment'
    },
    {
      '_patientDeleted': false,
      '_apptTime': '2015-04-14T16:40:00.000Z',
      '_apptEnd': '2015-04-14T17:40:00.000Z',
      '_apptTypeId': 10690064810089,
      '_duration': 60,
      '_referringProvider': '',
      '_id': 50593133887578,
      '_physicianUserId': 235,
      '_billingNote': '',
      '_patientName': 'Savannah Banana',
      '_roomId': null,
      '_statusTime': '2017-02-23T01:59:44.000Z',
      '_referringProviderState': '',
      '_patientDob': '2014-01-01T08:00:00.000Z',
      '_status': 'scheduled',
      '_description': '',
      '_copayCollected': null,
      '_statusNote': '',
      '_patientPhone': '555-555-5555',
      '_problemsNeedingXwalk': false,
      '_displayStatus': 'Scheduled',
      '_patientId': 40955633598465,
      '_modelClass': 'Appointment'
    }
  ],
  352: [
    {
      '_patientDeleted': false,
      '_apptTime': '2015-04-14T13:40:00.000Z',
      '_apptEnd': '2015-04-14T14:10:00.000Z',
      '_apptTypeId': 10690064810089,
      '_duration': 60,
      '_referringProvider': '',
      '_id': 50593133887578,
      '_physicianUserId': 352,
      '_billingNote': '',
      '_patientName': 'Kevin Durant',
      '_roomId': null,
      '_statusTime': '2017-02-23T01:59:44.000Z',
      '_referringProviderState': '',
      '_patientDob': '2014-01-01T08:00:00.000Z',
      '_status': 'scheduled',
      '_description': '',
      '_copayCollected': null,
      '_statusNote': '',
      '_patientPhone': '555-555-5555',
      '_problemsNeedingXwalk': false,
      '_displayStatus': 'Scheduled',
      '_patientId': 40955633598465,
      '_modelClass': 'Appointment'
    },
    {
      '_patientDeleted': false,
      '_apptTime': '2015-04-15T12:00:00.000Z',
      '_apptEnd': '2015-04-15T12:30:00.000Z',
      '_apptTypeId': 10690064810089,
      '_duration': 60,
      '_referringProvider': '',
      '_id': 50593133887578,
      '_physicianUserId': 352,
      '_billingNote': '',
      '_patientName': 'Steve Kerr',
      '_roomId': null,
      '_statusTime': '2017-02-23T01:59:44.000Z',
      '_referringProviderState': '',
      '_patientDob': '2014-01-01T08:00:00.000Z',
      '_status': 'scheduled',
      '_description': '',
      '_copayCollected': null,
      '_statusNote': '',
      '_patientPhone': '555-555-5555',
      '_problemsNeedingXwalk': false,
      '_displayStatus': 'Scheduled',
      '_patientId': 40955633598465,
      '_modelClass': 'Appointment'
    },
    {
      '_patientDeleted': false,
      '_apptTime': '2015-04-15T12:15:00.000Z',
      '_apptEnd': '2015-04-15T13:00:00.000Z',
      '_apptTypeId': 10690064810089,
      '_duration': 60,
      '_referringProvider': '',
      '_id': 50593133887578,
      '_physicianUserId': 352,
      '_billingNote': '',
      '_patientName': 'Stephen Curry',
      '_roomId': null,
      '_statusTime': '2017-02-23T01:59:44.000Z',
      '_referringProviderState': '',
      '_patientDob': '2014-01-01T08:00:00.000Z',
      '_status': 'scheduled',
      '_description': '',
      '_copayCollected': null,
      '_statusNote': '',
      '_patientPhone': '555-555-5555',
      '_problemsNeedingXwalk': false,
      '_displayStatus': 'Scheduled',
      '_patientId': 40955633598465,
      '_modelClass': 'Appointment'
    }
  ]
}

const NO_APPTS = [];
export function getAppts(physicianId) {
  return appts[physicianId] || NO_APPTS;
}

export function getAllAppts() {
  return appts;
}
