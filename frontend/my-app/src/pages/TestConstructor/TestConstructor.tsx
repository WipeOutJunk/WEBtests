import React, { useState, useCallback } from "react";
import type { QuestionType, TestData, AnswerOption, Question } from "./types";
import { PlusCircle, Trash2, Eye, ChevronDown, ChevronUp } from "lucide-react";
import styles from "./TestConstructor.module.css";

interface QuestionEditorProps {
  question: Question;
  index: number;
  onUpdate: (index: number, field: string, value: any) => void;
  onDeleteOption: (optionIndex: number) => void;
  onAddOption: () => void;
}

const Editor: React.FC<{
    value: string;
    onChange: (value: string) => void;
  }> = ({ value, onChange }) => (
    <textarea 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${styles.input} ${styles.textarea}`}
      rows={6}
    />
  );
  
  const TestPreview: React.FC<{ data: TestData }> = ({ data }) => (
    <div className={styles.preview}>
      <h2>{data.title}</h2>
      <p>{data.description}</p>
      {data.questions.map((q, i) => (
        <div key={q.id} className={styles.previewQuestion}>
          <h3>Вопрос {i + 1}: {q.text}</h3>
          {q.options?.map(opt => (
            <div key={opt.id} className={opt.correct ? styles.correctOption : ''}>
              {opt.text}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
  
  const QuestionEditor: React.FC<QuestionEditorProps> = ({
    question,
    index,
    onUpdate,
    onDeleteOption,
    onAddOption,
  }) => (
    <div className={styles.questionEditor}>
      <div className={styles.formGroup}>
        <label className={styles.label}>Текст вопроса *</label>
        <textarea
          value={question.text}
          onChange={(e) => onUpdate(index, "text", e.target.value)}
          className={`${styles.input} ${styles.textarea}`}
        />
      </div>
  
      {question.type !== "text" && (
        <div className={styles.optionsSection}>
          <h4 className={styles.subtitle}>Варианты ответов:</h4>
          {question.options?.map((option, optIndex) => (
            <div key={option.id} className={styles.optionRow}>
              <input
                type="text"
                value={option.text}
                onChange={(e) =>
                  onUpdate(index, "options", 
                    question.options?.map((o, i) => 
                      i === optIndex ? {...o, text: e.target.value} : o
                    )
                  )
                }
                className={`${styles.input} ${styles.optionInput}`}
                placeholder={`Вариант ${optIndex + 1}`}
              />
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={option.correct}
                  onChange={(e) =>
                    onUpdate(index, "options", 
                      question.options?.map((o, i) => 
                        i === optIndex ? {...o, correct: e.target.checked} : o
                      )
                    )
                  }
                />
                <span>Верный</span>
              </label>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnIcon} ${styles.btnDanger}`}
                onClick={() => onDeleteOption(optIndex)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button 
            type="button"
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={onAddOption}
          >
            <PlusCircle size={16} className={styles.btnIcon} />
            Добавить вариант
          </button>
        </div>
      )}
  
      <div className={styles.formGroup}>
        <label className={styles.label}>Пояснение к ответу</label>
        <textarea
          value={question.explanation}
          onChange={(e) => onUpdate(index, "explanation", e.target.value)}
          className={`${styles.input} ${styles.textarea}`}
        />
      </div>
    </div>
  );

const TestConstructor: React.FC = () => {
  const [testData, setTestData] = useState<TestData>({
    title: "",
    description: "",
    isPublic: false,
    isQuiz: true,
    questions: [],
    lessonContent: "",
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(-1);
  const [previewMode, setPreviewMode] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const validateTest = useCallback(() => {
    const newErrors: string[] = [];
    if (!testData.title.trim()) newErrors.push("Название теста обязательно");
    if (testData.isQuiz && testData.questions.length === 0) {
      newErrors.push("Добавьте хотя бы один вопрос");
    }
    setErrors(newErrors);
    return newErrors.length === 0;
  }, [testData]);

  const handleAddQuestion = (type: QuestionType) => {
    const newQuestion = {
      id: Date.now(),
      type,
      text: "",
      options: type === "text" ? [] : [{ id: Date.now(), text: "", correct: false }],
      explanation: "",
    };
    setTestData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
    setCurrentQuestionIndex(testData.questions.length);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateTest()) {
      console.log("Тест сохранен:", testData);
    }
  };

  
  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSave}>
        <section className={styles.settingsSection}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Название теста *</label>
            <input
              type="text"
              value={testData.title}
              onChange={(e) => setTestData({ ...testData, title: e.target.value })}
              className={`${styles.input} ${styles.inputText}`}
              placeholder="Введите название теста"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.switchLabel}>
              Тип контента:
              <div className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  className={styles.switchInput}
                  checked={testData.isQuiz}
                  onChange={(e) => setTestData({ ...testData, isQuiz: e.target.checked })}
                />
                <span className={styles.slider}></span>
              </div>
              <span>{testData.isQuiz ? "Тест" : "Урок"}</span>
            </label>
          </div>

          {!testData.isQuiz && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Содержание урока</label>
              <Editor
                value={testData.lessonContent ?? ""}
                onChange={(content) => setTestData({ ...testData, lessonContent: content })}
              />
            </div>
          )}
        </section>

        <section className={styles.questionsSection}>
          <div className={styles.questionsSidebar}>
            <div className={styles.questionsList}>
              {testData.questions.map((question, index) => (
                <div
                  key={question.id}
                  className={`${styles.questionItem} ${
                    index === currentQuestionIndex ? styles.active : ""
                  }`}
                  onClick={() => setCurrentQuestionIndex(index)}
                >
                  <span>Вопрос {index + 1}</span>
                  <button
                    type="button"
                    className={`${styles.btn} ${styles.btnIcon} ${styles.btnDanger}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm("Удалить вопрос?")) {
                        setTestData(prev => ({
                          ...prev,
                          questions: prev.questions.filter((_, i) => i !== index)
                        }));
                        setCurrentQuestionIndex(-1);
                      }
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className={styles.addButtons}>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={() => handleAddQuestion("single")}
              >
                <PlusCircle size={16} className={styles.btnIcon} />
                Одиночный выбор
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={() => handleAddQuestion("multiple")}
              >
                <PlusCircle size={16} className={styles.btnIcon} />
                Множественный выбор
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={() => handleAddQuestion("text")}
              >
                <PlusCircle size={16} className={styles.btnIcon} />
                Текстовый ответ
              </button>
            </div>
          </div>

          {currentQuestionIndex !== -1 && (
            <div className={styles.editorArea}>
              <QuestionEditor
                question={testData.questions[currentQuestionIndex]}
                index={currentQuestionIndex}
                onUpdate={(index, field, value) => {
                  setTestData(prev => ({
                    ...prev,
                    questions: prev.questions.map((q, i) =>
                      i === index ? { ...q, [field]: value } : q
                    ),
                  }));
                }}
                onDeleteOption={(optIndex) => {
                  setTestData(prev => ({
                    ...prev,
                    questions: prev.questions.map((q, i) =>
                      i === currentQuestionIndex
                        ? { ...q, options: q.options?.filter((_, oi) => oi !== optIndex) }
                        : q
                    ),
                  }));
                }}
                onAddOption={() => {
                  setTestData(prev => ({
                    ...prev,
                    questions: prev.questions.map((q, i) =>
                      i === currentQuestionIndex
                        ? { ...q, options: [...(q.options || []), { 
                            id: Date.now(), 
                            text: "", 
                            correct: false 
                          }] 
                        }
                        : q
                    ),
                  }));
                }}
              />
            </div>
          )}
        </section>

        {errors.length > 0 && (
          <div className={styles.errorAlert}>
            {errors.map((e, i) => (
              <div key={i}>{e}</div>
            ))}
          </div>
        )}

        <section className={styles.actions}>
          <button 
            type="submit"
            className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLarge}`}
            disabled={errors.length > 0}
          >
            Сохранить тест
          </button>
          <button 
            type="button"
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye size={16} className={styles.btnIcon} />
            {previewMode ? "Скрыть превью" : "Показать превью"}
          </button>
        </section>

        {previewMode && (
          <section className={styles.previewSection}>
            <TestPreview data={testData} />
          </section>
        )}
      </form>
    </div>
  );
};

export default TestConstructor;