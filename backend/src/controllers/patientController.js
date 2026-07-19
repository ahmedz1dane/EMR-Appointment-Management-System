import Patient from '../models/Patient.js';
import { sendResponse } from '../utils/response.js';

export const searchPatients = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return sendResponse(res, 400, false, 'Search query must be at least 2 characters');
    }

    const patients = await Patient.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { mobileNumber: { $regex: q, $options: 'i' } }
      ]
    }).limit(10);

    sendResponse(res, 200, true, 'Patients fetched', patients);
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};
