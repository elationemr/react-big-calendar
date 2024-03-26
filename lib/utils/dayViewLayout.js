'use strict';

exports.__esModule = true;
exports.startsBefore = startsBefore;
exports.positionFromDate = positionFromDate;
exports.default = getStyledEvents;
exports.getStyledAvailabilities = getStyledAvailabilities;

var _accessors = require('./accessors');

var _dates = require('./dates');

var _dates2 = _interopRequireDefault(_dates);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function startsBefore(date, min) {
  return _dates2.default.lt(_dates2.default.merge(min, date), min, 'minutes');
}

function positionFromDate(date, min, total) {
  if (startsBefore(date, min)) return 0;

  var diff = _dates2.default.diff(min, _dates2.default.merge(min, date), 'minutes');
  return Math.min(diff, total);
}

/**
 * Events will be sorted primarily according to earliest start time.
 * If two events start at the same time, the one with the longest duration will
 * be placed first. If they also have the same duration, then they will be sorted
 * by their entity keys if `entityKeyAccessor` prop was provided to the calendar.
 */
var sort = function sort(events, _ref) {
  var startAccessor = _ref.startAccessor,
      endAccessor = _ref.endAccessor,
      entityKeyAccessor = _ref.entityKeyAccessor;
  return events.sort(function (a, b) {
    var startA = +(0, _accessors.accessor)(a, startAccessor);
    var startB = +(0, _accessors.accessor)(b, startAccessor);

    if (startA === startB) {
      var endTimeSort = +(0, _accessors.accessor)(b, endAccessor) - +(0, _accessors.accessor)(a, endAccessor);
      if (endTimeSort === 0 && entityKeyAccessor) {
        // entity key may be a number, so cast to string first... this breaks logical
        // sorting of numbers, but we're really just looking for a consistent sort.
        return String(a[entityKeyAccessor]).localeCompare(String(b[entityKeyAccessor]));
      }
      return endTimeSort;
    }

    return startA - startB;
  });
};

var getSlot = function getSlot(event, accessor, min, totalMin) {
  var isEndAccessor = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

  // This is here for 'logic parity' with what was here before (event && positionFromDate(...)).
  // Not actually sure under what conditions a falsy event is passed in yet. - Sidney
  if (!event) return event;

  var time = (0, _accessors.accessor)(event, accessor);

  // If start/end of the event is on the day that daylight savings FALLS BACK,
  // then we need to adjust because the number of calendar slots doesn't match
  // the number of hours in that day (we don't show two slots for the two 2AMs
  // that exist). So, for example, 5 AM on this day is actually 6 hours after
  // 12 AM, but we will use 4 AM to calculate the difference when comparing to
  // 12 AM since we want to obtain a practical result of a 5 hour difference
  // (and 4 AM is five hours after 1 AM on this day due to having two 2 AMs).
  //
  // We don't have to do this for SPRINGING FORWARD because the calendar hides
  // the 2AM hour that gets skipped over, so the number of slots does match the
  // number of hours in the day.
  var dayStart = _dates2.default.startOf(time, 'day');
  var dayEnd = _dates2.default.endOf(time, 'day');
  var daylightSavingsShift = dayStart.getTimezoneOffset() - dayEnd.getTimezoneOffset();
  var isFallingBack = daylightSavingsShift < 0;
  if (isFallingBack && time.getTimezoneOffset() !== dayStart.getTimezoneOffset()) {
    time = _dates2.default.add(time, daylightSavingsShift, 'minutes');
  }

  // Handling long range events. Though long range events have a condition that
  // start and end times are less than 24 hours apart, we don't perform that check
  // here. That should already be handled at the TimeGrid/MultiTimeGrid level, and
  // any events that are 24+ hours long will be filtered into the "all day" section
  // of the calendar, not the "range events" section, so they shouldn't reach this
  // function.
  if (isEndAccessor) {
    // handling the front end of long range events:
    // if the end time is the day after `min`, use the end of day of `min` as the end time.
    if (_dates2.default.isDayAfter(min, time)) {
      time = new Date(min);
      time.setHours(23);
      time.setMinutes(59);
    }
  } else {
    // handling the back end of long range events:
    // if the start time is the day before `min`, use `min` as the start time
    if (_dates2.default.isDayBefore(min, time)) {
      time = new Date(min);
    }
  }
  return event && positionFromDate(time, min, totalMin);
};

/**
 * Two events are considered siblings if the difference between their
 * start time is less than 5 minutes (used to be 1 hour).
 */
var isSibling = function isSibling(idx1, idx2, _ref2) {
  var events = _ref2.events,
      startAccessor = _ref2.startAccessor,
      min = _ref2.min,
      totalMin = _ref2.totalMin;

  var event1 = events[idx1];
  var event2 = events[idx2];

  if (!event1 || !event2) return false;

  var start1 = getSlot(event1, startAccessor, min, totalMin);
  var start2 = getSlot(event2, startAccessor, min, totalMin);

  return Math.abs(start1 - start2) < 5;
};

/**
 * An event is considered a child of another event if its start time is
 * more than 1 hour later than the other event's start time,
 * but before its end time.
 */
var isChild = function isChild(parentIdx, childIdx, _ref3) {
  var events = _ref3.events,
      startAccessor = _ref3.startAccessor,
      endAccessor = _ref3.endAccessor,
      min = _ref3.min,
      totalMin = _ref3.totalMin;

  if (isSibling(parentIdx, childIdx, { events: events, startAccessor: startAccessor, endAccessor: endAccessor, min: min, totalMin: totalMin })) return false;

  var parentEnd = getSlot(events[parentIdx], endAccessor, min, totalMin, true);
  var childStart = getSlot(events[childIdx], startAccessor, min, totalMin);

  return parentEnd > childStart;
};

/**
 * Given an event index, siblings directly following it will be found and
 * returned as an array of indexes.
 */
var getSiblings = function getSiblings(idx, _ref4) {
  var events = _ref4.events,
      startAccessor = _ref4.startAccessor,
      endAccessor = _ref4.endAccessor,
      min = _ref4.min,
      totalMin = _ref4.totalMin;

  var nextIdx = idx;
  var siblings = [];

  while (isSibling(idx, ++nextIdx, { events: events, startAccessor: startAccessor, endAccessor: endAccessor, min: min, totalMin: totalMin })) {
    siblings.push(nextIdx);
  }

  return siblings;
};

/**
 * Given an event index, and a start search position, all child events to that
 * event will be found and placed into groups of siblings.
 * The return value is an array of child group arrays, as well as the largest
 * size of the child groups.
 */
var getChildGroups = function getChildGroups(idx, nextIdx, _ref5) {
  var events = _ref5.events,
      startAccessor = _ref5.startAccessor,
      endAccessor = _ref5.endAccessor,
      min = _ref5.min,
      totalMin = _ref5.totalMin;

  var groups = [];
  var nbrOfColumns = 0;

  while (isChild(idx, nextIdx, { events: events, startAccessor: startAccessor, endAccessor: endAccessor, min: min, totalMin: totalMin })) {
    var childGroup = [nextIdx];
    var siblingIdx = nextIdx;

    while (isSibling(nextIdx, ++siblingIdx, { events: events, startAccessor: startAccessor, endAccessor: endAccessor, min: min, totalMin: totalMin })) {
      childGroup.push(siblingIdx);
    }

    nbrOfColumns = Math.max(nbrOfColumns, childGroup.length);
    groups.push(childGroup);
    nextIdx = siblingIdx;
  }

  return { childGroups: groups, nbrOfChildColumns: nbrOfColumns };
};

/**
 * Returns height and top offset, both in percentage, for an event at
 * the specified index.
 */
var getYStyles = function getYStyles(idx, _ref6) {
  var events = _ref6.events,
      startAccessor = _ref6.startAccessor,
      endAccessor = _ref6.endAccessor,
      min = _ref6.min,
      totalMin = _ref6.totalMin,
      step = _ref6.step;

  var event = events[idx];
  var start = getSlot(event, startAccessor, min, totalMin);
  var end = Math.max(getSlot(event, endAccessor, min, totalMin, true), start + step);

  var top = start / totalMin * 100;
  var bottom = end / totalMin * 100;

  return {
    top: top,
    height: bottom - top
  };
};

/**
 * Takes an array of unsorted events, and returns a sorted array
 * containing the same events, but with an additional style property.
 * These styles will position the events similarly to Google Calendar.
 *
 * The algorithm will start by sorting the array, and then iterating over it.
 * Starting at the first event, each of its siblings and children, placed in
 * groups of siblings, will be found. Both are needed in order to calculate the
 * width of the first event. When the width is known, its siblings will be
 * given the same width, but with an incremental x-offset.
 *
 * Each group of children will be looking to move as far away from its original
 * parent as possible. A move can be made to one of the parent's siblings, if
 * that sibling is also a parent to the child group. This will make room for
 * more events.
 *
 * When a child group knows its parent, it looks at the space occupied by that
 * parent, and calculates the remaning available space and divides that among
 * each other.
 *
 * All widths and x-offsets are calculated without taking overlapping into
 * account. Overlapping is added in the end according to the OVERLAP_MULTIPLIER.
 * If that is set to 0, the events won't overlap or grow.
 *
 * When one of these rounds are finished, all events connected have been
 * traversed, so the cursor will be moved past all of them.
 */
function getStyledEvents(_ref7) {
  var unsortedEvents = _ref7.events,
      entityKeyAccessor = _ref7.entityKeyAccessor,
      startAccessor = _ref7.startAccessor,
      endAccessor = _ref7.endAccessor,
      min = _ref7.min,
      totalMin = _ref7.totalMin,
      step = _ref7.step,
      _ref7$rightOffset = _ref7.rightOffset,
      rightOffset = _ref7$rightOffset === undefined ? 0 : _ref7$rightOffset;

  var OVERLAP_MULTIPLIER = 0.3;
  var events = sort(unsortedEvents, { startAccessor: startAccessor, endAccessor: endAccessor, entityKeyAccessor: entityKeyAccessor });
  var helperArgs = { events: events, startAccessor: startAccessor, endAccessor: endAccessor, min: min, totalMin: totalMin, step: step };
  var styledEvents = [];
  // idx of top-most, left-most event in each group of events
  var idx = 0;

  // One iteration will cover all connected events.

  var _loop = function _loop() {
    var siblings = getSiblings(idx, helperArgs);

    var _getChildGroups = getChildGroups(idx, idx + siblings.length + 1, helperArgs),
        childGroups = _getChildGroups.childGroups;

    // Calculate number of columns based on top level events plus
    // any overlapping child events to ensure all events share
    // space equally


    var nbrOfColumns = siblings.length + 1;
    [idx].concat(siblings).forEach(function (eventIdx, siblingIdx) {
      childGroups.forEach(function (group) {
        if (isChild(eventIdx, group[0], helperArgs)) {
          // nbrOfColumns is the max of number of top level events plus
          // number of nested child events. Some top level events have more overlapping
          // child events than others.
          nbrOfColumns = Math.max(nbrOfColumns, group.length + siblingIdx + 1);
        }
      });
    });

    // Width of the top level events
    var width = (100 - rightOffset) / nbrOfColumns;

    // Calculate how much of the width need to be extended so that
    // the events can appear to be underneath each other, as opposed
    // to blocks that are stacked next to each other
    var xAdjustment = width * (nbrOfColumns > 1 ? OVERLAP_MULTIPLIER : 0);

    // Set styles to top level events.
    [idx].concat(siblings).forEach(function (eventIdx, siblingIdx) {
      var _getYStyles = getYStyles(eventIdx, helperArgs),
          top = _getYStyles.top,
          height = _getYStyles.height;

      // Determines if this event is the last in the number of top
      // level events + their overlapping child events


      var isLastEvent = nbrOfColumns === siblingIdx + 1;

      styledEvents[eventIdx] = {
        event: events[eventIdx],
        style: {
          top: top,
          height: height,
          width: width + (isLastEvent ? 0 : xAdjustment),
          xOffset: width * siblingIdx
        }
      };
    });

    childGroups.forEach(function (group) {
      var parentIdx = idx;
      var siblingIdx = 0;

      // Move child group to sibling if possible, since this will makes
      // room for more events.
      while (isChild(siblings[siblingIdx], group[0], helperArgs)) {
        parentIdx = siblings[siblingIdx];
        siblingIdx++;
      }

      // Set styles to child events.
      group.forEach(function (eventIdx, i) {
        var parentStyle = styledEvents[parentIdx].style;

        // Calculate space occupied by parent to know how much space the child groups
        // can occupy

        var spaceOccupiedByParent = parentStyle.width + parentStyle.xOffset - xAdjustment;

        // Calculate width of each child event
        var childColumns = Math.min(group.length, nbrOfColumns);
        var childWidth = (100 - rightOffset - spaceOccupiedByParent) / childColumns;

        // Adjust event width so they appear underneath others
        var childXAdjustment = i + 1 === group.length ? 0 : childWidth * OVERLAP_MULTIPLIER;

        var _getYStyles2 = getYStyles(eventIdx, helperArgs),
            top = _getYStyles2.top,
            height = _getYStyles2.height;

        styledEvents[eventIdx] = {
          event: events[eventIdx],
          style: {
            top: top,
            height: height,
            width: childWidth + childXAdjustment,
            xOffset: spaceOccupiedByParent + childWidth * i
          }
        };
      });
    });

    // Move past all events we just went through
    idx += 1 + siblings.length + childGroups.reduce(function (total, group) {
      return total + group.length;
    }, 0);
  };

  while (idx < events.length) {
    _loop();
  }

  return styledEvents;
}

/**
 * Takes an array of availabilies and returns an array
 * containing the same availabilies, but with an additional style property.
 *
 */
function getStyledAvailabilities(_ref8) {
  var unsortedAvailabilities = _ref8.availabilities,
      availabilityStartAccessor = _ref8.availabilityStartAccessor,
      availabilityEndAccessor = _ref8.availabilityEndAccessor,
      min = _ref8.min,
      step = _ref8.step,
      totalMin = _ref8.totalMin;

  var styledAvailabilities = [];
  if (!unsortedAvailabilities) return styledAvailabilities;

  var availabilities = unsortedAvailabilities.slice().sort(function (a, b) {
    return new Date((0, _accessors.accessor)(a, availabilityStartAccessor)) - new Date((0, _accessors.accessor)(b, availabilityStartAccessor)) || new Date((0, _accessors.accessor)(a, availabilityEndAccessor)) - new Date((0, _accessors.accessor)(a, availabilityEndAccessor));
  });

  var helperArgs = {
    events: availabilities,
    startAccessor: availabilityStartAccessor,
    endAccessor: availabilityEndAccessor,
    min: min,
    step: step,
    totalMin: totalMin
  };

  var availabilitiesByColumn = {};
  var columnIndex = 0;

  availabilities.forEach(function (availability) {
    var placed = false;

    // Check for overlap with existing groups
    var columnIndexes = Object.keys(availabilitiesByColumn);
    for (var groupIndex = 0; groupIndex < columnIndexes.length; groupIndex++) {
      var groupKey = columnIndexes[groupIndex];
      var group = availabilitiesByColumn[groupKey];
      var lastAvailability = group[group.length - 1];
      var lastAvailabilityEndTime = (0, _accessors.accessor)(lastAvailability, availabilityEndAccessor);
      var availabilityStartTime = (0, _accessors.accessor)(availability, availabilityStartAccessor);
      if (lastAvailabilityEndTime <= availabilityStartTime) {
        // No overlap, add to current group
        group.push(availability);
        placed = true;
        break;
      }
    }

    if (!placed) {
      // Create a new group
      availabilitiesByColumn[columnIndex] = [availability];
      columnIndex++;
    }
  });

  Object.entries(availabilitiesByColumn).forEach(function (_ref9) {
    var columnIndex = _ref9[0],
        group = _ref9[1];

    group.forEach(function (availability) {
      var _getYStyles3 = getYStyles(availabilities.indexOf(availability), helperArgs),
          height = _getYStyles3.height,
          top = _getYStyles3.top;

      var isMultiColumn = Object.keys(availabilitiesByColumn).length > 1;
      var xOffset = isMultiColumn ? columnIndex * 25 : undefined;
      styledAvailabilities.push({
        availability: availability,
        style: {
          height: height,
          top: top,
          isMultiColumn: isMultiColumn,
          xOffset: xOffset
        }
      });
    });
  });

  return styledAvailabilities;
}