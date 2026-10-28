import type { ComponentType } from "react";
import type { ActivityId } from "@/lib/types";
import { ConnectFour } from "./ConnectFour";
import { DeepTalk } from "./DeepTalk";
import { Constellation } from "./Constellation";
import { DrawTogether } from "./DrawTogether";
import { InSync } from "./InSync";
import { MemoryMatch } from "./MemoryMatch";
import type { ActivityProps } from "./shared";
import { StoryChain } from "./StoryChain";
import { TwoTruths } from "./TwoTruths";
import { WatchTogether } from "./WatchTogether";
import { WouldYouRather } from "./WouldYouRather";

export const ACTIVITY_COMPONENTS: Record<ActivityId, ComponentType<ActivityProps>> = {
  deeptalk: DeepTalk,
  wyr: WouldYouRather,
  insync: InSync,
  ttl: TwoTruths,
  draw: DrawTogether,
  story: StoryChain,
  constellation: Constellation,
  connect4: ConnectFour,
  memory: MemoryMatch,
  watch: WatchTogether,
};
