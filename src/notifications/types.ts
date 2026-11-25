export const TIMER_CHANNEL_ID = "timers";
export const TIMER_QUIET_CHANNEL_ID = "timers-quiet";
export const TIMER_SILENT_CHANNEL_ID = "timers-silent";
export const TIMER_ONGOING_CHANNEL_ID = "timers-ongoing";
export const TIMER_GROUP_ID = "active-timers";
export const TIMER_SUMMARY_ID = "timers-summary";

export interface TimerNotifier {
    prepare(options: {
        channelName: string;
        quietChannelName: string;
        silentChannelName: string;
        ongoingChannelName: string;
    }): Promise<void>;
    requestPermission(): Promise<boolean>;
    canScheduleExactAlarms(): Promise<boolean>;
    openExactAlarmSettings(): Promise<void>;
    schedule(input: {
        id: string;
        fireAt: number;
        title: string;
        body: string;
        sound: boolean;
        quiet: boolean;
    }): Promise<void>;
    cancel(id: string): Promise<void>;
    showOngoing(input: {
        id: string;
        title: string;
        body: string;
        endsAt: number | null;
    }): Promise<void>;
    showSummary(input: { title: string }): Promise<void>;
    cancelSummary(): Promise<void>;
}
