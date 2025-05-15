import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import StatsCards from "./components/StatsCards";
import AttemptsTable from "./components/AttemptsTable";
import TestsGrid from "./components/TestsGrid";
import CreateButton from "./components/CreateButton";
import { fetchStats, fetchAttempts, fetchTests } from "../../store/dashboardSlice";
import styles from "./Dashboard.module.css";

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(s => s.dashboard);

  useEffect(() => {
    dispatch(fetchStats());
    dispatch(fetchAttempts({ limit: 10 }));
    dispatch(fetchTests());
  }, [dispatch]);

  if (loading) return <div className="text-center mt-10">Загрузка...</div>;
  if (error)   return <div className="text-center mt-10 text-red-500">Ошибка: {error}</div>;

  return (
    <div className={styles.layout}>
      <div className={styles.glowEffect} />
      <main className={styles.main}>
        <StatsCards />
        <div className={styles.row}>
          <AttemptsTable />
          <CreateButton />
        </div>
        <TestsGrid />
      </main>
    </div>
  );
};

export default Dashboard;
