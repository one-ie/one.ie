import { useState, useEffect } from 'react';
import { Package, Clock, ShoppingBag } from 'lucide-react';

interface ActivityItem {
  name: string;
  location: string;
  timeAgo: string;
}

export function UrgencyMechanics() {
  const [stock, setStock] = useState(7);
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 34,
    seconds: 15,
  });
  const [activities, setActivities] = useState<ActivityItem[]>([
    { name: 'Sarah M.', location: 'New York', timeAgo: '2 min ago' },
    { name: 'Michael R.', location: 'London', timeAgo: '5 min ago' },
    { name: 'Emma W.', location: 'Tokyo', timeAgo: '8 min ago' },
  ]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;

        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }

        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Simulated activity feed
  useEffect(() => {
    const names = ['Jessica L.', 'David K.', 'Sophie T.', 'James P.', 'Olivia B.', 'Lucas M.'];
    const locations = ['Paris', 'Dubai', 'Singapore', 'LA', 'Miami', 'Sydney'];

    const activityTimer = setInterval(() => {
      const newActivity: ActivityItem = {
        name: names[Math.floor(Math.random() * names.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
        timeAgo: 'Just now',
      };

      setActivities((prev) => [newActivity, ...prev.slice(0, 2)]);
    }, 12000); // New activity every 12 seconds

    return () => clearInterval(activityTimer);
  }, []);

  const stockPercentage = (stock / 12) * 100;

  return (
    <div className="fixed bottom-6 right-6 z-40 space-y-3 max-w-sm">
      {/* Stock Counter */}
      <div className="bg-white dark:bg-black border-2 border-orange-500 rounded-lg p-4 shadow-2xl animate-pulse-slow">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900">
            <Package className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-orange-600 dark:text-orange-400">Limited Stock</p>
            <p className="text-xs text-gray-600 dark:text-gray-300">Only {stock} left in stock!</p>
          </div>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
            style={{ width: `${stockPercentage}%` }}
          />
        </div>
      </div>

      {/* Countdown Timer */}
      <div className="bg-white dark:bg-black border-2 border-red-500 rounded-lg p-4 shadow-2xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-900">
            <Clock className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-red-600 dark:text-red-400">Special Offer Ends In</p>
            <p className="text-xs text-gray-600 dark:text-gray-300">Free overnight shipping</p>
          </div>
        </div>
        <div className="flex gap-2 justify-center">
          <div className="flex flex-col items-center bg-gradient-to-b from-red-500 to-red-600 text-white rounded-lg p-2 min-w-[60px]">
            <span className="text-2xl font-black">{String(timeLeft.hours).padStart(2, '0')}</span>
            <span className="text-xs">Hours</span>
          </div>
          <div className="flex flex-col items-center bg-gradient-to-b from-red-500 to-red-600 text-white rounded-lg p-2 min-w-[60px]">
            <span className="text-2xl font-black">{String(timeLeft.minutes).padStart(2, '0')}</span>
            <span className="text-xs">Mins</span>
          </div>
          <div className="flex flex-col items-center bg-gradient-to-b from-red-500 to-red-600 text-white rounded-lg p-2 min-w-[60px]">
            <span className="text-2xl font-black">{String(timeLeft.seconds).padStart(2, '0')}</span>
            <span className="text-xs">Secs</span>
          </div>
        </div>
      </div>

      {/* Live Activity Feed */}
      <div className="bg-white dark:bg-black border-2 border-green-500 rounded-lg p-4 shadow-2xl max-h-[200px] overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900">
            <ShoppingBag className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-sm font-bold text-green-600 dark:text-green-400">Recent Purchases</p>
        </div>
        <div className="space-y-2">
          {activities.map((activity, index) => (
            <div
              key={`${activity.name}-${index}`}
              className="flex items-center justify-between text-xs py-2 border-b border-gray-200 dark:border-gray-700 last:border-0 animate-slide-in"
            >
              <div>
                <p className="font-semibold">{activity.name}</p>
                <p className="text-gray-500 dark:text-gray-400">{activity.location}</p>
              </div>
              <span className="text-gray-400 dark:text-gray-500">{activity.timeAgo}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
