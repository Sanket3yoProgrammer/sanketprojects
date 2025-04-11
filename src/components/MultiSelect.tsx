import React, { useState, useRef, useEffect } from 'react';
import { Check, X, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

export type Option = {
  value: string;
  label: string;
};

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
  allowCustom?: boolean;
  customValue?: string;
  onCustomChange?: (value: string) => void;
  customPlaceholder?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options",
  className,
  allowCustom = false,
  customValue = "",
  onCustomChange,
  customPlaceholder = "Enter custom value"
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input when the custom option is selected
  useEffect(() => {
    if (customOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [customOpen]);

  const handleSelect = (value: string) => {
    if (value === 'custom') {
      setCustomOpen(!customOpen);
      return;
    }
    
    const newSelected = selected.includes(value)
      ? selected.filter(item => item !== value)
      : [...selected, value];
    
    onChange(newSelected);
  };

  const handleCustomSubmit = () => {
    if (customValue && onCustomChange) {
      onCustomChange(customValue);
      setCustomOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCustomSubmit();
    }
  };

  const removeValue = (value: string) => {
    onChange(selected.filter(item => item !== value));
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between", className, selected.length > 0 ? "h-auto min-h-10" : "")}
          >
            <div className="flex flex-wrap gap-1">
              {selected.length === 0 && <span className="text-muted-foreground">{placeholder}</span>}
              {selected.map((value) => {
                const option = options.find(opt => opt.value === value);
                return (
                  <Badge 
                    key={value}
                    variant="secondary"
                    className="mr-1 mb-1"
                  >
                    {option ? option.label : value}
                    <button
                      className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          removeValue(value);
                        }
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={() => removeValue(value)}
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </button>
                  </Badge>
                );
              })}
            </div>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selected.includes(option.value) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
                {allowCustom && (
                  <CommandItem
                    value="custom"
                    onSelect={() => handleSelect('custom')}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        customOpen ? "opacity-100" : "opacity-0"
                      )}
                    />
                    Other (Custom)
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {allowCustom && customOpen && (
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={customValue}
            onChange={(e) => onCustomChange && onCustomChange(e.target.value)}
            placeholder={customPlaceholder}
            className="input-glass"
            onKeyDown={handleKeyDown}
          />
          <Button 
            type="button" 
            size="sm" 
            onClick={handleCustomSubmit}
            disabled={!customValue}
          >
            Add
          </Button>
        </div>
      )}
    </div>
  );
}

// Project topics options
const TOPICS = [
  { value: "web_design", label: "Web Design" },
  { value: "programming", label: "Programming" },
  { value: "app_development", label: "App Development" },
  { value: "css_design", label: "CSS Design" },
  { value: "ui_ux", label: "UI/UX Design" },
  { value: "game_development", label: "Game Development" },
  { value: "data_science", label: "Data Science" },
  { value: "machine_learning", label: "Machine Learning" },
  { value: "blockchain", label: "Blockchain" },
  { value: "devops", label: "DevOps" },
  { value: "cloud_computing", label: "Cloud Computing" },
  { value: "iot", label: "Internet of Things" },
  { value: "cybersecurity", label: "Cybersecurity" },
  { value: "automation", label: "Automation" },
];

// Project type options
const PROJECT_TYPES = [
  { value: "personal", label: "Personal Project" },
  { value: "fun", label: "Fun Project" },
  { value: "design", label: "Design Project" },
  { value: "practice", label: "Practice Project" },
  { value: "client", label: "Client Project" },
  { value: "group", label: "Group Project" },
  { value: "challenge", label: "Challenge" },
  { value: "school", label: "School Project" },
  { value: "hackathon", label: "Hackathon Project" },
  { value: "open_source", label: "Open Source Contribution" },
  { value: "portfolio", label: "Portfolio Piece" },
];

// Programming languages options
const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "cpp", label: "C++" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "dart", label: "Dart" },
  { value: "html_css", label: "HTML/CSS" },
  { value: "sql", label: "SQL" },
  { value: "bash", label: "Bash/Shell" },
  { value: "r", label: "R" },
  { value: "scala", label: "Scala" },
  { value: "perl", label: "Perl" },
  { value: "haskell", label: "Haskell" },
  { value: "lua", label: "Lua" },
  { value: "assembly", label: "Assembly" },
];

export { TOPICS, PROJECT_TYPES, LANGUAGES };
