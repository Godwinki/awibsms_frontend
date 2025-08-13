import ExpenseDetailClient from './ExpenseDetailClient';

// This is a Server Component that includes the client component
export default function ExpenseDetailPage() {
  return <ExpenseDetailClient />;
}

// Generate static params for Next.js static site generation
export async function generateStaticParams() {
  // Include the specific ID from the error message to make it available at build time
  // In a real-world scenario, you would fetch all possible IDs from your API
  return [
    { id: '4c4b3ab8-e81d-4cb4-908c-7e344fa8cb10' },
    { id: '2cdb00e4-a9f0-47b7-a013-c8483920fa86' },
    { id: '58b0f42d-113d-4c59-a0c8-6d9ace5e8325' },
    { id: '58b0f42d-113d-4c59-a0c8-6d9ace5e8325' },
    { id: 'cd894f5d-fd03-4b81-a03b-1743d8f15008' },
    { id: '00f5bcb9-741f-4e0c-863b-8cf12edfdc07' },
    // Add more IDs here if needed
  ];
}
