# UI & Styling Customization Guide

## Tailwind CSS Configuration

The project uses Tailwind CSS 4 with custom configurations. Customize your theme:

### Color Scheme

Edit colors in your components or create a `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        // Primary brand color
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        // Secondary accent
        secondary: {
          50: '#f5f3ff',
          500: '#a78bfa',
          600: '#9333ea',
        },
        // Custom colors for scheduling
        scheduled: '#10b981',
        conflict: '#ef4444',
        pending: '#f59e0b',
      },
      // Custom spacing
      spacing: {
        'slot': '60px',  // For timetable slots
        'timeline': '100px',  // For timeline width
      },
      // Custom typography
      fontFamily: {
        'display': ['Inter var', 'sans-serif'],
      },
    },
  },
};
```

## Component Styling

### Button Variants

```tsx
import { Button } from '@/components/ui/button';

export function ButtonExamples() {
  return (
    <div className="space-y-4">
      {/* Primary */}
      <Button>Primary Action</Button>
      
      {/* Secondary */}
      <Button variant="secondary">Secondary Action</Button>
      
      {/* Outline */}
      <Button variant="outline">Outline Button</Button>
      
      {/* Ghost */}
      <Button variant="ghost">Ghost Button</Button>
      
      {/* Destructive */}
      <Button variant="destructive">Delete</Button>
      
      {/* Disabled */}
      <Button disabled>Disabled Button</Button>
      
      {/* With Loading */}
      <Button disabled>
        <Spinner className="mr-2" />
        Loading...
      </Button>
    </div>
  );
}
```

### Card Styling

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function CardExamples() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Simple Card */}
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Content goes here</p>
        </CardContent>
      </Card>
      
      {/* Hoverable Card */}
      <Card className="hover:border-primary/50 hover:shadow-lg transition-all">
        <CardHeader>
          <CardTitle>Interactive Card</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Hover me</p>
        </CardContent>
      </Card>
      
      {/* Status Card */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="text-green-700">Success</CardTitle>
        </CardHeader>
        <CardContent>
          <p>All conflicts resolved</p>
        </CardContent>
      </Card>
    </div>
  );
}
```

## Layout Patterns

### Responsive Grid

```tsx
export function ResponsiveGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {/* Items automatically stack on mobile */}
    </div>
  );
}
```

### Sidebar Layout

```tsx
export function SidebarLayout() {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white overflow-y-auto">
        <nav className="space-y-1 p-4">
          <a href="#" className="block px-4 py-2 rounded-lg hover:bg-slate-800">
            Navigation Item
          </a>
        </nav>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Content */}
        </div>
      </main>
    </div>
  );
}
```

### Dashboard Grid

```tsx
export function DashboardLayout() {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {/* Stat Cards */}
      {stats.map(stat => (
        <Card key={stat.label}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {stat.label}
            </CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

## Timetable Grid Styling

```tsx
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

export function TimetableGrid({ assignments }: { assignments: Assignment[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-slate-300">
        <thead>
          <tr className="bg-slate-100">
            <th className="border p-2 w-20">Time</th>
            {DAYS.map(day => (
              <th key={day} className="border p-2 w-32 font-semibold">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERIODS.map(period => (
            <tr key={period} className="hover:bg-slate-50">
              <td className="border p-2 font-mono text-sm bg-slate-50">
                Period {period}
              </td>
              {DAYS.map((day, dayIdx) => {
                const assignment = assignments.find(
                  a => a.day === dayIdx + 1 && a.period === period
                );
                
                return (
                  <td
                    key={`${day}-${period}`}
                    className={`border p-2 text-sm ${
                      assignment
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-white'
                    }`}
                  >
                    {assignment ? (
                      <div className="space-y-1">
                        <div className="font-semibold">
                          {assignment.course.code}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {assignment.classroom.name}
                        </div>
                      </div>
                    ) : null}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## Form Styling

### Standard Form

```tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';

export function LecturerForm() {
  const { register, handleSubmit } = useForm();
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      {/* Name Field */}
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          placeholder="Dr. Jane Doe"
          {...register('name')}
        />
      </div>
      
      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="jane@university.edu"
          {...register('email')}
        />
      </div>
      
      {/* Department Select */}
      <div className="space-y-2">
        <Label htmlFor="department">Department</Label>
        <select
          id="department"
          className="w-full px-3 py-2 border border-slate-300 rounded-md"
          {...register('department')}
        >
          <option>Computer Science</option>
          <option>Mathematics</option>
          <option>Physics</option>
        </select>
      </div>
      
      {/* Submit Button */}
      <Button type="submit" className="w-full">
        Save Lecturer
      </Button>
    </form>
  );
}
```

## Dark Mode Support

Tailwind CSS automatically supports dark mode. Components will respect system preference:

```tsx
export function DarkModeExample() {
  return (
    <div className="bg-white dark:bg-slate-900 p-4">
      <h1 className="text-black dark:text-white">
        Content adapts to dark mode
      </h1>
      <p className="text-slate-600 dark:text-slate-400">
        And so does text
      </p>
    </div>
  );
}
```

Force dark mode:

```html
<!-- In index.html -->
<html class="dark">
  ...
</html>
```

## Animations

### Fade In

```tsx
<div className="animate-fade-in">
  Content fades in on load
</div>
```

### Slide In

```tsx
<div className="animate-slide-in-up">
  Content slides in from bottom
</div>
```

### Pulse (Loading)

```tsx
<div className="animate-pulse">
  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
</div>
```

### Bounce

```tsx
<div className="animate-bounce">
  Bouncing element
</div>
```

## Responsive Typography

```tsx
export function ResponsiveText() {
  return (
    <>
      {/* Heading that scales */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
        Responsive Title
      </h1>
      
      {/* Text that adapts */}
      <p className="text-sm md:text-base lg:text-lg">
        Responsive paragraph
      </p>
    </>
  );
}
```

## Custom CSS Classes

For complex styling, add custom CSS to `src/styles.css`:

```css
/* Timetable specific styles */
.timetable-slot {
  @apply p-3 border rounded-lg hover:shadow-md transition-shadow;
  min-height: 80px;
}

.timetable-slot.assigned {
  @apply bg-blue-50 border-blue-300;
}

.timetable-slot.conflict {
  @apply bg-red-50 border-red-300;
}

/* Custom animations */
@keyframes slide-in-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-in-up {
  animation: slide-in-up 0.3s ease-out;
}
```

## Accessibility

### Semantic HTML

```tsx
export function AccessibleForm() {
  return (
    <form aria-label="Create new course">
      <fieldset>
        <legend>Course Details</legend>
        
        <label htmlFor="code">
          Course Code (required)
        </label>
        <input
          id="code"
          type="text"
          required
          aria-required="true"
        />
        
        <button type="submit" aria-label="Save course">
          Save
        </button>
      </fieldset>
    </form>
  );
}
```

### Focus States

```css
button:focus-visible {
  @apply outline-2 outline-offset-2 outline-blue-500;
}

input:focus-visible {
  @apply ring-2 ring-blue-500 ring-offset-2;
}
```

### Color Contrast

Always ensure sufficient contrast:
- Foreground: >= 4.5:1 (normal text)
- Large text (18pt+): >= 3:1

## Performance Tips

1. **Use `clsx` for conditional classes**:
```tsx
import clsx from 'clsx';

<div className={clsx('p-4', {
  'bg-red-100': isError,
  'bg-green-100': isSuccess,
})}>
  Content
</div>
```

2. **Lazy load images**:
```tsx
<img loading="lazy" src="..." alt="..." />
```

3. **Optimize animations**:
```css
/* Use transform instead of top/left */
.animate {
  transform: translateY(-10px);
}
```

---

For more Tailwind CSS resources:
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Radix UI Components](https://www.radix-ui.com)
- [Tailwind UI Gallery](https://tailwindui.com)
