import { connectDB } from '@/lib/mongodb';
import { Student } from '@/lib/auth-models';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('authToken')?.value || request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || (decoded as any).role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { questId, questTitle, difficulty, timeTaken } = await request.json();

    if (!questId || !questTitle || !difficulty) {
      return NextResponse.json(
        { error: 'questId, questTitle, and difficulty are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const student = await Student.findById((decoded as any).userId);

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Check if quest already completed
    const alreadyCompleted = student.completedQuests.some((q: { questId: any; }) => q.questId === questId);
    if (alreadyCompleted) {
      return NextResponse.json(
        { error: 'Quest already completed' },
        { status: 400 }
      );
    }

    // Update student performance
    student.performance.totalQuestsSolved += 1;
    student.performance.totalTimeSolving += timeTaken || 0;

    const difficultyKey = difficulty.toLowerCase();
    if (difficultyKey in student.performance.questsSolvedByDifficulty) {
      student.performance.questsSolvedByDifficulty[difficultyKey as keyof typeof student.performance.questsSolvedByDifficulty]++;
    }

    // Add to completed quests
    student.completedQuests.push({
      questId,
      questTitle,
      difficulty,
      completedAt: new Date(),
      timeTaken: timeTaken || 0,
    });

    await student.save();

    return NextResponse.json({
      success: true,
      performance: student.performance,
    });
  } catch (error) {
    console.error('Error updating performance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
