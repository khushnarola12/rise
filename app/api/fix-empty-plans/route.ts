import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Get all plans
    const { data: plans } = await supabaseAdmin.from('workout_plans').select('id, name');
    if (!plans) return NextResponse.json({ error: 'No plans found' });

    // 2. Get all exercises to check which plans explain are empty
    const { data: exercises } = await supabaseAdmin.from('workout_exercises').select('workout_plan_id');
    const existingPlanIds = new Set(exercises?.map(e => e.workout_plan_id));
    
    const emptyPlans = plans.filter(p => !existingPlanIds.has(p.id));

    if (emptyPlans.length === 0) {
      return NextResponse.json({ message: 'No empty plans found.' });
    }

    const updates = [];
    const filledPlanNames = [];

    // 3. Define exercises for map
    const exerciseMap: Record<string, any[]> = {
      'Bodyweight Mastery': [
        { day: 'monday', exercise_name: 'Push-ups', description: 'Chest to floor', sets: 4, reps: 15, rest_seconds: 60, exercise_order: 1, video_url: 'https://www.youtube.com/watch?v=IODxDxX7oi4' },
        { day: 'monday', exercise_name: 'Air Squats', description: 'Full depth', sets: 4, reps: 30, rest_seconds: 60, exercise_order: 2, video_url: 'https://www.youtube.com/watch?v=bEv6CCg2BC8' },
        { day: 'monday', exercise_name: 'Plank', description: 'Hold tight', sets: 3, reps: 60, rest_seconds: 45, exercise_order: 3, video_url: 'https://www.youtube.com/watch?v=ASdvN_XEl_c' }
      ],
      'Powerlifting Prep': [
        { day: 'monday', exercise_name: 'Low Bar Squat', description: 'Competition form', sets: 5, reps: 3, rest_seconds: 240, exercise_order: 1, video_url: 'https://www.youtube.com/watch?v=bEv6CCg2BC8' },
        { day: 'wednesday', exercise_name: 'Bench Press', description: 'Paused reps', sets: 5, reps: 3, rest_seconds: 180, exercise_order: 1, video_url: 'https://www.youtube.com/watch?v=rT7DgCr-3pg' },
        { day: 'friday', exercise_name: 'Deadlift', description: 'Heavy singles', sets: 5, reps: 1, rest_seconds: 300, exercise_order: 1, video_url: 'https://www.youtube.com/watch?v=op9kVnSso6Q' }
      ],
      'Muscle Endurance': [
        { day: 'tuesday', exercise_name: 'Goblet Squat', description: 'Constant tension', sets: 3, reps: 20, rest_seconds: 45, exercise_order: 1, video_url: 'https://www.youtube.com/watch?v=MxsFDhcyFyE' },
        { day: 'tuesday', exercise_name: 'Push-ups', description: 'Burnout set', sets: 3, reps: 20, rest_seconds: 45, exercise_order: 2, video_url: 'https://www.youtube.com/watch?v=IODxDxX7oi4' }
      ],
      'Fat Shredder': [
        { day: 'thursday', exercise_name: 'Burpees', description: 'Full body cardio', sets: 4, reps: 15, rest_seconds: 30, exercise_order: 1, video_url: 'https://www.youtube.com/watch?v=dZgVxmf6jkA' },
        { day: 'thursday', exercise_name: 'Kettlebell Swings', description: 'Hinge movement', sets: 4, reps: 20, rest_seconds: 30, exercise_order: 2, video_url: 'https://www.youtube.com/watch?v=YSxHifyI6s8' }
      ],
      'Functional Fitness': [
        { day: 'monday', exercise_name: 'Farmer Carry', description: 'Heavy DB carry', sets: 3, reps: 60, rest_seconds: 60, exercise_order: 1, video_url: 'https://www.youtube.com/watch?v=rt1l16S-iWc' },
        { day: 'monday', exercise_name: 'Turkish Get Up', description: 'Full body stability', sets: 3, reps: 5, rest_seconds: 90, exercise_order: 2, video_url: 'https://www.youtube.com/watch?v=0bWRPC49-KI' }
      ],
      'Hypertrophy Max': [
        { day: 'wednesday', exercise_name: 'Incline DB Press', description: 'Upper chest', sets: 4, reps: 10, rest_seconds: 60, exercise_order: 1, video_url: 'https://www.youtube.com/watch?v=8iPEnn-ltC8' },
        { day: 'wednesday', exercise_name: 'Lateral Raises', description: 'Side delt cap', sets: 4, reps: 15, rest_seconds: 45, exercise_order: 2, video_url: 'https://www.youtube.com/watch?v=3VcKaXpzqRo' }
      ],
      'Quick 30 Workouts': [
        { day: 'friday', exercise_name: 'Jump Squats', description: 'Fast paced', sets: 3, reps: 15, rest_seconds: 30, exercise_order: 1, video_url: 'https://www.youtube.com/watch?v=A-cFYWvaHr0' }
      ],
      'Olympic Lifting': [
        { day: 'monday', exercise_name: 'Snatch', description: 'Full snatch', sets: 5, reps: 2, rest_seconds: 180, exercise_order: 1, video_url: 'https://www.youtube.com/watch?v=9xQp2sldyts' },
        { day: 'wednesday', exercise_name: 'Clean and Jerk', description: 'Full clean', sets: 5, reps: 2, rest_seconds: 180, exercise_order: 1, video_url: 'https://www.youtube.com/watch?v=8mRYYI-Q6rE' }
      ],
      'Senior Fitness': [
        { day: 'monday', exercise_name: 'Chair Squats', description: 'Sit to stand', sets: 2, reps: 10, rest_seconds: 60, exercise_order: 1, video_url: 'https://www.youtube.com/watch?v=FqSg8_Wf4SY' }
      ],
      'CrossFit Ready': [
        { day: 'tuesday', exercise_name: 'Thrusters', description: 'Squat press', sets: 4, reps: 15, rest_seconds: 60, exercise_order: 1, video_url: 'https://www.youtube.com/watch?v=L219ltL15kk' }
      ],
      'Glute Builder': [
        { day: 'thursday', exercise_name: 'Hip Thrust', description: 'Barbell loaded', sets: 4, reps: 12, rest_seconds: 90, exercise_order: 1, video_url: 'https://www.youtube.com/watch?v=LM8XHLYJoYs' }
      ],
      'Posture Perfect': [
        { day: 'wednesday', exercise_name: 'Face Pulls', description: 'Rear delts', sets: 3, reps: 15, rest_seconds: 60, exercise_order: 1, video_url: 'https://www.youtube.com/watch?v=rep-qVOkqgk' }
      ],
      'Weekend Warrior': [
        { day: 'saturday', exercise_name: 'Full Body Circuit', description: 'Compound moves', sets: 3, reps: 10, rest_seconds: 60, exercise_order: 1, video_url: 'https://www.youtube.com/watch?v=1Sk901ZlqJs' }
      ],
      'German Volume': [
        { day: 'monday', exercise_name: 'Bench Press', description: '10 sets of 10', sets: 10, reps: 10, rest_seconds: 90, exercise_order: 1, video_url: 'https://www.youtube.com/watch?v=rT7DgCr-3pg' }
      ],
      'Yoga Integration': [
        { day: 'sunday', exercise_name: 'Downward Dog', description: 'Stretch', sets: 3, reps: 60, rest_seconds: 30, exercise_order: 1, video_url: 'https://www.youtube.com/watch?v=EC7RGJ975iM' }
      ],
      'Superhero Training': [
        { day: 'monday', exercise_name: 'Incline Press', description: 'Upper chest', sets: 5, reps: 8, rest_seconds: 90, exercise_order: 1, video_url: 'https://www.youtube.com/watch?v=8iPEnn-ltC8' }
      ],
      'Morning Energizer': [
        { day: 'monday', exercise_name: 'Jumping Jacks', description: 'Warmup', sets: 3, reps: 50, rest_seconds: 30, exercise_order: 1, video_url: 'https://www.youtube.com/watch?v=c4DAnQ6DtF8' }
      ],
      'Desk Worker Rescue': [
        { day: 'wednesday', exercise_name: 'Glute Bridge', description: 'Activate glutes', sets: 3, reps: 15, rest_seconds: 45, exercise_order: 1, video_url: 'https://www.youtube.com/watch?v=wPM8icPu6T8' }
      ]
    };

    for (const plan of emptyPlans) {
      const exercisesToAdd = exerciseMap[plan.name];
      if (exercisesToAdd) {
        // Add plan_id to each exercise
        const toInsert = exercisesToAdd.map(e => ({
          ...e,
          workout_plan_id: plan.id
        }));
        
        updates.push(supabaseAdmin.from('workout_exercises').insert(toInsert));
        filledPlanNames.push(plan.name);
      }
    }

    if (updates.length > 0) {
      await Promise.all(updates);
    }

    return NextResponse.json({ 
      success: true, 
      filledCount: updates.length, 
      plans: filledPlanNames 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
