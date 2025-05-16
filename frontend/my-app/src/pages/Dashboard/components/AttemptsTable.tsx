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
            <th>Тест</th>
            <th>Участник</th>
            <th>Дата</th>
          </tr>
        </thead>
        <tbody>
          {attempts.map(a => (
            <tr key={a.id}>
              <td>{a.title}</td>
              <td>{a.participant}</td>
              <td>{new Date(a.date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttemptsTable;
