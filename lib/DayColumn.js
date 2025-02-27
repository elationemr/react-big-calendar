'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _Selection = require('./Selection');

var _Selection2 = _interopRequireDefault(_Selection);

var _dates = require('./utils/dates');

var _dates2 = _interopRequireDefault(_dates);

var _selection = require('./utils/selection');

var _localizer = require('./localizer');

var _localizer2 = _interopRequireDefault(_localizer);

var _helpers = require('./utils/helpers');

var _propTypes3 = require('./utils/propTypes');

var _accessors = require('./utils/accessors');

var _daylightSavings = require('./utils/daylightSavings');

var _dayViewLayout = require('./utils/dayViewLayout');

var _dayViewLayout2 = _interopRequireDefault(_dayViewLayout);

var _TimeColumn = require('./TimeColumn');

var _TimeColumn2 = _interopRequireDefault(_TimeColumn);

var _bowser = require('bowser');

var _bowser2 = _interopRequireDefault(_bowser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function snapToSlot(date, step) {
  var roundTo = 1000 * 60 * step;
  return new Date(Math.floor(date.getTime() / roundTo) * roundTo);
}

function startsAfter(date, max) {
  return _dates2.default.gt(_dates2.default.merge(max, date), max, 'minutes');
}

var DaySlot = function (_React$Component) {
  _inherits(DaySlot, _React$Component);

  function DaySlot() {
    var _temp, _this, _ret;

    _classCallCheck(this, DaySlot);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, _React$Component.call.apply(_React$Component, [this].concat(args))), _this), _initialiseProps.call(_this), _temp), _possibleConstructorReturn(_this, _ret);
  }

  DaySlot.prototype.componentDidMount = function componentDidMount() {
    this.props.selectable && this._selectable();
  };

  DaySlot.prototype.componentWillUnmount = function componentWillUnmount() {
    this._teardownSelectable();
  };

  DaySlot.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
    if (nextProps.selectable && !this.props.selectable) this._selectable();
    if (!nextProps.selectable && this.props.selectable) this._teardownSelectable();
  };

  DaySlot.prototype.render = function render() {
    var _props = this.props,
        min = _props.min,
        max = _props.max,
        step = _props.step,
        now = _props.now,
        nowTimezone = _props.nowTimezone,
        selectRangeFormat = _props.selectRangeFormat,
        culture = _props.culture,
        isMultiGrid = _props.isMultiGrid,
        props = _objectWithoutProperties(_props, ['min', 'max', 'step', 'now', 'nowTimezone', 'selectRangeFormat', 'culture', 'isMultiGrid']);

    this._totalMin = _dates2.default.diff(min, max, 'minutes');

    var _state = this.state,
        selecting = _state.selecting,
        startSlot = _state.startSlot,
        endSlot = _state.endSlot;

    var style = this._slotStyle(startSlot, endSlot);

    var selectDates = {
      start: this.state.startDate,
      end: this.state.endDate
    };

    return _react2.default.createElement(
      _TimeColumn2.default,
      _extends({}, props, {
        className: (0, _classnames2.default)('rbc-day-slot', !isMultiGrid && _dates2.default.isToday(max, nowTimezone) && 'rbc-today', _dates2.default.lt(max, _dates2.default.today(nowTimezone), 'day') && 'rbc-past', (_bowser2.default.mobile || _bowser2.default.tablet) && 'rbc-mobile-clickable'),
        now: now,
        nowTimezone: nowTimezone,
        min: min,
        max: max,
        step: step,
        isMultiGrid: isMultiGrid
      }),
      this.renderAvailabilities(),
      this.renderEvents(),
      selecting && _react2.default.createElement(
        'div',
        { className: 'rbc-slot-selection', style: style },
        _react2.default.createElement(
          'span',
          null,
          _localizer2.default.format(selectDates, selectRangeFormat, culture)
        )
      )
    );
  };

  return DaySlot;
}(_react2.default.Component);

DaySlot.propTypes = {
  availabilities: _propTypes2.default.array,
  availabilityKeyAccessor: _propTypes2.default.string,
  events: _propTypes2.default.array.isRequired,
  entityKeyAccessor: _propTypes2.default.string,
  step: _propTypes2.default.number.isRequired,
  rightOffset: _propTypes2.default.number.isRequired,
  min: _propTypes2.default.instanceOf(Date).isRequired,
  max: _propTypes2.default.instanceOf(Date).isRequired,
  now: _propTypes2.default.instanceOf(Date),
  nowTimezone: _propTypes2.default.string,
  date: _propTypes2.default.instanceOf(Date),

  rtl: _propTypes2.default.bool,
  titleAccessor: _propTypes3.accessor,
  allDayAccessor: _propTypes3.accessor.isRequired,
  startAccessor: _propTypes3.accessor.isRequired,
  endAccessor: _propTypes3.accessor.isRequired,
  availabilityStartAccessor: _propTypes3.accessor,
  availabilityEndAccessor: _propTypes3.accessor,

  selectRangeFormat: _propTypes3.dateFormat,
  eventTimeRangeFormat: _propTypes3.dateFormat,
  culture: _propTypes2.default.string,

  selected: _propTypes2.default.object,
  selectable: _propTypes2.default.oneOf([true, false, 'ignoreEvents']),
  eventOffset: _propTypes2.default.number,
  entityKey: _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.string]),

  onSelecting: _propTypes2.default.func,
  onSelectSlot: _propTypes2.default.func.isRequired,
  onSelectEvent: _propTypes2.default.func.isRequired,
  onSelectAvailability: _propTypes2.default.func.isRequired,

  className: _propTypes2.default.string,
  dragThroughEvents: _propTypes2.default.bool,
  eventPropGetter: _propTypes2.default.func,
  dayWrapperComponent: _propTypes3.elementType,
  eventComponent: _propTypes3.elementType,
  eventWrapperComponent: _propTypes3.elementType.isRequired,

  componentProps: _propTypes2.default.shape({
    event: _propTypes2.default.object,
    toolbar: _propTypes2.default.object
  }),

  availabilityComponent: _propTypes3.elementType,
  availabilityWrapperComponent: _propTypes3.elementType,

  // internal prop used to make slight changes in rendering
  isMultiGrid: _propTypes2.default.bool
};
DaySlot.defaultProps = { dragThroughEvents: true, rightOffset: 0, isMultiGrid: false };

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.state = { selecting: false };

  this.renderAvailabilities = function () {
    var _props2 = _this2.props,
        availabilities = _props2.availabilities,
        availabilityComponent = _props2.availabilityComponent,
        AvailabilityWrapper = _props2.availabilityWrapperComponent,
        availabilityStartAccessor = _props2.availabilityStartAccessor,
        availabilityEndAccessor = _props2.availabilityEndAccessor,
        availabilityKeyAccessor = _props2.availabilityKeyAccessor,
        min = _props2.min,
        onSelectAvailability = _props2.onSelectAvailability,
        step = _props2.step;


    if (!availabilityComponent) return;

    var AvailabilityComponent = availabilityComponent;
    var styledAvailabilities = (0, _dayViewLayout.getStyledAvailabilities)({
      availabilities: availabilities,
      availabilityStartAccessor: availabilityStartAccessor,
      availabilityEndAccessor: availabilityEndAccessor,
      min: min,
      step: step,
      totalMin: _this2._totalMin
    });

    return styledAvailabilities.map(function (_ref, idx) {
      var availability = _ref.availability,
          style = _ref.style;
      var height = style.height,
          top = style.top,
          xOffset = style.xOffset;

      var key = availabilityKeyAccessor && availability[availabilityKeyAccessor] ? availability[availabilityKeyAccessor] : 'avbl_' + idx;

      return _react2.default.createElement(
        AvailabilityWrapper,
        { key: key },
        _react2.default.createElement(
          'div',
          {
            className: (0, _classnames2.default)('rbc-availability', onSelectAvailability && 'rbc-availability-selectable'),
            style: {
              top: top + '%',
              height: height + '%',
              left: xOffset
            },
            onClick: function onClick(e) {
              return _this2._onSelectAvailability(availability, e);
            }
          },
          _react2.default.createElement(
            'div',
            { className: 'rbc-availability-content' },
            AvailabilityComponent && _react2.default.createElement(AvailabilityComponent, { availability: availability })
          )
        )
      );
    });
  };

  this.renderEvents = function () {
    var _props3 = _this2.props,
        events = _props3.events,
        min = _props3.min,
        max = _props3.max,
        culture = _props3.culture,
        eventPropGetter = _props3.eventPropGetter,
        selected = _props3.selected,
        eventTimeRangeFormat = _props3.eventTimeRangeFormat,
        eventComponent = _props3.eventComponent,
        EventWrapper = _props3.eventWrapperComponent,
        isRtl = _props3.rtl,
        step = _props3.step,
        rightOffset = _props3.rightOffset,
        componentProps = _props3.componentProps,
        startAccessor = _props3.startAccessor,
        endAccessor = _props3.endAccessor,
        titleAccessor = _props3.titleAccessor,
        entityKeyAccessor = _props3.entityKeyAccessor;


    var EventComponent = eventComponent;

    var styledEvents = (0, _dayViewLayout2.default)({
      events: events, entityKeyAccessor: entityKeyAccessor, startAccessor: startAccessor, endAccessor: endAccessor, min: min, totalMin: _this2._totalMin, step: step, rightOffset: rightOffset
    });

    var eventProps = componentProps.event || {};

    return styledEvents.map(function (_ref2, idx) {
      var _extends2;

      var event = _ref2.event,
          style = _ref2.style;

      var start = (0, _accessors.accessor)(event, startAccessor);
      var end = (0, _accessors.accessor)(event, endAccessor);
      var key = entityKeyAccessor && event[entityKeyAccessor] ? event[entityKeyAccessor] : 'evt_' + idx;

      var continuesPrior = (0, _dayViewLayout.startsBefore)(start, min);
      var continuesAfter = startsAfter(end, max);

      var title = (0, _accessors.accessor)(event, titleAccessor);
      var label = _localizer2.default.format({ start: start, end: end }, eventTimeRangeFormat, culture);
      var _isSelected = (0, _selection.isSelected)(event, selected);

      if (eventPropGetter) var _eventPropGetter = eventPropGetter(event, start, end, _isSelected),
            xStyle = _eventPropGetter.style,
            className = _eventPropGetter.className;

      var height = style.height,
          top = style.top,
          width = style.width,
          xOffset = style.xOffset,
          zIndex = style.zIndex;


      return _react2.default.createElement(
        EventWrapper,
        { event: event, key: key },
        _react2.default.createElement(
          'div',
          {
            style: _extends({}, xStyle, (_extends2 = {
              top: top + '%',
              height: height + '%'
            }, _extends2[isRtl ? 'right' : 'left'] = Math.max(0, xOffset) + '%', _extends2.width = width + '%', _extends2.zIndex = zIndex, _extends2)),
            title: label + ': ' + title,
            onClick: function onClick(e) {
              return _this2._select(event, e);
            },
            className: (0, _classnames2.default)('rbc-event', className, {
              'rbc-selected': _isSelected,
              'rbc-event-continues-earlier': continuesPrior,
              'rbc-event-continues-later': continuesAfter
            })
          },
          _react2.default.createElement(
            'div',
            { className: 'rbc-event-content' },
            EventComponent ? _react2.default.createElement(EventComponent, _extends({ event: event, title: title }, eventProps)) : title
          )
        )
      );
    });
  };

  this._slotStyle = function (startSlot, endSlot) {
    var top = startSlot / _this2._totalMin * 100;
    var bottom = endSlot / _this2._totalMin * 100;

    return {
      top: top + '%',
      height: bottom - top + '%'
    };
  };

  this._selectable = function () {
    var node = (0, _reactDom.findDOMNode)(_this2);
    var selector = _this2._selector = new _Selection2.default(function () {
      return (0, _reactDom.findDOMNode)(_this2);
    });

    /* Disabling drag-selection for now
    let maybeSelect = (box) => {
      let onSelecting = this.props.onSelecting
      let current = this.state || {};
      let state = selectionState(box);
      let { startDate: start, endDate: end } = state;
       if (onSelecting) {
        if (
          (dates.eq(current.startDate, start, 'minutes') &&
          dates.eq(current.endDate, end, 'minutes')) ||
          onSelecting({ start, end }) === false
        )
          return
      }
       this.setState(state)
    }
    */

    var selectionState = function selectionState(_ref3) {
      var y = _ref3.y;
      var _props4 = _this2.props,
          step = _props4.step,
          min = _props4.min,
          max = _props4.max;

      var _getBoundsForNode = (0, _Selection.getBoundsForNode)(node),
          top = _getBoundsForNode.top,
          bottom = _getBoundsForNode.bottom;

      var mins = _this2._totalMin;

      var range = Math.abs(top - bottom);

      var current = (y - top) / range;

      current = snapToSlot(minutesToDate(mins * current, min), step);

      // This is needed to account for the removed 2 AM hour during spring
      // forward
      if ((0, _daylightSavings.isDaylightSavingsSpring)(min) && current.getTimezoneOffset() !== min.getTimezoneOffset()) {
        current = _dates2.default.add(current, 60, 'minutes');
      }

      if (!_this2.state.selecting) _this2._initialDateSlot = current;

      var initial = _this2._initialDateSlot;

      if (_dates2.default.eq(initial, current, 'minutes')) current = _dates2.default.add(current, step, 'minutes');

      var start = _dates2.default.max(min, _dates2.default.min(initial, current));
      var end = _dates2.default.min(max, _dates2.default.max(initial, current));

      return {
        selecting: true,
        startDate: start,
        endDate: end,
        startSlot: (0, _dayViewLayout.positionFromDate)(start, min, _this2._totalMin),
        endSlot: (0, _dayViewLayout.positionFromDate)(end, min, _this2._totalMin)
      };
    };

    /* Disabling drag-selection for now
    selector.on('selecting', maybeSelect)
    selector.on('selectStart', maybeSelect)
    */

    selector.on('mousedown', function (box) {
      if (_this2.props.selectable !== 'ignoreEvents') return;

      return !(0, _Selection.isEvent)((0, _reactDom.findDOMNode)(_this2), box);
    });

    selector.on('click', function (box) {
      if (!(0, _Selection.isEvent)((0, _reactDom.findDOMNode)(_this2), box)) _this2._selectSlot(selectionState(box));

      _this2.setState({ selecting: false });
    });

    /* Disabling drag-selection for now
    selector
      .on('select', () => {
        if (this.state.selecting) {
          this._selectSlot(this.state)
          this.setState({ selecting: false })
        }
      })
    */
  };

  this._teardownSelectable = function () {
    if (!_this2._selector) return;
    _this2._selector.teardown();
    _this2._selector = null;
  };

  this._selectSlot = function (_ref4) {
    var startDate = _ref4.startDate,
        endDate = _ref4.endDate;

    var current = startDate,
        slots = [];

    while (_dates2.default.lte(current, endDate)) {
      slots.push(current);
      current = _dates2.default.add(current, _this2.props.step, 'minutes');
    }

    (0, _helpers.notify)(_this2.props.onSelectSlot, {
      slots: slots,
      entityKey: _this2.props.entityKey,
      start: startDate,
      end: endDate
    });
  };

  this._select = function () {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    (0, _helpers.notify)(_this2.props.onSelectEvent, args);
  };

  this._onSelectAvailability = function () {
    for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    (0, _helpers.notify)(_this2.props.onSelectAvailability, args);
  };
};

function minutesToDate(min, date) {
  var dt = new Date(date),
      totalMins = _dates2.default.diff(_dates2.default.startOf(date, 'day'), date, 'minutes');

  dt = _dates2.default.hours(dt, 0);
  dt = _dates2.default.minutes(dt, totalMins + min);
  dt = _dates2.default.seconds(dt, 0);
  return _dates2.default.milliseconds(dt, 0);
}

exports.default = DaySlot;
module.exports = exports['default'];