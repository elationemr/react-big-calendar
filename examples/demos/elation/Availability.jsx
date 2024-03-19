import PropTypes from 'prop-types';
import React from 'react';

export default class Availability extends React.Component {
  static propTypes = {
    availability: PropTypes.object,
    isMultiColumn: PropTypes.bool,
  }

  render() {
    const { availability, isMultiColumn } = this.props;
    const nowStartTime = new Date(availability.startTime);
    const nowEndTime = new Date(availability.endTime);

    if (isMultiColumn) {
      return (
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <strong>𖠽</strong>
        </div>
      )
    }

    return (
      <div style={{display: 'flex', fontSize: 12, justifyContent: 'space-between', padding: '15px 10px'}}>
        <div>
          <p><strong>Available</strong></p>
          <span>
            {nowStartTime.toLocaleTimeString()} - {nowEndTime.toLocaleTimeString()}
          </span>
        </div>
        <div>
          <p style={{
            backgroundColor: '#CDD7DB',
            border: '1px solid #5B7179',
            fontSize: 10,
            padding: '2px 5px',
          }}>{availability.appointmentTypes.length} Appointment Types</p>
          <p style={{textAlign: 'right'}}><strong>𖠽 Anaheim</strong></p>
        </div>
      </div>
    )
  }
}
