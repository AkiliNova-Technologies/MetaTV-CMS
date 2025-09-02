import React from "react";
import {
  IconTrendingDown,
  IconTrendingUp,
  IconMusic,
  IconGlobe,
  IconClock,
  IconPlayerPlay,
} from "@tabler/icons-react";
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
import { z } from "zod";
import { musicSchema } from "@/constants/Schemas";

export type CardData = {
  title: string;
  value: string | number;
  trend?: "up" | "down";
  percentage?: string;
  footerMain: string;
  footerSub: string;
};

type MusicSectionCardSong = z.infer<typeof musicSchema>;

interface MusicSectionCardsProps {
  cards: CardData[];
  music: MusicSectionCardSong[];
}

export function MusicSectionCards({ cards }: MusicSectionCardsProps) {
  const iconMap: {
    [key: string]: React.ComponentType<{ className?: string }>;
  } = {
    "Total Songs": IconMusic,
    "Public Songs": IconGlobe,
    "New Songs": IconClock,
    "Total Plays": IconPlayerPlay,
  };

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {cards.map((card, idx) => {
        const isUp = card.trend === "up";
        const TrendIcon = isUp ? IconTrendingUp : IconTrendingDown;
        const CardIcon = iconMap[card.title] || IconMusic;

        return (
          <Card key={idx} className={cn("@container/card")}>
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
              <div className="flex gap-2 font-medium">
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
