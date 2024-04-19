import PropTypes from 'prop-types';
import React from 'react';

export default class Availability extends React.Component {
  static propTypes = {
    availability: PropTypes.object,
  }

  render() {
    return (
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <strong>𖠽</strong>
      </div>
    )
  }
}
