# Member and Trainer Features Documentation

## Overview
This document describes all the implemented features for members (users), trainers, and admins in the Rise Fitness application, including the relationship management system.

---

## Relationship Management System

### Overview
The application now supports a complete relationship management system between:
- **Admins** ↔ **Trainers** ↔ **Members**
- **Workout Plans** → **Members**
- **Diet Plans** → **Members**

### Admin Capabilities

#### Member Management (`/admin/members/[id]`)
Admins can:
- **Assign Trainers to Members** - Link trainers to manage specific members
- **Assign Workout Plans** - Give members workout programs
- **Assign Diet Plans** - Give members nutrition programs
- **Log Progress** - Record weight, body fat, muscle mass
- **Mark Attendance** - Check in/out members
- **Update Profile** - Modify member's fitness profile

#### Available Actions:
1. Click on any member's name in `/admin/members` to access management
2. Use the assignment modals to link trainers/plans
3. Quick action buttons for attendance and progress logging

### Trainer Capabilities

#### Member Management (`/trainer/members/[id]`)
Trainers can:
- **Assign Workout Plans** - To their assigned members only
- **Assign Diet Plans** - To their assigned members only
- **Log Progress** - Record member progress
- **Mark Attendance** - Check in/out their members
- View member's full profile, history, and current assignments

#### Create Plans
- **Create Workout Plans** (`/trainer/workouts/new`)
- **Create Diet Plans** (`/trainer/diets/new`)

#### Restrictions:
- Trainers can only manage members assigned to them
- All actions are validated server-side

---

## Server Actions (`/app/actions/assignments.ts`)

### Trainer Assignment
```typescript
assignTrainerToMember(trainerId: string, memberId: string)
unassignTrainerFromMember(trainerId: string, memberId: string)
```

### Workout Plan Assignment
```typescript
assignWorkoutPlanToMember(planId: string, memberId: string, durationWeeks?: number)
unassignWorkoutPlanFromMember(memberId: string)
```

### Diet Plan Assignment
```typescript
assignDietPlanToMember(planId: string, memberId: string, durationWeeks?: number)
unassignDietPlanFromMember(memberId: string)
```

### Progress Management
```typescript
logMemberProgress(memberId: string, data: {
  weight_kg: number;
  body_fat_percentage?: number;
  muscle_mass_kg?: number;
  notes?: string;
})
```

### Attendance Management
```typescript
markAttendance(memberId: string, action: 'check_in' | 'check_out')
```

### Profile Updates
```typescript
updateMemberProfile(memberId: string, data: {
  height_cm?: number;
  current_weight_kg?: number;
  target_weight_kg?: number;
  fitness_goal?: string;
  experience_level?: string;
  health_conditions?: string;
})
```

---

## Member Features (User Portal)

### 1. Dashboard (`/user/dashboard`)
- Welcome message with user name
- **Quick Actions Panel** - New!
  - Self check-in/check-out buttons
  - Log own progress
  - Edit own profile
- Current stats (weight, BMI, attendance this month, trainers)
- Active workout and diet plan cards
- Assigned trainer information
- Latest progress summary

### 2. Profile Page (`/user/profile`)
- Displays personal information (name, email, phone)
- Shows physical profile stats (weight, height, BMI, age)
- Displays fitness goals and experience level
- Shows assigned trainer information
- Shows gym membership details

### 3. Workout Page (`/user/workout`)
- View currently active workout plan
- See all exercises with sets, reps, and rest times
- View exercise instructions and notes
- Track workout plan duration
- View history of previous workout plans

### 4. Diet Page (`/user/diet`)
- View currently active diet plan
- See nutritional summary (calories, protein, carbs, fat)
- View meal schedule organized by day and meal type
- Track diet preferences (vegetarian, vegan, etc.)
- View history of previous diet plans

### 5. Attendance Page (`/user/attendance`)
- View attendance statistics (this month, last month, this week)
- Track current attendance streak
- See detailed check-in/check-out times
- View workout session duration
- Motivational streak messages

### 6. Progress Page (`/user/progress`)
- View current weight and BMI stats
- Track progress towards weight goals
- Visual progress bar for goal completion
- View body fat percentage and muscle mass (if recorded)
- Complete progress history log

### 7. Settings Page (`/user/settings`) - New!
- Account information display
- Phone number update
- Theme switcher (Light/Dark/System)
- Sign out button

---

## Member Self-Service (`/app/actions/member-self-service.ts`) - New!

Members can now perform these actions themselves:

### Self Check-In/Out
```typescript
selfCheckIn()      // Check in for today's gym session
selfCheckOut()     // Check out after workout
```

### Log Own Progress
```typescript
logOwnProgress({
  weight_kg: number;
  body_fat_percentage?: number;
  muscle_mass_kg?: number;
  notes?: string;
})
```

### Update Own Profile
```typescript
updateOwnProfile({
  height_cm?: number;
  target_weight_kg?: number;
  fitness_goal?: string;
  experience_level?: string;
  health_conditions?: string;
  phone?: string;
})
```

---

## Trainer Features (Trainer Portal)

### 1. Members List Page (`/trainer/members`)
- View all assigned members in card format
- See member basic stats (weight, BMI, goal)
- Quick search functionality
- View assignment date
- Direct links to member detail pages

### 2. Member Detail Page (`/trainer/members/[id]`)
- **Quick Actions Bar** for:
  - Assigning/changing workout plans
  - Assigning/changing diet plans
  - Logging progress
  - Marking attendance
  - Editing member profile - New!
- Complete member profile view
- Contact information section
- Physical stats overview with gradient cards
- Fitness profile (goals, experience, health conditions)
- Active workout and diet plan summaries
- Recent attendance records
- Recent progress logs

### 3. Workouts Page (`/trainer/workouts`)
- View all workout plans
- See difficulty levels with color coding
- Track how many members are using each plan
- Duration and target muscle groups display
- **Create new workout plans** (`/trainer/workouts/new`)

### 4. Diets Page (`/trainer/diets`)
- View all diet plans
- See macro breakdown (protein, carbs, fat)
- Track calorie targets
- View diet preferences
- Track member usage per plan
- **Create new diet plans** (`/trainer/diets/new`)

### 5. Attendance Page (`/trainer/attendance`)
- View today's check-ins for assigned members
- Stats overview (total members, present today, weekly, monthly)
- Recent attendance history table
- Check-in times and session durations

### 6. Progress Page (`/trainer/progress`)
- Member overview cards with key stats
- Track which members have set goals
- Recent progress logs from all members
- Quick links to member detail pages

---

## Announcement System - New!

### Server Actions (`/app/actions/announcements.ts`)
```typescript
createAnnouncement({
  title: string;
  content: string;
  type?: 'info' | 'warning' | 'success' | 'important';
  ends_at?: string;
})

getActiveAnnouncements()
deleteAnnouncement(announcementId: string)
toggleAnnouncementStatus(announcementId: string)
```

### Components (`/components/announcements.tsx`)
- `AnnouncementBanner` - Displays active announcements with dismiss option
- `CreateAnnouncementForm` - Form for admins to create new announcements

### Features:
- Different types: Info, Warning, Success, Important
- Scheduled start/end dates
- Admin can manage (create, delete, toggle visibility)
- All gym members see active announcements

---

## UI Components

### Assignment Modal (`/components/assignment-modal.tsx`)
Reusable modal for assigning:
- Trainers to members
- Workout plans to members
- Diet plans to members

Features:
- Radio button selection
- Current assignment display with remove option
- Duration selector for plans (weeks)
- Loading states and success/error messages

### Member Quick Actions (`/components/member-quick-actions.tsx`) - New!
Self-service panel for members with:
- Check-in/Check-out buttons with status
- Progress logging form
- Profile update form
- Real-time status messages

### Search Components (`/components/search.tsx`) - New!
- `SearchableList<T>` - Filter any list by multiple keys
- `SearchInput` - Simple search input with clear button

### Progress Chart (`/components/progress-chart.tsx`) - New!
- SVG-based weight chart with gradient area
- Trend indicator (up/down)
- `TrendStat` component for stats with change indicators

### Member Management Client Components
- `/app/admin/members/[id]/client.tsx` - Admin member management
- `/app/trainer/members/[id]/client.tsx` - Trainer member management

Both provide interactive management interfaces with:
- Assignment modals
- Progress logging forms
- Profile editing forms
- Attendance quick actions

---

## Database Tables Used

| Table | Purpose |
|-------|---------|
| `users` | User account information |
| `user_profiles` | Physical stats and fitness goals |
| `trainer_assignments` | Trainer-member relationships |
| `workout_plans` | Workout plan definitions |
| `user_workout_plans` | Assigned workout plans |
| `workout_exercises` | Exercises in workout plans |
| `diet_plans` | Diet plan definitions |
| `user_diet_plans` | Assigned diet plans |
| `diet_plan_meals` | Meals in diet plans |
| `attendance` | Gym check-in/check-out records |
| `progress_logs` | Weight and body composition tracking |
| `announcements` | Gym-wide notifications - New! |

---

## Security & Authorization

### Role-Based Access Control
- **Superuser**: Full system access
- **Admin**: Manage trainers, members, plans within their gym
- **Trainer**: Manage only their assigned members
- **User**: View their own data, self check-in/out, log own progress

### Server-Side Validation
All assignment actions verify:
1. User is authenticated
2. User has appropriate role
3. Trainer is assigned to member (for trainer actions)
4. Resources belong to the same gym

---

## Files Created/Modified

### New Pages:
- `app/user/profile/page.tsx`
- `app/user/workout/page.tsx`
- `app/user/diet/page.tsx`
- `app/user/attendance/page.tsx`
- `app/user/progress/page.tsx`
- `app/user/settings/page.tsx` - New!
- `app/user/settings/client.tsx` - New!
- `app/trainer/members/page.tsx`
- `app/trainer/members/[id]/page.tsx`
- `app/trainer/members/[id]/client.tsx`
- `app/trainer/workouts/page.tsx`
- `app/trainer/workouts/new/page.tsx`
- `app/trainer/diets/page.tsx`
- `app/trainer/diets/new/page.tsx`
- `app/trainer/attendance/page.tsx`
- `app/trainer/progress/page.tsx`
- `app/admin/members/[id]/page.tsx`
- `app/admin/members/[id]/client.tsx`

### New Actions:
- `app/actions/assignments.ts` - Complete assignment management
- `app/actions/member-self-service.ts` - Member self-service actions - New!
- `app/actions/announcements.ts` - Announcement system - New!

### New Components:
- `components/assignment-modal.tsx`
- `components/member-quick-actions.tsx` - New!
- `components/search.tsx` - New!
- `components/progress-chart.tsx` - New!
- `components/announcements.tsx` - New!

### Error/Loading Pages:
- `app/error.tsx`
- `app/not-found.tsx`
- `app/admin/error.tsx`
- `app/trainer/error.tsx`
- `app/trainer/loading.tsx`
- `app/user/error.tsx`
- `app/user/loading.tsx`

### Modified Files:
- `app/api/auth/callback/route.ts` - Fixed redirect issue
- `app/admin/workouts/new/workout-plan-form.tsx` - Added redirectPath prop
- `app/admin/diets/new/diet-plan-form.tsx` - Added redirectPath prop
- `app/admin/members/page.tsx` - Added links to member detail
- `app/user/layout.tsx` - Added Settings link - New!
- `app/user/dashboard/page.tsx` - Added MemberQuickActions - New!
- `supabase/schema.sql` - Added announcements table - New!
