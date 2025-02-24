
# 音声Q&Aアシスタント

日本語で音声による質問応答ができるWebアプリケーションです。

## 機能

- 音声による質問入力
- 日本語音声での回答出力
- 複数の音声合成エンジンの選択
- 会話履歴の表示

## 技術スタック

- Flask
- Web Speech API
- OpenAI API
- Bootstrap

## セットアップ

1. 必要な環境変数を設定:
   - `OPENAI_API_KEY`: OpenAI APIキー
   - `SESSION_SECRET`: Flaskセッションの秘密鍵

2. 依存パッケージのインストール:
   ```
   pip install -r requirements.txt
   ```

3. アプリケーションの起動:
   ```
   python main.py
   ```

## 使用方法

1. 音声合成エンジンをドロップダウンメニューから選択
2. マイクボタンをクリックして質問を話す
3. 音声で回答が再生されます

## ライセンス

MITライセンス
