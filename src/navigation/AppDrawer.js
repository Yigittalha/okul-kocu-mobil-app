import React, { useContext } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SessionContext } from "../state/session";

// Import dashboard screens
import AdminDashboard from "../app/admin/AdminDashboard";
import TeacherDashboard from "../app/teacher/TeacherDashboard";
import ParentDashboard from "../app/parent/ParentDashboard";
// Import TeachersList and StudentsList screens
import TeachersList from "../app/common/TeachersList";
import StudentsList from "../app/common/StudentsList";
// Import TeacherSchedule screen
import TeacherSchedule from "../app/teacher/TeacherSchedule";
// Import AttendanceStart screen
import AttendanceStart from "../app/teacher/AttendanceStart";
// Import AttendanceResults screen
import AttendanceResults from "../app/teacher/AttendanceResults";
// Import HomeworkAssignment screen
import HomeworkAssignment from "../app/teacher/HomeworkAssignment";
// Import HomeworksGivenList screen
import HomeworksGivenList from "../app/teacher/HomeworksGivenList";
// Import HomeworkGivenDetail screen
import HomeworkGivenDetail from "../app/teacher/HomeworkGivenDetail";
// Import StudentHomeworkList screen
import StudentHomeworkList from "../app/parent/StudentHomeworkList";
// Import StudentHomeworkDetail screen
import StudentHomeworkDetail from "../app/parent/StudentHomeworkDetail";
// Import StudentAbsences screen
import StudentAbsences from "../app/parent/StudentAbsences";

const Stack = createNativeStackNavigator();

/**
 * Ana çekmece navigasyonu
 * Not: SlideMenu component'i ayrı bir dosyaya taşındı
 * ve döngüsel bağımlılık ortadan kaldırıldı
 */
export default function AppDrawer() {
  const { role } = useContext(SessionContext);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {role === "admin" && (
        <>
          <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
          <Stack.Screen name="TeachersList" component={TeachersList} />
          <Stack.Screen name="StudentsList" component={StudentsList} />
          <Stack.Screen name="AttendanceStart" component={AttendanceStart} />
        </>
      )}
      {role === "teacher" && (
        <>
          <Stack.Screen name="TeacherDashboard" component={TeacherDashboard} />
          <Stack.Screen name="TeacherSchedule" component={TeacherSchedule} />
          <Stack.Screen name="TeachersList" component={TeachersList} />
          <Stack.Screen name="StudentsList" component={StudentsList} />
          <Stack.Screen name="AttendanceStart" component={AttendanceStart} />
          <Stack.Screen name="AttendanceResults" component={AttendanceResults} />
          <Stack.Screen name="HomeworkAssignment" component={HomeworkAssignment} />
          <Stack.Screen name="HomeworksGivenList" component={HomeworksGivenList} />
          <Stack.Screen name="HomeworkGivenDetail" component={HomeworkGivenDetail} />
        </>
      )}
      {role === "parent" && (
        <>
          <Stack.Screen name="ParentDashboard" component={ParentDashboard} />
          <Stack.Screen name="StudentHomeworkList" component={StudentHomeworkList} />
          <Stack.Screen name="StudentHomeworkDetail" component={StudentHomeworkDetail} />
          <Stack.Screen name="StudentAbsences" component={StudentAbsences} />
        </>
      )}
    </Stack.Navigator>
  );
}
