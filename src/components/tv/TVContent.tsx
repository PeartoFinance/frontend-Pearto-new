'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import VideoPlayer from '@/components/tv/VideoPlayer';
import ChannelList from '@/components/tv/ChannelList';
import ChannelInfoBar from '@/components/tv/ChannelInfoBar';
import { TVChannel } from '@/types/media';
import { get } from '@/services/api';

export default function TVContent() {
    const [channels, setChannels] = useState<TVChannel[]>([]);
    const [activeChannel, setActiveChannel] = useState<TVChannel | null>(null);
    const [loading, setLoading] = useState(true);

    const searchParams = useSearchParams();
    const router = useRouter();

    // Fetch channels
    useEffect(() => {
        const fetchChannels = async () => {
            try {
                const data = await get<TVChannel[]>('/media/tv-channels');
                setChannels(data);

                // Set initial channel from URL or first available
                const channelId = searchParams.get('channel');
                if (channelId && data.length) {
                    const found = data.find(c => c.id === channelId);
                    if (found) setActiveChannel(found);
                    else if (data.length > 0) setActiveChannel(data[0]);
                } else if (data.length > 0) {
                    setActiveChannel(data[0]);
                }
            } catch (error) {
                console.error('Failed to fetch TV channels:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchChannels();
    }, [searchParams]);

    // Handle channel selection
    const handleSelectChannel = (channel: TVChannel) => {
        setActiveChannel(channel);
        router.replace(`/tv?channel=${channel.id}`, { scroll: false });
    };

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900">
            <Header />

            {/* Main Content - Full Height Split Layout */}
            <div className="flex-1 flex flex-col lg:flex-row">
                {/* Left Panel - Video Player */}
                <div className="flex-1 flex flex-col bg-black">
                    {/* Video Player Container */}
                    <div className="flex-1 relative min-h-[300px]">
                        <VideoPlayer
                            streamUrl={activeChannel?.stream_url || ''}
                            title={activeChannel?.name || 'TV Channel'}
                        />
                    </div>

                    {/* Channel Info Bar */}
                    <ChannelInfoBar channel={activeChannel} />
                </div>

                {/* Right Panel - Channel List */}
                <div className="lg:w-[380px] xl:w-[420px] h-[300px] lg:h-auto">
                    <ChannelList
                        channels={channels}
                        activeChannel={activeChannel}
                        onSelectChannel={handleSelectChannel}
                        loading={loading}
                    />
                </div>
            </div>
        </div>
    );
}
