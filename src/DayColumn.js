import PropTypes from 'prop-types';
import React from 'react';
import { findDOMNode } from 'react-dom';
import cn from 'classnames';

import Selection, { getBoundsForNode, isEvent } from './Selection';
import dates from './utils/dates';
import { isSelected } from './utils/selection';
import localizer from './localizer'

import { notify } from './utils/helpers';
import { accessor, elementType, dateFormat } from './utils/propTypes';
import { accessor as get } from './utils/accessors';
import { isDaylightSavingsSpring } from './utils/daylightSavings';

import getStyledEvents, { getStyledAvailabilities, positionFromDate, startsBefore } from './utils/dayViewLayout'

import TimeColumn from './TimeColumn'

import bowser from 'bowser';

function snapToSlot(date, step){
  var roundTo = 1000 * 60 * step;
  return new Date(Math.floor(date.getTime() / roundTo) * roundTo)
}

function startsAfter(date, max) {
  return dates.gt(dates.merge(max, date), max, 'minutes')
}

class DaySlot extends React.Component {
  static propTypes = {
    availabilities: PropTypes.array,
    availabilityKeyAccessor: PropTypes.string,
    events: PropTypes.array.isRequired,
    entityKeyAccessor: PropTypes.string,
    step: PropTypes.number.isRequired,
    rightOffset: PropTypes.number.isRequired,
    min: PropTypes.instanceOf(Date).isRequired,
    max: PropTypes.instanceOf(Date).isRequired,
    now: PropTypes.instanceOf(Date),
    nowTimezone: PropTypes.string,
    date: PropTypes.instanceOf(Date),

    rtl: PropTypes.bool,
    titleAccessor: accessor,
    allDayAccessor: accessor.isRequired,
    startAccessor: accessor.isRequired,
    endAccessor: accessor.isRequired,
    availabilityStartAccessor: accessor,
    availabilityEndAccessor: accessor,

    selectRangeFormat: dateFormat,
    eventTimeRangeFormat: dateFormat,
    culture: PropTypes.string,

    selected: PropTypes.object,
    selectable: PropTypes.oneOf([true, false, 'ignoreEvents']),
    eventOffset: PropTypes.number,
    entityKey: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

    onSelecting: PropTypes.func,
    onSelectSlot: PropTypes.func.isRequired,
    onSelectEvent: PropTypes.func.isRequired,
    onSelectAvailability: PropTypes.func.isRequired,

    className: PropTypes.string,
    dragThroughEvents: PropTypes.bool,
    eventPropGetter: PropTypes.func,
    dayWrapperComponent: elementType,
    eventComponent: elementType,
    eventWrapperComponent: elementType.isRequired,

    componentProps: PropTypes.shape({
      event: PropTypes.object,
      toolbar: PropTypes.object,
    }),

    availabilityComponent: elementType,
    availabilityWrapperComponent: elementType,

    // internal prop used to make slight changes in rendering
    isMultiGrid: PropTypes.bool,
  };

  static defaultProps = { dragThroughEvents: true, rightOffset: 0, isMultiGrid: false };
  state = { selecting: false };

  componentDidMount() {
    this.props.selectable
    && this._selectable()
  }

  componentWillUnmount() {
    this._teardownSelectable();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectable && !this.props.selectable)
      this._selectable();
    if (!nextProps.selectable && this.props.selectable)
      this._teardownSelectable();
  }

  render() {
    const {
      min,
      max,
      step,
      now,
      nowTimezone,
      selectRangeFormat,
      culture,
      isMultiGrid,
      ...props
    } = this.props

    this._totalMin = dates.diff(min, max, 'minutes')

    let { selecting, startSlot, endSlot } = this.state
    let style = this._slotStyle(startSlot, endSlot)

    let selectDates = {
      start: this.state.startDate,
      end: this.state.endDate
    };

    return (
      <TimeColumn
        {...props}
        className={cn(
          'rbc-day-slot',
          !isMultiGrid && dates.isToday(max, nowTimezone) && 'rbc-today',
          dates.lt(max, dates.today(nowTimezone), 'day') && 'rbc-past',
          (bowser.mobile || bowser.tablet) && 'rbc-mobile-clickable'
        )}
        now={now}
        nowTimezone={nowTimezone}
        min={min}
        max={max}
        step={step}
        isMultiGrid={isMultiGrid}
      >
        {this.renderAvailabilities()}
        {this.renderEvents()}

        {selecting &&
          <div className='rbc-slot-selection' style={style}>
              <span>
              { localizer.format(selectDates, selectRangeFormat, culture) }
              </span>
          </div>
        }
      </TimeColumn>
    );
  }

  renderAvailabilities = () => {
    const {
      availabilities,
      availabilityComponent,
      availabilityWrapperComponent: AvailabilityWrapper,
      availabilityStartAccessor,
      availabilityEndAccessor,
      availabilityKeyAccessor,
      min,
      onSelectAvailability,
      step,
    } = this.props;

    if (!availabilityComponent) return;

    const AvailabilityComponent = availabilityComponent;
    const styledAvailabilities = getStyledAvailabilities({
      availabilities,
      availabilityStartAccessor,
      availabilityEndAccessor,
      min,
      step,
      totalMin: this._totalMin,
    });

    return styledAvailabilities.map(({availability, style}, idx) => {
      const { height, top, xOffset } = style;
      const key = availabilityKeyAccessor && availability[availabilityKeyAccessor]
        ? availability[availabilityKeyAccessor]
        : `avbl_${idx}`;

      return (
        <AvailabilityWrapper key={key}>
          <div
            className={cn('rbc-availability', onSelectAvailability && 'rbc-availability-selectable')}
            style={{
              top: `${top}%`,
              height: `${height}%`,
              left: xOffset,
            }}
            onClick={(e) => this._onSelectAvailability(availability, e)}
          >
            <div className='rbc-availability-content'>
              {AvailabilityComponent && (
                <AvailabilityComponent availability={availability} />
              )}
            </div>
          </div>
        </AvailabilityWrapper>
      );
    });
  };

  renderEvents = () => {
    let {
        events
      , min
      , max
      , culture
      , eventPropGetter
      , selected, eventTimeRangeFormat, eventComponent
      , eventWrapperComponent: EventWrapper
      , rtl: isRtl
      , step
      , rightOffset
      , componentProps
      , startAccessor, endAccessor, titleAccessor, entityKeyAccessor } = this.props;

    let EventComponent = eventComponent

    let styledEvents = getStyledEvents({
      events, entityKeyAccessor, startAccessor, endAccessor, min, totalMin: this._totalMin, step, rightOffset
    })

    const eventProps = componentProps.event || {};

    return styledEvents.map(({ event, style }, idx) => {
      let start = get(event, startAccessor)
      let end = get(event, endAccessor)
      const key = entityKeyAccessor && event[entityKeyAccessor] ? event[entityKeyAccessor] : `evt_${idx}`;

      let continuesPrior = startsBefore(start, min)
      let continuesAfter = startsAfter(end, max)

      let title = get(event, titleAccessor)
      let label = localizer.format({ start, end }, eventTimeRangeFormat, culture)
      let _isSelected = isSelected(event, selected)

      if (eventPropGetter)
        var { style: xStyle, className } = eventPropGetter(event, start, end, _isSelected)

      let { height, top, width, xOffset, zIndex } = style

      return (
        <EventWrapper event={event} key={key}>
          <div
            style={{
              ...xStyle,
              top: `${top}%`,
              height: `${height}%`,
              [isRtl ? 'right' : 'left']: `${Math.max(0, xOffset)}%`,
              width: `${width}%`,
              zIndex
            }}
            title={label + ': ' + title }
            onClick={(e) => this._select(event, e)}
            className={cn('rbc-event', className, {
              'rbc-selected': _isSelected,
              'rbc-event-continues-earlier': continuesPrior,
              'rbc-event-continues-later': continuesAfter
            })}
          >
            <div className='rbc-event-content'>
              { EventComponent
                ? <EventComponent event={event} title={title} {...eventProps} />
                : title
              }
            </div>
          </div>
        </EventWrapper>
      )
    })
  };

  _slotStyle = (startSlot, endSlot) => {
    let top = ((startSlot / this._totalMin) * 100);
    let bottom = ((endSlot / this._totalMin) * 100);

    return {
      top: top + '%',
      height: bottom - top + '%'
    }
  };

  _selectable = () => {
    let node = findDOMNode(this);
    let selector = this._selector = new Selection(()=> findDOMNode(this))

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

    let selectionState = ({ y }) => {
      let { step, min, max } = this.props;
      let { top, bottom } = getBoundsForNode(node)

      let mins = this._totalMin;

      let range = Math.abs(top - bottom)

      let current = (y - top) / range;

      current = snapToSlot(minutesToDate(mins * current, min), step);

      // This is needed to account for the removed 2 AM hour during spring
      // forward
      if (
        isDaylightSavingsSpring(min) &&
        current.getTimezoneOffset() !== min.getTimezoneOffset()
      ) {
        current = dates.add(current, 60, 'minutes');
      }

      if (!this.state.selecting)
        this._initialDateSlot = current

      let initial = this._initialDateSlot;

      if (dates.eq(initial, current, 'minutes'))
        current = dates.add(current, step, 'minutes')

      let start = dates.max(min, dates.min(initial, current))
      let end = dates.min(max, dates.max(initial, current))

      return {
        selecting: true,
        startDate: start,
        endDate: end,
        startSlot: positionFromDate(start, min, this._totalMin),
        endSlot: positionFromDate(end, min, this._totalMin)
      }
    }

    /* Disabling drag-selection for now
    selector.on('selecting', maybeSelect)
    selector.on('selectStart', maybeSelect)
    */

    selector.on('mousedown', (box) => {
      if (this.props.selectable !== 'ignoreEvents') return

      return !isEvent(findDOMNode(this), box)
    })

    selector
      .on('click', (box) => {
        if (!isEvent(findDOMNode(this), box))
          this._selectSlot(selectionState(box))

        this.setState({ selecting: false })
      })

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

  _teardownSelectable = () => {
    if (!this._selector) return
    this._selector.teardown();
    this._selector = null;
  };

  _selectSlot = ({ startDate, endDate }) => {
    let current = startDate
      , slots = [];

    while (dates.lte(current, endDate)) {
      slots.push(current)
      current = dates.add(current, this.props.step, 'minutes')
    }

    notify(this.props.onSelectSlot, {
      slots,
      entityKey: this.props.entityKey,
      start: startDate,
      end: endDate,
    })
  };

  _select = (...args) => {
    notify(this.props.onSelectEvent, args)
  };

  _onSelectAvailability = (...args) => {
    notify(this.props.onSelectAvailability, args);
  };
}


function minutesToDate(min, date){
  var dt = new Date(date)
    , totalMins = dates.diff(dates.startOf(date, 'day'), date, 'minutes');

  dt = dates.hours(dt, 0);
  dt = dates.minutes(dt, totalMins + min);
  dt = dates.seconds(dt, 0)
  return dates.milliseconds(dt, 0)
}

export default DaySlot;
