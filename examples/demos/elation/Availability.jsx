import PropTypes from 'prop-types';
import React from 'react';

export default class Availability extends React.Component {
  static propTypes = {
    availability: PropTypes.object,
  }

  render() {
    const { availability } = this.props;
    const availabilityStartTime = new Date(availability.startTime).toLocaleTimeString();
    const availabilityEndTime = new Date(availability.endTime).toLocaleTimeString();
    const availabilityTitle = 'Anaheim ' + availabilityStartTime + ' - ' + availabilityEndTime + ': All Appointment Types';

    return (
      <div style={{display: 'flex', justifyContent: 'center', height: '100%'}} title={availabilityTitle}>
        <strong>𖠽</strong>
      </div>
    )
  }
}
