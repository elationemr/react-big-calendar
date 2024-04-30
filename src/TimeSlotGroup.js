import PropTypes from 'prop-types';
import React, { Component } from 'react';
import TimeSlot from './TimeSlot'
import date from './utils/dates.js'
import localizer from './localizer'
import { elementType } from './utils/propTypes'

export default class TimeSlotGroup extends Component {
  static propTypes = {
    availabilities: PropTypes.array,
    dayWrapperComponent: elementType,
    timeslots: PropTypes.number.isRequired,
    step: PropTypes.number.isRequired,
    value: PropTypes.instanceOf(Date).isRequired,
    showLabels: PropTypes.bool,
    isMultiGrid: PropTypes.bool,
    isNow: PropTypes.bool,
    timeGutterFormat: PropTypes.string,
    culture: PropTypes.string,
    height: PropTypes.number,
    slotPropGetter: PropTypes.func,
    entityKey: PropTypes.number,
  }
  static defaultProps = {
    timeslots: 2,
    step: 30,
    isNow: false,
    showLabels: false
  }

  shouldComponentUpdate(nextProps /* , nextState */) {
    if (
      this.props.dayWrapperComponent !== nextProps.dayWrapperComponent ||
      this.props.timeslots !== nextProps.timeslots ||
      this.props.step !== nextProps.step ||
      this.props.showLabels !== nextProps.showLabels ||
      this.props.isNow !== nextProps.isNow ||
      this.props.timeGutterFormat !== nextProps.timeGutterFormat ||
      this.props.culture !== nextProps.culture ||
      this.props.height !== nextProps.height ||
      // Highly experimental/aggressive extra condition here (this.props.showLabels),
      // in order to optimize calendar performance and prevent it from freezing
      // when loading a MultiView with many providers. This is based on the fact
      // that value doesn't seem to be used anywhere, even for slot selection
      // events.
      // The exception to the above observation is for the label column on the left
      // of the calendar, which is why we will re-render on value updates for
      // *only* those columns in particular.
      this.props.showLabels && date.neq(this.props.value, nextProps.value) ||
      (!this.props.showLabels && this.props.availabilities !== nextProps.availabilities)
    ) {
      return true;
    }

    return false;
  }

  renderSlice(slotNumber, content, value) {
    const { dayWrapperComponent, entityKey, showLabels, isMultiGrid, isNow, culture, slotPropGetter } = this.props;
    return (
      <TimeSlot
        key={slotNumber}
        dayWrapperComponent={dayWrapperComponent}
        showLabel={showLabels}
        content={content}
        culture={culture}
        isMultiGrid={isMultiGrid}
        isNow={isNow}
        value={value}
        slotPropGetter={slotPropGetter}
        entityKey={entityKey}
      />
    )
  }

  renderSlices() {
    const ret = []
    const sliceLength = this.props.step
    let sliceValue = this.props.value
    let stepInterval = 0;
    for (let i = 0; i < this.props.timeslots; i++) {
      let content;
      if (i === 0) {
        content = localizer.format(sliceValue, this.props.timeGutterFormat, this.props.culture)
      } else {
        content = `:${stepInterval}`;
      }
      ret.push(this.renderSlice(i, content, sliceValue))
      sliceValue = date.add(sliceValue, sliceLength, 'minutes')
      stepInterval += this.props.step;
    }
    return ret
  }

  render() {
    // note that style is currently not passed to this component, but we're handling
    // height so it doesn't break styling if style IS passed in.
    const { style, height } = this.props;

    const groupStyle = { ...style };
    if (height) {
      groupStyle.minHeight = height;
    }

    return (
      <div className="rbc-timeslot-group" style={groupStyle}>
        {this.renderSlices()}
      </div>
    )
  }
}
