import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';

import dates from './utils/dates';
import localizer from './localizer'
import DayColumn from './DayColumn';
import TimeColumn from './TimeColumn';
import Header from './Header';

import getWidth from 'dom-helpers/query/width';
import scrollbarSize from 'dom-helpers/util/scrollbarSize';

import { accessor, dateFormat } from './utils/propTypes';

import { notify, isAllDayEvent, makeEventOrAvailabilityFilter } from './utils/helpers';

import { accessor as get } from './utils/accessors';

import { inRange, multiSegStyle } from './utils/eventLevels';

export default class MultiTimeGrid extends Component {

  static propTypes = {
    view: PropTypes.string.isRequired,
    availabilityMap: PropTypes.object,
    eventMap: PropTypes.object.isRequired,
    entities: PropTypes.array.isRequired,
    entityKeyAccessor: PropTypes.string.isRequired,
    entityNameAccessor: accessor.isRequired,

    step: PropTypes.number,
    start: PropTypes.instanceOf(Date),
    end: PropTypes.instanceOf(Date),
    min: PropTypes.instanceOf(Date),
    max: PropTypes.instanceOf(Date),
    now: PropTypes.instanceOf(Date),

    scrollToTime: PropTypes.instanceOf(Date),
    eventPropGetter: PropTypes.func,
    dayFormat: dateFormat,
    culture: PropTypes.string,

    rtl: PropTypes.bool,
    width: PropTypes.number,

    titleAccessor: accessor.isRequired,
    allDayAccessor: accessor.isRequired,
    availabilityStartAccessor: accessor,
    availabilityEndAccessor: accessor,
    startAccessor: accessor.isRequired,
    endAccessor: accessor.isRequired,

    selected: PropTypes.object,
    selectable: PropTypes.oneOf([true, false, 'ignoreEvents']),

    onNavigate: PropTypes.func,
    onSelectSlot: PropTypes.func,
    onSelectEnd: PropTypes.func,
    onSelectStart: PropTypes.func,
    onSelectEvent: PropTypes.func,
    onDrillDown: PropTypes.func,
    getDrilldownView: PropTypes.func.isRequired,

    messages: PropTypes.object,
    components: PropTypes.object.isRequired,

    // new props
    selectedEntityKeys: PropTypes.array.isRequired,
    onSelectedEntityChange: PropTypes.func.isRequired,
  }

  static defaultProps = {
    step: 30,
    min: dates.startOf(new Date(), 'day'),
    max: dates.endOf(new Date(), 'day'),
    scrollToTime: dates.startOf(new Date(), 'day'),
    /* these 2 are needed to satisfy requirements from TimeColumn required props
     * There is a strange bug in React, using ...TimeColumn.defaultProps causes weird crashes
     */
    type: 'gutter',
    now: new Date()
  }

  constructor(props) {
    super(props)
    this.state = {
      gutterWidth: undefined,
      isOverflowing: null,
    };
    this.handleSelectEvent = this.handleSelectEvent.bind(this)
    this.handleHeaderClick = this.handleHeaderClick.bind(this)
    this.setEntityKeyTypeIfNecessary();

    // for checking which axis the content grid was scrolled
    this._lastScrollTop = 0;
    this._lastScrollLeft = 0;
  }

  componentWillMount() {
    this._gutters = [];
    this.calculateScroll();
  }

  componentDidMount() {
    this.checkOverflow();

    if (this.props.width == null) {
      this.measureGutter()
    }
    this.applyScroll();
  }

  componentDidUpdate() {
    if (this.props.width == null && !this.state.gutterWidth) {
      this.measureGutter()
    }

    this.applyScroll();
    //this.checkOverflow()
  }

  componentWillReceiveProps(nextProps) {
    const { start, scrollToTime } = this.props;

    this.setEntityKeyTypeIfNecessary();

    // When paginating, reset scroll
    if (
      nextProps.view !== this.props.view &&
      (!dates.eq(nextProps.start, start, 'minute') ||
       !dates.eq(nextProps.scrollToTime, scrollToTime, 'minute'))
    ) {
      this.calculateScroll();
    }

  }

  onHeaderSelectChange = ({ target }) => {
    const index = Number(target.getAttribute('data-header-index'));
    const value = this._entityKeyIsNumber ? Number(target.value) : target.value;
    const newSelectedKeys = [ ...this.props.selectedEntityKeys ];
    newSelectedKeys[index] = value;
    this.props.onSelectedEntityChange(newSelectedKeys, { index, value });
  }

  onContentScroll = ({ target }) => {
    if (target.scrollTop !== this._lastScrollTop) {
      this.leftScroller.scrollTop = target.scrollTop;
      this._lastScrollTop = target.scrollTop;
    }

    if (target.scrollLeft !== this._lastScrollLeft) {
      this.headerScroller.style.marginLeft = `-${target.scrollLeft}px`;
      this._lastScrollLeft = target.scrollLeft;
    }
  }

  render() {
    let {
        eventMap
      , start: date
      , width
      , startAccessor
      , endAccessor
      , allDayAccessor
      , selectedEntityKeys
    } = this.props;

    const { gutterWidth } = this.state;

    width = width || gutterWidth;

    this.slots = selectedEntityKeys.length;
    this.rangeEventsMap = {};
    for (const key in eventMap) {
      if (!eventMap.hasOwnProperty(key)) continue;

      const eventsForCurrentKey = eventMap[key];
      eventsForCurrentKey.forEach(event => {
        if (inRange(event, date, date, this.props)) {
          if (isAllDayEvent(event, { startAccessor, endAccessor, allDayAccessor })) {
            // is an all day event - removed support for all day events for now,
            // but may add it back in the future
            //
          } else {
            if (this.rangeEventsMap[key] === undefined) {
              this.rangeEventsMap[key] = [];
            }
            this.rangeEventsMap[key].push(event);
          }
        }
      });
    }

    let gutterRef = ref => this._gutters[1] = ref && findDOMNode(ref);

    return (
      <div className='rbc-time-view'>
        {this.renderHeader(width, date)}
        <div className="rbc-mv-body">
          <div className="rbc-mv-time-column">
            <div className="rbc-mv-left-scroller" style={{ width }} ref={(div) => { this.leftScroller = div; }}>
              <TimeColumn
                {...this.props}
                min={dates.merge(date, this.props.min)}
                max={dates.merge(date, this.props.max)}
                showLabels
                ref={gutterRef}
                className='rbc-time-gutter'
              />
            </div>
            <div className="rbc-mv-scroll-footer" style={{ height: scrollbarSize() }}></div>
          </div>
          <div
            ref={(div) => { this.content = div; }}
            className='rbc-time-content rbc-mv-time-content'
            onScroll={this.onContentScroll}
          >
            {/* dummy div replacement for timeIndicator to keep css working */}
            <div style={{ display: 'none' }} />
            {this.renderEventsAndAvailabilities(date, this.rangeEventsMap, this.props.now)}
          </div>
        </div>
      </div>
    );
  }

  renderEventsAndAvailabilities(date, rangeEventsMap /* , today */){
    const {
      min,
      max,
      endAccessor,
      startAccessor,
      components,
      availabilityMap,
      availabilityStartAccessor,
      availabilityEndAccessor,
    } = this.props;

    return this.props.selectedEntityKeys.map((selectedEntityKey, idx) => {
      let daysEvents = rangeEventsMap[selectedEntityKey] || [];
      const eventFilter = makeEventOrAvailabilityFilter(date);
      daysEvents = daysEvents.filter((event) => eventFilter(event, startAccessor, endAccessor));
      const providerAvailabilities = (
        availabilityMap && availabilityMap[selectedEntityKey] || []
      );
      const availabilityFilter = makeEventOrAvailabilityFilter(date);
      const daysAvailabilities = providerAvailabilities.filter(
        (availability) => availabilityFilter(
          availability, availabilityStartAccessor, availabilityEndAccessor
        )
      );

      return (
        <DayColumn
          {...this.props }
          min={dates.merge(date, min)}
          max={dates.merge(date, max)}
          availabilityComponent={components.availability}
          availabilityWrapperComponent={components.availabilityWrapper}
          availabilities={daysAvailabilities}
          eventComponent={components.event}
          eventWrapperComponent={components.eventWrapper}
          dayWrapperComponent={components.dayWrapper}
          style={multiSegStyle(1, this.slots)}
          key={idx}
          entityKey={selectedEntityKey}
          date={date}
          events={daysEvents}
          isMultiGrid
        />
      )
    })
  }

  renderHeader(width, date) {
    let { rtl } = this.props;

    const scrollHeader = <div className="rbc-mv-scroll-header" style={{ width: scrollbarSize() }}></div>;

    return (
      <div className="rbc-mv-header">
        {rtl && scrollHeader}
        <div
          ref={(ref) => { this._gutters[0] = ref; }}
          className='rbc-header-gutter'
          style={{ width }}
        />
        <div className="rbc-mv-header-content">
          <div className="rbc-mv-header-content-scroller" ref={(div) => { this.headerScroller = div; }}>
            {this.renderHeaderCells(date)}
          </div>
        </div>
        {!rtl && scrollHeader}
      </div>
    )
  }

  renderHeaderCells(date) {
    const {
      entities, entityKeyAccessor, entityNameAccessor, dayFormat, culture, components
    } = this.props;

    const HeaderComponent = components.header || Header;

    const entityOptions = entities.map((entity) => (
      <option key={entity[entityKeyAccessor]} value={entity[entityKeyAccessor]}>
        {get(entity, entityNameAccessor)}
      </option>
    ));

    return this.props.selectedEntityKeys.map((selectedEntityKey, i) => {
      const label = (
        <select
          value={selectedEntityKey}
          onChange={this.onHeaderSelectChange}
          data-header-index={i}
          style={{ width: '100%' }}
        >
          {entityOptions}
        </select>
      );

      return (
        <div
          key={i}
          className="rbc-header"
          style={multiSegStyle(1, this.slots)}
        >
          <HeaderComponent
            date={date}
            label={label}
            localizer={localizer}
            format={dayFormat}
            culture={culture}
          />
        </div>
      )
    })
  }

  handleHeaderClick(date, view, e){
    e.preventDefault()
    notify(this.props.onDrillDown, [date, view])
  }

  handleSelectEvent(...args) {
    notify(this.props.onSelectEvent, args)
  }

  clearSelection(){
    clearTimeout(this._selectTimer)
    this._pendingSelection = [];
  }

  measureGutter() {
    let width = this.state.gutterWidth;
    let gutterCells = this._gutters;

    if (!width) {
      width = Math.max(...gutterCells.map(getWidth));

      if (width) {
        this.setState({ gutterWidth: width })
      }
    }
  }

  applyScroll() {
    if (this._scrollRatio && this.content) {
      this.content.scrollTop = this.content.scrollHeight * this._scrollRatio;
      // Only do this once
      this._scrollRatio = null;
    }
  }

  calculateScroll() {
    const { min, max, scrollToTime } = this.props;

    const diffMillis = scrollToTime - dates.startOf(scrollToTime, 'day');
    const totalMillis = dates.diff(max, min);

    this._scrollRatio = diffMillis / totalMillis;
  }

  checkOverflow() {
    if (this._updatingOverflow) return;

    let isOverflowing = this.content.scrollHeight > this.content.clientHeight;

    if (this.state.isOverflowing !== isOverflowing) {
      this._updatingOverflow = true;
      this.setState({ isOverflowing }, () => {
        this._updatingOverflow = false;
      })
    }
  }

  // May return null/undefined, make sure to check the returned value
  getTimeGutter() {
    return this._gutters[this._gutters.length - 1];
  }

  setEntityKeyTypeIfNecessary() {
    if (this._entityKeyIsNumber === undefined) {
      const { entities, entityKeyAccessor } = this.props;

      if (entities.length > 0) {
        const entityKey = entities[0][entityKeyAccessor];
        this._entityKeyIsNumber = typeof entityKey === 'number';
      }
    }
  }
}
