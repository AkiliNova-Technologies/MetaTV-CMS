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

interface VideoSectionCardsProps {
  cards: CardData[];
  videos: VideoSectionCardVideo[];
  onFilterChange?: (filter: { key: string; value: string | number }) => void;
}

export function VideoSectionCards({ cards, onFilterChange }: VideoSectionCardsProps) {
  // Map titles to icons for visual consistency
  const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
    "Total Videos": IconVideo,
    "Public Videos": IconGlobe,
    "New Videos": IconClock,
    "Total Views": IconEye,
  };

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {cards.map((card, idx) => {
        const isUp = card.trend === "up";
        const TrendIcon = isUp ? IconTrendingUp : IconTrendingDown;
        const CardIcon = iconMap[card.title] || IconVideo; // Fallback to IconVideo

        return (
          <Card
            key={idx}
            className={cn(
              "@container/card",
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
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
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