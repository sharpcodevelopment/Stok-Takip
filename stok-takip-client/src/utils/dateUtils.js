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
  // Türkiye saat dilimini kullanarak şu anki zamanı al
  const turkeyTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Istanbul"}));
  return turkeyTime;
};

export const getCurrentTurkeyTimeISO = () => {
  const turkeyTime = getCurrentTurkeyTime();
  return turkeyTime.toISOString();
};

export const formatDateForDatabase = (date) => {
  if (!date) return null;
  try {
    const dateObj = new Date(date);
    return dateObj.toISOString();
  } catch (error) {
    return null;
  }
};

export const getRelativeTimeString = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    const now = getCurrentTurkeyTime();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Az önce';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} dakika önce`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} saat önce`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} gün önce`;
    } else {
      return formatDateForDisplayShort(dateString);
    }
  } catch (error) {
    return '-';
  }
};
