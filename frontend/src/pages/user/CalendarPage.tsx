import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserLayout } from '../../components/Layout/UserLayout';
import { ActivityCalendar } from '../../components/Calendar/ActivityCalendar';
import { calendarService } from '../../services/calendarService';

const formatMonth = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

export const CalendarPage: React.FC = () => {
  const [cursor, setCursor] = useState(() => new Date());
  const monthKey = formatMonth(cursor);

  const { data: days = [] } = useQuery({
    queryKey: ['calendar', monthKey],
    queryFn: () => calendarService.getMonth(monthKey),
  });

  return (
    <UserLayout>
      <ActivityCalendar cursor={cursor} days={days} onCursorChange={setCursor} />
    </UserLayout>
  );
};
