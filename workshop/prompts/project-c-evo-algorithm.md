# Project C: Evolutionary Algorithm Playground

## What You'll Build

A visual genetic algorithm that evolves rectangle packing layouts in real-time.

## Setup

No data files needed - everything is procedurally generated.

---

## Starter Prompt

```
Create a web page that runs a genetic algorithm to pack colored rectangles
into a 800x600 canvas with minimal overlap and wasted space. Show the
current best layout animated in real-time. Display generation count and
fitness score. Use a dark theme. Add start/stop/reset buttons.
```

---

## Advanced: React + shadcn Version

If you set up a Vite + React project (see Part 2b in the README), try this starter instead:

```
Create a React page using shadcn components that runs a genetic algorithm
to pack colored rectangles into a 800x600 canvas with minimal overlap and
wasted space. Show the current best layout animated in real-time. Display
generation count and fitness score in a shadcn Card. Use a dark theme.
Add start/stop/reset buttons using shadcn Button.
```

---

## Next Steps

Try these one at a time, after each previous step is working:

### Step 2: Settings Panel

```
Add a settings panel to adjust population size, mutation rate, and crossover rate
```

### Step 3: Fitness Chart

```
Show a fitness-over-time chart next to the canvas using Chart.js
```

### Step 4: Multi-Objective

```
Add a second objective: minimize total perimeter, and show a Pareto front
```

---

## Bonus Ideas

- *"Add a 'hall of fame' that saves the top 5 best solutions found"*
- *"Let me draw custom target shapes instead of rectangles"*
- *"Add a comparison mode: run two different configurations side by side"*
