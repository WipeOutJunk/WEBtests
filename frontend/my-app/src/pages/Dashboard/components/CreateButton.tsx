import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import styles from "./CreateButton.module.css";

const CreateButton: React.FC = () => {
  const navigate = useNavigate();
  return (
    <button className={styles.btn} onClick={() => navigate("/tests/new")}>
      <Plus size={22} />
      <span>Создать тест</span>
    </button>
  );
};

export default CreateButton;
