# AI始末書・詫び状ジェネレーター

建設・物流現場で働く人向けの始末書・詫び状を自動生成するWebアプリケーションです。

## 特徴

- 🎨 **現場向けUI**: 黒と黄色のハイコントラスト配色で視認性抜群
- 👷 **軍手対応**: 大きなボタンで現場でも操作しやすい
- 🤖 **AI生成**: Google Gemini AIで適切な謝罪文を自動生成
- 📱 **モバイル対応**: スマホからでも快適に利用可能
- 🔒 **登録不要**: アカウント登録なしで即座に利用可能
- 📋 **簡単共有**: コピー機能とLINE送信機能を搭載

## 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **AI**: Google Generative AI (Gemini 1.5 Flash)

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成し、Google Generative AI APIキーを設定します：

```bash
# .env.local
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

**APIキーの取得方法:**
1. [Google AI Studio](https://aistudio.google.com/apikey)にアクセス
2. Googleアカウントでログイン
3. 「APIキーを作成」をクリック
4. 生成されたAPIキーをコピーして`.env.local`に貼り付け

> **注意**: APIキーがなくてもデモモードで動作します！

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## 使い方

1. **宛先を選択**: 元請け、お客様、上司、近隣住民から選択
2. **理由を選択**: 遅刻、破損、紛失、工程遅延、喫煙マナーから選択
3. **反省度を調整**: スライダーで形だけ〜土下座級まで調整
4. **状況詳細を入力**: 具体的な状況を記入
5. **生成ボタンをクリック**: AIが適切な謝罪文を生成
6. **コピーまたはLINE送信**: 生成された文書をコピーまたはLINEで送信

## デモモード

APIキーが設定されていない場合、自動的にデモモードで動作します。デモモードでは、モックの謝罪文が生成されます。

## モデルの変更

`app/api/generate/route.ts`の`GEMINI_MODEL`定数を変更することで、使用するAIモデルを簡単に切り替えられます：

```typescript
const GEMINI_MODEL = 'gemini-1.5-flash'; // または 'gemini-2.0' など
```

## デプロイ

Vercelへのデプロイが推奨されます：

1. [Vercel](https://vercel.com)にアカウントを作成
2. プロジェクトをGitHubにプッシュ
3. Vercelでプロジェクトをインポート
4. 環境変数`GOOGLE_GENERATIVE_AI_API_KEY`を設定
5. デプロイ完了！

## ライセンス

MIT License

## 注意事項

生成された文書は必ず内容を確認・修正してから使用してください。AIによる生成結果は参考情報として活用し、最終的な責任はユーザー自身にあります。
