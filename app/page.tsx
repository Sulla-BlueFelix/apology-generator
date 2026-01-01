'use client';

import { useState } from 'react';

export default function Home() {
  const [recipient, setRecipient] = useState('元請け');
  const [reason, setReason] = useState('遅刻');
  const [remorse, setRemorse] = useState(50);
  const [details, setDetails] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const recipients = ['元請け', 'お客様', '上司', '近隣住民'];
  const reasons = ['遅刻', '破損', '紛失', '工程遅延', '喫煙マナー'];

  const handleGenerate = async () => {
    if (!details.trim()) {
      alert('状況詳細を入力してください');
      return;
    }

    setIsLoading(true);
    setGeneratedText('');
    setCopied(false);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient,
          reason,
          remorse,
          details,
        }),
      });

      const data = await response.json();

      if (data.text) {
        setGeneratedText(data.text);
      } else if (data.error) {
        setGeneratedText(`エラー: ${data.error}`);
      }
    } catch (error) {
      setGeneratedText(
        `エラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      alert('コピーに失敗しました');
    }
  };

  const handleLineShare = () => {
    const encodedText = encodeURIComponent(generatedText);
    const lineUrl = `https://line.me/R/msg/text/?${encodedText}`;
    window.open(lineUrl, '_blank');
  };

  const remorseLabel =
    remorse < 30 ? '形だけ' : remorse < 70 ? '通常の謝罪' : '土下座級';

  return (
    <main className="min-h-screen bg-safety-black p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-safety-yellow mb-2 md:mb-4">
            AI始末書・詫び状ジェネレーター
          </h1>
          <p className="text-safety-yellow text-sm md:text-base opacity-80">
            現場の事故・トラブル対応を迅速にサポート
          </p>
        </header>

        {/* 入力フォーム */}
        <div className="bg-safety-yellow rounded-lg p-4 md:p-8 mb-6 md:mb-8 border-4 border-safety-black">
          {/* 相手の選択 */}
          <div className="mb-6">
            <label className="block text-safety-black text-lg md:text-xl font-bold mb-3">
              📋 宛先
            </label>
            <div className="grid grid-cols-2 gap-2 md:gap-3">
              {recipients.map((r) => (
                <button
                  key={r}
                  onClick={() => setRecipient(r)}
                  className={`h-14 md:h-16 text-base md:text-lg font-bold rounded-lg border-4 transition-all ${
                    recipient === r
                      ? 'bg-safety-black text-safety-yellow border-safety-black'
                      : 'bg-white text-safety-black border-safety-black hover:bg-gray-100'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* 理由の選択 */}
          <div className="mb-6">
            <label className="block text-safety-black text-lg md:text-xl font-bold mb-3">
              ⚠️ 理由
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
              {reasons.map((r) => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  className={`h-14 md:h-16 text-base md:text-lg font-bold rounded-lg border-4 transition-all ${
                    reason === r
                      ? 'bg-safety-black text-safety-yellow border-safety-black'
                      : 'bg-white text-safety-black border-safety-black hover:bg-gray-100'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* 反省度のスライダー */}
          <div className="mb-6">
            <label className="block text-safety-black text-lg md:text-xl font-bold mb-3">
              😓 反省度: {remorseLabel} ({remorse}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={remorse}
              onChange={(e) => setRemorse(Number(e.target.value))}
              className="w-full h-4 bg-safety-black rounded-lg appearance-none cursor-pointer accent-yellow-400"
            />
            <div className="flex justify-between text-xs md:text-sm text-safety-black font-bold mt-2">
              <span>形だけ</span>
              <span>土下座級</span>
            </div>
          </div>

          {/* 状況詳細 */}
          <div className="mb-6">
            <label className="block text-safety-black text-lg md:text-xl font-bold mb-3">
              📝 状況詳細
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="例: 渋滞により現場到着が30分遅れました。事前連絡を怠り、工程に影響を与えてしまいました。"
              className="w-full h-32 md:h-40 p-4 text-base md:text-lg bg-white text-black border-4 border-safety-black rounded-lg focus:outline-none focus:ring-4 focus:ring-safety-black"
            />
          </div>

          {/* 生成ボタン */}
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full h-16 md:h-20 text-xl md:text-2xl font-bold bg-safety-black text-safety-yellow rounded-lg border-4 border-safety-black hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading
              ? '親方に怒られない言葉を選んでいます...'
              : 'AIに言い訳を考えてもらう'}
          </button>
        </div>

        {/* 出力エリア */}
        {generatedText && (
          <div className="bg-white rounded-lg p-4 md:p-8 border-4 border-safety-yellow">
            <h2 className="text-xl md:text-2xl font-bold text-safety-black mb-4">
              📄 生成された文書
            </h2>
            <div className="bg-gray-50 p-4 md:p-6 rounded-lg mb-4 md:mb-6 border-2 border-gray-300 whitespace-pre-wrap text-sm md:text-base">
              {generatedText}
            </div>

            {/* アクションボタン */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <button
                onClick={handleCopy}
                className="h-14 md:h-16 text-base md:text-lg font-bold bg-safety-yellow text-safety-black rounded-lg border-4 border-safety-black hover:bg-opacity-90 transition-all"
              >
                {copied ? '✅ コピーしました！' : '📋 コピーする'}
              </button>
              <button
                onClick={handleLineShare}
                className="h-14 md:h-16 text-base md:text-lg font-bold bg-[#06C755] text-white rounded-lg border-4 border-safety-black hover:bg-opacity-90 transition-all"
              >
                💬 LINEで送る
              </button>
            </div>
          </div>
        )}

        {/* フッター */}
        <footer className="text-center mt-8 md:mt-12 text-safety-yellow text-xs md:text-sm opacity-60">
          <p>※ 生成された文書は必ず確認・修正してからご使用ください</p>
          <p className="mt-2">Powered by Google Gemini AI</p>
        </footer>
      </div>
    </main>
  );
}
