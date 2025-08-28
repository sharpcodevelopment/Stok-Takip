// Tarih formatlaması için yardımcı fonksiyonlar
export const formatDateForDisplay = (dateString) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Istanbul'
    });
  } catch (error) {
    return '-';
  }
};

export const formatDateForDisplayShort = (dateString) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleString('tr-TR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Istanbul'
    });
  } catch (error) {
    return '-';
  }
};

export const getCurrentTurkeyTime = () => {
  const now = new Date();
  const turkeyTimeString = now.toLocaleString('tr-TR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Europe/Istanbul'
  });
  
  // String'i Date objesine çevir
  const [datePart, timePart] = turkeyTimeString.split(' ');
  const [day, month, year] = datePart.split('.');
  const [hour, minute, second] = timePart.split(':');
  return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
};
