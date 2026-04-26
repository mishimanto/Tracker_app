import { Task } from '../types';

const TASK_TIMEZONE = 'Asia/Dhaka';

const getDhakaNow = () => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TASK_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });

  const parts = formatter.formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    date: `${values.year}-${values.month}-${values.day}`,
    time: `${values.hour}:${values.minute}:${values.second}`,
  };
};

export const isTaskOverdue = (task: Task): boolean => {
  if (task.status === 'completed' || !task.due_date) {
    return false;
  }

  const now = getDhakaNow();

  if (task.due_date < now.date) {
    return true;
  }

  if (task.due_date > now.date) {
    return false;
  }

  if (!task.due_time) {
    return false;
  }

  const dueTime = task.due_time.length === 5 ? `${task.due_time}:00` : task.due_time;

  return dueTime < now.time;
};
