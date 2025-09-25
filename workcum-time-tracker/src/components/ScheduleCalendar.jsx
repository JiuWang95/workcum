import React, { useState } from 'react';
import { format, isSameDay } from 'date-fns';

const ScheduleCalendar = ({ weekDates, schedule, onUpdateSchedule }) => {
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({
    id: null,
    title: '',
    startTime: '',
    endTime: '',
    notes: ''
  });

  const getDaySchedule = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return schedule.days.find(day => day.date === dateStr) || { date: dateStr, tasks: [] };
  };

  const handleAddTask = (date) => {
    setEditingTask({ date, taskId: null });
    setNewTask({
      id: null,
      title: '',
      startTime: '',
      endTime: '',
      notes: ''
    });
  };

  const handleEditTask = (date, task) => {
    setEditingTask({ date, taskId: task.id });
    setNewTask({ ...task });
  };

  const handleSaveTask = () => {
    if (!newTask.title) return;

    const dateStr = format(editingTask.date, 'yyyy-MM-dd');
    
    // Create updated schedule
    const updatedDays = schedule.days.map(day => {
      if (day.date === dateStr) {
        let updatedTasks;
        
        if (editingTask.taskId) {
          // Update existing task
          updatedTasks = day.tasks.map(task => 
            task.id === editingTask.taskId ? { ...newTask } : task
          );
        } else {
          // Add new task
          const taskWithId = { ...newTask, id: Date.now().toString() };
          updatedTasks = [...day.tasks, taskWithId];
        }
        
        return { ...day, tasks: updatedTasks };
      }
      return day;
    });

    const updatedSchedule = { ...schedule, days: updatedDays };
    onUpdateSchedule(updatedSchedule);

    // Reset form
    setEditingTask(null);
    setNewTask({
      id: null,
      title: '',
      startTime: '',
      endTime: '',
      notes: ''
    });
  };

  const handleDeleteTask = (date, taskId) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    const updatedDays = schedule.days.map(day => {
      if (day.date === dateStr) {
        const updatedTasks = day.tasks.filter(task => task.id !== taskId);
        return { ...day, tasks: updatedTasks };
      }
      return day;
    });

    const updatedSchedule = { ...schedule, days: updatedDays };
    onUpdateSchedule(updatedSchedule);
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setNewTask({
      id: null,
      title: '',
      startTime: '',
      endTime: '',
      notes: ''
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
      {weekDates.map((date, index) => {
        const daySchedule = getDaySchedule(date);
        const isToday = isSameDay(date, new Date());
        
        return (
          <div 
            key={index} 
            className={`border rounded-lg p-3 ${isToday ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'}`}
          >
            <div className={`text-center font-semibold mb-2 ${isToday ? 'text-indigo-700' : 'text-gray-700'}`}>
              <div className="text-sm">{format(date, 'EEE')}</div>
              <div className="text-lg">{format(date, 'd')}</div>
            </div>
            
            <div className="space-y-2 mb-3">
              {daySchedule.tasks.map(task => (
                <div 
                  key={task.id} 
                  className="bg-white border border-gray-200 rounded p-2 text-sm"
                >
                  {editingTask && editingTask.taskId === task.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        className="w-full p-1 border rounded text-sm"
                        placeholder="Task title"
                      />
                      <div className="flex space-x-1">
                        <input
                          type="time"
                          value={newTask.startTime}
                          onChange={(e) => setNewTask({ ...newTask, startTime: e.target.value })}
                          className="w-full p-1 border rounded text-sm"
                        />
                        <input
                          type="time"
                          value={newTask.endTime}
                          onChange={(e) => setNewTask({ ...newTask, endTime: e.target.value })}
                          className="w-full p-1 border rounded text-sm"
                        />
                      </div>
                      <textarea
                        value={newTask.notes}
                        onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                        className="w-full p-1 border rounded text-sm"
                        placeholder="Notes"
                        rows="2"
                      />
                      <div className="flex space-x-1">
                        <button
                          onClick={handleSaveTask}
                          className="flex-1 bg-indigo-600 text-white text-xs py-1 rounded"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex-1 bg-gray-300 text-gray-700 text-xs py-1 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="font-medium">{task.title}</div>
                      {task.startTime && task.endTime && (
                        <div className="text-gray-600 text-xs">
                          {task.startTime} - {task.endTime}
                        </div>
                      )}
                      {task.notes && (
                        <div className="text-gray-500 text-xs mt-1">
                          {task.notes}
                        </div>
                      )}
                      <div className="flex space-x-1 mt-1">
                        <button
                          onClick={() => handleEditTask(date, task)}
                          className="text-xs text-indigo-600 hover:text-indigo-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTask(date, task.id)}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {(!editingTask || !isSameDay(editingTask.date, date)) && (
              <button
                onClick={() => handleAddTask(date)}
                className="w-full py-1 text-sm text-indigo-600 hover:text-indigo-800 border border-dashed border-indigo-300 rounded"
              >
                + Add Task
              </button>
            )}
            
            {editingTask && isSameDay(editingTask.date, date) && !editingTask.taskId && (
              <div className="bg-white border border-gray-200 rounded p-2 space-y-2">
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full p-1 border rounded text-sm"
                  placeholder="Task title"
                />
                <div className="flex space-x-1">
                  <input
                    type="time"
                    value={newTask.startTime}
                    onChange={(e) => setNewTask({ ...newTask, startTime: e.target.value })}
                    className="w-full p-1 border rounded text-sm"
                  />
                  <input
                    type="time"
                    value={newTask.endTime}
                    onChange={(e) => setNewTask({ ...newTask, endTime: e.target.value })}
                    className="w-full p-1 border rounded text-sm"
                  />
                </div>
                <textarea
                  value={newTask.notes}
                  onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                  className="w-full p-1 border rounded text-sm"
                  placeholder="Notes"
                  rows="2"
                />
                <div className="flex space-x-1">
                  <button
                    onClick={handleSaveTask}
                    className="flex-1 bg-indigo-600 text-white text-xs py-1 rounded"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex-1 bg-gray-300 text-gray-700 text-xs py-1 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ScheduleCalendar;