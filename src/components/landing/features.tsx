import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PiggyBank, BrainCircuit, LineChart } from 'lucide-react';

const features = [
  {
    icon: BrainCircuit,
    title: 'AI-Powered Insights',
    description:
      'Our smart AI analyzes your spending habits and calendar to give you a clear view of your financial future.',
  },
  {
    icon: LineChart,
    title: 'Cash Flow Forecasting',
    description:
      'Predict potential shortfalls and get personalized recommendations to stay on track, stress-free.',
  },
  {
    icon: PiggyBank,
    title: 'Personalized Savings Plans',
    description:
      'Whether it\'s a big trip or just a rainy day, create micro-savings plans that fit your lifestyle.',
  },
];

export function Features() {
  return (
    <section id="features" className="container mx-auto px-4 py-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold font-headline">
          All the tools you need. None of the stress.
        </h2>
        <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
          Juggle simplifies your finances so you can focus on what truly matters.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="p-3 bg-primary/10 rounded-full w-fit mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription className="pt-2">{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
