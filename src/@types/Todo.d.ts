export type Todo = {
  readonly id: number;
  value: string;
  checked: boolean;
  removed: boolean;
};

//先頭に　'declare'をつけるとグローバル型定義になるので注意(代わりにインポートもいらなくなる)
//d.tsは「型定義専用ファイル」という扱い

//型は１ファイルに複数書いてもOK。