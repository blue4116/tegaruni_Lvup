# 軽作業レベルアップアプリ（ログイン版）

メールアドレスで新規登録・ログインし、ユーザーごとにレベル・EXP・作業履歴・目標を保存します。
AさんのデータはBさんから見られません（Firestoreのルールで制限）。

## ファイル
- index.html / style.css / script.js … アプリ本体
- firebase-config.js … Firebaseの設定値（自分の値に書き換える）
- firestore.rules … データを本人だけに制限するルール

## セットアップ（初回のみ）
1. https://console.firebase.google.com で「プロジェクトを追加」
2. 左メニュー「構築」→ **Authentication** → 始める → ログイン方法で **メール/パスワード** を有効化
3. 「構築」→ **Firestore Database** → データベースを作成（本番モード・場所は asia-northeast1 など）
4. Firestore の「ルール」タブに `firestore.rules` の中身を貼り付けて「公開」
5. プロジェクトの設定（歯車）→「マイアプリ」→ ウェブアプリ（`</>`）を追加し、表示された設定値を `firebase-config.js` に貼り付ける
6. Authentication →「設定」→「承認済みドメイン」に公開先（例：`ユーザー名.github.io`）を追加

## GitHub Pages で公開
5ファイルをリポジトリにコミット → Settings → Pages → Deploy from a branch → main → / (root)

## 補足
- ログイン前の旧版データが端末に残っていれば、初回ログイン時に引き継ぐか確認します。
- 作業記録で「目標に紐づける」を選ぶと目標の進捗が進み、達成した期間に1回だけ+50 EXP（そのソフトに加算）が入ります。
- 「データ初期化」は、ログイン中の本人のデータだけを初期化します。
