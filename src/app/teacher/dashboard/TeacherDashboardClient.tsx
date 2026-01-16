
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Users,
  TrendingUp,
  BookOpen,
  LogOut,
  Loader2,
  BarChart3,
  Award,
  Activity,
} from 'lucide-react';

// ... (Interface definitions remain same as your original)
interface StudentData {
  _id: string;
  name: string;
  email: string;
  studentId: string;
  performance: {
    totalQuestsSolved: number;
    questsSolvedByDifficulty: { beginner: number; intermediate: number; advanced: number; };
  };
}

interface Analytics {
  totalStudents: number;
  totalQuestsSolvedByAll: number;
  averageQuestsSolvedPerStudent: number;
  avgQuestsByDifficulty: { beginner: number; intermediate: number; advanced: number; };
}

export default function TeacherDashboardClient() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('authToken');

    if (!userData || !token) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'teacher') {
      router.push('/');
      return;
    }

    setUser(parsedUser);
    fetchData(token);
  }, [router]);

  const fetchData = async (token: string) => {
    try {
      const [studentsRes, analyticsRes] = await Promise.all([
        fetch('/api/teacher/students', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/teacher/analytics', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (studentsRes.ok) setStudents((await studentsRes.json()).students);
      if (analyticsRes.ok) setAnalytics((await analyticsRes.json()).analytics);
    } catch (err) {
      setError('Failed to load class data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    router.push('/login');
  };

  // Vital check for Recharts and localStorage
  if (!mounted || !user) return null;

  const difficultyChartData = [
    { name: 'Beginner', average: analytics?.avgQuestsByDifficulty.beginner || 0 },
    { name: 'Intermediate', average: analytics?.avgQuestsByDifficulty.intermediate || 0 },
    { name: 'Advanced', average: analytics?.avgQuestsByDifficulty.advanced || 0 },
  ];

  const studentProgressData = students.map((s) => ({
    name: s.name,
    beginner: s.performance.questsSolvedByDifficulty.beginner,
    intermediate: s.performance.questsSolvedByDifficulty.intermediate,
    advanced: s.performance.questsSolvedByDifficulty.advanced,
  }));

  return (
    <div className="min-h-screen bg-slate-50/50">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen /> SQLArcade Teacher
          </h1>
          <Button variant="outline" className="bg-white/10 text-white hover:bg-white/20" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-purple-600" /></div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard title="Total Students" value={analytics?.totalStudents} icon={<Users />} color="text-blue-600" />
              <StatCard title="Total Quests" value={analytics?.totalQuestsSolvedByAll} icon={<TrendingUp />} color="text-green-600" />
              <StatCard title="Avg per Student" value={analytics?.averageQuestsSolvedPerStudent.toFixed(1)} icon={<Award />} color="text-purple-600" />
              <StatCard title="Teacher ID" value={user.teacherId} icon={<Activity />} color="text-pink-600" />
            </div>

            <Tabs defaultValue="analytics">
              <TabsList className="w-full">
                <TabsTrigger value="analytics" className="flex-1">Analytics</TabsTrigger>
                <TabsTrigger value="students" className="flex-1">Student Roster</TabsTrigger>
              </TabsList>

              <TabsContent value="analytics" className="space-y-6 mt-6">
                <Card>
                  <CardHeader><CardTitle>Class Difficulty Progress</CardTitle></CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={difficultyChartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="average" fill="#8884d8" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Individual Student Comparison</CardTitle></CardHeader>
                  <CardContent className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={studentProgressData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="beginner" stackId="a" fill="#10b981" />
                        <Bar dataKey="intermediate" stackId="a" fill="#f59e0b" />
                        <Bar dataKey="advanced" stackId="a" fill="#ef4444" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="students" className="mt-6">
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead className="text-center">Total Solved</TableHead>
                          <TableHead className="text-center">Difficulty (B/I/A)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((s) => (
                          <TableRow key={s._id}>
                            <TableCell className="font-medium">{s.name}</TableCell>
                            <TableCell className="text-center">{s.performance.totalQuestsSolved}</TableCell>
                            <TableCell className="text-center">
                              <span className="text-green-600">{s.performance.questsSolvedByDifficulty.beginner}</span> / 
                              <span className="text-orange-600"> {s.performance.questsSolvedByDifficulty.intermediate}</span> / 
                              <span className="text-red-600"> {s.performance.questsSolvedByDifficulty.advanced}</span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <span className={color}>{icon}</span>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color}`}>{value || 0}</div>
      </CardContent>
    </Card>
  );
}