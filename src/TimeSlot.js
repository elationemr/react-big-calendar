import PropTypes from 'prop-types';
import React, { Component } from 'react';
import cn from 'classnames';
import { elementType } from './utils/propTypes';


export default class TimeSlot extends Component {
  static propTypes = {
    dayWrapperComponent: elementType,
    value: PropTypes.instanceOf(Date).isRequired,
    isMultiGrid: PropTypes.bool,
    isNow: PropTypes.bool,
    showLabel: PropTypes.bool,
    content: PropTypes.string,
    culture: PropTypes.string,
    slotPropGetter: PropTypes.func,
    entityKey: PropTypes.number,
  };

  static defaultProps = {
    isNow: false,
    showLabel: false,
    content: ''
  };

  render() {
    const { entityKey, isMultiGrid, value, slotPropGetter } = this.props;
    const Wrapper = this.props.dayWrapperComponent;
    let availableClassName;
    let availableStyle;
    if (slotPropGetter) {
      const { className, style } = slotPropGetter(value, entityKey, isMultiGrid) || {};
      availableClassName = className;
      availableStyle = style;
    }

    return (
      <Wrapper value={value}>
        <div
          className={cn(
            'rbc-time-slot',
            this.props.showLabel && 'rbc-label',
            !this.props.showLabel && availableClassName,
            this.props.isNow && 'rbc-now',
          )}
          style={{...(!this.props.showLabel ? availableStyle : {})}}
        >
        {this.props.showLabel &&
          <span>{this.props.content}</span>
        }
        </div>
      </Wrapper>
    );
  }
}
