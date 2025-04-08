import { Event, PrismaClient, InvoiceStatus, Invoice } from '@prisma/client';
import dayjs from 'dayjs';
import { accessGoogleSheetAPI } from './google_sheets/sheets';

import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const prisma = new PrismaClient();

// type Invoice = {
//   // invoice number is generated by the system
//   invoiceNumber: string;
//   // sent by requester
//   createDate: Date;
//   // sent by requester
//   dueDate: Date;
//   // sent by requester
//   status: InvoiceStatus;
//   // created in backend
//   invoiceFrom: any;
//   // static value which is cult creative
//   invoiceTo: object;
//   // the service item which is static
//   items: object[];
//   // get it from the aggremant form data
//   totalAmount: number;
//   // get all of it from creator data
//   bankInfo: object;
//   // get it from the session
//   createdBy: string;
//   // sent by requester
//   campaignId: string;
// };

async function generateUniqueInvoiceNumber() {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const randomNumber = Math.floor(1000 + Math.random() * 9000); // Ensures 4 digits
    const invoiceNumber = `INV-${randomNumber}`;

    // Check if the invoice number already exists
    const existingInvoice = await prisma.invoice.findUnique({
      where: { invoiceNumber },
    });

    if (!existingInvoice) {
      // Return the unique invoice number
      return invoiceNumber;
    }

    // If the number exists, retry
  }
}

export const createInvoiceService = async (
  data: any,
  userId: any,
  amount: any,
  invoiceItems?: { type: string; count: number }[],
) => {
  const invoiceNumber = await generateUniqueInvoiceNumber();

  const invoiceTo = {
    id: '1',
    name: 'Cult Creative',
    fullAddress:
      '4-402, Level 4, The Starling Mall, Lot 4-401 &, 6, Jalan SS 21/37, Damansara Utama, 47400 Petaling Jaya, Selangor',
    phoneNumber: '+60 11-5415 5751',
    company: 'Cult Creative',
    addressType: 'Hq',
    email: 'support@cultcreative.asia',
    primary: true,
  };

  // get item from aggremant form
  const item = {
    title: 'Posting on social media',
    description: 'Posting on social media',
    service: 'Posting on social media',
    quantity: 1,
    price: amount,
    total: amount,
  };

  const invoiceFrom = {
    id: data.user.id,
    name: data.user.name,
    phoneNumber: data.user.phoneNumber,
    email: data.user.email,
    fullAddress: data.user.creator.fullAddress,
    company: data.user.creator.employment,
    addressType: 'Home',
    primary: false,
  };

  const bankInfo = {
    bankName: data.user.paymentForm.bankName,
    accountName: data.user.paymentForm.bankAccountName,
    payTo: data.user.name,
    accountNumber: data.user.paymentForm.bankAccountNumber,
    accountEmail: data.user.email,
  };

  try {
    const { invoice } = await prisma.campaign.update({
      where: {
        id: data.campaignId,
      },
      data: {
        invoice: {
          create: {
            invoiceNumber: invoiceNumber,
            createdAt: data.updatedAt,
            dueDate: new Date(dayjs(data.updatedAt).add(28, 'day').format()),
            status: 'draft' as InvoiceStatus,
            invoiceFrom: invoiceFrom,
            invoiceTo,
            task: item,
            amount: parseFloat(amount) || 0,
            bankAcc: bankInfo,
            user: {
              connect: {
                id: userId,
              },
            },
            creator: {
              connect: {
                userId: data.user.id,
              },
            },
            ...(invoiceItems?.length && {
              deliverables: invoiceItems,
            }),
          },
        },
      },
      include: {
        invoice: true,
      },
    });

    return invoice.find((item) => item.creatorId === data.user.id);
  } catch (error) {
    throw new Error(error);
  }
};

export const sendToSpreadSheet = async (
  data: {
    createdAt: string;
    name: string;
    icNumber: string;
    bankName: string;
    campaignName: string;
    bankAccountNumber: string;
    amount: number;
  },
  spreadSheetId: string,
  sheetByTitle: string,
) => {
  try {
    const sheet = await accessGoogleSheetAPI(spreadSheetId);

    if (!sheet) {
      throw new Error('Sheet not found.');
    }

    const currentSheet = sheet.sheetsByTitle[sheetByTitle];

    if (!currentSheet) {
      throw new Error('Sheet not found.');
    }

    const updatedRow = await currentSheet.addRow({
      'Date Created': dayjs(data.createdAt).tz('Asia/Kuala_Lumpur').format('LLL'),
      'Creator Name': data.name || '',
      'IC Number': data.icNumber || '',
      'Campaign Name': data.campaignName || '',
      'Bank Name': data.bankName || '',
      'Bank Account Number': data.bankAccountNumber || '',
      Amount: new Intl.NumberFormat('en-MY', { minimumFractionDigits: 2 }).format(data.amount),
    });

    console.log(updatedRow);

    return updatedRow;
  } catch (error) {
    throw new Error(error);
  }
};
