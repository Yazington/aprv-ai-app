import { useEffect, useState } from 'react';
import { apiClient } from '../services/axiosConfig';
import { ChevronDown, ChevronUp,  Wand2 } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

interface Tool {
  type: string;
  function: {
    name: string;
    description: string;
  };
}

export const ToolsCommand = () => {
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
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="relative space-y-1"
    >
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between px-1 cursor-pointer hover:bg-accent rounded-md">
          <h4 className="text-xs font-medium text-muted-foreground">Available Tools</h4>
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-slideUp data-[state=open]:animate-slideDown">
        <Command className="rounded-lg border shadow-md overflow-hidden">
          <div className="max-h-[180px] overflow-y-auto scrollbar-none">
        <CommandInput placeholder="Search tools..." className="h-8" />
        <CommandList>
          <CommandEmpty>No tools found.</CommandEmpty>
          <CommandGroup heading="Available Tools">
            {tools.map((tool, index) => (
              <CommandItem
                key={index}
                className="flex items-center gap-2 px-3 py-1.5 cursor-pointer"
              >
                <Wand2 className="h-4 w-4" />
                <div className="flex flex-col">
                  <span className="font-medium">{tool.function.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {tool.function.description}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
          </div>
        </Command>
      </CollapsibleContent>
    </Collapsible>
  );
};
