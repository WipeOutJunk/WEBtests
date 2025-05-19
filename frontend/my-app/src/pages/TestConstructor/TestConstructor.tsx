import React, { useState, useCallback, useEffect } from 'react';
import { Switch } from 'antd';
import { PlusCircle, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../../store';
import {
  createLesson,
  resetLessonState,
} from '../../store/lessonSlice';
import type { LessonState } from '../../store/lessonSlice';   // ← тип

import styles from './TestConstructor.module.css';

/* ---------- TYPES ----------------------------------------- */
export type QuestionType = 'single' | 'multiple' | 'text';

export interface AnswerOption {
  id: number;
  text: string;
  correct: boolean;
}

export interface Question {
  id: number;
  type: QuestionType;
  text: string;
  options?: AnswerOption[];
  correctAnswer?: string;
  explanation?: string;
}

export interface TestData {
  title: string;
  description?: string;
  isPublic: boolean;
  requireEmail: boolean;
  isQuiz: boolean;
  duration: number;      // минуты
  questions: Question[];
  lessonContent?: string;
}

/* ---------- UI-HELPERS ----------------------------------- */
const InputBlock: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: 'text' | 'number';
  min?: number;
}> = ({ label, value, onChange, placeholder, type = 'text', min }) => (
  <div className={styles.formGroup}>
    <label className={styles.label}>{label}</label>
    <input
      className={styles.input}
      type={type}
      min={min}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const SwitchRow: React.FC<{
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  checkedLabel?: string;
  uncheckedLabel?: string;
}> = ({ label, checked, onChange, checkedLabel, uncheckedLabel }) => (
  <div className={styles.formGroup}>
    <label className={styles.label}>{label}</label>
    <Switch
      checked={checked}
      onChange={onChange}
      checkedChildren={checkedLabel}
      unCheckedChildren={uncheckedLabel}
    />
  </div>
);

const Editor: React.FC<{ value: string; onChange: (v: string) => void }> = ({
  value,
  onChange,
}) => (
  <textarea
    rows={6}
    className={`${styles.input} ${styles.textarea}`}
    value={value}
    onChange={(e) => onChange(e.target.value)}
  />
);

/* ---------- PREVIEW -------------------------------------- */
const TestPreview: React.FC<{ data: TestData }> = ({ data }) => (
  <div className={styles.preview}>
    <h2 className={styles.previewTitle}>{data.title || '— без названия —'}</h2>

    {data.description && <p className={styles.previewDesc}>{data.description}</p>}

    <p className={styles.previewMeta}>
      Длительность:&nbsp;<strong>{data.duration} мин</strong>&nbsp;|&nbsp;
      Участник {data.requireEmail ? 'обязан' : 'не обязан'} вводить e-mail
    </p>

    {data.questions.map((q, i) => (
      <div key={q.id} className={styles.previewQuestion}>
        <div className={styles.previewQHeader}>
          <span className={styles.previewQIndex}>Вопрос {i + 1}</span>
          <h3 className={styles.previewQText}>{q.text || '—'}</h3>
        </div>

        {q.type !== 'text' ? (
          <ul className={styles.previewOptions}>
            {q.options?.map((opt) => (
              <li
                key={opt.id}
                className={`${styles.previewOption} ${
                  opt.correct ? styles.correctOption : ''
                }`}
              >
                {opt.text || '—'}
              </li>
            ))}
          </ul>
        ) : (
          <div className={styles.previewTextAnswer}>
            <label className={styles.previewAnswerLabel}>Ожидаемый ответ:</label>
            <div className={styles.previewAnswerValue}>
              {q.correctAnswer || <em>не указан</em>}
            </div>
          </div>
        )}
      </div>
    ))}
  </div>
);

/* ---------- QUESTION-EDITOR ------------------------------ */
interface QuestionEditorProps {
  question: Question;
  index: number;
  onUpdate: (i: number, f: string, v: any) => void;
  onDeleteOption: (optI: number) => void;
  onAddOption: () => void;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  index,
  onUpdate,
  onDeleteOption,
  onAddOption,
}) => (
  <div className={styles.questionEditor}>
    <InputBlock
      label="Текст вопроса *"
      value={question.text}
      onChange={(v) => onUpdate(index, 'text', v)}
    />

    {question.type === 'text' && (
      <InputBlock
        label="Правильный ответ"
        value={question.correctAnswer ?? ''}
        onChange={(v) => onUpdate(index, 'correctAnswer', v)}
        placeholder="Введите ожидаемый ответ"
      />
    )}

    {question.type !== 'text' && (
      <div className={styles.optionsSection}>
        <h4 className={styles.subtitle}>Варианты ответов:</h4>

        {question.options?.map((opt, optIdx) => (
          <div key={opt.id} className={styles.optionRow}>
            <input
              className={`${styles.input} ${styles.optionInput}`}
              value={opt.text}
              onChange={(e) =>
                onUpdate(
                  index,
                  'options',
                  question.options?.map((o, i) =>
                    i === optIdx ? { ...o, text: e.target.value } : o,
                  ),
                )
              }
              placeholder={`Вариант ${optIdx + 1}`}
            />
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={opt.correct}
                onChange={(e) =>
                  onUpdate(
                    index,
                    'options',
                    question.options?.map((o, i) =>
                      i === optIdx ? { ...o, correct: e.target.checked } : o,
                    ),
                  )
                }
              />
              <span>Верный</span>
            </label>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnDanger} ${styles.btnIcon}`}
              onClick={() => onDeleteOption(optIdx)}
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
          <PlusCircle size={20} className={styles.btnIcon} />
          Добавить вариант
        </button>
      </div>
    )}

    <InputBlock
      label="Пояснение"
      value={question.explanation ?? ''}
      onChange={(v) => onUpdate(index, 'explanation', v)}
      placeholder="Опционально"
    />
  </div>
);

/* ---------- MAIN COMPONENT ------------------------------- */
const TestConstructor: React.FC = () => {
  const navigate = useNavigate();
  const dispatch  = useAppDispatch();

  /** селекторы под ключ `lessonReducer` */
  const status: LessonState['status'] = useAppSelector(
    (st) => st.lessonReducer.status
  );
  const serverErr: LessonState['error'] = useAppSelector(
    (st) => st.lessonReducer.error
  );

  const [testData, setTestData] = useState<TestData>({
    title: '',
    description: '',
    isPublic: false,
    requireEmail: false,
    isQuiz: true,
    duration: 30,
    questions: [],
    lessonContent: '',
  });

  const [currIdx, setCurrIdx]     = useState(-1);
  const [previewMode, setPreview] = useState(false);
  const [errors, setErrors]       = useState<string[]>([]);

  /* --- переход на Dashboard при успешном сохранении ------ */
  useEffect(() => {
    if (status === 'succeeded') {
      navigate('/dashboard');
      dispatch(resetLessonState());
    }
  }, [status, navigate, dispatch]);

  /* --- cleanup (сброс среза) ----------------------------- */
  useEffect(() => {
    return () => {               // ← возвращаем void-функцию
      dispatch(resetLessonState());
    };
  }, [dispatch]);

  /* --- validation --------------------------------------- */
  const validate = useCallback(() => {
    const errs: string[] = [];
    if (!testData.title.trim()) errs.push('Название теста обязательно');
    if (testData.isQuiz && !testData.questions.length)
      errs.push('Добавьте хотя бы один вопрос');
    if (testData.duration < 1)
      errs.push('Длительность должна быть ≥ 1 минуты');
    setErrors(errs);
    return !errs.length;
  }, [testData]);

  /* --- helpers ------------------------------------------ */
  const addQuestion = (type: QuestionType) => {
    const q: Question = {
      id: Date.now(),
      type,
      text: '',
      options: type === 'text' ? [] : [{ id: Date.now(), text: '', correct: false }],
    };
    setTestData((p) => ({ ...p, questions: [...p.questions, q] }));
    setCurrIdx(testData.questions.length);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'loading' || !validate()) return;
    dispatch(createLesson(testData));
  };

  /* --- render ------------------------------------------- */
  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        {/* SETTINGS */}
        <section className={styles.settingsSection}>
          <h3 className={styles.sectionTitle}>Основные настройки</h3>

          <InputBlock
            label="Название *"
            value={testData.title}
            onChange={(v) => setTestData({ ...testData, title: v })}
            placeholder="Название теста"
          />

          <InputBlock
            label="Описание"
            value={testData.description ?? ''}
            onChange={(v) => setTestData({ ...testData, description: v })}
            placeholder="Краткое описание"
          />

          <SwitchRow
            label="Тип контента"
            checked={testData.isQuiz}
            onChange={(v) => setTestData({ ...testData, isQuiz: v })}
            checkedLabel="Тест"
            uncheckedLabel="Урок"
          />

          <InputBlock
            label="Длительность (мин.)"
            type="number"
            min={1}
            value={testData.duration.toString()}
            onChange={(v) =>
              setTestData({ ...testData, duration: Math.max(1, +v) })
            }
          />

          <SwitchRow
            label="Сделать публичным"
            checked={testData.isPublic}
            onChange={(v) => setTestData({ ...testData, isPublic: v })}
            checkedLabel="Да"
            uncheckedLabel="Нет"
          />

          <SwitchRow
            label="Требовать e-mail участника"
            checked={testData.requireEmail}
            onChange={(v) => setTestData({ ...testData, requireEmail: v })}
            checkedLabel="Да"
            uncheckedLabel="Нет"
          />

          {!testData.isQuiz && (
            <InputBlock
              label="Содержание урока"
              value={testData.lessonContent ?? ''}
              onChange={(v) => setTestData({ ...testData, lessonContent: v })}
              placeholder="Markdown / текст урока"
            />
          )}
        </section>

        {/* QUESTIONS */}
        <section className={styles.questionsSection}>
          <div className={styles.questionsSidebar}>
            <div className={styles.questionsList}>
              {testData.questions.map((q, i) => (
                <div
                  key={q.id}
                  className={`${styles.questionItem} ${
                    i === currIdx ? styles.active : ''
                  }`}
                  onClick={() => setCurrIdx(i)}
                >
                  <span>Вопрос {i + 1}</span>
                  <button
                    type="button"
                    className={`${styles.btn} ${styles.btnDanger} ${styles.btnIcon}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Удалить вопрос?')) {
                        setTestData((p) => ({
                          ...p,
                          questions: p.questions.filter((_, idx) => idx !== i),
                        }));
                        setCurrIdx(-1);
                      }
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className={styles.addButtons}>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={() => addQuestion('single')}
              >
                <PlusCircle size={20} className={styles.btnIcon} />
                Одиночный выбор
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={() => addQuestion('multiple')}
              >
                <PlusCircle size={20} className={styles.btnIcon} />
                Множественный выбор
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={() => addQuestion('text')}
              >
                <PlusCircle size={20} className={styles.btnIcon} />
                Текстовый ответ
              </button>
            </div>
          </div>

          {currIdx !== -1 && (
            <div className={styles.editorArea}>
              <QuestionEditor
                question={testData.questions[currIdx]}
                index={currIdx}
                onUpdate={(idx, field, val) =>
                  setTestData((p) => ({
                    ...p,
                    questions: p.questions.map((q, i) =>
                      i === idx ? { ...q, [field]: val } : q,
                    ),
                  }))
                }
                onDeleteOption={(optIdx) =>
                  setTestData((p) => ({
                    ...p,
                    questions: p.questions.map((q, i) =>
                      i === currIdx
                        ? {
                            ...q,
                            options: q.options?.filter((_, oi) => oi !== optIdx),
                          }
                        : q,
                    ),
                  }))
                }
                onAddOption={() =>
                  setTestData((p) => ({
                    ...p,
                    questions: p.questions.map((q, i) =>
                      i === currIdx
                        ? {
                            ...q,
                            options: [
                              ...(q.options || []),
                              { id: Date.now(), text: '', correct: false },
                            ],
                          }
                        : q,
                    ),
                  }))
                }
              />
            </div>
          )}
        </section>

        {/* ERRORS */}
        {(errors.length > 0 || serverErr) && (
          <div className={styles.errorAlert}>
            {errors.map((e) => (
              <div key={e}>{e}</div>
            ))}
            {serverErr && <div>{serverErr}</div>}
          </div>
        )}

        {/* ACTIONS */}
        <section className={styles.actions}>
          <button
            type="submit"
            className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLarge}`}
            disabled={status === 'loading' || errors.length > 0}
          >
            {status === 'loading' ? 'Сохраняем…' : 'Сохранить'}
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={() => setPreview((p) => !p)}
          >
            <Eye size={28} className={styles.btnIcon} />
            {previewMode ? 'Скрыть превью' : 'Показать превью'}
          </button>
        </section>

        {/* PREVIEW */}
        {previewMode && (
          <section className={`${styles.previewSection} ${styles.open}`}>
            <TestPreview data={testData} />
          </section>
        )}
      </form>
    </div>
  );
};

export default TestConstructor;
