import React from 'react';
import { CalendarViewProps } from './calendar/Shared';
import { StaffDayView } from './calendar/StaffDayView';
import { WeekView } from './calendar/WeekView';
import { MonthView } from './calendar/MonthView';

export function CalendarView(props: CalendarViewProps) {
  if (props.mode === 'week') {
    return <WeekView {...props} />;
  }
  
  if (props.mode === 'month') {
    return <MonthView {...props} />;
  }

  // Default to day mode
  return <StaffDayView {...props} />;
}
