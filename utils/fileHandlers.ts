// Fix: Implement the file content for Excel handling. This file was previously missing/empty.
// Note: This implementation requires the 'xlsx' package to be installed.
import * as XLSX from 'xlsx';

/**
 * Exports an array of objects to an Excel file (XLSX format).
 * This function relies on the 'xlsx' library.
 *
 * @param data The array of objects to be exported. Each object represents a row.
 * @param fileName The name for the downloaded file, without the .xlsx extension.
 * @param sheetName The name for the sheet inside the Excel workbook.
 */
export const exportToExcel = (data: any[], fileName: string, sheetName: string): void => {
  try {
    // Create a new worksheet from the JSON data
    const worksheet = XLSX.utils.json_to_sheet(data);
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    // Append the worksheet to the workbook with the specified sheet name
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    // Trigger the file download
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  } catch (error) {
    console.error("Error during Excel export:", error);
    // Inform the user about the failure
    alert("An error occurred while exporting the data to Excel.");
  }
};

/**
 * Imports data from an Excel file (XLSX or XLS format).
 * This function relies on the 'xlsx' library.
 *
 * @param file The File object to be imported, typically from an <input type="file"> element.
 * @returns A promise that resolves with an array of objects, where each object represents a row from the first sheet.
 */
export const importFromExcel = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      if (!event.target || !event.target.result) {
        return reject(new Error("FileReader event target is null or has no result."));
      }
      try {
        const data = event.target.result;
        // Parse the binary string data from the file.
        const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
        // Get the name of the first sheet
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
            return reject(new Error("No sheets found in the Excel file."));
        }
        // Get the worksheet object
        const worksheet = workbook.Sheets[firstSheetName];
        // Convert the worksheet to JSON format. `raw: true` ensures numbers are not parsed as formatted strings.
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData);
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        reject(new Error("Failed to parse the Excel file. Please ensure it's a valid format."));
      }
    };

    reader.onerror = (errorEvent: ProgressEvent<FileReader>) => {
      console.error("FileReader error:", errorEvent);
      reject(new Error("An error occurred while reading the file."));
    };

    // Read the file as a binary string, which is required by XLSX.read
    reader.readAsBinaryString(file);
  });
};

interface ExportSheet {
  sheetName: string;
  data: any[];
}

export const exportAllDataToExcel = (sheets: ExportSheet[], fileName: string): void => {
  try {
    const workbook = XLSX.utils.book_new();
    sheets.forEach(sheet => {
      const worksheet = XLSX.utils.json_to_sheet(sheet.data);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheet.sheetName);
    });
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  } catch (error) {
    console.error("Error during multi-sheet Excel export:", error);
    alert("An error occurred while exporting all data to Excel.");
  }
};

/**
 * Imports all sheets from an Excel file.
 * @param file The Excel file to import.
 * @returns A promise that resolves to an object where keys are sheet names and values are the sheet data as JSON.
 */
export const importAllDataFromExcel = (file: File): Promise<{ [sheetName: string]: any[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      if (!event.target || !event.target.result) {
        return reject(new Error("FileReader event target is null or has no result."));
      }
      try {
        const data = event.target.result;
        const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
        const allSheetsData: { [sheetName: string]: any[] } = {};

        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          if (worksheet) {
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            allSheetsData[sheetName] = jsonData;
          }
        });

        resolve(allSheetsData);
      } catch (error) {
        console.error("Error parsing multi-sheet Excel file:", error);
        reject(new Error("Failed to parse the Excel file. Please ensure it's a valid backup format."));
      }
    };

    reader.onerror = (errorEvent) => {
      console.error("FileReader error:", errorEvent);
      reject(new Error("An error occurred while reading the file."));
    };

    reader.readAsBinaryString(file);
  });
};