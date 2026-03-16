import type { LucideIcon } from 'lucide-react';
export type SideBarItem = { name: string; icon: LucideIcon };
import { useEffect } from 'react';
interface SideBarProps {
  sideBarItems: SideBarItem[];
  activeItem: string | null;
  setActiveItem: (item: string) => void;
  handleLogout: () => Promise<void>;
}

export const SideBar = ({ sideBarItems, activeItem, setActiveItem, handleLogout }: SideBarProps) => {
  const handleItemClick = (item: string) => {
    if (item === 'Logout') {
      handleLogout();
      return;
    }
    setActiveItem(item);
  };
  const isActive = (item: string) => activeItem === item;
  const getIconColor = (item: string) =>
    isActive(item) ? 'text-white' : 'text-gray-500';
  const getTextColor = (item: string) =>
    isActive(item) ? 'text-white' : 'text-gray-500';
  return (
    <ul className="menu w-full grow">
      {/* List item */}
      {sideBarItems.map((item) => (
        <li key={item.name}>
          <button
            className={`is-drawer-close:tooltip is-drawer-close:tooltip-right ${isActive(item.name) ? 'bg-primary text-white' : ''}`}
            onClick={() => handleItemClick(item.name)}
            data-tip={item.name}
          >
            <item.icon
              className={`my-1.5 inline-block size-4 ${getIconColor(item.name)}`}
            />
            <span
              className={`is-drawer-close:hidden whitespace-nowrap truncate${getTextColor(item.name)}`}
            >
              {item.name}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
};
