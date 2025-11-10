export interface AddStudentPayload {
  parentId: string;
  firstName: string;
  lastName: string;
  class: string;
  section: string;
  registrationNo: string;
  classRollNo: string;
}

export interface AddStudentResponse {
  success: boolean;
  message: string;
  data: {
    student: StudentApi;
  };
}

export interface StudentApi {
  id: string;
  parentId: string;
  firstName: string;
  lastName: string;
  class: string;
  section: string;
  registrationNo: string;
  classRollNo: string;
  createdAt?: string;
  updatedAt?: string;
  attendanceStatus?: 'present' | 'absent' | null;
  attendanceHistory?: Array<{
    date: string;
    status: string;
    updatedAt: string;
  }>;
}

export interface StudentFormData {
  firstName: string;
  lastName: string;
  class: string;
  section: string;
  registrationNo: string;
  classRollNo: string;
}

export interface GetStudentsResponse {
  success: boolean;
  message: string;
  data: {
    students: StudentApi[];
  };
}

export interface UpdateStudentPayload extends AddStudentPayload {
  studentId: string;
}

export interface UpdateStudentResponse extends AddStudentResponse {}

export interface DeleteStudentResponse {
  success: boolean;
  message: string;
}

// Class Student API types (from getClassStudents endpoint)
export interface ClassStudentApi {
  _id: string;
  parentId: string;
  firstName: string;
  lastName: string;
  class: string;
  section: string;
  registrationNo: string;
  classRollNo: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetClassStudentsSuccessResponse {
  success: true;
  message: string;
  data: {
    class: string;
    section: string;
    students: ClassStudentApi[];
    count: number;
  };
}

export interface GetClassStudentsErrorResponse {
  success: false;
  message: string;
}

export type GetClassStudentsResponse = GetClassStudentsSuccessResponse | GetClassStudentsErrorResponse;

export interface GetClassStudentsPayload {
  teacherId: string;
}

export interface GetParentStudentsResponse {
  success: boolean;
  message: string;
  data: {
    students: StudentApi[];
    count?: number;
  };
}

export type AttendanceStatusApi = 'present' | 'absent' | 'holiday' | 'not_marked';

export interface AttendanceHistoryEntryApi {
  date: string;
  status: AttendanceStatusApi;
  updatedAt: string | null;
}

export interface AttendanceHistoryResponse {
  success: boolean;
  message: string;
  data: {
    student: {
      id: string;
      firstName: string;
      lastName: string;
      class: string;
      section: string;
    };
    history: AttendanceHistoryEntryApi[];
    count: number;
  };
}

