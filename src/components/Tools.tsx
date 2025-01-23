import { useEffect, useState } from 'react';
import { apiClient } from '../services/axiosConfig';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';

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

  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-2 md:mb-4">
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full px-1 flex items-center justify-between hover:bg-accent rounded-md">
          {/* <h4 className="text-xs font-medium text-muted-foreground">Available Tools</h4> */}
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent id="tools-content" className="flex items-center space-x-2 overflow-x-auto px-2 pb-2 scrollbar-none">
        {tools.map((tool, index) => (
          <HoverCard key={index}>
            <HoverCardTrigger className="h-7 min-w-[90px] px-3 flex-shrink-0 flex items-center justify-center rounded-full bg-darkBg3 text-sm text-lightBg1 hover:bg-darkBg4 transition-colors duration-200 cursor-pointer">
              {tool.function.name}
            </HoverCardTrigger>
            <HoverCardContent className="w-[90%] md:w-[50%] bg-darkBg1" side="top">
              <div className="w-full">
                <div className="font-medium mb-1 text-sm md:text-base text-lightBg1 text-wrap w-full">{tool.function.name}</div>
                <div className="text-xs md:text-sm text-lightBg1">{tool.function.description}</div>
              </div>
            </HoverCardContent>
          </HoverCard>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};
