import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ContentListBaseProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

const ContentListBase = ({
  children,
  title,
  description,
}: ContentListBaseProps) => {
  return (
    <Card className="grid auto-rows-max items-start lg:col-span-2">
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        <div>
          <></>
        </div>
      </CardHeader>
      <CardContent className="grid">
        <ScrollArea className=" flex items-center space-x-4 rounded-md max-h-96">
          {children}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ContentListBase;
