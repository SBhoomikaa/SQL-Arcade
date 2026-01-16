// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { BookOpen, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

// interface Teacher {
//   _id: string;
//   name: string;
//   teacherId: string;
//   email: string;
//   institution?: string;
// }

// export default function SignupPage() {
//   const router = useRouter();
//   const [role, setRole] = useState<'student' | 'teacher'>('student');
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//     confirmPassword: '',
//     name: '',
//     class: '',
//     section: '',
//     semester: '',
//     teacherId: '',
//   });
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [teachers, setTeachers] = useState<Teacher[]>([]);
//   const [loadingTeachers, setLoadingTeachers] = useState(false);

//   useEffect(() => {
//     if (role === 'student') {
//       fetchTeachers();
//     }
//   }, [role]);

//   const fetchTeachers = async () => {
//     setLoadingTeachers(true);
//     try {
//       const response = await fetch('/api/auth/teachers');
//       const data = await response.json();
//       if (data.success) {
//         setTeachers(data.teachers);
//       }
//     } catch (err) {
//       console.error('Error fetching teachers:', err);
//     } finally {
//       setLoadingTeachers(false);
//     }
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSelectChange = (value: string) => {
//     setFormData((prev) => ({ ...prev, teacherId: value }));
//   };

//   const validateForm = () => {
//     if (!formData.email || !formData.password || !formData.name) {
//       setError('Email, password, and name are required');
//       return false;
//     }

//     if (formData.password.length < 8) {
//       setError('Password must be at least 8 characters');
//       return false;
//     }

//     if (formData.password !== formData.confirmPassword) {
//       setError('Passwords do not match');
//       return false;
//     }

//     if (role === 'student' && !formData.teacherId) {
//       setError('Please select a teacher');
//       return false;
//     }

//     return true;
//   };

//   const handleSignup = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');

//     if (!validateForm()) {
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await fetch('/api/auth/signup', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           email: formData.email,
//           password: formData.password,
//           name: formData.name,
//           class: formData.class,
//           section: formData.section,
//           semester: formData.semester,
//           teacherId: role === 'student' ? formData.teacherId : undefined,
//           role,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         setError(data.error || 'Signup failed');
//         return;
//       }

//       // Store token
//       localStorage.setItem('authToken', data.token);
//       localStorage.setItem('user', JSON.stringify(data.user));

//       // Redirect
//       if (role === 'teacher') {
//         router.push('/teacher/dashboard');
//       } else {
//         router.push('/');
//       }
//     } catch (err) {
//       setError('An error occurred. Please try again.');
//       console.error('Signup error:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-green-600 via-blue-600 to-purple-600 flex items-center justify-center p-4">
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute top-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
//         <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
//       </div>

//       <div className="relative z-10 w-full max-w-2xl">
//         <div className="text-center mb-8">
//           <div className="flex items-center justify-center gap-2 mb-4">
//             <BookOpen className="w-8 h-8 text-white" />
//             <h1 className="text-3xl font-bold text-white">SQLArcade</h1>
//           </div>
//           <p className="text-white/80">Join the SQL Learning Revolution</p>
//         </div>

//         <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur">
//           <CardHeader className="space-y-2">
//             <CardTitle className="text-2xl text-center">Create Your Account</CardTitle>
//             <CardDescription className="text-center">
//               Choose your role and get started on your SQL journey
//             </CardDescription>
//           </CardHeader>

//           <CardContent>
//             <Tabs value={role} onValueChange={(v) => setRole(v as 'student' | 'teacher')}>
//               <TabsList className="grid w-full grid-cols-2 mb-6">
//                 <TabsTrigger value="student">Student</TabsTrigger>
//                 <TabsTrigger value="teacher">Teacher</TabsTrigger>
//               </TabsList>

//               <TabsContent value={role}>
//                 <form onSubmit={handleSignup} className="space-y-4">
//                   {error && (
//                     <Alert className="border-red-200 bg-red-50">
//                       <AlertCircle className="h-4 w-4 text-red-600" />
//                       <AlertDescription className="text-red-600">{error}</AlertDescription>
//                     </Alert>
//                   )}

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label htmlFor="name">Full Name</Label>
//                       <Input
//                         id="name"
//                         name="name"
//                         placeholder="John Doe"
//                         value={formData.name}
//                         onChange={handleInputChange}
//                         required
//                         className="border-gray-200"
//                       />
//                     </div>

//                     <div className="space-y-2">
//                       <Label htmlFor="email">Email Address</Label>
//                       <Input
//                         id="email"
//                         name="email"
//                         type="email"
//                         placeholder="you@example.com"
//                         value={formData.email}
//                         onChange={handleInputChange}
//                         required
//                         className="border-gray-200"
//                       />
//                     </div>

//                     <div className="space-y-2">
//                       <Label htmlFor="class">Class/Grade</Label>
//                       <Input
//                         id="class"
//                         name="class"
//                         placeholder="e.g., 10-B"
//                         value={formData.class}
//                         onChange={handleInputChange}
//                         className="border-gray-200"
//                       />
//                     </div>

//                     <div className="space-y-2">
//                       <Label htmlFor="section">Section</Label>
//                       <Input
//                         id="section"
//                         name="section"
//                         placeholder="e.g., A"
//                         value={formData.section}
//                         onChange={handleInputChange}
//                         className="border-gray-200"
//                       />
//                     </div>

//                     {role === 'student' && (
//                       <div className="space-y-2">
//                         <Label htmlFor="semester">Semester</Label>
//                         <Input
//                           id="semester"
//                           name="semester"
//                           placeholder="e.g., 4"
//                           value={formData.semester}
//                           onChange={handleInputChange}
//                           className="border-gray-200"
//                         />
//                       </div>
//                     )}

//                     {role === 'student' && (
//                       <div className="space-y-2">
//                         <Label htmlFor="teacherId">Teacher</Label>
//                         <Select value={formData.teacherId} onValueChange={handleSelectChange}>
//                           <SelectTrigger className="border-gray-200">
//                             <SelectValue placeholder={loadingTeachers ? 'Loading teachers...' : 'Select your teacher'} />
//                           </SelectTrigger>
//                           <SelectContent>
//                             {teachers.map((teacher) => (
//                               <SelectItem key={teacher._id} value={teacher.teacherId}>
//                                 <div className="flex flex-col">
//                                   <span className="font-semibold">{teacher.name}</span>
//                                   <span className="text-xs text-gray-500">ID: {teacher.teacherId}</span>
//                                 </div>
//                               </SelectItem>
//                             ))}
//                           </SelectContent>
//                         </Select>
//                         {role === 'student' && teachers.length === 0 && !loadingTeachers && (
//                           <p className="text-xs text-yellow-600">No teachers available. Ask your teacher to sign up first.</p>
//                         )}
//                       </div>
//                     )}
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label htmlFor="password">Password</Label>
//                       <Input
//                         id="password"
//                         name="password"
//                         type="password"
//                         placeholder="••••••••"
//                         value={formData.password}
//                         onChange={handleInputChange}
//                         required
//                         className="border-gray-200"
//                       />
//                       <p className="text-xs text-gray-500">Min 8 characters</p>
//                     </div>

//                     <div className="space-y-2">
//                       <Label htmlFor="confirmPassword">Confirm Password</Label>
//                       <Input
//                         id="confirmPassword"
//                         name="confirmPassword"
//                         type="password"
//                         placeholder="••••••••"
//                         value={formData.confirmPassword}
//                         onChange={handleInputChange}
//                         required
//                         className="border-gray-200"
//                       />
//                     </div>
//                   </div>

//                   <Button
//                     type="submit"
//                     className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold h-10"
//                     disabled={loading}
//                   >
//                     {loading ? (
//                       <>
//                         <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                         Creating account...
//                       </>
//                     ) : (
//                       <>
//                         <CheckCircle2 className="w-4 h-4 mr-2" />
//                         Sign Up
//                       </>
//                     )}
//                   </Button>

//                   <p className="text-center text-sm text-gray-600">
//                     Already have an account?{' '}
//                     <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
//                       Sign in here
//                     </Link>
//                   </p>
//                 </form>
//               </TabsContent>
//             </Tabs>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }



import { Suspense } from 'react';
import SignupClient from './SignupClient.tsx';

export const metadata = {
  title: 'Sign Up | SQLArcade',
  description: 'Create your account and start your SQL journey.',
};

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <SignupClient />
    </Suspense>
  );
}
