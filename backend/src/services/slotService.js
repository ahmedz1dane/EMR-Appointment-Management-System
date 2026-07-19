import DoctorSchedule from '../models/DoctorSchedule.js';
import Appointment from '../models/Appointment.js';

export const generateSlots = async (doctorId, date) => {
  const schedule = await DoctorSchedule.findOne({ doctor: doctorId });
  if (!schedule) {
    throw new Error('Doctor schedule not found');
  }

  const targetDate = new Date(date);
  const dayOfWeek = targetDate.getDay();

  const dayConfig = schedule.days.find(d => d.day === dayOfWeek);

  if (!dayConfig || !dayConfig.isWorking) {
    return []; // Doctor not working on this day
  }

  // Find booked slots
  const bookedAppointments = await Appointment.find({
    doctor: doctorId,
    date,
    status: { $ne: 'Cancelled' }
  });
  const bookedTimes = bookedAppointments.map(app => app.time);

  const availableSlots = [];
  const now = new Date();
  const isToday = targetDate.toDateString() === now.toDateString();

  const timeToMinutes = (time) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };
  const minutesToTime = (mins) => {
    const h = Math.floor(mins / 60).toString().padStart(2, '0');
    const m = (mins % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  dayConfig.sessions.forEach(session => {
    let currentSlot = timeToMinutes(session.startTime);
    const endSession = timeToMinutes(session.endTime);

    while (currentSlot + schedule.slotDuration <= endSession) {
      const slotTimeStr = minutesToTime(currentSlot);
      
      // Check if slot is in a break
      const inBreak = dayConfig.breaks.some(br => {
        const breakStart = timeToMinutes(br.startTime);
        const breakEnd = timeToMinutes(br.endTime);
        return currentSlot >= breakStart && currentSlot < breakEnd;
      });

      // If today, prevent past slots
      const isPast = isToday && currentSlot <= currentMinutes;

      if (!inBreak && !isPast) {
        availableSlots.push({
          time: slotTimeStr,
          isBooked: bookedTimes.includes(slotTimeStr)
        });
      }
      currentSlot += schedule.slotDuration;
    }
  });

  return availableSlots;
};
