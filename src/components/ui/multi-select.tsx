"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  disabled = false,
  className,
}: MultiSelectProps) {

  const handleSelect = (value: string) => {
    // Check if already selected
    if (selected.includes(value)) {
      return;
    }
    onChange([...selected, value]);
  };

  const handleRemove = (value: string) => {
    onChange(selected.filter((item) => item !== value));
  };

  const availableOptions = options.filter(
    (option) => !selected.includes(option.value)
  );

  return (
    <div className={cn("space-y-2", className)}>
      <Select
        value=""
        onValueChange={handleSelect}
        disabled={disabled || availableOptions.length === 0}
      >
        <SelectTrigger className="w-full">
          <SelectValue
            placeholder={
              availableOptions.length === 0
                ? "All options selected"
                : placeholder
            }
          />
        </SelectTrigger>
        <SelectContent>
          {availableOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((value) => {
            const option = options.find((opt) => opt.value === value);
            return (
              <Badge
                key={value}
                variant="secondary"
                className="gap-1 pr-1"
              >
                {option?.label || value}
                <button
                  type="button"
                  className="ml-1 rounded-sm hover:bg-accent hover:text-accent-foreground"
                  onClick={() => handleRemove(value)}
                  disabled={disabled}
                  aria-label={`Remove ${option?.label || value}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
