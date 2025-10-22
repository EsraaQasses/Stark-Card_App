export const currenciesData = [
  {
    currency: 'USD',
    name: 'US Dollar',
    balance: '$15,250.75',
    available: '$14,800.00',
    pending: '$450.75',
    icon: '$',
    color: 'bg-blue-100',
    textColor: 'text-blue-600',
    exchangeRate: '1 USD = 12,500 SYP',
  },
  {
    currency: 'SYP',
    name: 'Syrian Pound',
    balance: 'ل.س 45,780,250',
    available: 'ل.س 40,250,000',
    pending: 'ل.س 5,530,250',
    icon: 'ل.س',
    color: 'bg-green-100',
    textColor: 'text-green-600',
    exchangeRate: '1 SYP = 0.00008 USD',
  },
];

export const exchangeRates = [
  {
    from: 'USD',
    to: 'SYP',
    rate: '12,500',
    change: '+1.2%',
    trend: 'up',
  },
  {
    from: 'SYP',
    to: 'USD',
    rate: '0.00008',
    change: '-0.3%',
    trend: 'down',
  },
];
