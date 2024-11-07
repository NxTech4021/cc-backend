import { JWT } from 'google-auth-library';

interface NewSheetWithRows {
  title: string;
  rows: string[];
}

interface Row {
  sheetId: number;
  creatorInfo: {
    name: string;
    email: string;
    videoLink: string;
  };
}

export const accessGoogleSheetAPI = async () => {
  try {
    const { GoogleSpreadsheet } = await import('google-spreadsheet');
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet('1k-0MzP1vQUltu_DacbwzagmHi-_J2924g7NN5J6ptBM', serviceAccountAuth);
    await doc.loadInfo();

    return doc;
  } catch (error) {
    throw new Error(error);
  }
};

// Create Campaign = Sheet
export const createNewSheetWithHeaderRows = async ({ title, rows }: NewSheetWithRows) => {
  try {
    const sheet = await accessGoogleSheetAPI();

    const newSheet = await sheet.addSheet({ headerValues: rows, title: title });

    return newSheet;
  } catch (error) {
    throw new Error(error);
  }
};

// Insert shortlisted creator => row
export const createNewRowData = async ({ sheetId, creatorInfo }: Row) => {
  try {
    const sheet = await accessGoogleSheetAPI();

    const existingSheet = sheet.sheetsById[sheetId];

    if (!existingSheet) {
      throw new Error('Sheet not found.');
    }

    const updatedRow = await existingSheet.addRow({
      'Creator name': creatorInfo.name,
      'Creator Email': creatorInfo.email,
      'Video Link': creatorInfo.videoLink,
    });

    return updatedRow;
  } catch (error) {
    throw new Error(error);
  }
};