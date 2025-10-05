import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const inquiries = [
  {
    id: 'REQ-804',
    customer: 'Elio Meridian',
    topic: 'Custom scent layering',
  },
  {
    id: 'REQ-811',
    customer: 'Suri Dawn',
    topic: 'Delivery update',
  },
];

export default function EmployeeInquiriesPage() {
  return (
    <div className="space-y-6">
      {inquiries.map((inquiry) => (
        <Card key={inquiry.id} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardHeader>
            <CardTitle>{inquiry.topic}</CardTitle>
            <CardDescription>
              {inquiry.id} · {inquiry.customer}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">Open workspace</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
