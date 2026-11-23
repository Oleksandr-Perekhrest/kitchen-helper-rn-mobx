export const TIMER_CHANNEL_ID = "timers";

export interface TimerNotifier {
    prepare(options: { channelName: string }): Promise<void>;
    requestPermission(): Promise<boolean>;
    canScheduleExactAlarms(): Promise<boolean>;
    openExactAlarmSettings(): Promise<void>;
    schedule(input: {
        id: string;
        fireAt: number;
        title: string;
        body: string;
    }): Promise<void>;
    cancel(id: string): Promise<void>;
}
