import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// モデル定数（後で変更しやすいように）
// 最新の無料枠対応モデル: gemini-2.5-flash
// フォールバック候補: gemini-2.0-flash, gemini-3-flash-preview
const GEMINI_MODEL = 'gemini-2.5-flash';

// デモモード用のダミーテキスト生成
function generateMockApology(
  recipient: string,
  reason: string,
  remorse: number,
  details: string
): string {
  const remorseLevel = remorse < 30 ? '軽度' : remorse < 70 ? '中程度' : '最大級';

  return `【デモモード】

${recipient}　御中

この度は、${reason}につきまして、誠に申し訳ございませんでした。

${details}

反省度: ${remorseLevel}（${remorse}%）

今後このようなことがないよう、十分注意いたします。
何卒、ご容赦くださいますようお願い申し上げます。

※ 本文はデモモードで生成されました。実際のAPI連携には .env.local に GOOGLE_GENERATIVE_AI_API_KEY を設定してください。`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { recipient, reason, remorse, details } = body;

    // バリデーション
    if (!recipient || !reason || remorse === undefined || !details) {
      return NextResponse.json(
        { error: '必須項目が入力されていません' },
        { status: 400 }
      );
    }

    // APIキーの取得
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    // デモモード: APIキーがない場合
    if (!apiKey) {
      console.log('APIキーが設定されていません。デモモードで動作します。');
      const mockText = generateMockApology(recipient, reason, remorse, details);
      return NextResponse.json({ text: mockText });
    }

    // Gemini APIを使用してテキスト生成
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    // プロンプトの構築
    const remorseLevel = remorse < 30 ? '形だけの反省' : remorse < 70 ? '通常の謝罪' : '土下座級の深い反省';

    const prompt = `あなたは建設・物流現場で働く人のための始末書・詫び状を作成するアシスタントです。

以下の情報をもとに、適切な始末書・詫び状を作成してください：

【宛先】${recipient}
【理由】${reason}
【反省度】${remorseLevel}（${remorse}/100）
【状況詳細】${details}

要件：
- ビジネス文書として適切な敬語を使用
- 反省度に応じた謝罪の強さを調整
- 建設・物流業界で使われる表現を使用
- 簡潔で分かりやすい文章
- 再発防止への言及を含める
- 400〜600文字程度`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return NextResponse.json({ text });
  } catch (error) {
    console.error('エラーが発生しました:', error);
    console.error('使用しようとしたモデル:', GEMINI_MODEL);

    // エラー時もデモテキストを返してアプリが落ちないようにする
    const errorMessage = error instanceof Error ? error.message : '不明なエラー';
    const fallbackText = `【エラーが発生しました】

申し訳ございません。AI生成中にエラーが発生しました。
エラー内容: ${errorMessage}
使用モデル: ${GEMINI_MODEL}

APIキーが正しく設定されているか確認してください。
.env.local に GOOGLE_GENERATIVE_AI_API_KEY を設定してください。`;

    return NextResponse.json(
      { text: fallbackText },
      { status: 200 } // 200を返してフロントエンドでは正常に表示
    );
  }
}
