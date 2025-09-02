import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type CardData = {
  title: string
  value: string | number
  trend: "up" | "down"
  percentage: string
  footerMain: string
  footerSub: string
}

interface TeamSectionCardsProps {
  cards?: CardData[]
}

export function TeamSectionCards({ cards }: TeamSectionCardsProps) {
  const defaultCards: CardData[] = [
    {
      title: "Total Revenue",
      value: "$1,250.00",
      trend: "up",
      percentage: "+12.5%",
      footerMain: "Trending up this month",
      footerSub: "Visitors for the last 6 months",
    },
    {
      title: "New Customers",
      value: "1,234",
      trend: "down",
      percentage: "-20%",
      footerMain: "Down 20% this period",
      footerSub: "Acquisition needs attention",
    },
    {
      title: "Active Accounts",
      value: "45,678",
      trend: "up",
      percentage: "+12.5%",
      footerMain: "Strong user retention",
      footerSub: "Engagement exceed targets",
    },
    {
      title: "Growth Rate",
      value: "4.5%",
      trend: "up",
      percentage: "+4.5%",
      footerMain: "Steady performance increase",
      footerSub: "Meets growth projections",
    },
  ]

  const dataToRender = cards ?? defaultCards

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {dataToRender.map((card, idx) => {
        const isUp = card.trend === "up"
        const Icon = isUp ? IconTrendingUp : IconTrendingDown

        return (
          <Card key={idx} className="@container/card">
            <CardHeader>
              <CardDescription>{card.title}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {card.value}
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  <Icon />
                  {card.percentage}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                {card.footerMain} <Icon className="size-4" />
              </div>
              <div className="text-muted-foreground">{card.footerSub}</div>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
