'use strict';

exports.__esModule = true;

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _dates = require('./utils/dates');

var _dates2 = _interopRequireDefault(_dates);

var _daylightSavings = require('./utils/daylightSavings');

var _propTypes3 = require('./utils/propTypes');

var _BackgroundWrapper = require('./BackgroundWrapper');

var _BackgroundWrapper2 = _interopRequireDefault(_BackgroundWrapper);

var _TimeSlotGroup = require('./TimeSlotGroup');

var _TimeSlotGroup2 = _interopRequireDefault(_TimeSlotGroup);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TimeColumn = function (_Component) {
  _inherits(TimeColumn, _Component);

  function TimeColumn() {
    var _temp, _this, _ret;

    _classCallCheck(this, TimeColumn);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, _Component.call.apply(_Component, [this].concat(args))), _this), _this.rootRef = function (div) {
      _this.root = div;
    }, _this.indicatorRef = function (div) {
      _this.timeIndicator = div;
    }, _this.positionTimeIndicator = function () {
      var _this$props = _this.props,
          min = _this$props.min,
          max = _this$props.max,
          dragThroughEvents = _this$props.dragThroughEvents,
          nowTimezone = _this$props.nowTimezone;

      // this prop is only passed into this component from DayColumn, so here we're
      // excluding the time gutter TimeColumn from having a time indicator.

      if (!dragThroughEvents) return;

      var now = _dates2.default.now(nowTimezone);

      var dayEnd = _dates2.default.endOf(now, 'day');

      var dayEndTimezoneOffset = dayEnd.getTimezoneOffset();
      var nowTimezoneOffset = now.getTimezoneOffset();

      var daylightSavingsShift = (0, _daylightSavings.getDaylightSavingsShift)(now);
      var isFallingBack = (0, _daylightSavings.isDaylightSavingsFall)(daylightSavingsShift);

      // This is generally at 2:00am on the day we fall back to standard time
      var isAfterFallBackTimeShift = isFallingBack && nowTimezoneOffset === dayEndTimezoneOffset;

      if (isAfterFallBackTimeShift) {
        now = _dates2.default.add(now, daylightSavingsShift, 'minutes');
      }

      var secondsGrid = _dates2.default.diff(max, min, 'seconds');
      var secondsPassed = _dates2.default.diff(now, min, 'seconds');

      var timeIndicator = _this.timeIndicator;
      var factor = secondsPassed / secondsGrid;

      if (_this.root && now >= min && now <= max) {
        var pixelHeight = _this.root.offsetHeight;
        var offset = Math.floor(factor * pixelHeight);

        timeIndicator.style.display = 'block';
        timeIndicator.style.left = 0;
        timeIndicator.style.right = 0;
        timeIndicator.style.top = offset + 'px';
      } else {
        timeIndicator.style.display = 'none';
      }
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  TimeColumn.prototype.componentDidMount = function componentDidMount() {
    this.positionTimeIndicator();
    this.indicatorRefresh = window.setInterval(this.positionTimeIndicator, 60000);
  };

  TimeColumn.prototype.componentDidUpdate = function componentDidUpdate(prevProps /*, prevState */) {
    // Don't position indicator on update for multi grid if day didn't change,
    // because it can de-sync the lines across the different columns if only
    // some columns update but others don't.
    if (this.props.isMultiGrid && _dates2.default.eq(prevProps.min, this.props.min)) return;

    this.positionTimeIndicator();
  };

  TimeColumn.prototype.componentWillUnmount = function componentWillUnmount() {
    window.clearInterval(this.indicatorRefresh);
  };

  TimeColumn.prototype.renderTimeSliceGroup = function renderTimeSliceGroup(key, isNow, date) {
    var _props = this.props,
        availabilities = _props.availabilities,
        dayWrapperComponent = _props.dayWrapperComponent,
        entityKey = _props.entityKey,
        isMultiGrid = _props.isMultiGrid,
        timeslots = _props.timeslots,
        showLabels = _props.showLabels,
        step = _props.step,
        timeGutterFormat = _props.timeGutterFormat,
        culture = _props.culture,
        groupHeight = _props.groupHeight,
        slotPropGetter = _props.slotPropGetter;


    return _react2.default.createElement(_TimeSlotGroup2.default, {
      availabilities: availabilities,
      entityKey: entityKey,
      key: key,
      isMultiGrid: isMultiGrid,
      isNow: isNow,
      value: date,
      step: step,
      culture: culture,
      timeslots: timeslots,
      showLabels: showLabels,
      timeGutterFormat: timeGutterFormat,
      dayWrapperComponent: dayWrapperComponent,
      height: groupHeight,
      slotPropGetter: slotPropGetter
    });
  };

  TimeColumn.prototype.render = function render() {
    var _props2 = this.props,
        className = _props2.className,
        children = _props2.children,
        style = _props2.style,
        now = _props2.now,
        min = _props2.min,
        max = _props2.max,
        step = _props2.step,
        timeslots = _props2.timeslots,
        isMultiGrid = _props2.isMultiGrid;

    var totalMin = _dates2.default.diff(min, max, 'minutes');
    var numGroups = Math.ceil(totalMin / (step * timeslots));
    var renderedSlots = [];
    var groupLengthInMinutes = step * timeslots;

    var date = min;
    var next = date;
    var isNow = false;

    for (var i = 0; i < numGroups; i++) {
      isNow = _dates2.default.inRange(now, date, _dates2.default.add(next, groupLengthInMinutes - 1, 'minutes'), 'minutes');

      next = _dates2.default.add(date, groupLengthInMinutes, 'minutes');
      renderedSlots.push(this.renderTimeSliceGroup(i, isNow, date));

      date = next;
    }

    return _react2.default.createElement(
      'div',
      {
        className: (0, _classnames2.default)(className, 'rbc-time-column'),
        style: style,
        ref: this.rootRef
      },
      _react2.default.createElement('div', { ref: this.indicatorRef, className: 'rbc-current-time-indicator' }),
      isMultiGrid ? children : renderedSlots,
      isMultiGrid ? renderedSlots : children
    );
  };

  return TimeColumn;
}(_react.Component);

TimeColumn.propTypes = {
  availabilities: _propTypes2.default.array,
  step: _propTypes2.default.number.isRequired,
  culture: _propTypes2.default.string,
  timeslots: _propTypes2.default.number.isRequired,
  now: _propTypes2.default.instanceOf(Date).isRequired,
  min: _propTypes2.default.instanceOf(Date).isRequired,
  max: _propTypes2.default.instanceOf(Date).isRequired,
  showLabels: _propTypes2.default.bool,
  timeGutterFormat: _propTypes2.default.string,
  type: _propTypes2.default.string.isRequired,
  className: _propTypes2.default.string,
  groupHeight: _propTypes2.default.number,
  dayWrapperComponent: _propTypes3.elementType,

  dragThroughEvents: _propTypes2.default.bool,
  nowTimezone: _propTypes2.default.string,

  entityKey: _propTypes2.default.number,
  slotPropGetter: _propTypes2.default.func,

  // internal prop used to make slight changes in rendering
  isMultiGrid: _propTypes2.default.bool
};
TimeColumn.defaultProps = {
  step: 30,
  timeslots: 2,
  showLabels: false,
  type: 'day',
  className: '',
  dayWrapperComponent: _BackgroundWrapper2.default,

  isMultiGrid: false
};
exports.default = TimeColumn;
module.exports = exports['default'];