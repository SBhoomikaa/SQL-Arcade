// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';
// import { Badge } from '@/components/ui/badge';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   LineChart,
//   Line,
// } from 'recharts';
// import {
//   Users,
//   TrendingUp,
//   BookOpen,
//   LogOut,
//   Loader2,
//   BarChart3,
//   Award,
//   Activity,
// } from 'lucide-react';

// interface StudentData {
//   _id: string;
//   name: string;
//   email: string;
//   studentId: string;
//   class: string;
//   section: string;
//   semester: string;
//   performance: {
//     totalQuestsSolved: number;
//     questsSolvedByDifficulty: {
//       beginner: number;
//       intermediate: number;
//       advanced: number;
//     };
//   };
//   completedQuests: any[];
// }

// interface Analytics {
//   totalStudents: number;
//   totalQuestsSolvedByAll: number;
//   averageQuestsSolvedPerStudent: number;
//   avgQuestsByDifficulty: {
//     beginner: number;
//     intermediate: number;
//     advanced: number;
//   };
// }

// export default function TeacherDashboard() {
//   const router = useRouter();
//   const [user, setUser] = useState<any>(null);
//   const [students, setStudents] = useState<StudentData[]>([]);
//   const [analytics, setAnalytics] = useState<Analytics | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const userData = localStorage.getItem('user');
//     const token = localStorage.getItem('authToken');

//     if (!userData || !token) {
//       router.push('/login');
//       return;
//     }

//     const parsedUser = JSON.parse(userData);
//     if (parsedUser.role !== 'teacher') {
//       router.push('/');
//       return;
//     }

//     setUser(parsedUser);
//     fetchData(token);
//   }, [router]);

//   const fetchData = async (token: string) => {
//     try {
//       setLoading(true);
//       const [studentsRes, analyticsRes] = await Promise.all([
//         fetch('/api/teacher/students', {
//           headers: { Authorization: `Bearer ${token}` },
//         }),
//         fetch('/api/teacher/analytics', {
//           headers: { Authorization: `Bearer ${token}` },
//         }),
//       ]);

//       if (studentsRes.ok) {
//         const studentsData = await studentsRes.json();
//         setStudents(studentsData.students);
//       }

//       if (analyticsRes.ok) {
//         const analyticsData = await analyticsRes.json();
//         setAnalytics(analyticsData.analytics);
//       }
//     } catch (err) {
//       setError('Failed to load data');
//       console.error('Error fetching data:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('authToken');
//     localStorage.removeItem('user');
//     router.push('/login');
//   };

//   if (!user) {
//     return null;
//   }

//   const difficultyChartData = [
//     {
//       name: 'Beginner',
//       average: analytics?.avgQuestsByDifficulty.beginner || 0,
//       fill: '#10b981',
//     },
//     {
//       name: 'Intermediate',
//       average: analytics?.avgQuestsByDifficulty.intermediate || 0,
//       fill: '#f59e0b',
//     },
//     {
//       name: 'Advanced',
//       average: analytics?.avgQuestsByDifficulty.advanced || 0,
//       fill: '#ef4444',
//     },
//   ];

//   const studentProgressData = students.map((student) => ({
//     name: student.name,
//     beginner: student.performance.questsSolvedByDifficulty.beginner,
//     intermediate: student.performance.questsSolvedByDifficulty.intermediate,
//     advanced: student.performance.questsSolvedByDifficulty.advanced,
//     total: student.performance.totalQuestsSolved,
//   }));

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
//       {/* Header */}
//       <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg sticky top-0 z-50">
//         <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
//           <div>
//             <h1 className="text-3xl font-bold flex items-center gap-2">
//               <BookOpen className="w-8 h-8" />
//               SQLArcade Teacher Dashboard
//             </h1>
//             <p className="text-white/80 mt-1">Welcome, {user.name}</p>
//           </div>
//           <Button
//             variant="outline"
//             className="bg-white/20 border-white/40 text-white hover:bg-white/30"
//             onClick={handleLogout}
//           >
//             <LogOut className="w-4 h-4 mr-2" />
//             Logout
//           </Button>
//         </div>
//       </header>

//       <main className="max-w-7xl mx-auto px-6 py-8">
//         {error && (
//           <Alert className="mb-6 border-red-200 bg-red-50">
//             <AlertDescription className="text-red-600">{error}</AlertDescription>
//           </Alert>
//         )}

//         {loading ? (
//           <div className="flex items-center justify-center min-h-[400px]">
//             <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
//           </div>
//         ) : (
//           <div className="space-y-8">
//             {/* Stats Cards */}
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//               <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
//                 <CardHeader className="pb-3">
//                   <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
//                     <Users className="w-4 h-4 text-blue-600" />
//                     Total Students
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-3xl font-bold text-blue-600">
//                     {analytics?.totalStudents || 0}
//                   </div>
//                   <p className="text-xs text-gray-500 mt-2">Assigned to your class</p>
//                 </CardContent>
//               </Card>

//               <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
//                 <CardHeader className="pb-3">
//                   <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
//                     <TrendingUp className="w-4 h-4 text-green-600" />
//                     Total Quests
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-3xl font-bold text-green-600">
//                     {analytics?.totalQuestsSolvedByAll || 0}
//                   </div>
//                   <p className="text-xs text-gray-500 mt-2">Solved by all students</p>
//                 </CardContent>
//               </Card>

//               <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
//                 <CardHeader className="pb-3">
//                   <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
//                     <Award className="w-4 h-4 text-purple-600" />
//                     Average/Student
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-3xl font-bold text-purple-600">
//                     {analytics?.averageQuestsSolvedPerStudent.toFixed(1) || 0}
//                   </div>
//                   <p className="text-xs text-gray-500 mt-2">Quests solved on average</p>
//                 </CardContent>
//               </Card>

//               <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
//                 <CardHeader className="pb-3">
//                   <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
//                     <Activity className="w-4 h-4 text-pink-600" />
//                     Class ID
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-xl font-bold text-pink-600 truncate">
//                     {user.teacherId}
//                   </div>
//                   <p className="text-xs text-gray-500 mt-2">Share with students</p>
//                 </CardContent>
//               </Card>
//             </div>

//             <Tabs defaultValue="analytics" className="space-y-4">
//               <TabsList className="grid w-full grid-cols-2">
//                 <TabsTrigger value="analytics" className="flex items-center gap-2">
//                   <BarChart3 className="w-4 h-4" />
//                   Analytics
//                 </TabsTrigger>
//                 <TabsTrigger value="students" className="flex items-center gap-2">
//                   <Users className="w-4 h-4" />
//                   Student Details
//                 </TabsTrigger>
//               </TabsList>

//               <TabsContent value="analytics" className="space-y-4">
//                 {/* Average Quests by Difficulty */}
//                 <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
//                   <CardHeader>
//                     <CardTitle>Average Quests Solved by Difficulty</CardTitle>
//                     <CardDescription>
//                       Average number of quests solved by all students per difficulty level
//                     </CardDescription>
//                   </CardHeader>
//                   <CardContent>
//                     {difficultyChartData.length > 0 ? (
//                       <ResponsiveContainer width="100%" height={300}>
//                         <BarChart data={difficultyChartData}>
//                           <CartesianGrid strokeDasharray="3 3" />
//                           <XAxis dataKey="name" />
//                           <YAxis />
//                           <Tooltip />
//                           <Bar dataKey="average" fill="#6366f1" />
//                         </BarChart>
//                       </ResponsiveContainer>
//                     ) : (
//                       <p className="text-center py-12 text-gray-500">No data available</p>
//                     )}
//                   </CardContent>
//                 </Card>

//                 {/* Student Progress Comparison */}
//                 <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
//                   <CardHeader>
//                     <CardTitle>Student Progress Comparison</CardTitle>
//                     <CardDescription>
//                       Compare quest completion across difficulty levels for each student
//                     </CardDescription>
//                   </CardHeader>
//                   <CardContent>
//                     {studentProgressData.length > 0 ? (
//                       <ResponsiveContainer width="100%" height={400}>
//                         <BarChart data={studentProgressData}>
//                           <CartesianGrid strokeDasharray="3 3" />
//                           <XAxis dataKey="name" />
//                           <YAxis />
//                           <Tooltip />
//                           <Legend />
//                           <Bar dataKey="beginner" fill="#10b981" />
//                           <Bar dataKey="intermediate" fill="#f59e0b" />
//                           <Bar dataKey="advanced" fill="#ef4444" />
//                         </BarChart>
//                       </ResponsiveContainer>
//                     ) : (
//                       <p className="text-center py-12 text-gray-500">
//                         No students enrolled yet
//                       </p>
//                     )}
//                   </CardContent>
//                 </Card>
//               </TabsContent>

//               <TabsContent value="students" className="space-y-4">
//                 <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
//                   <CardHeader>
//                     <CardTitle>Your Students</CardTitle>
//                     <CardDescription>
//                       View individual student performance and achievement
//                     </CardDescription>
//                   </CardHeader>
//                   <CardContent>
//                     {students.length > 0 ? (
//                       <div className="overflow-x-auto">
//                         <Table>
//                           <TableHeader>
//                             <TableRow className="hover:bg-transparent border-b-2">
//                               <TableHead className="font-bold">Name</TableHead>
//                               <TableHead className="font-bold">Email</TableHead>
//                               <TableHead className="font-bold text-center">
//                                 Total Quests
//                               </TableHead>
//                               <TableHead className="font-bold text-center">
//                                 Beginner
//                               </TableHead>
//                               <TableHead className="font-bold text-center">
//                                 Intermediate
//                               </TableHead>
//                               <TableHead className="font-bold text-center">Advanced</TableHead>
//                             </TableRow>
//                           </TableHeader>
//                           <TableBody>
//                             {students.map((student) => (
//                               <TableRow key={student._id}>
//                                 <TableCell className="font-medium">{student.name}</TableCell>
//                                 <TableCell className="text-sm">{student.email}</TableCell>
//                                 <TableCell className="text-center">
//                                   <Badge className="bg-blue-100 text-blue-800">
//                                     {student.performance.totalQuestsSolved}
//                                   </Badge>
//                                 </TableCell>
//                                 <TableCell className="text-center">
//                                   <Badge className="bg-green-100 text-green-800">
//                                     {student.performance.questsSolvedByDifficulty.beginner}
//                                   </Badge>
//                                 </TableCell>
//                                 <TableCell className="text-center">
//                                   <Badge className="bg-yellow-100 text-yellow-800">
//                                     {student.performance.questsSolvedByDifficulty.intermediate}
//                                   </Badge>
//                                 </TableCell>
//                                 <TableCell className="text-center">
//                                   <Badge className="bg-red-100 text-red-800">
//                                     {student.performance.questsSolvedByDifficulty.advanced}
//                                   </Badge>
//                                 </TableCell>
//                               </TableRow>
//                             ))}
//                           </TableBody>
//                         </Table>
//                       </div>
//                     ) : (
//                       <div className="text-center py-12">
//                         <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
//                         <p className="text-gray-500 font-medium">No students yet</p>
//                         <p className="text-gray-400 text-sm mt-1">
//                           Share your Teacher ID with students to get started
//                         </p>
//                         <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg inline-block">
//                           <p className="text-sm font-mono font-bold text-purple-600">
//                             {user.teacherId}
//                           </p>
//                         </div>
//                       </div>
//                     )}
//                   </CardContent>
//                 </Card>
//               </TabsContent>
//             </Tabs>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }



import { Suspense } from 'react';
import TeacherDashboardClient from './TeacherDashboardClient.tsx';

export const metadata = {
  title: 'Teacher Dashboard | SQLArcade',
  description: 'Monitor student progress and class analytics.',
};

export default function TeacherPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="text-muted-foreground animate-pulse">Loading Analytics...</p>
        </div>
      </div>
    }>
      <TeacherDashboardClient />
    </Suspense>
  );
}