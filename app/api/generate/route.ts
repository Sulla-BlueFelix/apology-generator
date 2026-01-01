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

// 詳細情報の型定義
interface DetailInfo {
  date?: string;
  recipientCompany?: string;
  recipientName?: string;
  siteName?: string;
  ownCompany?: string;
  ownName?: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { recipient, reason, remorse, details, detailInfo } = body as {
      recipient: string;
      reason: string;
      remorse: number;
      details: string;
      detailInfo?: DetailInfo;
    };

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

    // 詳細情報の有無をチェック
    const hasDetailInfo = detailInfo && Object.values(detailInfo).some(v => v && v.trim() !== '');

    // 詳細情報をプロンプトに含める
    let detailInfoText = '';
    if (hasDetailInfo && detailInfo) {
      detailInfoText = '\n\n【詳細情報】';
      if (detailInfo.date) detailInfoText += `\n- 日付: ${detailInfo.date}`;
      if (detailInfo.recipientCompany) detailInfoText += `\n- 相手先会社: ${detailInfo.recipientCompany}`;
      if (detailInfo.recipientName) detailInfoText += `\n- 相手先担当者: ${detailInfo.recipientName}`;
      if (detailInfo.siteName) detailInfoText += `\n- 現場名: ${detailInfo.siteName}`;
      if (detailInfo.ownCompany) detailInfoText += `\n- 自社名: ${detailInfo.ownCompany}`;
      if (detailInfo.ownName) detailInfoText += `\n- 自分の氏名: ${detailInfo.ownName}`;
    }

    const prompt = `あなたは建設・物流現場で働く人のための始末書・詫び状を作成するアシスタントです。

以下の情報をもとに、適切な始末書・詫び状を作成してください：

【宛先】${recipient}
【理由】${reason}
【反省度】${remorseLevel}（${remorse}/100）
【状況詳細】${details}${detailInfoText}

要件：
- ビジネス文書として適切な敬語を使用
- 反省度に応じた謝罪の強さを調整
- 建設・物流業界で使われる表現を使用
- 簡潔で分かりやすい文章
- 再発防止への言及を含める
- 400〜600文字程度
${hasDetailInfo ? '- 【詳細情報】が提供されている場合は、文書中の具体的な名前や日付として使用してください（プレースホルダーではなく実際の値を使用）' : '- 具体的な会社名・担当者名・日付などは「○○建設」「○月○日」のようなプレースホルダーを使用してください'}`;

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
