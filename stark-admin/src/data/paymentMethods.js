// src/data/paymentMethods.js

export const paymentMethodsData = [
  {
    MethodID: 2001,
    Title: 'Bank Transfer - Syrian Pounds',
    Currency: 'SYP',
    PhotoURL: 'https://cdn-icons-png.flaticon.com/512/483/483361.png',
    AccountDetails: 'Bank: Syrian Commercial Bank | Account No: 12345678 | IBAN: SY12345678901234567890123456',
    InstructionText: '1. Transfer to the account above\n2. Use memo: StarkCard_[YourUserID]\n3. Keep receipt for verification\n4. Allow 24 hours for processing',
    DateCreated: new Date('2025-09-20'),
    IsActive: true,
  },
  {
    MethodID: 2002,
    Title: 'Agent Cash Deposit - Damascus',
    Currency: 'USD',
    PhotoURL: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    AccountDetails: 'Agent: Ali Mohammed | Location: Damascus Center | Contact: +963 912 345 678 (WhatsApp) | Hours: 9AM-6PM',
    InstructionText: '1. Contact Agent Ali on WhatsApp\n2. Bring your StarkCard ID and cash\n3. Only clean USD bills accepted\n4. Get receipt from agent\n5. Funds credited within 1 hour',
    DateCreated: new Date('2025-09-21'),
    IsActive: true,
  },
  {
    MethodID: 2003,
    Title: 'Western Union - Dollar Transfer',
    Currency: 'USD',
    PhotoURL: 'https://cdn-icons-png.flaticon.com/512/2692/2692653.png',
    AccountDetails: 'Receiver: StarkCard Finance | City: Damascus | Country: Syria | ID Required: Yes',
    InstructionText: '1. Visit any Western Union branch\n2. Send to receiver details above\n3. Include your StarkCard ID in message\n4. Email receipt to receipts@starkcard.com\n5. Processing time: 4-6 hours',
    DateCreated: new Date('2025-09-15'),
    IsActive: false,
  },
  {
    MethodID: 2004,
    Title: 'Mobile Wallet - SYP',
    Currency: 'SYP',
    PhotoURL: 'https://cdn-icons-png.flaticon.com/512/3573/3573387.png',
    AccountDetails: 'Provider: Syriatel Cash | Number: 0933 123 456 | Name: StarkCard Payments',
    InstructionText: '1. Open your mobile wallet app\n2. Send to the number above\n3. Include your UserID in notes\n4. Take screenshot of transaction\n5. Upload screenshot in app',
    DateCreated: new Date('2025-09-25'),
    IsActive: true,
  }
];