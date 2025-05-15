import React from "react";
import { useAppSelector } from "../../../store";
import styles from "./AttemptsTable.module.css";

const AttemptsTable: React.FC = () => {
  const attempts = useAppSelector(s => s.dashboard.attempts);

  return (
    <div className={styles.wrapper}>
      <h3>Последние попытки</h3>
      <table>
        <thead>
          <tr>
            <th>Тест / опрос</th>
            <th>Дата</th>
            <th>Участник</th>
            <th>Баллы</th>
          </tr>
        </thead>
        <tbody>
          {attempts.map(a => (
            <tr key={a.id}>
              <td>{a.title}</td>
              <td>{new Date(a.date).toLocaleString()}</td>
              <td>{a.participant}</td>
              <td>{a.score ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttemptsTable;
