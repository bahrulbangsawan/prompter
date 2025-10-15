"use client"

import * as React from "react"
import {
	CheckIcon,
	XCircle,
	ChevronDown,
	XIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command"

// Use React's built-in useId hook for React 18+ compatibility
// If not available, provide a simple fallback that doesn't cause hydration issues
const useId = () => {
	try {
		// Try to use React's built-in useId first (React 18+)
		const reactId = React.useId();
		return `multi-select-${reactId}`;
	} catch {
		// Fallback for older React versions - use a simple ref-based approach
		const ref = React.useRef<number | null>(null);
		if (ref.current === null) {
			// Use a fixed number to avoid hydration mismatches
			ref.current = 0;
		}
		return `multi-select-fixed-${ref.current}`;
	}
};

// Performance optimizations
const DEBOUNCE_DELAY = 150; // Reduced for better responsiveness
const VIRTUAL_LIST_HEIGHT = 240; // Optimized height for better UX
const ITEM_HEIGHT = 32;
const VISIBLE_ITEMS_COUNT = 5; // Show 5 items max in dropdown with scrolling for remaining options
const SEARCH_HEIGHT = 40; // Height for search input
const ACTIONS_HEIGHT = 40; // Height for action buttons
const DROPDOWN_MAX_HEIGHT = (VISIBLE_ITEMS_COUNT * ITEM_HEIGHT) + SEARCH_HEIGHT + ACTIONS_HEIGHT + 16; // 16px for padding
const VIRTUAL_SCROLLING_THRESHOLD = 20; // Enable virtual scrolling for lists with 20+ items

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
	const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

	React.useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);

	return debouncedValue;
}

// Virtual list component for performance
interface VirtualListProps {
	items: Array<{ value: string; label: string; disabled?: boolean }>;
	selectedValues: string[];
	onToggle: (value: string) => void;
	height?: number;
	itemHeight?: number;
}

const VirtualList = React.memo(({
	items,
	selectedValues,
	onToggle,
	height = VIRTUAL_LIST_HEIGHT,
	itemHeight = ITEM_HEIGHT
}: VirtualListProps) => {
	const containerHeight = React.useState(height)[0];
	const visibleCount = Math.ceil(containerHeight / itemHeight);
	const [startIndex, setStartIndex] = React.useState(0);
	const [endIndex, setEndIndex] = React.useState(visibleCount);
	const containerRef = React.useRef<HTMLDivElement>(null);

	const visibleItems = React.useMemo(() => {
		return items.slice(startIndex, endIndex);
	}, [items, startIndex, endIndex]);

	const handleScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
		const scrollTop = e.currentTarget.scrollTop;
		const newStartIndex = Math.floor(scrollTop / itemHeight);
		const newEndIndex = Math.min(newStartIndex + visibleCount + 1, items.length);

		setStartIndex(newStartIndex);
		setEndIndex(newEndIndex);
	}, [itemHeight, visibleCount, items.length]);

	const handleKeyDown = React.useCallback((e: React.KeyboardEvent, itemValue: string) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			onToggle(itemValue);
		}
	}, [onToggle]);

	return (
		<div
			ref={containerRef}
			className="overflow-y-auto focus:outline-none"
			style={{ height: containerHeight }}
			onScroll={handleScroll}
			role="listbox"
			aria-label="Available options"
		>
			<div style={{ height: items.length * itemHeight, position: 'relative' }}>
				<div style={{ transform: `translateY(${startIndex * itemHeight}px)` }}>
					{visibleItems.map((item, index) => {
						const isSelected = selectedValues.includes(item.value);
						const globalIndex = startIndex + index;
						return (
							<div
								key={item.value}
								style={{ height: itemHeight }}
								className={cn(
									"flex items-center px-2 py-1 cursor-pointer hover:bg-accent rounded-sm outline-none",
									"focus:bg-accent focus:ring-1 focus:ring-ring",
									item.disabled && "opacity-50 cursor-not-allowed",
									isSelected && "bg-accent"
								)}
								onClick={() => !item.disabled && onToggle(item.value)}
								onKeyDown={(e) => !item.disabled && handleKeyDown(e, item.value)}
								role="option"
								aria-selected={isSelected}
								aria-disabled={item.disabled || false}
								tabIndex={item.disabled ? -1 : 0}
							>
								<div className="mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary">
									{isSelected && (
										<CheckIcon className="h-3 w-3" />
									)}
								</div>
								<span className="text-sm">{item.label}</span>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
});

VirtualList.displayName = 'VirtualList';

/**
 * Optimized MultiSelect Component with performance improvements
 */
export interface OptimizedMultiSelectOption {
	/** The text to display for the option. */
	label: string;
	/** The unique value associated with the option. */
	value: string;
	/** Whether this option is disabled */
	disabled?: boolean;
}

export interface OptimizedMultiSelectProps
	extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "animationConfig"> {
	/** Array of option objects to be displayed */
	options: OptimizedMultiSelectOption[];
	/** Callback function triggered when the selected values change */
	onValueChange: (value: string[]) => void;
	/** The default selected values when the component mounts */
	defaultValue?: string[];
	/** Placeholder text to be displayed when no values are selected */
	placeholder?: string;
	/** Maximum number of items to display. Extra selected items will be summarized */
	maxCount?: number;
	/** Additional class names to apply custom styles */
	className?: string;
	/** If true, disables the component completely */
	disabled?: boolean;
	/** If true, shows search functionality in the popover */
	searchable?: boolean;
	/** Custom empty state message when no options match search */
	emptyIndicator?: React.ReactNode;
	/** If true, enables virtual scrolling for large lists */
	virtualScrolling?: boolean;
	/** Height of virtual list container */
	virtualHeight?: number;
}

export const OptimizedMultiSelect = React.forwardRef<
	HTMLButtonElement,
	OptimizedMultiSelectProps
>(
	(
		{
			options,
			onValueChange,
			defaultValue = [],
			placeholder = "Select options",
			maxCount = 3,
			className,
			disabled = false,
			searchable = true,
			emptyIndicator,
			virtualScrolling = false,
			virtualHeight = VIRTUAL_LIST_HEIGHT,
			...props
		},
		ref
	) => {
		const [selectedValues, setSelectedValues] = React.useState<string[]>(defaultValue);
		const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
		const [searchValue, setSearchValue] = React.useState("");

		// Debounced search value for performance
		const debouncedSearchValue = useDebounce(searchValue, DEBOUNCE_DELAY);

		const multiSelectId = useId();
		const listboxId = `${multiSelectId}-listbox`;
		const triggerDescriptionId = `${multiSelectId}-description`;

		// Filter options based on search with improved fuzzy matching
		const filteredOptions = React.useMemo(() => {
			if (!searchable || !debouncedSearchValue) return options;

			const searchLower = debouncedSearchValue.toLowerCase();

			return options.filter((option) => {
				const labelLower = option.label.toLowerCase();
				const valueLower = option.value.toLowerCase();

				// Exact match gets highest priority
				if (labelLower === searchLower || valueLower === searchLower) {
					return true;
				}

				// Starts with match
				if (labelLower.startsWith(searchLower) || valueLower.startsWith(searchLower)) {
					return true;
				}

				// Contains match
				if (labelLower.includes(searchLower) || valueLower.includes(searchLower)) {
					return true;
				}

				// Fuzzy matching for better UX
				const searchWords = searchLower.split(' ');
				return searchWords.every(word =>
					labelLower.includes(word) || valueLower.includes(word)
				);
			});
		}, [options, debouncedSearchValue, searchable]);

		// Memoized handlers
		const toggleOption = React.useCallback((optionValue: string) => {
			if (disabled) return;
			const option = options.find((opt) => opt.value === optionValue);
			if (option?.disabled) return;

			const newSelectedValues = selectedValues.includes(optionValue)
				? selectedValues.filter((value) => value !== optionValue)
				: [...selectedValues, optionValue];

			setSelectedValues(newSelectedValues);
			onValueChange(newSelectedValues);
		}, [disabled, options, selectedValues, onValueChange]);

		const handleClear = React.useCallback(() => {
			if (disabled) return;
			setSelectedValues([]);
			onValueChange([]);
		}, [disabled, onValueChange]);

		const handleTogglePopover = React.useCallback(() => {
			if (disabled) return;
			setIsPopoverOpen((prev) => !prev);
		}, [disabled]);

		// Reset search when popover closes
		React.useEffect(() => {
			if (!isPopoverOpen) {
				setSearchValue("");
			}
		}, [isPopoverOpen]);

		// Sync with default value changes (avoid hydration issues)
		React.useEffect(() => {
			// Only sync if the arrays are different in length or content
			if (selectedValues.length !== defaultValue.length ||
					!selectedValues.every((val, idx) => val === defaultValue[idx])) {
				setSelectedValues(defaultValue);
			}
		}, [defaultValue]);

		// Get selected option labels
		const selectedOptions = React.useMemo(() => {
			return selectedValues
				.map(value => options.find(opt => opt.value === value))
				.filter(Boolean) as OptimizedMultiSelectOption[];
		}, [selectedValues, options]);

		return (
			<Popover
				open={isPopoverOpen}
				onOpenChange={setIsPopoverOpen}
				modal={false}
			>
				<PopoverTrigger asChild>
					<Button
						ref={ref}
						{...props}
						onClick={handleTogglePopover}
						disabled={disabled}
						role="combobox"
						aria-expanded={isPopoverOpen}
						aria-haspopup="listbox"
						aria-controls={isPopoverOpen ? listboxId : undefined}
						aria-describedby={triggerDescriptionId}
						className={cn(
							"flex p-1 rounded-md border min-h-10 h-auto items-center justify-between bg-inherit hover:bg-inherit",
							"w-full",
							disabled && "opacity-50 cursor-not-allowed",
							className
						)}
					>
						{selectedValues.length > 0 ? (
							<div className="flex justify-between items-center w-full">
								<div className="flex items-center gap-1 flex-wrap">
									{selectedOptions
										.slice(0, maxCount)
										.map((option) => (
											<Badge
												key={option.value}
												variant="secondary"
												className="mr-1 mb-1"
											>
												{option.label}
												<div
													role="button"
													tabIndex={0}
													onClick={(event) => {
														event.stopPropagation();
														toggleOption(option.value);
													}}
													onKeyDown={(event) => {
														if (
															event.key === "Enter" ||
															event.key === " "
														) {
															event.preventDefault();
															event.stopPropagation();
															toggleOption(option.value);
														}
													}}
													className="ml-2 h-3 w-3 cursor-pointer hover:bg-white/20 rounded-sm"
												>
													<XCircle className="h-3 w-3" />
												</div>
											</Badge>
										))}
									{selectedValues.length > maxCount && (
										<Badge variant="outline" className="mr-1 mb-1">
											+{selectedValues.length - maxCount} more
										</Badge>
									)}
								</div>
								<div className="flex items-center justify-between">
									<div
										role="button"
										tabIndex={0}
										onClick={(event) => {
											event.stopPropagation();
											handleClear();
										}}
										onKeyDown={(event) => {
											if (event.key === "Enter" || event.key === " ") {
												event.preventDefault();
												event.stopPropagation();
												handleClear();
											}
										}}
										className="flex items-center justify-center h-4 w-4 mx-2 cursor-pointer text-muted-foreground hover:text-foreground"
									>
										<XIcon className="h-4 w-4" />
									</div>
									<Separator orientation="vertical" className="flex min-h-6 h-full mx-1" />
									<ChevronDown className="h-4 mx-2 cursor-pointer text-muted-foreground" />
								</div>
							</div>
						) : (
							<div className="flex items-center justify-between w-full mx-auto">
								<span className="text-sm text-muted-foreground mx-3">
									{placeholder}
								</span>
								<ChevronDown className="h-4 cursor-pointer text-muted-foreground mx-2" />
							</div>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent
					id={listboxId}
					role="listbox"
					aria-multiselectable="true"
					className={cn(
						"w-auto p-0 overflow-hidden",
						// Use consistent max-height for all dropdowns
						"max-h-[256px]"
					)}
					align="start"
					onEscapeKeyDown={() => setIsPopoverOpen(false)}
					side="bottom"
					sideOffset={4}
				>
					<Command>
						{searchable && (
							<CommandInput
								placeholder="Search options..."
								value={searchValue}
								onValueChange={setSearchValue}
								aria-label="Search through available options"
							/>
						)}
						<CommandList className={cn(
							"p-1",
							// Apply consistent scrolling for all lists
							"max-h-[160px] overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
						)}>
							<CommandEmpty>
								{emptyIndicator || "No results found."}
							</CommandEmpty>
							{filteredOptions.length === 0 ? (
								<CommandEmpty>No options available.</CommandEmpty>
							) : virtualScrolling && filteredOptions.length > VIRTUAL_SCROLLING_THRESHOLD ? (
								<VirtualList
									items={filteredOptions}
									selectedValues={selectedValues}
									onToggle={toggleOption}
									height={160}
								/>
							) : (
								<CommandGroup>
									{filteredOptions.map((option) => {
										const isSelected = selectedValues.includes(option.value);
										return (
											<CommandItem
												key={option.value}
												onSelect={() => toggleOption(option.value)}
												disabled={option.disabled}
												className={cn(
													"cursor-pointer outline-none",
													"focus:bg-accent focus:ring-1 focus:ring-ring",
													option.disabled && "opacity-50 cursor-not-allowed"
												)}
											>
												<div
													className={cn(
														"mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
														isSelected
															? "bg-primary text-primary-foreground"
															: "opacity-50 [&_svg]:invisible"
													)}
												>
													<CheckIcon className="h-4 w-4" />
												</div>
												<span>{option.label}</span>
											</CommandItem>
										);
									})}
								</CommandGroup>
							)}
							<CommandSeparator />
							<CommandGroup>
								<div className="flex items-center justify-between">
									{selectedValues.length > 0 && (
										<>
											<CommandItem
												onSelect={handleClear}
												className="flex-1 justify-center cursor-pointer"
											>
												Clear
											</CommandItem>
											<Separator orientation="vertical" className="flex min-h-6 h-full" />
										</>
									)}
									<CommandItem
										onSelect={() => setIsPopoverOpen(false)}
										className="flex-1 justify-center cursor-pointer"
									>
										Close
									</CommandItem>
								</div>
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		)
	}
);

OptimizedMultiSelect.displayName = "OptimizedMultiSelect";
export type { OptimizedMultiSelectOption, OptimizedMultiSelectProps };