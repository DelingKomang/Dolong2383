export const formatCurrency = (value: number | undefined | null): string => {
  if (value === null || typeof value === 'undefined' || value === 0) {
    return '-';
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatDate = (dateString: string): string => {
  // Treat YYYY-MM-DD as a local date to avoid timezone issues.
  // Appending 'T00:00:00' makes `new Date()` parse it in the local timezone.
  const date = new Date(`${dateString}T00:00:00`);
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const indonesianMonths: { [key: string]: string } = {
    'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'mei': '05', 'jun': '06',
    'jul': '07', 'agu': '08', 'sep': '09', 'okt': '10', 'nov': '11', 'des': '12'
};

// This function handles Excel's numeric date format and various string formats
export const safeFormatDateForImport = (dateValue: any): string => {
  let date: Date | null = null;

  // 1. If it's already a valid Date object from xlsx parsing
  if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
    date = dateValue;
  } 
  // 2. If it's an Excel serial number
  else if (typeof dateValue === 'number' && dateValue > 1) {
    // Formula to convert Excel serial date to JS Date.
    // The result is a date at UTC midnight. We add the local timezone offset
    // to create a new date object whose UTC date components match the intended local date.
    const excelDate = new Date((dateValue - 25569) * 864e5);
    const tzOffset = excelDate.getTimezoneOffset() * 60 * 1000;
    const adjustedDate = new Date(excelDate.getTime() + tzOffset);
    if (!isNaN(adjustedDate.getTime())) {
      // For this timezone-adjusted date, `toISOString` correctly extracts the YYYY-MM-DD part.
      return adjustedDate.toISOString().split('T')[0];
    }
  } 
  // 3. If it's a string, try parsing it
  else if (typeof dateValue === 'string') {
    let parsedDate = new Date(dateValue); // Try standard parse first.
    
    // If standard parsing fails (e.g., for "31 Des 2023"), try our custom parser.
    if (isNaN(parsedDate.getTime())) {
      const parts = dateValue.toLowerCase().replace(/[,.-]/g, '').split(' ');
      if (parts.length === 3) {
        const day = parts[0];
        const monthStr = parts[1].substring(0, 3);
        const year = parts[2];
        const month = indonesianMonths[monthStr];
        if (day && month && year && !isNaN(parseInt(day)) && !isNaN(parseInt(year))) {
          // Construct an ISO string and parse it as a local date.
          parsedDate = new Date(`${year}-${month}-${day.padStart(2, '0')}T00:00:00`);
        }
      }
    }
    date = parsedDate;
  } 
  // 4. Handle any other cases
  else {
      date = new Date(dateValue);
  }

  // For dates parsed from strings or other types, format them using local components
  // to avoid timezone shifts that `toISOString` can cause on local dates.
  if (date && !isNaN(date.getTime())) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Fallback for invalid formats
  console.warn('Invalid date detected during import, falling back to today:', dateValue);
  return new Date().toISOString().split('T')[0];
};

const ones = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan'];
const teens = ['sepuluh', 'sebelas', 'dua belas', 'tiga belas', 'empat belas', 'lima belas', 'enam belas', 'tujuh belas', 'delapan belas', 'sembilan belas'];
const tens = ['', 'sepuluh', 'dua puluh', 'tiga puluh', 'empat puluh', 'lima puluh', 'enam puluh', 'tujuh puluh', 'delapan puluh', 'sembilan puluh'];
const thousands = ['', 'ribu', 'juta', 'miliar', 'triliun'];

const convertThreeDigits = (num: number): string => {
    let str = '';
    const hundred = Math.floor(num / 100);
    const rest = num % 100;

    if (hundred > 0) {
        str += hundred === 1 ? 'seratus' : `${ones[hundred]} ratus`;
    }

    if (rest > 0) {
        str += str ? ' ' : '';
        if (rest < 10) {
            str += ones[rest];
        } else if (rest < 20) {
            str += teens[rest - 10];
        } else {
            const ten = Math.floor(rest / 10);
            const one = rest % 10;
            str += tens[ten];
            if (one > 0) {
                str += ` ${ones[one]}`;
            }
        }
    }
    return str;
};

export const numberToWords = (num: number): string => {
    if (num === 0) return 'nol';

    let words = '';
    let i = 0;

    while (num > 0) {
        if (num % 1000 !== 0) {
            let chunk = num % 1000;
            if (i > 0) {
              if(chunk === 1 && i === 1){ // handle 'seribu'
                words = 'seribu ' + words;
              } else {
                words = `${convertThreeDigits(chunk)} ${thousands[i]} ` + words;
              }
            } else {
              words = convertThreeDigits(chunk) + words;
            }
        }
        num = Math.floor(num / 1000);
        i++;
    }

    return words.trim();
};
