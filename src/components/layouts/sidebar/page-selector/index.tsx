/* eslint-disable @typescript-eslint/no-empty-object-type */
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
	Files,
	Search,
	GitBranch,
	Settings,
	Bug,
	PuzzleIcon,
} from "lucide-react";
import React, { useState } from "react";

type Props = {};

const PageSelector = ({}: Props) => {
	const [activeItem, setActiveItem] = useState<string>("explorer");

	const handleClick = (itemName: string) => {
		setActiveItem(itemName);
	};

	const menuItems = [
		{ id: "explorer", icon: Files, tooltip: "Explorateur" },
		{ id: "search", icon: Search, tooltip: "Rechercher" },
		{ id: "git", icon: GitBranch, tooltip: "Contrôle de source" },
		{ id: "debug", icon: Bug, tooltip: "Débogage" },
		{ id: "extensions", icon: PuzzleIcon, tooltip: "Extensions" },
		{
			id: "settings",
			icon: Settings,
			tooltip: "Paramètres",
			position: "bottom",
		},
	];

	return (
		<div className="flex flex-col items-center w-[48px] h-full bg-gray-100 border-gray-200 dark:bg-neutral-900 border-r dark:border-neutral-800 pt-1 pb-1">
			{menuItems.map((item) =>
				item.position === "bottom" ? null : (
					<TooltipProvider key={item.id}>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant={"ghost"}
									size={"icon"}
									className={cn(
										"mb-1 h-12 w-12 rounded-none hover:bg-transparent dark:hover:bg-transparent group/button relative",
										{
											"after:absolute after:left-0 after:top-0 after:h-full after:w-0.5 after:bg-blue-500":
												activeItem === item.id,
										}
									)}
									onClick={() => handleClick(item.id)}
								>
									<item.icon
										className={cn(
											"group-hover/button:text-neutral-700 group-hover/button:dark:text-white size-6",
											activeItem === item.id
												? "text-neutral-700 dark:text-white"
												: "text-neutral-500 dark:text-neutral-400"
										)}
									/>
								</Button>
							</TooltipTrigger>
							<TooltipContent side="right">
								<p>{item.tooltip}</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				)
			)}

			<div className="flex-grow"></div>

			{menuItems
				.filter((item) => item.position === "bottom")
				.map((item) => (
					<TooltipProvider key={item.id}>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant={"ghost"}
									size={"icon"}
									className={cn(
										"mb-1 h-12 w-12 rounded-none hover:bg-transparent dark:hover:bg-transparent group/button relative",
										{
											"after:absolute after:left-0 after:top-0 after:h-full after:w-0.5 after:bg-blue-500":
												activeItem === item.id,
										}
									)}
									onClick={() => handleClick(item.id)}
								>
									<item.icon
										className={cn(
											"group-hover/button:text-neutral-700 group-hover/button:dark:text-white size-6",
											activeItem === item.id
												? "text-neutral-700 dark:text-white"
												: "text-neutral-500 dark:text-neutral-400"
										)}
									/>
								</Button>
							</TooltipTrigger>
							<TooltipContent side="right">
								<p>{item.tooltip}</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				))}
		</div>
	);
};

export default PageSelector;
