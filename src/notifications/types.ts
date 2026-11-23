export const TIMER_CHANNEL_ID = "timers";
export const TIMER_SILENT_CHANNEL_ID = "timers-silent";

export interface TimerNotifier {
    prepare(options: {
        channelName: string;
        silentChannelName: string;
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
    }): Promise<void>;
    cancel(id: string): Promise<void>;
}
