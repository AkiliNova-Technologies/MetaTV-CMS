import {
  IconBroadcast,
  IconClock,
  IconEye,
  IconTrendingDown,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import type { Livestream } from "@/types/livestream";

export type CardData = {
  title: string;
  value: string | number;
  trend?: "up" | "down";
  percentage?: string;
  footerMain: string;
  footerSub: string;
};

interface LivestreamSectionCardsProps {
  cards: CardData[];
  livestreams: Livestream[];
  onFilterChange?: (filter: { key: string; value: string | number }) => void;
  layout?: "auto" | "2x2" | "1x1" | "4col";
}

export function LivestreamSectionCards({
  cards,
  onFilterChange,
  layout = "auto",
}: LivestreamSectionCardsProps) {
  const iconMap: {
    [key: string]: React.ComponentType<{ className?: string }>;
  } = {
    "Active Streams": IconBroadcast,
    "Total Viewers": IconUsers,
    "Scheduled Streams": IconClock,
    "Total Views": IconEye,
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

  // Determine how many cards to show based on layout
  const displayCards = layout === "2x2" ? cards.slice(0, 4) : cards;

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs ">
      <div className={getGridClasses()}>
        {displayCards.map((card, idx) => {
          const isUp = card.trend === "up";
          const TrendIcon = isUp ? IconTrendingUp : IconTrendingDown;
          const CardIcon = iconMap[card.title] || IconBroadcast;

          return (
            <Card
              key={idx}
              className={cn(
                "@container/card",
                onFilterChange &&
                  card.title in { "Active Streams": 1, "Scheduled Streams": 1 }
                  ? "cursor-pointer hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-800"
                  : ""
              )}
              data-slot="card"
              onClick={
                onFilterChange && card.title === "Active Streams"
                  ? () => onFilterChange({ key: "status", value: "LIVE" })
                  : onFilterChange && card.title === "Scheduled Streams"
                  ? () => onFilterChange({ key: "status", value: "SCHEDULED" })
                  : undefined
              }
            >
              <CardHeader>
                <CardDescription className="flex items-center gap-2">
                  <CardIcon className="size-4" />
                  {card.title}
                </CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {card.value}
                </CardTitle>
                {card.trend && card.percentage && (
                  <CardAction>
                    <Badge
                      variant="outline"
                      className={isUp ? "text-green-500" : "text-red-500"}
                    >
                      <TrendIcon className="size-4 mr-1" />
                      {card.percentage}
                    </Badge>
                  </CardAction>
                )}
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  {card.footerMain}
                  {card.trend && <TrendIcon className="size-4" />}
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
