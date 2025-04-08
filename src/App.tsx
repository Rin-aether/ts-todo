import { useEffect, useState } from "react";
import localforage from "localforage";
import { Todo } from "./@types/Todo";
import { Filter } from "./@types/Filter";
import { isTodos } from "./lib/isTodo";
import styles from "./style.module.scss";

export const App = () => {
  //form text
  const [text, setText] = useState("");
  //todo obj
  const [todos, setTodos] = useState<Todo[]>([]);
  //状態の型
  const [filter, setFilter] = useState<Filter>("all");

  const [removingIds, setRemovingIds] = useState<number[]>([]);

  //マウント時最初にデータを取得
  //.getItem() は戻り値の型が Promise<unknown>なのでそのまま代入すると怒られる
  // useEffect(() => {
  //   localforage.getItem<Todo[]>("todo-list").then((values) => {
  //     if (values) {
  //       setTodos(values);
  //     }
  //   });
  // }, []);

  //型ガード関数インポート版
  useEffect(() => {
    localforage
      .getItem("todo-list")
      .then((values) => isTodos(values) && setTodos(values));
  }, []);

  //todoが更新されたら、その値をデータベースに保存
  useEffect(() => {
    localforage.setItem("todo-list", todos);
  }, [todos]);

  //状態選択
  const handleFilter = (filter: Filter) => {
    setFilter(filter);
  };

  //入力時
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  //todo登録
  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    //todo生成（型注釈をつける）
    const newTodo: Todo = {
      id: new Date().getTime(),
      value: trimmed,
      checked: false,
      removed: false,
    };
    //todoを追加
    //更新前のstateを引数にとる関数((prev) => prev + 1);
    setTodos((prevTodos) => [...prevTodos, newTodo]);
    setText("");
  };

  //(旧関数)todo編集
  // const handleEdit = (id: number, value: string) => {
  //   setTodos((prevTodos) => {
  //     //idが一致するtodoをvalueの値で書き変える
  //     //！！！！重要！！！！！
  //     // map()は浅いコピーなので、一段階潜る時は、その階層までたどってコピーする
  //     const newTodos = prevTodos.map((todo) => {
  //       if (todo.id === id) {
  //         //変更するときの階層でtodoをコピー・展開して上書きする
  //         //例
  //         // const todo = { id: 1, value: "あ" };
  //         // const updated = { ...todo, value: "い" };
  //         // console.log(updated); // → { id: 1, value: "い" }
  //         return { ...todo, value: value };
  //       }
  //       return todo;
  //     });

  //     //state更新
  //     return newTodos;
  //   });
  // };

  // //todoチェック変更
  // const handleCheck = (id: number, checked: boolean) => {
  //   setTodos((prevTodos) => {
  //     const newTodos = prevTodos.map((todo) => {
  //       if (todo.id === id) {
  //         return { ...todo, checked: checked };
  //       }
  //       return todo;
  //     });

  //     //state更新
  //     return newTodos;
  //   });
  // };

  // //todo削除
  // const handleRemove = (id: number, removed: boolean) => {
  //   setTodos((prevTodos) => {
  //     const newTodos = prevTodos.map((todo) => {
  //       if (todo.id === id) {
  //         return { ...todo, removed: removed };
  //       }
  //       return todo;
  //     });

  //     //state更新
  //     return newTodos;
  //   });
  // };

  //todoフィルタリング
  const filterTodos = todos.filter((todo) => {
    switch (filter) {
      case "all":
        return !todo.removed;
      case "checked":
        return todo.checked && !todo.removed;
      case "unchecked":
        return !todo.checked && !todo.removed;
      case "removed":
        return todo.removed;
      default:
        return todo;
    }
  });

  //todoを完全に削除
  const handleEmpty = () => {
    setTodos((prevTodos) => prevTodos.filter((todo) => !todo.removed));
  };

  //todo更新関数にまとめる
  //01.ジェネリクスでまとめる→02.'extends'を用いて、型引数の型を限定する
  //extendsのプロパティは、keyofで取得
  //ex) K extends keyof Todo => id,value,checked,removedのいずれか
  //ex) V extends Todo[K] => todo.id,value,checked,removedのいずれかの値

  const handleTodo = <K extends keyof Todo, V extends Todo[K]>(
    id: number,
    key: K,
    value: V
  ) => {
    if (key === "removed" && value === true) {
      // 削除時は fadeOut アニメーションを先に実行
      setRemovingIds((prev) => [...prev, id]);
      setTimeout(() => {
        setTodos((prevTodos) => {
          return prevTodos.map((todo) =>
            todo.id === id ? { ...todo, [key]: value } : todo
          );
        });
        setRemovingIds((prev) => prev.filter((removeId) => removeId !== id));
      }, 300); // アニメーション時間と同じ (0.3s)
    } else {
      setTodos((prevTodos) => {
        return prevTodos.map((todo) => {
          if (todo.id === id) {
            return { ...todo, [key]: value };
          }
          return todo;
        });
        //state更新
      });
    }
  };

  //[key]<=計算プロパティ。この中は式が計算されてプロパティ名として使用される
  //つまり、プロパティが動的に決まる場合は[]が必要
  //これがないと、「key」という名前のプロパティを新しく設定することになってしまう

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>TODOリスト</h2>

      <select
        defaultValue="all"
        onChange={(e) => handleFilter(e.target.value as Filter)}
        className={styles.select}
      >
        <option value="all">全てのタスク</option>
        <option value="checked">完了したタスク</option>
        <option value="unchecked">未完了のタスク</option>
        <option value="removed">ごみ箱</option>
      </select>
      {/* filterがremoveの時は「ごみ箱を空にする」ボタンを表示 */}
      {filter === "removed" ? (
        <button
          onClick={handleEmpty}
          disabled={todos.filter((todo) => todo.removed).length === 0}
          className={styles.emptyButton}
        >
          ごみ箱を空にする
        </button>
      ) : (
        // removeでもcheckedでもないときは入力フォームを表示
        filter !== "checked" && (
          <form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <input
              type="text"
              value={text}
              onChange={(e) => handleChange(e)}
              className={styles.inputText}
              placeholder="タスクを入力してください"
            />
            <input type="submit" value="追加" className={styles.submitButton} />
          </form>
        )
      )}

      <ul className={styles.todoList}>
        {filterTodos.map((todo) => (
          <li
            key={todo.id}
            className={`${styles.todoItem} ${
              removingIds.includes(todo.id) ? styles.fadeOut : ""
            }`}
          >
            <input
              type="checkbox"
              checked={todo.checked}
              disabled={todo.removed}
              className={styles.todoCheckbox}
              //呼び出し側でcheckedを反転させる（押した瞬間はまだ状態が変わっていないため！）

              onChange={() => handleTodo(todo.id, "checked", !todo.checked)}
            />
            <input
              type="text"
              value={todo.value}
              disabled={todo.checked || todo.removed}
              className={styles.todoInput}
              onChange={(e) => handleTodo(todo.id, "value", e.target.value)}
            />
            <button
              onClick={() => handleTodo(todo.id, "removed", !todo.removed)}
              className={styles.todoButton}
            >
              {todo.removed ? "復元" : "削除"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
