import { ExchangeConfig, ExchangeBalance, ExchangeOrder, ExchangePosition } from '@/types/exchange';

export class ExchangeService {
  private config: ExchangeConfig;
  private baseUrl: string = '';

  constructor(config: ExchangeConfig) {
    this.config = config;
    this.setBaseUrl();
  }

  private setBaseUrl() {
    if (this.config.mode === 'demo') {
      // در حالت دمو از API واقعی استفاده نمی‌کنیم
      return;
    }

    switch (this.config.type) {
      case 'binance':
        this.baseUrl = this.config.credentials?.testnet 
          ? 'https://testnet.binance.vision/api'
          : 'https://api.binance.com/api';
        break;
      case 'bybit':
        this.baseUrl = this.config.credentials?.testnet
          ? 'https://api-testnet.bybit.com'
          : 'https://api.bybit.com';
        break;
      case 'okx':
        this.baseUrl = this.config.credentials?.testnet
          ? 'https://www.okx.com'
          : 'https://www.okx.com';
        break;
      case 'kucoin':
        this.baseUrl = this.config.credentials?.testnet
          ? 'https://openapi-sandbox.kucoin.com'
          : 'https://api.kucoin.com';
        break;
    }
  }

  async getBalances(): Promise<ExchangeBalance[]> {
    if (this.config.mode === 'demo') {
      // در حالت دمو، موجودی مجازی برمی‌گردانیم
      return [
        { asset: 'USDT', free: 10000, locked: 0, total: 10000 },
        { asset: 'BTC', free: 0, locked: 0, total: 0 },
        { asset: 'ETH', free: 0, locked: 0, total: 0 },
      ];
    }

    // برای حالت واقعی، باید API صرافی را فراخوانی کنیم
    if (!this.config.credentials) {
      throw new Error('اطلاعات API تنظیم نشده است');
    }

    // اینجا باید درخواست واقعی به API صرافی ارسال شود
    // به دلیل امنیت، این کار باید از طریق سرور انجام شود
    throw new Error('اتصال به صرافی واقعی نیاز به سرور دارد');
  }

  async placeOrder(
    symbol: string,
    side: 'BUY' | 'SELL',
    quantity: number,
    price?: number
  ): Promise<ExchangeOrder> {
    if (this.config.mode === 'demo') {
      // در حالت دمو، سفارش مجازی ایجاد می‌کنیم
      return {
        orderId: `DEMO_${Date.now()}`,
        symbol,
        side,
        type: price ? 'LIMIT' : 'MARKET',
        quantity,
        price,
        status: 'FILLED',
        timestamp: Date.now(),
      };
    }

    if (!this.config.credentials) {
      throw new Error('اطلاعات API تنظیم نشده است');
    }

    // برای حالت واقعی، باید از طریق سرور سفارش ثبت شود
    throw new Error('ثبت سفارش واقعی نیاز به سرور دارد');
  }

  async getPositions(): Promise<ExchangePosition[]> {
    if (this.config.mode === 'demo') {
      return [];
    }

    if (!this.config.credentials) {
      throw new Error('اطلاعات API تنظیم نشده است');
    }

    throw new Error('دریافت پوزیشن‌ها نیاز به سرور دارد');
  }

  async cancelOrder(orderId: string): Promise<boolean> {
    if (this.config.mode === 'demo') {
      return true;
    }

    if (!this.config.credentials) {
      throw new Error('اطلاعات API تنظیم نشده است');
    }

    throw new Error('لغو سفارش نیاز به سرور دارد');
  }

  isDemo(): boolean {
    return this.config.mode === 'demo';
  }

  getExchangeName(): string {
    const names = {
      binance: 'بایننس',
      bybit: 'بای‌بیت',
      okx: 'او‌کی‌ایکس',
      kucoin: 'کوکوین',
    };
    return names[this.config.type];
  }
}