'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _reactDom = require('react-dom');

var _dates = require('./utils/dates');

var _dates2 = _interopRequireDefault(_dates);

var _localizer = require('./localizer');

var _localizer2 = _interopRequireDefault(_localizer);

var _DayColumn = require('./DayColumn');

var _DayColumn2 = _interopRequireDefault(_DayColumn);

var _TimeColumn = require('./TimeColumn');

var _TimeColumn2 = _interopRequireDefault(_TimeColumn);

var _Header = require('./Header');

var _Header2 = _interopRequireDefault(_Header);

var _width = require('dom-helpers/query/width');

var _width2 = _interopRequireDefault(_width);

var _scrollbarSize = require('dom-helpers/util/scrollbarSize');

var _scrollbarSize2 = _interopRequireDefault(_scrollbarSize);

var _propTypes = require('./utils/propTypes');

var _helpers = require('./utils/helpers');

var _accessors = require('./utils/accessors');

var _eventLevels = require('./utils/eventLevels');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MultiTimeGrid = function (_Component) {
  _inherits(MultiTimeGrid, _Component);

  function MultiTimeGrid(props) {
    _classCallCheck(this, MultiTimeGrid);

    var _this = _possibleConstructorReturn(this, _Component.call(this, props));

    _this.onHeaderSelectChange = function (_ref) {
      var target = _ref.target;

      var index = Number(target.getAttribute('data-header-index'));
      var value = _this._entityKeyIsNumber ? Number(target.value) : target.value;
      var newSelectedKeys = [].concat(_this.props.selectedEntityKeys);
      newSelectedKeys[index] = value;
      _this.props.onSelectedEntityChange(newSelectedKeys, { index: index, value: value });
    };

    _this.onContentScroll = function (_ref2) {
      var target = _ref2.target;

      if (target.scrollTop !== _this._lastScrollTop) {
        _this.leftScroller.scrollTop = target.scrollTop;
        _this._lastScrollTop = target.scrollTop;
      }

      if (target.scrollLeft !== _this._lastScrollLeft) {
        _this.headerScroller.style.marginLeft = '-' + target.scrollLeft + 'px';
        _this._lastScrollLeft = target.scrollLeft;
      }
    };

    _this.state = {
      gutterWidth: undefined,
      isOverflowing: null
    };
    _this.handleSelectEvent = _this.handleSelectEvent.bind(_this);
    _this.handleHeaderClick = _this.handleHeaderClick.bind(_this);
    _this.setEntityKeyTypeIfNecessary();

    // for checking which axis the content grid was scrolled
    _this._lastScrollTop = 0;
    _this._lastScrollLeft = 0;
    return _this;
  }

  MultiTimeGrid.prototype.componentWillMount = function componentWillMount() {
    this._gutters = [];
    this.calculateScroll();
  };

  MultiTimeGrid.prototype.componentDidMount = function componentDidMount() {
    this.checkOverflow();

    if (this.props.width == null) {
      this.measureGutter();
    }
    this.applyScroll();

    this.positionTimeIndicator();
    this.triggerTimeIndicatorUpdate();
  };

  MultiTimeGrid.prototype.componentWillUnmount = function componentWillUnmount() {
    window.clearTimeout(this._timeIndicatorTimeout);
  };

  MultiTimeGrid.prototype.componentDidUpdate = function componentDidUpdate() {
    if (this.props.width == null && !this.state.gutterWidth) {
      this.measureGutter();
    }

    this.applyScroll();
    this.positionTimeIndicator();
    //this.checkOverflow()
  };

  MultiTimeGrid.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
    var _props = this.props,
        start = _props.start,
        scrollToTime = _props.scrollToTime;


    this.setEntityKeyTypeIfNecessary();

    // When paginating, reset scroll
    if (nextProps.view !== this.props.view && (!_dates2.default.eq(nextProps.start, start, 'minute') || !_dates2.default.eq(nextProps.scrollToTime, scrollToTime, 'minute'))) {
      this.calculateScroll();
    }
  };

  MultiTimeGrid.prototype.render = function render() {
    var _this2 = this;

    var _props2 = this.props,
        eventMap = _props2.eventMap,
        date = _props2.start,
        width = _props2.width,
        startAccessor = _props2.startAccessor,
        endAccessor = _props2.endAccessor,
        allDayAccessor = _props2.allDayAccessor,
        selectedEntityKeys = _props2.selectedEntityKeys;
    var gutterWidth = this.state.gutterWidth;


    width = width || gutterWidth;

    this.slots = selectedEntityKeys.length;
    this.rangeEventsMap = {};

    var _loop = function _loop(key) {
      if (!eventMap.hasOwnProperty(key)) return 'continue';

      var eventsForCurrentKey = eventMap[key];
      eventsForCurrentKey.forEach(function (event) {
        if ((0, _eventLevels.inRange)(event, date, date, _this2.props)) {
          var eStart = (0, _accessors.accessor)(event, startAccessor),
              eEnd = (0, _accessors.accessor)(event, endAccessor);

          if ((0, _accessors.accessor)(event, allDayAccessor) || !_dates2.default.eq(eStart, eEnd, 'day') || _dates2.default.isJustDate(eStart) && _dates2.default.isJustDate(eEnd)) {
            // is an all day event - removed support for all day events for now,
            // but may add it back in the future
            //
          } else {
            if (_this2.rangeEventsMap[key] === undefined) {
              _this2.rangeEventsMap[key] = [];
            }
            _this2.rangeEventsMap[key].push(event);
          }
        }
      });
    };

    for (var key in eventMap) {
      var _ret = _loop(key);

      if (_ret === 'continue') continue;
    }

    var gutterRef = function gutterRef(ref) {
      return _this2._gutters[1] = ref && (0, _reactDom.findDOMNode)(ref);
    };

    return _react2.default.createElement(
      'div',
      { className: 'rbc-time-view' },
      this.renderHeader(width, date),
      _react2.default.createElement(
        'div',
        { className: 'rbc-mv-body' },
        _react2.default.createElement(
          'div',
          { className: 'rbc-mv-time-column' },
          _react2.default.createElement(
            'div',
            { className: 'rbc-mv-left-scroller', style: { width: width }, ref: function ref(div) {
                _this2.leftScroller = div;
              } },
            _react2.default.createElement(_TimeColumn2.default, _extends({}, this.props, {
              showLabels: true,
              ref: gutterRef,
              className: 'rbc-time-gutter'
            }))
          ),
          _react2.default.createElement('div', { className: 'rbc-mv-scroll-footer', style: { height: (0, _scrollbarSize2.default)() } })
        ),
        _react2.default.createElement(
          'div',
          {
            ref: function ref(div) {
              _this2.refs.content = div;
            },
            className: 'rbc-time-content rbc-mv-time-content',
            onScroll: this.onContentScroll
          },
          _react2.default.createElement('div', { ref: 'timeIndicator', className: 'rbc-current-time-indicator' }),
          this.renderEvents(date, this.rangeEventsMap, this.props.now)
        )
      )
    );
  };

  MultiTimeGrid.prototype.renderEvents = function renderEvents(date, rangeEventsMap, today) {
    var _this3 = this;

    var _props3 = this.props,
        min = _props3.min,
        max = _props3.max,
        endAccessor = _props3.endAccessor,
        startAccessor = _props3.startAccessor,
        components = _props3.components;


    return this.props.selectedEntityKeys.map(function (selectedEntityKey, idx) {
      var daysEvents = rangeEventsMap[selectedEntityKey] || [];
      daysEvents = daysEvents.filter(function (event) {
        return _dates2.default.inRange(date, (0, _accessors.accessor)(event, startAccessor), (0, _accessors.accessor)(event, endAccessor), 'day');
      });

      return _react2.default.createElement(_DayColumn2.default, _extends({}, _this3.props, {
        min: _dates2.default.merge(date, min),
        max: _dates2.default.merge(date, max),
        eventComponent: components.event,
        eventWrapperComponent: components.eventWrapper,
        dayWrapperComponent: components.dayWrapper,
        style: (0, _eventLevels.multiSegStyle)(1, _this3.slots),
        key: idx,
        entityKey: selectedEntityKey,
        date: date,
        events: daysEvents,
        isMultiGrid: true
      }));
    });
  };

  MultiTimeGrid.prototype.renderHeader = function renderHeader(width, date) {
    var _this4 = this;

    var rtl = this.props.rtl;


    var scrollHeader = _react2.default.createElement('div', { className: 'rbc-mv-scroll-header', style: { width: (0, _scrollbarSize2.default)() } });

    return _react2.default.createElement(
      'div',
      { className: 'rbc-mv-header' },
      rtl && scrollHeader,
      _react2.default.createElement('div', {
        ref: function ref(_ref3) {
          _this4._gutters[0] = _ref3;
        },
        className: 'rbc-header-gutter',
        style: { width: width }
      }),
      _react2.default.createElement(
        'div',
        { className: 'rbc-mv-header-content' },
        _react2.default.createElement(
          'div',
          { className: 'rbc-mv-header-content-scroller', ref: function ref(div) {
              _this4.headerScroller = div;
            } },
          this.renderHeaderCells(date)
        )
      ),
      !rtl && scrollHeader
    );
  };

  MultiTimeGrid.prototype.renderHeaderCells = function renderHeaderCells(date) {
    var _this5 = this;

    var _props4 = this.props,
        entities = _props4.entities,
        entityKeyAccessor = _props4.entityKeyAccessor,
        entityNameAccessor = _props4.entityNameAccessor,
        dayFormat = _props4.dayFormat,
        culture = _props4.culture,
        components = _props4.components;


    var HeaderComponent = components.header || _Header2.default;

    var entityOptions = entities.map(function (entity) {
      return _react2.default.createElement(
        'option',
        { key: entity[entityKeyAccessor], value: entity[entityKeyAccessor] },
        (0, _accessors.accessor)(entity, entityNameAccessor)
      );
    });

    return this.props.selectedEntityKeys.map(function (selectedEntityKey, i) {
      var label = _react2.default.createElement(
        'select',
        {
          value: selectedEntityKey,
          onChange: _this5.onHeaderSelectChange,
          'data-header-index': i,
          style: { width: '100%' }
        },
        entityOptions
      );

      return _react2.default.createElement(
        'div',
        {
          key: i,
          className: 'rbc-header',
          style: (0, _eventLevels.multiSegStyle)(1, _this5.slots)
        },
        _react2.default.createElement(HeaderComponent, {
          date: date,
          label: label,
          localizer: _localizer2.default,
          format: dayFormat,
          culture: culture
        })
      );
    });
  };

  MultiTimeGrid.prototype.handleHeaderClick = function handleHeaderClick(date, view, e) {
    e.preventDefault();
    (0, _helpers.notify)(this.props.onDrillDown, [date, view]);
  };

  MultiTimeGrid.prototype.handleSelectEvent = function handleSelectEvent() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    (0, _helpers.notify)(this.props.onSelectEvent, args);
  };

  MultiTimeGrid.prototype.clearSelection = function clearSelection() {
    clearTimeout(this._selectTimer);
    this._pendingSelection = [];
  };

  MultiTimeGrid.prototype.measureGutter = function measureGutter() {
    var width = this.state.gutterWidth;
    var gutterCells = this._gutters;

    if (!width) {
      width = Math.max.apply(Math, gutterCells.map(_width2.default));

      if (width) {
        this.setState({ gutterWidth: width });
      }
    }
  };

  MultiTimeGrid.prototype.applyScroll = function applyScroll() {
    if (this._scrollRatio) {
      var content = this.refs.content;

      content.scrollTop = content.scrollHeight * this._scrollRatio;
      // Only do this once
      this._scrollRatio = null;
    }
  };

  MultiTimeGrid.prototype.calculateScroll = function calculateScroll() {
    var _props5 = this.props,
        min = _props5.min,
        max = _props5.max,
        scrollToTime = _props5.scrollToTime;


    var diffMillis = scrollToTime - _dates2.default.startOf(scrollToTime, 'day');
    var totalMillis = _dates2.default.diff(max, min);

    this._scrollRatio = diffMillis / totalMillis;
  };

  MultiTimeGrid.prototype.checkOverflow = function checkOverflow() {
    var _this6 = this;

    if (this._updatingOverflow) return;

    var isOverflowing = this.refs.content.scrollHeight > this.refs.content.clientHeight;

    if (this.state.isOverflowing !== isOverflowing) {
      this._updatingOverflow = true;
      this.setState({ isOverflowing: isOverflowing }, function () {
        _this6._updatingOverflow = false;
      });
    }
  };

  // May return null/undefined, make sure to check the returned value


  MultiTimeGrid.prototype.getTimeGutter = function getTimeGutter() {
    return this._gutters[this._gutters.length - 1];
  };

  MultiTimeGrid.prototype.positionTimeIndicator = function positionTimeIndicator() {
    var _props6 = this.props,
        rtl = _props6.rtl,
        min = _props6.min,
        max = _props6.max;

    var now = new Date();

    var secondsGrid = _dates2.default.diff(max, min, 'seconds');
    var secondsPassed = _dates2.default.diff(now, min, 'seconds');

    var timeIndicator = this.refs.timeIndicator;
    var factor = secondsPassed / secondsGrid;
    var timeGutter = this.getTimeGutter();

    if (timeGutter && now >= min && now <= max) {
      var pixelHeight = timeGutter.offsetHeight;
      var offset = Math.floor(factor * pixelHeight);

      timeIndicator.style.display = 'block';
      timeIndicator.style[rtl ? 'left' : 'right'] = 0;
      timeIndicator.style[rtl ? 'right' : 'left'] = timeGutter.offsetWidth + 'px';
      timeIndicator.style.top = offset + 'px';
    } else {
      timeIndicator.style.display = 'none';
    }
  };

  MultiTimeGrid.prototype.triggerTimeIndicatorUpdate = function triggerTimeIndicatorUpdate() {
    var _this7 = this;

    // Update the position of the time indicator every minute
    this._timeIndicatorTimeout = window.setTimeout(function () {
      _this7.positionTimeIndicator();

      _this7.triggerTimeIndicatorUpdate();
    }, 60000);
  };

  MultiTimeGrid.prototype.setEntityKeyTypeIfNecessary = function setEntityKeyTypeIfNecessary() {
    if (this._entityKeyIsNumber === undefined) {
      var _props7 = this.props,
          entities = _props7.entities,
          entityKeyAccessor = _props7.entityKeyAccessor;


      if (entities.length > 0) {
        var entityKey = entities[0][entityKeyAccessor];
        this._entityKeyIsNumber = typeof entityKey === 'number';
      }
    }
  };

  return MultiTimeGrid;
}(_react.Component);

MultiTimeGrid.propTypes = {
  view: _react2.default.PropTypes.string.isRequired,
  eventMap: _react2.default.PropTypes.object.isRequired,
  entities: _react2.default.PropTypes.array.isRequired,
  entityKeyAccessor: _react2.default.PropTypes.string.isRequired,
  entityNameAccessor: _propTypes.accessor.isRequired,

  step: _react2.default.PropTypes.number,
  start: _react2.default.PropTypes.instanceOf(Date),
  end: _react2.default.PropTypes.instanceOf(Date),
  min: _react2.default.PropTypes.instanceOf(Date),
  max: _react2.default.PropTypes.instanceOf(Date),
  now: _react2.default.PropTypes.instanceOf(Date),

  scrollToTime: _react2.default.PropTypes.instanceOf(Date),
  eventPropGetter: _react2.default.PropTypes.func,
  dayFormat: _propTypes.dateFormat,
  culture: _react2.default.PropTypes.string,

  rtl: _react2.default.PropTypes.bool,
  width: _react2.default.PropTypes.number,

  titleAccessor: _propTypes.accessor.isRequired,
  allDayAccessor: _propTypes.accessor.isRequired,
  startAccessor: _propTypes.accessor.isRequired,
  endAccessor: _propTypes.accessor.isRequired,

  selected: _react2.default.PropTypes.object,
  selectable: _react2.default.PropTypes.oneOf([true, false, 'ignoreEvents']),

  onNavigate: _react2.default.PropTypes.func,
  onSelectSlot: _react2.default.PropTypes.func,
  onSelectEnd: _react2.default.PropTypes.func,
  onSelectStart: _react2.default.PropTypes.func,
  onSelectEvent: _react2.default.PropTypes.func,
  onDrillDown: _react2.default.PropTypes.func,
  getDrilldownView: _react2.default.PropTypes.func.isRequired,

  messages: _react2.default.PropTypes.object,
  components: _react2.default.PropTypes.object.isRequired,

  // new props
  selectedEntityKeys: _react2.default.PropTypes.array.isRequired,
  onSelectedEntityChange: _react2.default.PropTypes.func.isRequired
};
MultiTimeGrid.defaultProps = {
  step: 30,
  min: _dates2.default.startOf(new Date(), 'day'),
  max: _dates2.default.endOf(new Date(), 'day'),
  scrollToTime: _dates2.default.startOf(new Date(), 'day'),
  /* these 2 are needed to satisfy requirements from TimeColumn required props
   * There is a strange bug in React, using ...TimeColumn.defaultProps causes weird crashes
   */
  type: 'gutter',
  now: new Date()
};
exports.default = MultiTimeGrid;
module.exports = exports['default'];