import { format } from 'date-fns';

export const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
};

export const formatPace = (pace: number): string => {
    const m = Math.floor(pace);
    const s = Math.round((pace - m) * 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
};

export const formatDistance = (meters: number): string => {
    return (meters / 1000).toFixed(2);
};

export const formatDate = (timestamp: number): string => {
    return format(new Date(timestamp), 'MMM d');
};

export const formatTime = (timestamp: number): string => {
    return format(new Date(timestamp), 'h:mm a');
};
