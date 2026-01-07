
import { Student, AttendanceRecord, Notice, Homework, HomeworkSubmission, Post, GradeRecord, TimetableEntry } from './types';

export const INITIAL_STUDENTS: Student[] = [
  { id: '1', name: '김철수', password: '0000', phone: '010-1234-5678', parentPhone: '010-1111-2222', enrolledDate: '2023-01-15', grade: '중1', level: 'middle', courseType: 'comprehensive', active: true, tuitionDueDay: 15 },
  { id: '2', name: '이영희', password: '0000', phone: '010-2345-6789', parentPhone: '010-3333-4444', enrolledDate: '2023-02-10', grade: '고2', level: 'high', courseType: 'eng_math', active: true, tuitionDueDay: 10 },
  { id: '3', name: '박민준', password: '0000', phone: '010-3456-7890', parentPhone: '010-5555-6666', enrolledDate: '2023-03-05', grade: '중1', level: 'middle', courseType: 'math_only', active: true, tuitionDueDay: 5 },
  { id: '4', name: '정지원', password: '0000', phone: '010-4567-8901', parentPhone: '010-7777-8888', enrolledDate: '2023-04-20', grade: '고3', level: 'high', courseType: 'except_english', active: true, tuitionDueDay: 20 },
  { id: '5', name: '최현우', password: '0000', phone: '010-5678-9012', parentPhone: '010-9999-0000', enrolledDate: '2023-05-12', grade: '초6', level: 'elementary', courseType: 'kor_math', active: true, tuitionDueDay: 12 },
  { id: '6', name: '한소희', password: '0000', phone: '010-6789-0123', parentPhone: '010-1234-5678', enrolledDate: '2024-01-10', grade: '초5', level: 'elementary', courseType: 'english_only', active: true, tuitionDueDay: 10 },
  { id: '7', name: '강동원', password: '0000', phone: '010-7890-1234', parentPhone: '010-2345-6789', enrolledDate: '2024-02-15', grade: '중2', level: 'middle', courseType: 'math_sci', active: true, tuitionDueDay: 15 },
  { id: '8', name: '윤아름', password: '0000', phone: '010-8901-2345', parentPhone: '010-3456-7890', enrolledDate: '2024-03-20', grade: '중3', level: 'middle', courseType: 'math_hist', active: true, tuitionDueDay: 20 },
];

export const INITIAL_TIMETABLE: TimetableEntry[] = [
  { id: 't1', day: '수학(윤)', period: '1:00 - 1:40', time: '1:00 - 1:40', subject: '해법', teacher: '윤교사', room: '101', level: 'elementary' },
  { id: 't2', day: '수학(윤)', period: '5:00 - 5:45', time: '5:00 - 5:45', subject: '중2S', teacher: '윤교사', room: '101', level: 'middle' },
  { id: 't3', day: '수학(윤)', period: '5:50 - 6:35', time: '5:50 - 6:35', subject: '중3 동중', teacher: '윤교사', room: '101', level: 'middle' },
  { id: 't4', day: '수학(박)', period: '6:55 - 7:40', time: '6:55 - 7:40', subject: '고1합', teacher: '박교사', room: '201', level: 'high' },
  { id: 't5', day: '수학공간', period: '8:35 - 9:25', time: '8:35 - 9:25', subject: '고2합', teacher: '공간교사', room: '202', level: 'high' },
  { id: 't6', day: '국어', period: '5:00 - 5:45', time: '5:00 - 5:45', subject: '중등국어', teacher: '최국어', room: '301', level: 'middle' },
  { id: 't7', day: '영어A', period: '5:50 - 6:35', time: '5:50 - 6:35', subject: '고등영어', teacher: '김영어', room: '302', level: 'high' },
];

export const INITIAL_GRADES: GradeRecord[] = [
  { id: 'g1', studentId: '1', subject: '수학', testName: '3월 단원평가', score: 85, date: '2024-03-15' },
  { id: 'g2', studentId: '1', subject: '수학', testName: '4월 중간고사', score: 92, date: '2024-04-20' },
  { id: 'g3', studentId: '1', subject: '수학', testName: '5월 수행평가', score: 88, date: '2024-05-10' },
  { id: 'g7', studentId: '2', subject: '수학', testName: '4월 중간고사', score: 95, date: '2024-04-20' },
];

export const INITIAL_NOTICES: Notice[] = [
  { id: 'n1', title: '6월 기말고사 대비 특강 안내', content: '기말고사 만점을 위한 집중 대비반이 개설됩니다.', author: '원장님', date: '2024-05-20', isImportant: true },
  { id: 'n2', title: '현충일 학원 휴무 공지', content: '6월 6일 현충일은 법정 공휴일로 학원 수업이 없습니다.', author: '관리자', date: '2024-05-18', isImportant: false },
];

export const INITIAL_POSTS: Post[] = [
  { id: 'p1', title: '오늘 수학 숙제 질문있어요!', content: '쎈 25페이지 14번 문제 풀이 과정이 이해가 안 가요. 알려주세요!', authorId: '1', authorName: '김철수', date: '2024-05-22 14:30', isSecret: false },
];

export const INITIAL_HOMEWORKS: Homework[] = [
  { id: 'h1', subject: '수학', title: '쎈 2단원 문제풀이', content: 'C단계 제외, 25페이지까지 풀어오기', dueDate: '2024-05-25', teacherName: '박수학' },
];

export const INITIAL_SUBMISSIONS: HomeworkSubmission[] = [
  { id: 's1', homeworkId: 'h1', studentId: '1', status: 'completed', lastUpdated: '2024-05-22' },
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  { id: 'a1', studentId: '1', date: '2024-05-20', status: 'present' },
];

export const COLORS = {
  present: '#22c55e',
  absent: '#ef4444',
  late: '#f59e0b',
  excused: '#6366f1',
};
