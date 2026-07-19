import { generateSlots } from '../services/slotService.js';
import { sendResponse } from '../utils/response.js';

export const getSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    
    if (!doctorId || !date) {
      return sendResponse(res, 400, false, 'Doctor ID and Date are required');
    }

    // prevent past dates
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (targetDate < today) {
      return sendResponse(res, 400, false, 'Cannot book slots for past dates');
    }

    const slots = await generateSlots(doctorId, date);
    sendResponse(res, 200, true, 'Slots fetched successfully', slots);
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};
