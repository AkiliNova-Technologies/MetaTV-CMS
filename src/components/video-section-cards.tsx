import React from "react";
import { IconTrendingDown, IconTrendingUp, IconVideo, IconGlobe, IconClock, IconEye } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { videoSchema } from "@/constants/Schemas";
import { z } from "zod";

export type CardData = {
  title: string;
  value: string | number;
  trend?: "up" | "down";
  percentage?: string;
  footerMain: string;
  footerSub: string;
};

// Extend videoSchema to make programId optional
type VideoSectionCardVideo = z.infer<typeof videoSchema> & { programId?: number };

// Updated VideoSectionCards component with layout prop
interface VideoSectionCardsProps {
  cards: CardData[];
  videos: VideoSectionCardVideo[];
  onFilterChange?: (filter: { key: string; value: string | number }) => void;
  layout?: 'auto' | '2x2' | '1x1' | '4col'; // Add layout prop
}

export function VideoSectionCards({ 
  cards, 
  onFilterChange, 
  layout = 'auto' 
}: VideoSectionCardsProps) {
  const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
    "Total Videos": IconVideo,
    "Public Videos": IconGlobe,
    "New Videos": IconClock,
    "Total Views": IconEye,
  };

  // Determine grid classes based on layout prop
  const getGridClasses = () => {
    switch(layout) {
      case '2x2':
        return 'grid grid-cols-2 gap-4'; // Fixed 2x2 grid
      case '1x1':
        return 'grid grid-cols-1 gap-4'; // Single column
      case '4col':
        return 'grid grid-cols-1 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 gap-4'; // Original responsive
      case 'auto':
      default:
        return 'grid grid-cols-1 @sm/main:grid-cols-2 @xl/main:grid-cols-4 gap-4'; // Responsive default
    }
  };

  // Determine how many cards to show based on layout
  const displayCards = layout === '2x2' ? cards.slice(0, 4) : cards;

  return (
    <div className={getGridClasses()}>
      {displayCards.map((card, idx) => {
        const isUp = card.trend === "up";
        const TrendIcon = isUp ? IconTrendingUp : IconTrendingDown;
        const CardIcon = iconMap[card.title] || IconVideo;

        return (
          <Card
            key={idx}
            className={cn(
              "h-full",
              onFilterChange && card.title in { "Public Videos": 1, "New Videos": 1 }
                ? "cursor-pointer hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-800"
                : ""
            )}
            data-slot="card"
            onClick={
              onFilterChange && card.title === "Public Videos"
                ? () => onFilterChange({ key: "visibility", value: "PUBLIC" })
                : onFilterChange && card.title === "New Videos"
                ? () =>
                    onFilterChange({
                      key: "createdAt",
                      value: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
                    })
                : undefined
            }
          >
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <CardIcon className="size-4" />
                {card.title}
              </CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">
                {card.value}
              </CardTitle>
              {card.trend && card.percentage && (
                <CardAction>
                  <Badge variant="outline" className={isUp ? "text-green-500" : "text-red-500"}>
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
  );
}