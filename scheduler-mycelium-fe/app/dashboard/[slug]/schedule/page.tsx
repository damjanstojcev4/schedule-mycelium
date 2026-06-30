'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { TimeBlockResponse, Appointment, StaffMember } from '@/types/api';
import { Modal } from '@/components/ui/Modal';
import { useParams } from 'next/navigation';
import { localDateISO } from '@/lib/format';

export default function SchedulePage() {
  const { slug } = useParams() as { slug: string };
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [blocks, setBlocks] = useState<TimeBlockResponse[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [soloOperator, setSoloOperator] = useState(false);

  // Form states
  const [fromTime, setFromTime] = useState('09:00');
  const [toTime, setToTime] = useState('10:00');
  const [reason, setReason] = useState('');

  useEffect(() => {
    const raw = sessionStorage.getItem(`solo-${slug}`);
    if (raw === 'true') setSoloOperator(true);
    
    // Initial fetch of staff and appointments
    api.getDashboardAppointments().then(setAppointments).catch(console.error);
    api.getBusinesses().then(businesses => {
      const biz = businesses.find(b => b.slug === slug);
      if (biz) {
        api.getStaff(biz.publicId).then(staff => {
          setStaffList(staff);
          if (staff.length > 0) {
            setSelectedStaffId(staff[0].publicId);
          }
        }).catch(console.error);
      }
    });
  }, [slug]);

  const loadBlocks = async (date: Date, staffId: string) => {
    if (!staffId) return;
    try {
      const dateStr = localDateISO(date);
      const businesses = await api.getBusinesses();
      const biz = businesses.find(b => b.slug === slug);
      if (!biz) return;
      const res = await api.getTimeBlocks(biz.publicId, staffId, dateStr);
      setBlocks(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadBlocks(selectedDate, selectedStaffId);
  }, [selectedDate, selectedStaffId, slug]);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = new Date(year, month, 1).getDay();
    const startingDay = firstDay === 0 ? 6 : firstDay - 1; // Mon-Sun

    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const selectedDateStr = localDateISO(selectedDate);
  const todaysAppointments = appointments.filter(a => 
    a.startTime.startsWith(selectedDateStr) &&
    (selectedStaffId ? a.staffName === staffList.find(s => s.publicId === selectedStaffId)?.name : true)
  );

  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (fromTime >= toTime) {
      setError('Start time must be before end time');
      return;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      setError('Cannot block time in the past');
      return;
    }

    setIsSubmitting(true);
    try {
      const businesses = await api.getBusinesses();
      const biz = businesses.find(b => b.slug === slug);
      if (!biz) throw new Error("Business not found");
      
      await api.createTimeBlock(biz.publicId, selectedStaffId, {
        blockDate: selectedDateStr,
        startTime: fromTime + ':00',
        endTime: toTime + ':00',
        reason
      });
      setIsModalOpen(false);
      setFromTime('09:00');
      setToTime('10:00');
      setReason('');
      loadBlocks(selectedDate, selectedStaffId);
    } catch (err: any) {
      setError(err.message || 'Failed to create block');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBlock = async (blockPublicId: string) => {
    if (!confirm('Delete this time block?')) return;
    try {
      const businesses = await api.getBusinesses();
      const biz = businesses.find(b => b.slug === slug);
      if (!biz) return;
      await api.deleteTimeBlock(biz.publicId, selectedStaffId, blockPublicId);
      loadBlocks(selectedDate, selectedStaffId);
    } catch (err) {
      console.error(err);
      alert('Failed to delete block');
    }
  };

  const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8 to 20

  const getPositionStyles = (timeStr: string) => {
    // timeStr format: "HH:mm" or "HH:mm:ss"
    const [h, m] = timeStr.split(':').map(Number);
    const totalMinutes = (h - 8) * 60 + m;
    const top = (totalMinutes / 60) * 4; // 4rem per hour
    return { top: `${top}rem` };
  };

  const getHeightStyles = (startStr: string, endStr: string) => {
    const [sh, sm] = startStr.split(':').map(Number);
    const [eh, em] = endStr.split(':').map(Number);
    const startMins = sh * 60 + sm;
    const endMins = eh * 60 + em;
    const diff = endMins - startMins;
    const height = (diff / 60) * 4;
    return { height: `${height}rem` };
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Block Time</h1>

      {!soloOperator && (
        <div className="mb-6 max-w-xs">
          <label className="block text-sm font-medium text-gray-700 mb-1">Staff Member</label>
          <select
            className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-black focus:ring-black sm:text-sm"
            value={selectedStaffId}
            onChange={(e) => setSelectedStaffId(e.target.value)}
          >
            {staffList.map(s => (
              <option key={s.publicId} value={s.publicId}>{s.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Panel: Calendar */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex space-x-1">
                <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded">
                  &larr;
                </button>
                <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded">
                  &rarr;
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
                <div key={d} className="text-gray-500 font-medium py-1">{d}</div>
              ))}
              {generateCalendar().map((date, i) => {
                if (!date) return <div key={`empty-${i}`} className="p-2" />;
                const isSelected = isSameDay(date, selectedDate);
                const isToday = isSameDay(date, new Date());
                return (
                  <button
                    key={localDateISO(date)}
                    onClick={() => setSelectedDate(date)}
                    className={`p-2 rounded-full w-8 h-8 flex items-center justify-center mx-auto text-sm transition-colors ${
                      isSelected ? 'bg-black text-white' : 
                      isToday ? 'bg-gray-100 text-black font-semibold' : 
                      'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Panel: Day View */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[600px]">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 rounded-t-xl">
            <h2 className="font-semibold text-gray-900">
              {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </h2>
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={!selectedStaffId}
              className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Block time
            </button>
          </div>
          <div className="flex-1 overflow-y-auto relative">
            <div className="absolute top-0 left-0 w-16 h-full border-r border-gray-100 bg-gray-50/50" />
            
            <div className="relative min-h-full" style={{ height: `${13 * 4}rem` }}>
              {hours.map((hour, i) => (
                <div key={hour} className="absolute w-full border-t border-gray-100 flex" style={{ top: `${i * 4}rem`, height: '4rem' }}>
                  <div className="w-16 flex-shrink-0 text-right pr-3 pt-2 text-xs text-gray-400 font-medium">
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                </div>
              ))}

              {/* Render Appointments */}
              {todaysAppointments.map(app => {
                const startTime = app.startTime.split('T')[1];
                const endTime = app.endTime.split('T')[1];
                const top = getPositionStyles(startTime);
                const height = getHeightStyles(startTime, endTime);
                
                const [sh, sm] = startTime.split(':').map(Number);
                const [eh, em] = endTime.split(':').map(Number);
                const diff = (eh * 60 + em) - (sh * 60 + sm);
                const isSmall = diff <= 30;
                const isTiny = diff <= 15;

                return (
                  <div
                    key={app.publicId}
                    className={`absolute left-16 right-4 ml-2 mr-2 bg-blue-100 border border-blue-200 rounded-md overflow-hidden flex ${
                      isSmall ? 'flex-row items-center gap-2 px-2 py-0.5' : 'flex-col p-2'
                    }`}
                    style={{ ...top, ...height, minHeight: isTiny ? '1.75rem' : 'auto', zIndex: isTiny ? 10 : 1 }}
                  >
                    <div className="text-xs font-semibold text-blue-900 truncate">{app.serviceName}</div>
                    <div className={`text-xs text-blue-700 truncate ${isSmall ? '' : 'mt-0.5'}`}>
                      {isSmall ? '• ' : ''}{app.customerName || app.guestName || 'Walk-in'}
                    </div>
                  </div>
                );
              })}

              {/* Render Time Blocks */}
              {blocks.map(block => {
                const top = getPositionStyles(block.startTime);
                const height = getHeightStyles(block.startTime, block.endTime);
                
                const [sh, sm] = block.startTime.split(':').map(Number);
                const [eh, em] = block.endTime.split(':').map(Number);
                const diff = (eh * 60 + em) - (sh * 60 + sm);
                const isSmall = diff <= 30;
                const isTiny = diff <= 15;

                return (
                  <div
                    key={block.publicId}
                    className={`absolute left-16 right-4 ml-2 mr-2 bg-gray-100 border border-gray-300 rounded-md overflow-hidden flex group cursor-pointer ${
                      isSmall ? 'flex-row items-center px-2 py-0.5' : 'flex-col p-2'
                    }`}
                    style={{ 
                      ...top, 
                      ...height,
                      minHeight: isTiny ? '1.75rem' : 'auto',
                      zIndex: isTiny ? 5 : 1,
                      backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.03) 10px, rgba(0,0,0,0.03) 20px)'
                    }}
                  >
                    <div className={`flex ${isSmall ? 'items-center gap-2' : 'justify-between items-start'} w-full`}>
                      <div className="text-xs font-semibold text-gray-700 whitespace-nowrap">Blocked Time</div>
                      {block.reason && !isSmall && <div className="text-xs text-gray-500 mt-1 truncate">{block.reason}</div>}
                      {block.reason && isSmall && <div className="text-xs text-gray-500 truncate mr-auto">({block.reason})</div>}
                      <button 
                        onClick={() => handleDeleteBlock(block.publicId)}
                        className={`text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ${isSmall ? 'ml-auto' : ''}`}
                        title="Remove Block"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Block Time">
        <form onSubmit={handleCreateBlock} className="space-y-4">
          {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="text"
              readOnly
              value={selectedDate.toLocaleDateString()}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-500 sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">From</label>
              <select
                required
                value={fromTime}
                onChange={e => setFromTime(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black sm:text-sm"
              >
                {Array.from({ length: 13 }, (_, h) => h + 8).flatMap(h =>
                  [0, 15, 30, 45].map(m => {
                    const val = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
                    return <option key={val} value={val}>{val}</option>;
                  })
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">To</label>
              <select
                required
                value={toTime}
                onChange={e => setToTime(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black sm:text-sm"
              >
                {Array.from({ length: 13 }, (_, h) => h + 8).flatMap(h =>
                  [0, 15, 30, 45].map(m => {
                    const val = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
                    return <option key={val} value={val}>{val}</option>;
                  })
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Reason (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Meeting, Personal, Training"
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black sm:text-sm"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Block'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
