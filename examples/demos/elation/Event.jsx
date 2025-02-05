import PropTypes from 'prop-types';
import React from 'react';


const BLUE = '#3174ad';

const styles = {
  bar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 5,
    width: 10,
    backgroundColor: BLUE
  }
};


export default class Event extends React.Component {
  static propTypes = {
    event: PropTypes.object,
    title: PropTypes.node
  }

  render() {
    const { event, title } = this.props;
    const eventStartTime = new Date(event._apptTime).toLocaleTimeString(
      [],
      { hour: 'numeric', minute: '2-digit' }
    );
    const eventEndTime = new Date(event._apptEnd).toLocaleTimeString(
      [],
      { hour: 'numeric', minute: '2-digit' }
    );

    return (
      <div>
        {title}
        <div style={{fontSize: '0.8em', marginTop: 5}}>
          {eventStartTime} - {eventEndTime}
        </div>
        <div style={styles.bar}></div>
      </div>
    )
  }
}
