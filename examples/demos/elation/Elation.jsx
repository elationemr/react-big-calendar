import React from 'react';
import BigCalendar from 'react-big-calendar';
import Availability from './Availability';
import Event from './Event';
import Toolbar from './Toolbar';
import physicians, { getPhysicianName } from './data/physicians';
import { getAvailabilities, getAllAvailabilities } from './data/availabilities';
import { getAppts, getAllAppts } from './data/appts';
import eventStyler from './util/eventStyler';


const formats = {
  dayFormat: (date, culture, localizer) => {
    return localizer.format(date, 'dddd MM/dd', culture);
  },
  dayHeaderFormat: (date, culture, localizer) => {
    return localizer.format(date, 'ddd, MMM dd, yyyy', culture);
  },
  dayRangeHeaderFormat: ({ start, end }, culture, localizer) => {
    return localizer.format(start, 'MMM dd', culture) + ' - ' +
      localizer.format(end, 'MMM dd, yyyy', culture);
  }
}

export default class Elation extends React.Component {

  state = {
    currentPhysicianId: physicians[0].id,
    appts: getAppts(physicians[0].id),
    availabilities: getAvailabilities(physicians[0].id),
  }

  onCurrentPhysicianChange = (event) => {
    const newPhysicianId = Number(event.target.value);
    this.setState({
      currentPhysicianId: newPhysicianId,
      appts: getAppts(newPhysicianId),
      availabilities: getAvailabilities(newPhysicianId),
    });
  }

  onRefresh = () => {
    console.log('Refreshing!'); // eslint-disable-line no-console
    this.setState({
      appts: getAppts(this.state.currentPhysicianId),
      availabilities: getAvailabilities(this.state.currentPhysicianId),
    })
  }

  onSelectSlot = ({ start, end, entityKey/*, slots */}) => {
    const name = getPhysicianName(entityKey || this.state.currentPhysicianId);
    // eslint-disable-next-line no-undef
    alert(`Adding event from ${start.toLocaleString()} to ${end.toLocaleString()} for physician ${name}`);
  }

  onSelectEvent = (event/*, e*/) => {
    const name = getPhysicianName(event._physicianUserId);
    // eslint-disable-next-line no-undef
    alert(`Selected appointment with ${event._patientName} for ${name} starting at ${new Date(event._apptTime).toLocaleString()}`);
  }

  onAvailabilityClick = (availability /*, e*/) => {
    const name = getPhysicianName(availability.providerId);
    // eslint-disable-next-line no-undef
    alert(
      `Availability clicked for ${name} at location ID ${availability.serviceLocationId} starting at ${new Date(
        availability.startTime
      ).toLocaleString()}`
    );
  };

  render(){
    return (
      <BigCalendar
        {...this.props}
        availabilities={this.state.availabilities}
        availabilityMap={getAllAvailabilities()}
        availabilityKeyAccessor="id"
        events={this.state.appts}
        eventMap={getAllAppts()}
        entities={physicians}
        entityKeyAccessor="id"
        entityNameAccessor="fullName"
        eventPropGetter={eventStyler}
        selectedEntityKeys={[28716, 25454, 235]}
        singleDayEventsOnly
        formats={formats}
        nowTimezone="America/Los_Angeles"
        step={10}
        rightOffset={5}
        groupHeight={140}
        timeslots={6}
        views={['day', 'week', 'multi']}
        messages={{
          day: 'Day',
          week: '7 Days',
          multi: 'Multi-Providers'
        }}
        defaultView="day"
        defaultDate={new Date(2015, 3, 12)}
        titleAccessor="_patientName"
        startAccessor={(event) => new Date(event._apptTime)}
        endAccessor={(event) => new Date(event._apptEnd)}
        availabilityStartAccessor={(availability) => new Date(availability.startTime)}
        availabilityEndAccessor={(availability) => new Date(availability.endTime)}
        drilldownView={null}
        components={{
          toolbar: Toolbar,
          event: Event,
          availability: Availability,
        }}
        componentProps={{
          toolbar: {
            currentPhysicianId: this.state.currentPhysicianId,
            onCurrentPhysicianChange: this.onCurrentPhysicianChange,
            onRefresh: this.onRefresh
          }
        }}
        selectable
        onSelectSlot={this.onSelectSlot}
        onSelectEvent={this.onSelectEvent}
        onAvailabilityClick={this.onAvailabilityClick}
      />
    )
  }
}
