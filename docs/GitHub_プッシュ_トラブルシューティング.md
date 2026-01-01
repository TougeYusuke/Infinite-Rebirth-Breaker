# GitHub プッシュ トラブルシューティング

## エラー: OAuth App が workflow スコープを持っていない

### エラーメッセージ
```
! [remote rejected] main -> main (refusing to allow an OAuth App to create or update workflow `.github/workflows/test.yml` without `workflow` scope)
```

### 原因
OAuth Appが`.github/workflows/test.yml`を作成または更新するために必要な`workflow`スコープを持っていない。

### 解決策

#### 方法1: Personal Access Token (PAT) を使用（推奨）

1. **GitHubでPersonal Access Tokenを作成**
   - GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - "Generate new token (classic)" をクリック
   - スコープに以下を選択:
     - ✅ `repo` (すべてのリポジトリへのフルアクセス)
     - ✅ `workflow` (GitHub Actionsワークフローの更新)
   - トークンを生成してコピー

2. **リモートURLを更新**
   ```bash
   git remote set-url origin https://[YOUR_TOKEN]@github.com/TougeYusuke/Infinite-Rebirth-Breaker.git
   ```

3. **プッシュ**
   ```bash
   git push -u origin main
   ```

#### 方法2: GitHub CLIを使用

1. **GitHub CLIをインストール**（未インストールの場合）
   ```bash
   winget install GitHub.cli
   ```

2. **認証**
   ```bash
   gh auth login
   ```
   - GitHub.comを選択
   - HTTPSを選択
   - 認証方法を選択（ブラウザ推奨）

3. **プッシュ**
   ```bash
   git push -u origin main
   ```

#### 方法3: 一時的にワークフローファイルを除外（非推奨）

1. **ワークフローファイルを一時的に削除**
   ```bash
   git rm --cached .github/workflows/test.yml
   git commit -m "chore: 一時的にワークフローファイルを除外"
   ```

2. **プッシュ**
   ```bash
   git push -u origin main
   ```

3. **後でGitHub上で手動でワークフローファイルを追加**
   - GitHubリポジトリの`.github/workflows/`ディレクトリに直接ファイルを追加

---

## 推奨される解決策

**方法1（PAT使用）** が最も確実で推奨されます。

### PATの作成手順（詳細）

1. GitHubにログイン
2. 右上のプロフィール画像をクリック → **Settings**
3. 左サイドバーの一番下 → **Developer settings**
4. **Personal access tokens** → **Tokens (classic)**
5. **Generate new token (classic)** をクリック
6. **Note** に適当な名前を入力（例: "Infinite Rebirth Breaker"）
7. **Expiration** を設定（推奨: 90日または無期限）
8. **Select scopes** で以下を選択:
   - ✅ **repo** - すべてのリポジトリへのフルアクセス
   - ✅ **workflow** - GitHub Actionsワークフローの更新
9. **Generate token** をクリック
10. 表示されたトークンをコピー（この画面を閉じると二度と見れません！）

### リモートURLの更新

```bash
# 現在のリモートURLを確認
git remote -v

# PATを使用してリモートURLを更新
git remote set-url origin https://[YOUR_TOKEN]@github.com/TougeYusuke/Infinite-Rebirth-Breaker.git

# プッシュ
git push -u origin main
```

**注意:** トークンは機密情報なので、他人に見せないようにしてください。

---

## 参考資料

- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [GitHub CLI Documentation](https://cli.github.com/manual/)

