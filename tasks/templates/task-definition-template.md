# Add support for Task Filtering and Search

## Overview
Add support for filtering tasks by status and searching by title or description.

## Why
Currently, users have to scroll through the entire list to find specific tasks. They need a faster way to locate tasks by status or keywords.

## Assumptions
* The selected filter should persist after page reloads (using URL params via `next/navigation`)
* Search should run client-side for instant feedback (leveraging `useState` and `useMemo`)
* Must integrate with existing TaskBoard columns (TODO, IN_PROGRESS, DONE)
* Should be mobile-responsive using the current Tailwind breakpoints

## Acceptance Criteria
- [] Dropdown for filtering by status (All, Todo, In Progress, Done)
- [] Search field with debounced input
- [] Sync filter state with URL parameters (e.g., ?status=todo&q=search)
- [] Button to clear all filters
- [] Display an empty state when no results are found
- [] Add unit tests for the filtering logic

## Technical Notes
- Update existing component: components/task-board/TaskBoardView.tsx to support filtering and search functionality
- Create new UI components: components/ui/task-controls/TaskFilters.tsx and components/ui/task-controls/TaskSearchInput.tsx
- Leverage existing data model: models/task/TaskItem.ts for task handling and state management

## Plan
<!-- Claude will fill this in during the Plan phase -->

