import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Placeholder customer roster; replace with Supabase-backed query for production use.
const customers = [
  {
    name: 'Nova Hart',
    email: 'nova@lumenmail.com',
    loyalty: 'Aurora tier',
    sentiment: 'Joyful',
  },
  {
    name: 'Mira Sola',
    email: 'mira@sensescape.io',
    loyalty: 'Lunar tier',
    sentiment: 'Calm',
  },
];

export default function EmployeeCustomersPage() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {customers.map((customer) => (
        <Card key={customer.email}>
          <CardHeader>
            <CardTitle>{customer.name}</CardTitle>
            <CardDescription>{customer.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-purple-700">
            <p>Loyalty: {customer.loyalty}</p>
            <p>Sentiment: {customer.sentiment}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
