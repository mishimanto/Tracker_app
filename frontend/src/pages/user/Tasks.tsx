import React from 'react';
import { UserLayout } from '../../components/Layout/UserLayout';
import { TaskList } from '../../components/Tasks/TaskList';

export const Tasks: React.FC = () => {
  return (
    <UserLayout>
      <div className="space-y-6">        
        <TaskList />
      </div>
    </UserLayout>
  );
};
