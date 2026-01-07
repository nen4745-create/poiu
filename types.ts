
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';
export type UserRole = 'admin' | 'teacher' | 'parent' | 'student';
export type HomeworkStatus = 'completed' | 'incomplete' | 'pending';
export type SchoolLevel = 'elementary' | 'middle' | 'high';
export type CourseType = 
  | 'comprehensive' 
  | 'english_only' 
  | 'math_only' 
  | 'except_english' 
  | 'kor_math' 
  | 'eng_math' 
  | 'math_sci' 
  | 'math_hist';

export interface Student {
  id: string;
  name: string;
  password: string; // 추가: 학생/학부모 전용 4자리 비밀번호
  phone: string;
  parentPhone: string;
  enrolledDate: string;
  grade: string;
  level: SchoolLevel;
  courseType: CourseType;
  active: boolean;
  tuitionDueDay: number;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: AttendanceStatus;
  note?: string;
}

export interface GradeRecord {
  id: string;
  studentId: string;
  subject: string;
  testName: string;
  score: number;
  date: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  isImportant: boolean;
}

export interface TimetableEntry {
  id: string;
  day: string;
  period: string;
  time: string;
  subject: string;
  teacher: string;
  room: string;
  level: SchoolLevel;
}

export interface Homework {
  id: string;
  subject: string;
  title: string;
  content: string;
  dueDate: string;
  teacherName: string;
}

export interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  studentId: string;
  status: HomeworkStatus;
  lastUpdated: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  date: string;
  isSecret: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  type: 'attendance' | 'homework' | 'notice' | 'grade' | 'timetable' | 'tuition';
  studentId?: string;
  read: boolean;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
}
