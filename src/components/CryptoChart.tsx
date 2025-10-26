import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PriceHistory } from '@/types/crypto';

interface CryptoChartProps {
  symbol: string;
  data: PriceHistory[];
}

const CryptoChart = ({ symbol, data }: CryptoChartProps) => {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatPrice = (price: number) => {
    if (price < 1) {
      return `$${price.toFixed(6)}`;
    } else if (price < 100) {
      return `$${price.toFixed(2)}`;
    } else {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  const chartData = data.map(item => ({
    time: formatTime(item.timestamp),
    price: item.price,
    timestamp: item.timestamp,
  }));

  return (
    <Card dir="rtl">
      <CardHeader>
        <CardTitle className="text-right">نمودار قیمت {symbol}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => formatPrice(value)}
              domain={['auto', 'auto']}
            />
            <Tooltip 
              formatter={(value: number) => [formatPrice(value), 'قیمت']}
              labelFormatter={(label) => `زمان: ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#8884d8" 
              strokeWidth={2}
              dot={false}
              animationDuration={300}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default CryptoChart;