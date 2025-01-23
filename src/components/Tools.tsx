import { useEffect, useState } from 'react';
import { apiClient } from '../services/axiosConfig';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';

interface Tool {
  type: string;
  function: {
    name: string;
    description: string;
  };
}

export const Tools = () => {
  const [tools, setTools] = useState<Tool[]>([]);

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await apiClient.get('/tools');
        setTools(response.data);
      } catch (error) {
        console.error('Failed to fetch tools:', error);
      }
    };

    fetchTools();
  }, []);

  return (
    <div className="mb-4">
      <div className="mb-2 text-center text-sm font-medium text-textSecondary">Available Tools</div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {tools.map((tool, index) => (
          <HoverCard key={index}>
            <HoverCardTrigger className="inline-block rounded-full bg-darkBg3 px-3 py-1 text-sm text-lightBg1 hover:bg-darkBg4 transition-colors duration-200 max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer">
              {tool.function.name}
            </HoverCardTrigger>
            <HoverCardContent className="w-[50%] bg-darkBg1" side="top">
              <div className="w-[100%]">
                <div className="font-medium mb-1 text-lightBg1 text-wrap w-[100%]">{tool.function.name}</div>
                <div className="text-sm text-lightBg1">{tool.function.description}</div>
              </div>
            </HoverCardContent>
          </HoverCard>
        ))}
      </div>
    </div>
  );
};
