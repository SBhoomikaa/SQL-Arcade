import { connectDB } from '@/lib/mongodb';
import { Student } from '@/lib/auth-models';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('authToken')?.value || request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || (decoded as any).role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const student = await Student.findById((decoded as any).userId).select(
      'name email studentId performance completedQuests'
    );

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      student,
    });

  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
