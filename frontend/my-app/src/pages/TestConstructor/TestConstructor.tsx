// src/pages/TestConstructor/TestConstructor.tsx
import React, { useState, useEffect, useCallback, type FormEvent } from 'react';
import { Switch } from 'antd';
import { Eye, PlusCircle, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import clsx from 'clsx';

import { useAppDispatch, useAppSelector } from '../../store';
import {
  createLesson,
  updateLesson,
  fetchLesson,
  resetLessonState,
  selectLessonStatus,
  selectLessonError,
  selectCurrentLesson,
} from '../../store/lessonSlice';

import styles from './TestConstructor.module.css';

/* ---------- TYPES ----------------------------------- */
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
  duration: number;
  questions: Question[];
  lessonContent?: string;
}

/* ---------- UI HELPERS -------------------------------- */
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

/* ---------- PREVIEW ---------------------------------- */
const TestPreview: React.FC<{ data: TestData }> = ({ data }) => (
  <div className={styles.preview}>
    <h2 className={styles.previewTitle}>{data.title || '— без названия —'}</h2>
    {data.description && <p className={styles.previewDesc}>{data.description}</p>}

    <p className={styles.previewMeta}>
      Длительность:&nbsp;<strong>{data.duration} мин</strong>&nbsp;|&nbsp;Участник&nbsp;
      {data.requireEmail ? 'обязан' : 'не обязан'} вводить e-mail
    </p>

    {data.questions.map((q, i) => (
      <div key={q.id} className={styles.previewQuestion}>
        <div className={styles.previewQHeader}>
          <span className={styles.previewQIndex}>Вопрос {i + 1}</span>
          <h3 className={styles.previewQText}>{q.text || '—'}</h3>
        </div>

        {q.type !== 'text' ? (
          <ul className={styles.previewOptions}>
            {q.options?.map((opt, optIdx) => (
              <li
                key={`${q.id}-${optIdx}`}               
                className={clsx(
                  styles.previewOption,
                  opt.correct && styles.correctOption
                )}
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

/* ---------- QUESTION EDITOR -------------------------- */
interface QuestionEditorProps {
  question: Question;
  index: number;
  onUpdate: (i: number, f: string, v: any) => void;
  onDeleteOption: (optIdx: number) => void;
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
          <div key={`${question.id}-${optIdx}`} className={styles.optionRow}>
            <input
              className={clsx(styles.input, styles.optionInput)}
              value={opt.text}
              onChange={(e) =>
                onUpdate(
                  index,
                  'options',
                  question.options?.map((o, i) =>
                    i === optIdx ? { ...o, text: e.target.value } : o
                  )
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
                      i === optIdx ? { ...o, correct: e.target.checked } : o
                    )
                  )
                }
              />
              <span>Верный</span>
            </label>
            <button
              type="button"
              className={clsx(styles.btn, styles.btnDanger, styles.btnIcon)}
              onClick={() => onDeleteOption(optIdx)}          
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        <button
          type="button"
          className={clsx(styles.btn, styles.btnSecondary)}
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

/* ---------- MAIN ------------------------------------- */
const TestConstructor: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const status    = useAppSelector(selectLessonStatus);
  const serverErr = useAppSelector(selectLessonError);
  const existing  = useAppSelector(selectCurrentLesson);

  const [data, setData] = useState<TestData>({
    title: '',
    description: '',
    isPublic: false,
    requireEmail: false,
    isQuiz: true,
    duration: 30,
    questions: [],
    lessonContent: '',
  });
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [preview, setPreview]       = useState(false);
  const [errors, setErrors]         = useState<string[]>([]);
  const [isSaving, setIsSaving]     = useState(false);

  /* ---- загрузка при edit-mode ----------------------- */
  useEffect(() => { if (id) dispatch(fetchLesson(id)); }, [id, dispatch]);

  /* ---- заполняем форму ------------------------------ */
  useEffect(() => {
    if (existing && id) {
      setData({
        title:         existing.title,
        description:   existing.description ?? '',
        isPublic:      existing.isPublic,
        requireEmail:  existing.requireEmail,
        isQuiz:        existing.isQuiz,
        duration:      existing.duration,
        questions:     existing.questions,
        lessonContent: existing.lessonContent ?? '',
      });
    }
  }, [existing, id]);

  /* ---- validate ------------------------------------ */
  const validate = useCallback(() => {
    const errs: string[] = [];
    if (!data.title.trim()) errs.push('Название теста обязательно');
    if (data.isQuiz && !data.questions.length) errs.push('Добавьте хотя бы один вопрос');
    if (data.duration < 1) errs.push('Длительность ≥ 1 минуты');
    setErrors(errs);
    return !errs.length;
  }, [data]);

  /* ---- submit -------------------------------------- */
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (status === 'loading' || !validate()) return;
    setIsSaving(true);    
    id ? dispatch(updateLesson({ id, body: data })) : dispatch(createLesson(data));
  };

  /* ---- redirect on success ------------------------- */
  useEffect(() => {
  if (isSaving && status === 'succeeded') {
      navigate('/dashboard');
      dispatch(resetLessonState())
      setIsSaving(false);;
    }
  }, [status, navigate, dispatch, isSaving]);

  /* ---- helpers ------------------------------------- */
  const addQuestion = (type: QuestionType) => {
    const q: Question = {
      id: Date.now(),
      type,
      text: '',
      options: type === 'text' ? [] : [{ id: Date.now(), text: '', correct: false }],
    };
    setData((d) => {
      const questions = [...d.questions, q];
      setCurrentIdx(questions.length - 1);
      return { ...d, questions };
    });
  };

  /* ---------- RENDER -------------------------------- */
  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={onSubmit}>
        {/* SETTINGS */}
        <section className={styles.settingsSection}>
          <h3 className={styles.sectionTitle}>
            {id ? 'Редактирование теста' : 'Создание теста'}
          </h3>

          <InputBlock label="Название *" value={data.title}
            onChange={(v) => setData({ ...data, title: v })}
            placeholder="Название теста" />

          <InputBlock label="Описание" value={data.description ?? ''}
            onChange={(v) => setData({ ...data, description: v })}
            placeholder="Краткое описание" />

          <SwitchRow label="Тип контента" checked={data.isQuiz}
            onChange={(v) => setData({ ...data, isQuiz: v })}
            checkedLabel="Тест" uncheckedLabel="Урок" />

          <InputBlock label="Длительность (мин.)" type="number" min={1}
            value={String(data.duration)}
            onChange={(v) => setData({ ...data, duration: Math.max(1, +v) })} />

          <SwitchRow label="Сделать публичным" checked={data.isPublic}
            onChange={(v) => setData({ ...data, isPublic: v })}
            checkedLabel="Да" uncheckedLabel="Нет" />

          <SwitchRow label="Требовать e-mail участника" checked={data.requireEmail}
            onChange={(v) => setData({ ...data, requireEmail: v })}
            checkedLabel="Да" uncheckedLabel="Нет" />

          {!data.isQuiz && (
            <InputBlock label="Содержание урока" value={data.lessonContent ?? ''}
              onChange={(v) => setData({ ...data, lessonContent: v })}
              placeholder="Markdown / текст урока" />
          )}
        </section>

        {/* QUESTIONS */}
        <section className={styles.questionsSection}>
          {/* sidebar */}
          <div className={styles.questionsSidebar}>
            <div className={styles.questionsList}>
              {data.questions.map((q, i) => (
                <div
                  key={`sidebar-${q.id}-${i}`}              
                  className={clsx(styles.questionItem, i === currentIdx && styles.active)}
                  onClick={() => setCurrentIdx(i)}
                >
                  <span>Вопрос {i + 1}</span>
                  <button
                    type="button"
                    className={clsx(styles.btn, styles.btnDanger, styles.btnIcon)}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Удалить вопрос?')) {
                        setData((d) => ({
                          ...d,
                          questions: d.questions.filter((_, idx) => idx !== i),
                        }));
                        setCurrentIdx(-1);
                      }
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className={styles.addButtons}>
              {(['single', 'multiple', 'text'] as QuestionType[]).map((t) => (
                <button
                  key={`btn-${t}`}
                  type="button"
                  className={clsx(styles.btn, styles.btnPrimary)}
                  onClick={() => addQuestion(t)}
                >
                  <PlusCircle size={20} className={styles.btnIcon} />
                  {{ single: 'Одиночный выбор', multiple: 'Множественный выбор', text: 'Текстовый ответ' }[t]}
                </button>
              ))}
            </div>
          </div>

          {/* editor */}
          {currentIdx !== -1 && (
            <div className={styles.editorArea}>
              <QuestionEditor
                question={data.questions[currentIdx]}
                index={currentIdx}
                onUpdate={(idx, field, val) =>
                  setData((d) => ({
                    ...d,
                    questions: d.questions.map((q, i) =>
                      i === idx ? { ...q, [field]: val } : q
                    ),
                  }))
                }
                onDeleteOption={(optIdx) =>
                  setData((d) => ({
                    ...d,
                    questions: d.questions.map((q, qi) =>
                      qi === currentIdx
                        ? { ...q, options: q.options?.filter((_, oi) => oi !== optIdx) }
                        : q
                    ),
                  }))
                }
                onAddOption={() =>
                  setData((d) => ({
                    ...d,
                    questions: d.questions.map((q, qi) =>
                      qi === currentIdx
                        ? {
                            ...q,
                            options: [
                              ...(q.options || []),
                              { id: Date.now(), text: '', correct: false },
                            ],
                          }
                        : q
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
            {errors.map((e, i) => (
              <div key={`err-${i}`}>{e}</div>
            ))}
            {serverErr && <div key="server">{serverErr}</div>}
          </div>
        )}

        {/* ACTIONS */}
        <section className={styles.actions}>
          <button
            type="submit"
            className={clsx(styles.btn, styles.btnPrimary, styles.btnLarge)}
            disabled={status === 'loading' || errors.length > 0}
          >
            {status === 'loading' ? 'Сохраняем…' : id ? 'Сохранить изменения' : 'Создать'}
          </button>
          <button
            type="button"
            className={clsx(styles.btn, styles.btnSecondary)}
            onClick={() => setPreview((p) => !p)}
          >
            <Eye size={28} className={styles.btnIcon} />
            {preview ? 'Скрыть превью' : 'Показать превью'}
          </button>
        </section>

        {/* PREVIEW */}
        {preview && (
          <section className={clsx(styles.previewSection, styles.open)}>
            <TestPreview data={data} />
          </section>
        )}
      </form>
    </div>
  );
};

export default TestConstructor;
