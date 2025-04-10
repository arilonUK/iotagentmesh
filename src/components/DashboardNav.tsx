
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, Globe, Settings, LifeBuoy, Users } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Devices', href: '/dashboard/devices', icon: Globe },
  { 
    name: 'Settings', 
    href: '/dashboard/settings', 
    icon: Settings,
    submenu: [
      { name: 'Profile', href: '/dashboard/settings/profile' },
      { name: 'Team', href: '/dashboard/settings/team' },
    ]
  },
  { name: 'Help', href: '/dashboard/help', icon: LifeBuoy },
];

const DashboardNav = () => {
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = React.useState<string | null>(null);

  // Check if the current path is in a submenu
  React.useEffect(() => {
    navigation.forEach(item => {
      if (item.submenu && item.submenu.some(subItem => location.pathname === subItem.href)) {
        setOpenSubmenu(item.name);
      }
    });
  }, [location.pathname]);

  const toggleSubmenu = (name: string) => {
    setOpenSubmenu(openSubmenu === name ? null : name);
  };

  return (
    <nav className="space-y-1 px-2">
      {navigation.map((item) => {
        const isActive = item.submenu
          ? item.submenu.some(subItem => location.pathname === subItem.href)
          : location.pathname === item.href;
        
        return (
          <div key={item.name}>
            {item.submenu ? (
              <>
                <button
                  onClick={() => toggleSubmenu(item.name)}
                  className={cn(
                    isActive
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                    'group w-full flex items-center px-2 py-2 text-sm font-medium rounded-md'
                  )}
                >
                  <item.icon
                    className={cn(
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-white',
                      'mr-3 h-5 w-5'
                    )}
                    aria-hidden="true"
                  />
                  <span className="flex-1 text-left">{item.name}</span>
                  <svg
                    className={cn(
                      'h-5 w-5 transition-transform',
                      openSubmenu === item.name ? 'rotate-90' : ''
                    )}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {/* Submenu */}
                {openSubmenu === item.name && (
                  <div className="pl-6 mt-1 space-y-1">
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.name}
                        to={subItem.href}
                        className={cn(
                          location.pathname === subItem.href
                            ? 'bg-gray-800 text-white'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                          'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                        )}
                      >
                        {subItem.name === 'Team' ? (
                          <Users className={cn(
                            location.pathname === subItem.href ? 'text-white' : 'text-gray-400',
                            'mr-3 h-4 w-4'
                          )} />
                        ) : null}
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                to={item.href}
                className={cn(
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-white',
                    'mr-3 h-5 w-5'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default DashboardNav;
