'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Demo dataset; replace with live inquiry feed sourced from Supabase.
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
    <ul className="space-y-6">
      {inquiries.map((inquiry) => (
        <li key={inquiry.id}>
          <Card className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardHeader>
              <CardTitle>{inquiry.topic}</CardTitle>
              <CardDescription>
                {inquiry.id} · {inquiry.customer}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={() => console.info('TODO: open collaborative workspace for inquiry', inquiry.id)}
              >
                Open workspace
              </Button>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
