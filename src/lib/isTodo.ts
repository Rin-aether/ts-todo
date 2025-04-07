import { Todo } from "../@types/Todo";

/* eslint-disable @typescript-eslint/no-explicit-any */

//なんで型ガードを使うの？
//=>TypeScriptはコンパイル時の話なので、
//APIレスポンスやlocalforage.getItemの戻り値）は「何が来るか分からない（any）」から

//1つのTodoオブジェクトかどうかをチェックする関数。
//これによって、argがオブジェクトか？ id や value の型が正しいか？などを確認
const isTodo = (arg: any): arg is Todo => {
  return (
    typeof arg === "object" &&
    Object.keys(arg).length === 4 &&
    typeof arg.id === "number" &&
    typeof arg.value === "string" &&
    typeof arg.checked === "boolean" &&
    typeof arg.removed === "boolean"
  );
};

//(arg: any): arg is Todo[] =>
//「戻り値がboolean型の関数」に対して適用でき、戻り値の型の注釈部分を記載する
//argの部分はなんでもいい
//普通の関数：(arg: any): boolean ← ただtrue/false返すだけ
//型ガード関数：(arg: any): arg is Todo[]
//→ true のとき、「TypeScriptが自動で型推論を切り替えてくれる」

// 配列の中身がすべてTodoか検証する関数
//配列かどうか(isArrat)と、全てが条件に当てはまるか(every(isTodo))を確認してる
export const isTodos = (arg: any): arg is Todo[] => {
  return Array.isArray(arg) && arg.every(isTodo);
};
