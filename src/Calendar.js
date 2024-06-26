import PropTypes from 'prop-types';
import React from 'react';
import uncontrollable from 'uncontrollable';
import cn from 'classnames';
import {
    accessor
  , elementType
  , dateFormat
  , dateRangeFormat
  , views as componentViews } from './utils/propTypes';

import { notify } from './utils/helpers';
import { navigate, views } from './utils/constants';
import defaultFormats from './formats';
import viewLabel from './utils/viewLabel';
import moveDate from './utils/move';
import VIEWS from './Views';
import Toolbar from './Toolbar';
import AvailabilityWrapper from './AvailabilityWrapper';
import EventWrapper from './EventWrapper';
import BackgroundWrapper from './BackgroundWrapper';

import omit from 'lodash/omit';
import defaults from 'lodash/defaults';
import transform from 'lodash/transform';
import mapValues from 'lodash/mapValues';


function viewNames(_views){
  return !Array.isArray(_views) ? Object.keys(_views) : _views
}

function isValidView(view, { views: _views, viewAliases }) {
  if (viewAliases && viewAliases[view]) {
    view = viewAliases[view];
  }
  let names = viewNames(_views)
  return names.indexOf(view) !== -1
}

let now = new Date();

/**
 * react-big-calendar is full featured Calendar component for managing events and dates. It uses
 * modern `flexbox` for layout making it super responsive and performant. Leaving most of the layout heavy lifting
 * to the browser. __note:__ The default styles use `height: 100%` which means your container must set an explicit
 * height (feel free to adjust the styles to suit your specific needs).
 *
 * Big Calendar is unopiniated about editing and moving events, prefering to let you implement it in a way that makes
 * the most sense to your app. It also tries not to be prescriptive about your event data structures, just tell it
 * how to find the start and end datetimes and you can pass it whatever you want.
 *
 * One thing to note is that, `react-big-calendar` treats event start/end dates as an _exclusive_ range.
 * which means that the event spans up to, but not including, the end date. In the case
 * of displaying events on whole days, end dates are rounded _up_ to the next day. So an
 * event ending on `Apr 8th 12:00:00 am` will not appear on the 8th, whereas one ending
 * on `Apr 8th 12:01:00 am` will. If you want _inclusive_ ranges consider providing a
 * function `endAccessor` that returns the end date + 1 day for those events that end at midnight.
 */
class Calendar extends React.Component {
 static propTypes = {

   /**
    * Props passed to main calendar `<div>`.
    */
   elementProps: PropTypes.object,

   /**
    * The current date value of the calendar. Determines the visible view range
    *
    * @controllable onNavigate
    */
   date: PropTypes.instanceOf(Date),

   /**
    * The current view of the calendar.
    *
    * @default 'month'
    * @controllable onView
    */
   view: PropTypes.string,

   /**
    * An object-map where the keys are view aliases and the values are
    * the valid underlying views. For example, { 'day-wide': 'day' } could
    * be used to treat 'day-wide' as a 'day' view under the hood.
    *
    * This is useful mostly just for the odd cases where you may want to show
    * the same view in multiple different ways, for example with different
    * container sizes. It allows you to specify different view names from the
    * outside of this component and have this component understand them all to
    * be the same logical view.
    */
   viewAliases: PropTypes.object,

   /**
    * An array of availability objects to display on the calendar
    */
   availabilities: PropTypes.arrayOf(PropTypes.object),

   /**
    * <b>- MultiView ONLY -</b>
    * An object containing key-value pairs where the key is an entity key,
    * such as a person ID, and the value is an array of availabilities associated with
    * that entity
    */
   availabilityMap: PropTypes.object,

   /**
    * <b>- MultiView ONLY -</b>
    * The name of the property to treat as the availability's unique identifier,
    * e.g. `id`
    */
   availabilityKeyAccessor: PropTypes.string,

   /**
    * An array of event objects to display on the calendar
    */
   events: PropTypes.arrayOf(PropTypes.object),

   /**
    * <b>- MultiView ONLY -</b>
    * An object containing key-value pairs where the key is an entity key,
    * such as a person ID, and the value is an array of events associated with
    * that entity
    */
   eventMap: PropTypes.object,

   /**
    * <b>- MultiView ONLY -</b>
    * An array of entity objects
    */
   entities: PropTypes.arrayOf(PropTypes.object),

   /**
    * <b>- MultiView ONLY -</b>
    * An array of entity keys, which will be used to render the columns in the
    * multi view.
    */
   selectedEntityKeys: PropTypes.array,

   /**
    * <b>- MultiView ONLY -</b>
    * The name of the property to treat as entities' unique identifiers,
    * e.g. `id`
    */
   entityKeyAccessor: PropTypes.string,

   /**
    * <b>- MultiView ONLY -</b>
    * The name of a given entity. Must resolve to a `renderable` object, but
    * should specifically be a `string`.
    *
    * @type {(func|string)}
    */
   entityNameAccessor: accessor,

   /**
    * True if the calendar should only support single day events and exclude
    * all-day and multi-day events.
    */
   singleDayEventsOnly: PropTypes.bool,

   /**
    * Callback fired when the `date` value changes.
    *
    * @controllable date
    */
   onNavigate: PropTypes.func,

   /**
    * Callback fired when the `view` value changes.
    *
    * @controllable date
    */
   onView: PropTypes.func,

   /**
    * A callback fired when a date selection is made. Only fires when `selectable` is `true`.
    *
    * ```js
    * function(
    *   slotInfo: object {
    *     start: Date,
    *     end: Date,
    *     slots: array<Date>,
    *     entityKey: number | string (undefined unless current view is MultiView)
    *   }
    * )
    * ```
    */
   onSelectSlot: PropTypes.func,

   /**
    * Callback fired when a calendar event is selected.
    *
    * ```js
    * function(event: object, e: SyntheticEvent)
    * ```
    */
   onSelectEvent: PropTypes.func,

   /**
    * Callback fired when a calendar availability is selected.
    *
    * ```js
    * function(availability: object, e: SyntheticEvent)
    * ```
    */
   onSelectAvailability: PropTypes.func,

   /**
    * Callback fired when dragging a selection in the Time views.
    *
    * Returning `false` from the handler will prevent a selection.
    *
    * ```js
    * function ({ start: Date, end: Date }) : boolean
    * ```
    */
   onSelecting: PropTypes.func,

   /**
    * <b>- MultiView ONLY -</b>
    * Callback fired when an entity is selected in one of the multiview header
    * columns' <select>.
    *
    * ```js
    * function (newSelectedKeys: Array, { index: Number, value: Number | string })
    * ```
    */
   onSelectedEntityChange: PropTypes.func,

   /**
    * An array of built-in view names to allow the calendar to display.
    *
    * @type Calendar.views
    * @default ['month', 'week', 'day', 'agenda']
    */
   views: componentViews,

   /**
    * The string name of the destination view for drill-down actions, such
    * as clicking a date header, or the truncated events links. If
    * `getDrilldownView` is also specified it will be used instead.
    *
    * Set to `null` to disable drill-down actions.
    *
    * ```js
    * <BigCalendar
    *   drilldownView="agenda"
    * />
    * ```
    */
   drilldownView: PropTypes.string,

   /**
    * Functionally equivalent to `drilldownView`, but accepts a function
    * that can return a view name. It's useful for customizing the drill-down
    * actions depending on the target date and triggering view.
    *
    * Return `null` to disable drill-down actions.
    *
    * ```js
    * <BigCalendar
    *   getDrilldownView={(targetDate, currentViewName, configuredViewNames) =>
    *     if (currentViewName === 'month' && configuredViewNames.includes('week'))
    *       return 'week'
    *
    *     return null;
    *   }}
    * />
    * ```
    */
   getDrilldownView: PropTypes.func,

   /**
    * Determines whether the toolbar is displayed
    */
   toolbar: PropTypes.bool,

   /**
    * Show truncated events in an overlay when you click the "+_x_ more" link.
    */
   popup: PropTypes.bool,

   /**
    * Distance in pixels, from the edges of the viewport, the "show more" overlay should be positioned.
    *
    * ```js
    * <BigCalendar popupOffset={30}/>
    * <BigCalendar popupOffset={{x: 30, y: 20}}/>
    * ```
    */
   popupOffset: PropTypes.oneOfType([
     PropTypes.number,
     PropTypes.shape({ x: PropTypes.number, y: PropTypes.number })
   ]),
   /**
    * Allows mouse selection of ranges of dates/times.
    *
    * The 'ignoreEvents' option prevents selection code from running when a
    * drag begins over an event. Useful when you want custom event click or drag
    * logic
    */
   selectable: PropTypes.oneOf([true, false, 'ignoreEvents']),

   /**
    * Determines the selectable time increments in week and day views
    */
   step: PropTypes.number,

   /**
    * The number of pixels to reserve on the right side of each column for
    * clickable space. This allows cells to be clicked even if there is an
    * event that covers the timespan represented by the cell.
    */
   rightOffset: PropTypes.number,

   /**
    * The number of slots per "section" in the time grid views. Adjust with `step`
    * to change the default of 1 hour long groups, with 30 minute slots.
    */
   timeslots: PropTypes.number,

   /**
    * The height, in pixels, of each vertical time grouping in the calendar.
    * If omitted, will default to the value specified in the stylesheet for
    * the `rbc-timeslot-group` class.
    */
   groupHeight: PropTypes.number,

   /**
    *Switch the calendar to a `right-to-left` read direction.
    */
   rtl: PropTypes.bool,

   /**
    * Optionally provide a function that returns an object of className or style props
    * to be applied to the the event node.
    *
    * ```js
    * function(
    * 	event: object,
    * 	start: date,
    * 	end: date,
    * 	isSelected: bool
    * ) -> { className: string?, style: object? }
    * ```
    */
   eventPropGetter: PropTypes.func,

   /**
    * Optionally provide a function that returns an object of className or style props
    * to be applied to the the time slot node.
    *
    * ```js
    * function(
    * 	slotDate: date,
    * 	entityKey: number | string,
    * 	isMultiGrid: bool
    * ) -> { className: string?, style: object? }
    * ```
    */
  slotPropGetter: PropTypes.func,

   /**
    * Accessor for the event title, used to display event information. Should
    * resolve to a `renderable` value.
    *
    * @type {(func|string)}
    */
   titleAccessor: accessor,

   /**
    * Determines whether the event should be considered an "all day" event and ignore time.
    * Must resolve to a `boolean` value.
    *
    * @type {(func|string)}
    */
   allDayAccessor: accessor,

   /**
    * The start date/time of the availability. Must resolve to a JavaScript `Date` object.
    *
    * @type {(func|string)}
    */
   availabilityStartAccessor: accessor,

   /**
    * The end date/time of the availability. Must resolve to a JavaScript `Date` object.
    *
    * @type {(func|string)}
    */
   availabilityEndAccessor: accessor,

   /**
    * The start date/time of the event. Must resolve to a JavaScript `Date` object.
    *
    * @type {(func|string)}
    */
   startAccessor: accessor,

   /**
    * The end date/time of the event. Must resolve to a JavaScript `Date` object.
    *
    * @type {(func|string)}
    */
   endAccessor: accessor,

   /**
    * Constrains the minimum _time_ of the Day and Week views.
    */
   min: PropTypes.instanceOf(Date),

   /**
    * Constrains the maximum _time_ of the Day and Week views.
    */
   max: PropTypes.instanceOf(Date),

   /**
    * Determines how far down the scroll pane is initially scrolled down.
    */
   scrollToTime: PropTypes.instanceOf(Date),

   /**
    * Specify a specific culture code for the Calendar.
    *
    * **Note: it's generally better to handle this globally via your i18n library.**
    */
   culture: PropTypes.string,

   /**
    * The timezone to use for "now" calculations, such as determining the position
    * of the time indicator line and determining if a DayColumn is for the current day.
    * We've introduced a dependency on `moment-timezone` for this because of our unique
    * use case where we want to display all times in a specific timezone regardless of
    * what timezone the user is browsing from.
    */
   nowTimezone: PropTypes.string,

   /**
    * Localizer specific formats, tell the Calendar how to format and display dates.
    *
    * `format` types are dependent on the configured localizer; both Moment and Globalize
    * accept strings of tokens according to their own specification, such as: `'DD mm yyyy'`.
    *
    * ```jsx
    * let formats = {
    *   dateFormat: 'dd',
    *
    *   dayFormat: (date, culture, localizer) =>
    *     localizer.format(date, 'DDD', culture),
    *
    *   dayRangeHeaderFormat: ({ start, end }, culture, local) =>
    *     local.format(start, { date: 'short' }, culture) + ' — ' +
    *     local.format(end, { date: 'short' }, culture)
    * }
    *
    * <Calendar formats={formats} />
    * ```
    *
    * All localizers accept a function of
    * the form `(date: Date, culture: ?string, localizer: Localizer) -> string`
    */
   formats: PropTypes.shape({
     /**
      * Format for the day of the month heading in the Month view.
      * e.g. "01", "02", "03", etc
      */
     dateFormat,

     /**
      * A day of the week format for Week and Day headings,
      * e.g. "Wed 01/04"
      *
      */
     dayFormat: dateFormat,

     /**
      * Week day name format for the Month week day headings,
      * e.g: "Sun", "Mon", "Tue", etc
      *
      */
     weekdayFormat: dateFormat,

     /**
      * The timestamp cell formats in Week and Time views, e.g. "4:00 AM"
      */
     timeGutterFormat: dateFormat,

     /**
      * Toolbar header format for the Month view, e.g "2015 April"
      *
      */
     monthHeaderFormat: dateFormat,

     /**
      * Toolbar header format for the Week views, e.g. "Mar 29 - Apr 04"
      */
     dayRangeHeaderFormat: dateRangeFormat,

     /**
      * Toolbar header format for the Day view, e.g. "Wednesday Apr 01"
      */
     dayHeaderFormat: dateFormat,

     /**
      * Toolbar header format for the Agenda view, e.g. "4/1/2015 — 5/1/2015"
      */
     agendaHeaderFormat: dateFormat,

     /**
      * A time range format for selecting time slots, e.g "8:00am — 2:00pm"
      */
     selectRangeFormat: dateRangeFormat,

     agendaDateFormat: dateFormat,
     agendaTimeFormat: dateFormat,
     agendaTimeRangeFormat: dateRangeFormat,

     /**
      * Time range displayed on events.
      */
     eventTimeRangeFormat: dateRangeFormat
   }),

   /**
    * Customize how different sections of the calendar render by providing custom Components.
    * In particular the `Event` component can be specified for the entire calendar, or you can
    * provide an individual component for each view type.
    *
    * ```jsx
    * let components = {
    *   event: MyEvent, // used by each view (Month, Day, Week)
    *   toolbar: MyToolbar,
    *   agenda: {
    *   	 event: MyAgendaEvent // with the agenda view use a different component to render events
    *   }
    * }
    * <Calendar components={components} />
    * ```
    */
   components: PropTypes.shape({
     availability: elementType,
     availabilityWrapper: elementType,

     event: elementType,
     eventWrapper: elementType,
     dayWrapper: elementType,
     dateCellWrapper: elementType,

     toolbar: elementType,

     agenda: PropTypes.shape({
       date: elementType,
       time: elementType,
       event: elementType
     }),

     day: PropTypes.shape({
       header: elementType,
       event: elementType
     }),
     week: PropTypes.shape({
       header: elementType,
       event: elementType
     }),
     month: PropTypes.shape({
       header: elementType,
       event: elementType
     })
   }),

   /**
    * Customize the props provided to different sections of the calendar. This
    * prop should typically be used when supplying custom components with
    * the `components` prop, for example to supply callbacks to the custom
    * components.
    *
    * ```jsx
    * let componentProps = {
    *   toolbar: { onUserChange: (event) => this.setState({ userId: event.target.value })},
    *   [...]
    * }
    * <Calendar componentProps={componentProps} />
    * ```
    *
    * Note: only implemented for event and toolbar at the moment.
    */
   componentProps: PropTypes.shape({
     event: PropTypes.object,
     toolbar: PropTypes.object,
   }),

   /**
    * String messages used throughout the component, override to provide localizations
    */
   messages: PropTypes.shape({
     allDay: PropTypes.node,
     previous: PropTypes.node,
     next: PropTypes.node,
     today: PropTypes.node,
     month: PropTypes.node,
     week: PropTypes.node,
     day: PropTypes.node,
     agenda: PropTypes.node,
     showMore: PropTypes.func
   }),

   /**
    * Ref for the calendar's root div. Can be either the old ref style (function/string)
    * or the new ref style (React.createRef).
    */
   containerRef: PropTypes.oneOfType([
     PropTypes.func,
     PropTypes.string,
     PropTypes.shape({
       current: PropTypes.any,
     })
   ])
 };

 static defaultProps = {
   elementProps: {},
   popup: false,
   toolbar: true,
   view: views.MONTH,
   views: [views.MONTH, views.WEEK, views.DAY, views.AGENDA],
   date: now,
   step: 30,

   drilldownView: views.DAY,

   titleAccessor: 'title',
   allDayAccessor: 'allDay',
   startAccessor: 'start',
   endAccessor: 'end',
   availabilityStartAccessor: 'start',
   availabilityEndAccessor: 'end'
 };

 /**
  * Gets the logical view - particularly important because this function can handle
  * view aliases.
  */
 getLogicalView = () => {
   const { view, viewAliases } = this.props;
   let realView = view;
   if (viewAliases && viewAliases[view]) {
     realView = viewAliases[view];
   }
   return realView;
 };

 getViews = () => {
   const views = this.props.views;

   if (Array.isArray(views)) {
     return transform(views, (obj, name) => obj[name] = VIEWS[name], {});
   }

   if (typeof views === 'object') {
     return mapValues(views, (value, key) => {
       if (value === true) {
         return VIEWS[key];
       }

       return value;
     });
   }

   return VIEWS;
 };

 getView = () => {
   const views = this.getViews();

   return views[this.getLogicalView()];
 };

 getDrilldownView = (date) => {
   const { drilldownView, getDrilldownView } = this.props

   if (!getDrilldownView) return drilldownView

   return getDrilldownView(date, this.getLogicalView(), Object.keys(this.getViews()));
 };

 render() {
   let {
       view, toolbar, events, singleDayEventsOnly
     , availabilities
     , culture
     , components = {}
     , componentProps = {}
     , formats = {}
     , style
     , className
     , elementProps
     , date: current
     , containerRef
     , ...props } = this.props;

   const viewName = view;

   view = this.getLogicalView();

   formats = defaultFormats(formats)

   let View = this.getView();
   let names = viewNames(this.props.views)

   let viewComponents = defaults(
     components[view] || {},
     omit(components, names),
     {
       availabilityWrapper: AvailabilityWrapper,
       eventWrapper: EventWrapper,
       dayWrapper: BackgroundWrapper,
       dateCellWrapper: BackgroundWrapper
     }
   )

   let ToolbarToRender = components.toolbar || Toolbar;
   let toolbarProps = componentProps.toolbar || {};

   return (
     <div
       {...elementProps}
       className={cn('rbc-calendar', className, {
         'rbc-rtl': props.rtl
       })}
       ref={containerRef}
       style={style}
     >
       {toolbar &&
         <ToolbarToRender
           date={current}
           view={view}
           viewName={viewName}
           views={names}
           label={viewLabel(current, view, formats, culture)}
           onViewChange={this.handleViewChange}
           onNavigate={this.handleNavigate}
           messages={this.props.messages}
           {...toolbarProps}
         />
       }
       <View
         ref='view'
         view={view}
         {...props}
         {...formats}
         componentProps={componentProps}
         culture={culture}
         formats={undefined}
         availabilities={availabilities}
         events={events}
         singleDayEventsOnly={singleDayEventsOnly}
         date={current}
         components={viewComponents}
         getDrilldownView={this.getDrilldownView}
         onNavigate={this.handleNavigate}
         onDrillDown={this.handleDrillDown}
         onSelectEvent={this.handleSelectEvent}
         onSelectSlot={this.handleSelectSlot}
         onShowMore={this._showMore}
       />
     </div>
   );
 }

 handleNavigate = (action, newDate) => {
   let { date, onNavigate } = this.props;
   let ViewComponent = this.getView();

   date = moveDate(action, newDate || date, ViewComponent)

   onNavigate(date, this.getLogicalView(), action);
 };

 handleViewChange = (view) => {
   if (view !== this.props.view && isValidView(view, this.props))
     this.props.onView(view)
 };

 handleSelectEvent = (...args) => {
   notify(this.props.onSelectEvent, args)
 };

 handleSelectSlot = (slotInfo) => {
   notify(this.props.onSelectSlot, slotInfo)
 };

 handleDrillDown = (date, view) => {
   if (view)
     this.handleViewChange(view)

   this.handleNavigate(navigate.DATE, date)
 };
}

export default uncontrollable(Calendar, {
  view: 'onView',
  date: 'onNavigate'
})
