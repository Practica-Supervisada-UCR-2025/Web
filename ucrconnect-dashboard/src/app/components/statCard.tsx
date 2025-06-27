import { FC } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  route?: string;
  bgStyle?: string;
  iconSize?: string;
}

export const getChangeBgClass = (change: number): string => {
  if (change > 0) return 'bg-green-100 text-green-800';
  if (change < 0) return 'bg-red-100 text-red-800';
  return '';
};

export const getArrowIcon = (change: number) => {
  return change >= 0 ? ArrowUp : ArrowDown;
};

const StatCard: FC<StatCardProps> = ({
  title,
  value,
  route,
  bgStyle,
}) => {
  const defaultBgStyle = 'bg-white border border-gray-300 text-gray-900';

  const content = (
    <div
      className={`p-6 rounded-[25px] flex flex-col justify-between ${bgStyle || defaultBgStyle}`}
      role="region"
      aria-labelledby={`${title}-stat`}
    >
      <h3 id={`${title}-stat`} className="text-lg font-medium">{title}</h3>
      <div className="flex items-start">
        <p className="text-5xl font-bold">{value}</p>
      </div>
    </div>
  );

  if (route) {
    return (
      <div
        className="block cursor-pointer"
        onClick={() => window.location.href = route}
        role="link"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && (window.location.href = route)}
      >
        {content}
      </div>
    );
  }

  return content;
};

export default StatCard;
