import { getAvailabilities, getAllAvailabilities } from '../data/availabilities';

const availableSlotStyle = {
  style: { background: '#FFF' },
};

const initialPhysicianAvailabilities = Object.values(getAvailabilities(28716));
const allAvailabilities = Object.values(getAllAvailabilities()).flat();

export default function slotStyler(date, entityKey, isMultiGrid) {
  const availabilities = isMultiGrid ? allAvailabilities : initialPhysicianAvailabilities;

  const hasAvailability = availabilities.some(availability => {
    const startTime = new Date(availability.startTime);
    const endTime = new Date(availability.endTime);

    if (startTime <= date && date < endTime) {
      if (!isMultiGrid || isMultiGrid && entityKey && entityKey === availability.providerId) {
        return true;
      }
      return false
    }
  });

  return hasAvailability ? availableSlotStyle : undefined;
}
