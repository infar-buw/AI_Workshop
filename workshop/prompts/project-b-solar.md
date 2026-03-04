# Project B: Solar Position Dashboard

## What You'll Build

A professional solar analysis tool with a sun path diagram and shadow visualization for Weimar.

## Setup

No data files needed for the basic version. For Step 3, copy `building-footprints.geojson` from `workshop/data/`.

---

## Starter Prompt

```
Create a web page with a solar position calculator. Show a sun path diagram
(stereographic projection) for latitude 50.98, longitude 11.33 (Weimar).
Add a date picker and time slider. Show the current sun azimuth and altitude.
Draw it with SVG. Make it look professional with a dark theme.
```

---

## Advanced: React + shadcn Version

If you set up a Vite + React project (see Part 2b in the README), try this starter instead:

```
Create a React page using shadcn components with a solar position calculator.
Show a sun path diagram (stereographic projection) for latitude 50.98,
longitude 11.33 (Weimar). Use shadcn's date picker and a Slider for time.
Show the current sun azimuth and altitude in a Card. Draw the diagram with
SVG. Use a dark theme.
```

---

## Next Steps

Try these one at a time, after each previous step is working:

### Step 2: Shadow Direction

```
Add a 2D map view next to the sun path diagram showing shadow direction as an arrow
```

### Step 3: Building Shadows

```
Load building-footprints.geojson and show approximate shadow projections on the map
```

### Step 4: Animation

```
Add an animation button that cycles through the hours of the day
```

---

## Bonus Ideas

- *"Add a second location (e.g., Munich) and show both sun paths side by side"*
- *"Show total sunlight hours for each month as a bar chart"*
- *"Add an analemma diagram showing the sun's position at noon throughout the year"*
