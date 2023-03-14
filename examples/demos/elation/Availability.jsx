import PropTypes from 'prop-types';
import React from 'react';

export default class Availability extends React.Component {
  static propTypes = {
    availability: PropTypes.object,
  }

  render() {
    const { availability} = this.props;
    const nowStartTime = new Date(Date.now());
    nowStartTime.setHours(...availability.startTime.split(':'));
    const nowEndTime = new Date(Date.now());
    nowEndTime.setHours(...availability.endTime.split(':'))

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
