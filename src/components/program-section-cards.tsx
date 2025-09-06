import { IconTrendingDown, IconTrendingUp, IconTable, IconVideo, IconUsers } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type CardData = {
  title: string;
  value: string | number;
  trend: "up" | "down";
  percentage: string;
  footerMain: string;
  footerSub: string;
};

interface ProgramSectionCardsProps {
  cards: CardData[];
  layout?: "auto" | "2x2" | "1x1" | "4col";
}

export function ProgramSectionCards({ cards, layout= "auto" }: ProgramSectionCardsProps) {
  // Map titles to icons for visual consistency
  const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
    "Total Programs": IconTable,
    "Total Videos": IconVideo,
    "Total Subscribers": IconUsers,
    "Recent Programs": IconTable,
  };

   // Determine grid classes based on layout prop
  const getGridClasses = () => {
    switch (layout) {
      case "2x2":
        return "grid grid-cols-2 gap-4";
      case "1x1":
        return "grid grid-cols-1 gap-4";
      case "4col":
        return "grid grid-cols-1 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 gap-4";
      case "auto":
      default:
        return "grid grid-cols-1 @sm/main:grid-cols-2 @xl/main:grid-cols-4 gap-4"; // Responsive default
    }
  };

  const dataToRender =layout === "2x2" ? cards!.slice(0, 4) : cards

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs ">
      <div className={getGridClasses()}>
      {dataToRender.map((card, idx) => {
        const isUp = card.trend === "up";
        const TrendIcon = isUp ? IconTrendingUp : IconTrendingDown;
        const CardIcon = iconMap[card.title] || IconTable; // Fallback to IconTable

        return (
          <Card key={idx} className="@container/card">
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <CardIcon className="size-4" />
                {card.title}
              </CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {card.value}
              </CardTitle>
              <CardAction>
                <Badge variant="outline" className={isUp ? "text-green-500" : "text-red-500"}>
                  <TrendIcon className="size-4 mr-1" />
                  {card.percentage}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                {card.footerMain} <TrendIcon className="size-4" />
              </div>
              <div className="text-muted-foreground">{card.footerSub}</div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
    </div>
  );
}